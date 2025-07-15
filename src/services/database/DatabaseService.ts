// src/services/database/DatabaseService.ts
import { supabase } from "@/services/api/supabase";
import { Database } from "@/services/api/supabase";

// Types based on your existing schema
type UserXP = {
  level: number;
  total_xp: number;
  xp_this_level: number;
};

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Goal = Database["public"]["Tables"]["goals"]["Row"];

interface TaskWithGoal extends Task {
  goals?: Pick<Goal, "id" | "title" | "category" | "priority"> | null;
}

interface DatabaseValidationResult {
  [tableName: string]: {
    exists: boolean;
    error: string | null;
  };
}

interface XPUpdateResult {
  success: boolean;
  newLevel?: number;
  newTotalXP?: number;
  xpGained?: number;
  error?: string;
}

interface UserInitializationResult {
  success: boolean;
  error?: string;
}

interface DiagnosticResult {
  schema: DatabaseValidationResult;
  userXP: UserXP;
  tasksCount: number;
  onboardingCount: number;
}

/**
 * Database service to handle schema validation and data migration
 * Helps ensure all required tables and columns exist
 */
class DatabaseService {
  /**
   * Initialize user-specific records when a new user signs up
   */
  async initializeUserData(userId: string): Promise<UserInitializationResult> {
    try {
      console.log(`Initializing database records for user: ${userId}`);

      // 1. Create user_xp record
      await this.ensureUserXPRecord(userId);

      // 2. You can add other initialization logic here
      console.log("User data initialization completed successfully");

      return { success: true };
    } catch (error) {
      console.error("Error initializing user data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Ensure user has an XP record
   */
  async ensureUserXPRecord(userId: string): Promise<boolean> {
    try {
      // Check if record exists
      const { data: existingXP, error: checkError } = await supabase
        .from("user_xp")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected if no record exists
        console.error("Error checking user XP:", checkError);
        return false;
      }

      // If record doesn't exist, create it
      if (!existingXP) {
        const { error: insertError } = await supabase.from("user_xp").insert({
          user_id: userId,
          level: 1,
          total_xp: 0,
          xp_this_level: 0,
        });

        if (insertError) {
          console.error("Error creating user XP record:", insertError);
          return false;
        }

        console.log("Created XP record for user:", userId);
      }

      return true;
    } catch (error) {
      console.error("Error in ensureUserXPRecord:", error);
      return false;
    }
  }

  /**
   * Validate that all required database tables exist
   * This helps diagnose schema issues
   */
  async validateDatabaseSchema(): Promise<DatabaseValidationResult> {
    const requiredTables = [
      "users",
      "goals",
      "tasks",
      "user_xp",
      "onboarding_responses",
      "daily_schedules",
      "milestones",
      "schedules",
    ];

    const validationResults: DatabaseValidationResult = {};

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1);

        validationResults[table] = {
          exists: !error,
          error: error?.message || null,
        };
      } catch (error) {
        validationResults[table] = {
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return validationResults;
  }

  /**
   * Get user tasks with proper error handling for missing relationships
   */
  async getUserTasks(
    userId: string,
    date: string | null = null
  ): Promise<TaskWithGoal[]> {
    try {
      let query = supabase
        .from("tasks")
        .select(
          `
          *,
          goals:related_goal_id (
            id,
            title,
            category,
            priority
          )
        `
        )
        .eq("user_id", userId);

      if (date) {
        query = query.eq("scheduled_date", date);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error loading tasks:", error);

        // If foreign key relationship error, try without goals join
        if (error.code === "PGRST200") {
          console.log("Fetching tasks without goals relationship...");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (fallbackError) {
            throw fallbackError;
          }

          return (fallbackData || []).map((task) => ({ ...task, goals: null }));
        }

        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserTasks:", error);
      return [];
    }
  }

  /**
   * Get user XP with fallback to users table
   */
  async getUserXP(userId: string): Promise<UserXP> {
    try {
      // Try user_xp table first
      const { data: xpData, error: xpError } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!xpError && xpData) {
        return {
          level: xpData.level,
          total_xp: xpData.total_xp,
          xp_this_level: xpData.xp_this_level,
        };
      }

      // Fallback to users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("current_level, xp_total")
        .eq("id", userId)
        .single();

      if (userError) {
        console.warn("No XP data found:", userError);
        return { level: 1, total_xp: 0, xp_this_level: 0 };
      }

      return {
        level: userData.current_level || 1,
        total_xp: userData.xp_total || 0,
        xp_this_level: 0,
      };
    } catch (error) {
      console.error("Error getting user XP:", error);
      return { level: 1, total_xp: 0, xp_this_level: 0 };
    }
  }

  /**
   * Update user XP in both tables for consistency
   */
  async updateUserXP(
    userId: string,
    xpGained: number
  ): Promise<XPUpdateResult> {
    try {
      const currentXP = await this.getUserXP(userId);
      const newTotalXP = currentXP.total_xp + xpGained;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const newXPThisLevel = newTotalXP % 100;

      // Update user_xp table
      const { error: xpError } = await supabase.from("user_xp").upsert({
        user_id: userId,
        level: newLevel,
        total_xp: newTotalXP,
        xp_this_level: newXPThisLevel,
      });

      if (xpError) {
        console.error("Error updating user_xp:", xpError);
      }

      // Also update users table for consistency
      const { error: userError } = await supabase
        .from("users")
        .update({
          current_level: newLevel,
          xp_total: newTotalXP,
        })
        .eq("id", userId);

      if (userError) {
        console.error("Error updating users XP:", userError);
      }

      return {
        success: true,
        newLevel,
        newTotalXP,
        xpGained,
      };
    } catch (error) {
      console.error("Error in updateUserXP:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get onboarding responses with fallback
   */
  async getOnboardingData(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", userId);

      if (error && error.code !== "PGRST116") {
        console.warn("No onboarding data found:", error);
      }

      return data || [];
    } catch (error) {
      console.error("Error getting onboarding data:", error);
      return [];
    }
  }

  /**
   * Get schedule with fallback handling
   */
  async getDailySchedule(userId: string, date: string): Promise<any | null> {
    try {
      // Try daily_schedules table first
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("daily_schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .single();

      if (!scheduleError && scheduleData) {
        return scheduleData;
      }

      // Fallback to schedules table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .single();

      if (fallbackError && fallbackError.code !== "PGRST116") {
        console.log("No schedule found for date:", date);
      }

      return fallbackData;
    } catch (error) {
      console.error("Error getting daily schedule:", error);
      return null;
    }
  }

  /**
   * Diagnostic function to help troubleshoot database issues
   */
  async runDatabaseDiagnostics(userId: string): Promise<DiagnosticResult> {
    console.log("=== Database Diagnostics ===");

    const schema = await this.validateDatabaseSchema();
    console.log("Schema validation:", schema);

    const xp = await this.getUserXP(userId);
    console.log("User XP:", xp);

    const tasks = await this.getUserTasks(userId);
    console.log(`User tasks count: ${tasks.length}`);

    const onboarding = await this.getOnboardingData(userId);
    console.log(`Onboarding responses: ${onboarding.length}`);

    console.log("=== End Diagnostics ===");

    return {
      schema,
      userXP: xp,
      tasksCount: tasks.length,
      onboardingCount: onboarding.length,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
