/**
 * Authentication service
 * Handles user authentication, registration, and session management
 */

import { supabase } from "./supabase";
import { AuthError, AuthResponse, Session, User } from "@supabase/supabase-js";

// Types for authentication
export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface UserProfileData {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  xpTotal: number;
  currentLevel: number;
  currentStreak: number;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, fullName }: SignUpData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error.message);
        return { user: null, session: null, error };
      }

      // Don't create profile immediately - let auth state change handle it
      console.log(
        "✅ User authentication created, profile will be created on auth state change"
      );

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (err) {
      console.error("Sign up exception:", err);
      return {
        user: null,
        session: null,
        error: err as AuthError,
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error.message);
        return { user: null, session: null, error };
      }

      // Update last login time
      if (data.user) {
        await this.updateLastLogin(data.user.id);
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (err) {
      console.error("Sign in exception:", err);
      return {
        user: null,
        session: null,
        error: err as AuthError,
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
      }

      return { error };
    } catch (err) {
      console.error("Sign out exception:", err);
      return { error: err as AuthError };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{
    session: Session | null;
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (err) {
      console.error("Get session exception:", err);
      return { session: null, error: err as AuthError };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{
    user: User | null;
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { user: data.user, error };
    } catch (err) {
      console.error("Get current user exception:", err);
      return { user: null, error: err as AuthError };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "blobai://reset-password",
      });

      if (error) {
        console.error("Reset password error:", error.message);
      }

      return { error };
    } catch (err) {
      console.error("Reset password exception:", err);
      return { error: err as AuthError };
    }
  }

  /**
   * Update password
   */
  async updatePassword(
    newPassword: string
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Update password error:", error.message);
      }

      return { error };
    } catch (err) {
      console.error("Update password exception:", err);
      return { error: err as AuthError };
    }
  }

  /**
   * Create user profile in database (public)
   */
  async createUserProfile(
    user: User,
    fullName?: string
  ): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name: fullName || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add default values for required fields
        onboarding_completed: false,
        onboarding_step: 0,
        xp_total: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
        break_duration: 15,
        calendar_connected: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (error) {
        console.error("Create user profile error:", error.message);
        return { error };
      }

      console.log("✅ User profile created successfully");
      return { error: null };
    } catch (err) {
      console.error("Create user profile exception:", err);
      return { error: err };
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.error("Update last login error:", error.message);
      }
    } catch (err) {
      console.error("Update last login exception:", err);
    }
  }

  /**
   * Get user profile data
   */
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
        id,
        email,
        full_name,
        avatar_url,
        onboarding_completed,
        onboarding_step,
        xp_total,
        current_level,
        current_streak
      `
        )
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) {
        console.error("Get user profile error:", error.message);
        return null;
      }

      // If no data returned, user profile doesn't exist
      if (!data) {
        console.log("No profile found for user:", userId);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        onboardingCompleted: data.onboarding_completed,
        onboardingStep: data.onboarding_step,
        xpTotal: data.xp_total,
        currentLevel: data.current_level,
        currentStreak: data.current_streak,
      };
    } catch (err) {
      console.error("Get user profile exception:", err);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<{
      fullName: string;
      avatarUrl: string;
      onboardingCompleted: boolean;
      onboardingStep: number;
      chronotype: "morning" | "evening" | "flexible";
      workStyle: "deep_focus" | "multitasking" | "balanced";
      motivationType: "intrinsic" | "extrinsic" | "mixed";
      workStartTime: string;
      workEndTime: string;
      breakDuration: number;
    }>
  ): Promise<{ error: any | null }> {
    try {
      const updateData: any = {};

      // Map camelCase to snake_case for database
      if (updates.fullName !== undefined)
        updateData.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined)
        updateData.avatar_url = updates.avatarUrl;
      if (updates.onboardingCompleted !== undefined)
        updateData.onboarding_completed = updates.onboardingCompleted;
      if (updates.onboardingStep !== undefined)
        updateData.onboarding_step = updates.onboardingStep;
      if (updates.chronotype !== undefined)
        updateData.chronotype = updates.chronotype;
      if (updates.workStyle !== undefined)
        updateData.work_style = updates.workStyle;
      if (updates.motivationType !== undefined)
        updateData.motivation_type = updates.motivationType;
      if (updates.workStartTime !== undefined)
        updateData.work_start_time = updates.workStartTime;
      if (updates.workEndTime !== undefined)
        updateData.work_end_time = updates.workEndTime;
      if (updates.breakDuration !== undefined)
        updateData.break_duration = updates.breakDuration;

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (error) {
        console.error("Update user profile error:", error.message);
      }

      return { error };
    } catch (err) {
      console.error("Update user profile exception:", err);
      return { error: err };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
