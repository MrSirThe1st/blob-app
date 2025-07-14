// src/services/goals/GoalsService.ts
/**
 * Goals Service - Complete goal management system
 * Handles goal creation, progress tracking, and AI integration
 */

import { openAIService } from "../api/openai";
import { supabase } from "../api/supabase";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category:
    | "health"
    | "career"
    | "personal"
    | "learning"
    | "relationships"
    | "finance";
  priority: "high" | "medium" | "low";
  targetDate: string | null; // ISO date string
  isCompleted: boolean;
  completedAt: string | null;
  progress: number; // 0-100 percentage

  // AI-generated breakdown
  aiBreakdown: {
    weeklyTasks: string[];
    dailyHabits: string[];
    milestones: {
      title: string;
      description: string;
      targetDate: string;
      isCompleted: boolean;
    }[];
    estimatedTimeframe: string;
    difficultyLevel: "beginner" | "intermediate" | "advanced";
    successTips: string[];
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastProgressUpdate: string | null;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  category: Goal["category"];
  priority: Goal["priority"];
  targetDate?: string;
  userContext?: string; // Additional context for AI breakdown
}

export interface GoalProgress {
  goalId: string;
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
  daysActive: number;
  lastActivity: string;
}

class GoalsService {
  /**
   * Create a new goal with AI-powered breakdown
   */
  async createGoal(
    userId: string,
    request: CreateGoalRequest
  ): Promise<Goal | null> {
    try {
      console.log("Creating goal for user:", userId, request);

      // Generate AI breakdown for the goal
      const aiBreakdown = await this.generateGoalBreakdown(request, userId);

      const goalId = `goal_${userId}_${Date.now()}`;
      const now = new Date().toISOString();

      const goal: Goal = {
        id: goalId,
        userId,
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        targetDate: request.targetDate || null,
        isCompleted: false,
        completedAt: null,
        progress: 0,
        aiBreakdown,
        createdAt: now,
        updatedAt: now,
        lastProgressUpdate: null,
      };

      // Save to database
      const { error } = await supabase.from("goals").insert({
        id: goal.id,
        user_id: goal.userId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        priority: goal.priority,
        target_date: goal.targetDate,
        is_completed: goal.isCompleted,
        completed_at: goal.completedAt,
        progress: goal.progress,
        ai_breakdown: goal.aiBreakdown,
        created_at: goal.createdAt,
        updated_at: goal.updatedAt,
        last_progress_update: goal.lastProgressUpdate,
      });

      if (error) {
        console.error("Error saving goal:", error);
        return null;
      }

      console.log("Goal created successfully:", goalId);
      return goal;
    } catch (error) {
      console.error("Error creating goal:", error);
      return null;
    }
  }

  /**
   * Get all goals for a user
   */
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching goals:", error);
        return [];
      }

      return data.map(this.mapDatabaseToGoal);
    } catch (error) {
      console.error("Error in getUserGoals:", error);
      return [];
    }
  }

  /**
   * Get a specific goal by ID
   */
  async getGoalById(goalId: string): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (error || !data) {
        console.error("Error fetching goal:", error);
        return null;
      }

      return this.mapDatabaseToGoal(data);
    } catch (error) {
      console.error("Error in getGoalById:", error);
      return null;
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, progress: number): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const isCompleted = progress >= 100;

      const { error } = await supabase
        .from("goals")
        .update({
          progress,
          is_completed: isCompleted,
          completed_at: isCompleted ? now : null,
          last_progress_update: now,
          updated_at: now,
        })
        .eq("id", goalId);

      if (error) {
        console.error("Error updating goal progress:", error);
        return false;
      }

      // Award XP for goal completion
      if (isCompleted) {
        const goal = await this.getGoalById(goalId);
        if (goal) {
          await this.awardGoalCompletionXP(goal.userId, goal);
        }
      }

      return true;
    } catch (error) {
      console.error("Error in updateGoalProgress:", error);
      return false;
    }
  }

  /**
   * Update goal details
   */
  async updateGoal(
    goalId: string,
    updates: Partial<CreateGoalRequest>
  ): Promise<boolean> {
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("goals")
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          priority: updates.priority,
          target_date: updates.targetDate,
          updated_at: now,
        })
        .eq("id", goalId);

      if (error) {
        console.error("Error updating goal:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateGoal:", error);
      return false;
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);

      if (error) {
        console.error("Error deleting goal:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteGoal:", error);
      return false;
    }
  }

  /**
   * Get goal progress statistics
   */
  async getGoalProgress(goalId: string): Promise<GoalProgress | null> {
    try {
      const goal = await this.getGoalById(goalId);
      if (!goal) return null;

      // For MVP, calculate basic progress
      // In future phases, this would aggregate from actual task completions
      const totalMilestones = goal.aiBreakdown.milestones.length;
      const completedMilestones = goal.aiBreakdown.milestones.filter(
        (m) => m.isCompleted
      ).length;

      const createdDate = new Date(goal.createdAt);
      const now = new Date();
      const daysActive = Math.floor(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        goalId,
        completedTasks: 0, // Will be calculated from actual tasks in future
        totalTasks: goal.aiBreakdown.weeklyTasks.length,
        completedMilestones,
        totalMilestones,
        daysActive,
        lastActivity: goal.lastProgressUpdate || goal.createdAt,
      };
    } catch (error) {
      console.error("Error getting goal progress:", error);
      return null;
    }
  }

  /**
   * Generate goal breakdown using AI
   */
  private async generateGoalBreakdown(
    request: CreateGoalRequest,
    userId: string
  ): Promise<Goal["aiBreakdown"]> {
    try {
      // Get user context for personalization
      const userProfile = await this.getUserProfile(userId);
      const userContext = this.buildUserContext(userProfile);

      const prompt = `Create a comprehensive breakdown for this goal:

Goal: "${request.title}"
Description: "${request.description}"
Category: ${request.category}
Priority: ${request.priority}
Target Date: ${request.targetDate || "Not specified"}
Additional Context: ${request.userContext || "None provided"}

User Context:
${userContext}

Please provide a detailed breakdown in this exact JSON format:
{
  "weeklyTasks": ["task1", "task2", "task3"],
  "dailyHabits": ["habit1", "habit2"],
  "milestones": [
    {
      "title": "Milestone 1",
      "description": "Description of milestone",
      "targetDate": "2024-02-15",
      "isCompleted": false
    }
  ],
  "estimatedTimeframe": "3-6 months",
  "difficultyLevel": "intermediate",
  "successTips": ["tip1", "tip2", "tip3"]
}

Make it specific, actionable, and tailored to the user's work style and preferences.`;

      const response = await openAIService.makeRequest([
        {
          role: "system",
          content:
            "You are an expert goal-setting coach who creates detailed, actionable plans for achieving goals. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      if (response.choices?.[0]?.message?.content) {
        try {
          const breakdown = JSON.parse(response.choices[0].message.content);
          return breakdown;
        } catch (parseError) {
          console.error("Failed to parse AI breakdown:", parseError);
          return this.getDefaultBreakdown(request);
        }
      }

      return this.getDefaultBreakdown(request);
    } catch (error) {
      console.error("Error generating goal breakdown:", error);
      return this.getDefaultBreakdown(request);
    }
  }

  /**
   * Get user profile for context
   */
  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error getting user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  }

  /**
   * Build user context for AI personalization
   */
  private buildUserContext(userProfile: any): string {
    if (!userProfile) return "No user context available";

    const context = [];

    if (userProfile.chronotype) {
      context.push(`Chronotype: ${userProfile.chronotype} person`);
    }

    if (userProfile.work_style) {
      context.push(`Work style: ${userProfile.work_style}`);
    }

    if (userProfile.work_start_time && userProfile.work_end_time) {
      context.push(
        `Work hours: ${userProfile.work_start_time} - ${userProfile.work_end_time}`
      );
    }

    if (userProfile.ai_personality?.aiInsights) {
      const insights = userProfile.ai_personality.aiInsights;
      if (insights.challenges) {
        context.push(`Current challenges: ${insights.challenges.join(", ")}`);
      }
      if (insights.motivationType) {
        context.push(`Motivation style: ${insights.motivationType}`);
      }
    }

    return context.join("\n");
  }

  /**
   * Default breakdown for fallback scenarios
   */
  private getDefaultBreakdown(request: CreateGoalRequest): Goal["aiBreakdown"] {
    return {
      weeklyTasks: [
        `Plan specific actions for ${request.title}`,
        `Research best practices for ${request.category} goals`,
        `Take first concrete step toward ${request.title}`,
      ],
      dailyHabits: [
        `Spend 15 minutes working on ${request.title}`,
        "Review progress and adjust plan if needed",
      ],
      milestones: [
        {
          title: "Initial Planning Complete",
          description: "Define clear action steps and timeline",
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          isCompleted: false,
        },
        {
          title: "First Major Progress",
          description: "Complete initial phase of goal achievement",
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          isCompleted: false,
        },
      ],
      estimatedTimeframe: "2-4 months",
      difficultyLevel: "intermediate",
      successTips: [
        "Break down large tasks into smaller, manageable steps",
        "Set up a consistent routine for working on this goal",
        "Track your progress regularly to stay motivated",
      ],
    };
  }

  /**
   * Award XP for goal completion
   */
  private async awardGoalCompletionXP(
    userId: string,
    goal: Goal
  ): Promise<void> {
    try {
      const baseXP = 100; // Base XP for completing a goal
      const priorityMultiplier = { high: 2, medium: 1.5, low: 1 };
      const xpGained = baseXP * priorityMultiplier[goal.priority];

      // Get current user XP
      const { data: currentProfile, error: fetchError } = await supabase
        .from("users")
        .select("xp_total, current_level")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching user XP:", fetchError);
        return;
      }

      const newXP = (currentProfile.xp_total || 0) + xpGained;
      const newLevel = Math.floor(newXP / 1000) + 1; // Level up every 1000 XP

      // Update user XP
      const { error: updateError } = await supabase
        .from("users")
        .update({
          xp_total: newXP,
          current_level: newLevel,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user XP:", updateError);
        return;
      }

      console.log(
        `User ${userId} gained ${xpGained} XP for completing goal: ${goal.title}`
      );
    } catch (error) {
      console.error("Error awarding goal completion XP:", error);
    }
  }

  /**
   * Map database row to Goal interface
   */
  private mapDatabaseToGoal(data: any): Goal {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      targetDate: data.target_date,
      isCompleted: data.is_completed,
      completedAt: data.completed_at,
      progress: data.progress,
      aiBreakdown: data.ai_breakdown,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastProgressUpdate: data.last_progress_update,
    };
  }

  /**
   * Calculate overall progress for all user goals
   */
  async getUserGoalsOverview(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    averageProgress: number;
    totalXPFromGoals: number;
  }> {
    try {
      const goals = await this.getUserGoals(userId);

      const totalGoals = goals.length;
      const completedGoals = goals.filter((g) => g.isCompleted).length;
      const activeGoals = goals.filter((g) => !g.isCompleted).length;

      const averageProgress =
        totalGoals > 0
          ? Math.round(
              goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals
            )
          : 0;

      // Calculate XP from completed goals
      const baseXP = 100;
      const priorityMultiplier = { high: 2, medium: 1.5, low: 1 };
      const totalXPFromGoals = goals
        .filter((g) => g.isCompleted)
        .reduce(
          (sum, goal) => sum + baseXP * priorityMultiplier[goal.priority],
          0
        );

      return {
        totalGoals,
        completedGoals,
        activeGoals,
        averageProgress,
        totalXPFromGoals,
      };
    } catch (error) {
      console.error("Error calculating goals overview:", error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        averageProgress: 0,
        totalXPFromGoals: 0,
      };
    }
  }
}

export const goalsService = new GoalsService();
export default goalsService;
