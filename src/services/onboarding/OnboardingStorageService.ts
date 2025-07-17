// src/services/onboarding/OnboardingStorageService.ts
/**
 * Service for storing and retrieving onboarding conversation data
 * Stores both full transcript and AI-extracted insights for future reference
 */

import { supabase } from "@/services/api/supabase";
import { OnboardingConversationData } from "@/services/api/openai";

export interface StoredOnboardingData {
  id: string;
  user_id: string;

  // Raw conversation data
  conversation_text: string;
  basic_profile: {
    chronotype?: string;
    workStyle?: string;
    stressResponse?: string;
  };
  additional_context: {
    energyPatternNote?: string;
    workStyleNote?: string;
    stressResponseNote?: string;
  };

  // AI-extracted insights
  ai_insights: {
    primaryGoals: string[];
    challenges: string[];
    lifestyle: string;
    motivationType: string;
    availabilityPattern: string;
    personalityTraits: string[];
    workPreferences?: {
      preferredHours?: string;
      energyPeaks?: string[];
      focusStyle?: string;
    };
    stressFactors?: string[];
    timeConstraints?: string[];
  };

  // Summarized for quick reference
  summary: {
    keyPoints: string[];
    userContext: string;
    personalizedRecommendations: string[];
  };

  // Metadata
  created_at: string;
  updated_at: string;
  processing_status: "pending" | "processed" | "failed";
  ai_processing_notes?: string;
}

export interface OnboardingDataQuery {
  userId: string;
  includeFullTranscript?: boolean;
  includeSummaryOnly?: boolean;
}

class OnboardingStorageService {
  /**
   * Store complete onboarding conversation and AI insights
   */
  async storeOnboardingData(
    userId: string,
    conversationText: string,
    basicProfile: {
      chronotype?: string;
      workStyle?: string;
      stressResponse?: string;
    },
    additionalContext: {
      energyPatternNote?: string;
      workStyleNote?: string;
      stressResponseNote?: string;
    },
    aiInsights?: OnboardingConversationData["aiInsights"],
    summary?: OnboardingConversationData["summarized"]
  ): Promise<{
    success: boolean;
    data?: StoredOnboardingData;
    error?: string;
  }> {
    try {
      console.log("📝 Storing onboarding data for user:", userId);

      // Prepare data for storage
      const onboardingData = {
        user_id: userId,
        conversation_text: conversationText,
        basic_profile: basicProfile,
        additional_context: additionalContext,
        ai_insights: aiInsights || null,
        summary: summary || null,
        processing_status: aiInsights ? "processed" : ("pending" as const),
        ai_processing_notes: aiInsights
          ? "Successfully processed by AI"
          : "Pending AI processing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in database
      const { data, error } = await supabase
        .from("onboarding_conversations")
        .insert(onboardingData)
        .select()
        .single();

      if (error) {
        console.error("❌ Error storing onboarding data:", error);
        return {
          success: false,
          error: `Failed to store onboarding data: ${error.message}`,
        };
      }

      console.log("✅ Onboarding data stored successfully");
      return {
        success: true,
        data: data as StoredOnboardingData,
      };
    } catch (error) {
      console.error("❌ Exception storing onboarding data:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Update existing onboarding data with AI insights
   */
  async updateWithAIInsights(
    userId: string,
    aiInsights: OnboardingConversationData["aiInsights"],
    summary: OnboardingConversationData["summarized"]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(
        "🔄 Updating onboarding data with AI insights for user:",
        userId
      );

      const { error } = await supabase
        .from("onboarding_conversations")
        .update({
          ai_insights: aiInsights,
          summary: summary,
          processing_status: "processed",
          ai_processing_notes: "Successfully processed by AI",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("❌ Error updating AI insights:", error);
        return {
          success: false,
          error: `Failed to update AI insights: ${error.message}`,
        };
      }

      console.log("✅ AI insights updated successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Exception updating AI insights:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Retrieve onboarding data for a user
   */
  async getOnboardingData(query: OnboardingDataQuery): Promise<{
    success: boolean;
    data?: StoredOnboardingData;
    error?: string;
  }> {
    try {
      console.log("📖 Retrieving onboarding data for user:", query.userId);

      // Determine what columns to select
      let selectColumns = "*";
      if (query.includeSummaryOnly) {
        selectColumns =
          "id, user_id, summary, basic_profile, ai_insights, processing_status, created_at";
      } else if (!query.includeFullTranscript) {
        selectColumns = "*, conversation_text:conversation_text"; // Include everything but conversation can be truncated
      }

      const { data, error } = await supabase
        .from("onboarding_conversations")
        .select(selectColumns)
        .eq("user_id", query.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error retrieving onboarding data:", error);
        return {
          success: false,
          error: `Failed to retrieve onboarding data: ${error.message}`,
        };
      }

      if (!data) {
        console.log("📝 No onboarding data found for user");
        return {
          success: true,
          data: undefined,
        };
      }

      console.log("✅ Onboarding data retrieved successfully");
      return {
        success: true,
        data: data as StoredOnboardingData,
      };
    } catch (error) {
      console.error("❌ Exception retrieving onboarding data:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get user context summary for use in AI requests
   */
  async getUserContextSummary(userId: string): Promise<{
    success: boolean;
    context?: string;
    recommendations?: string[];
    error?: string;
  }> {
    try {
      const result = await this.getOnboardingData({
        userId,
        includeSummaryOnly: true,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: "No onboarding data available for context",
        };
      }

      const { summary, ai_insights } = result.data;

      // Build context string from available data
      let context = "";
      if (summary?.userContext) {
        context = summary.userContext;
      } else if (ai_insights?.lifestyle) {
        context = ai_insights.lifestyle;
      } else {
        context =
          "User focused on improving productivity and achieving personal goals";
      }

      // Get recommendations
      const recommendations = summary?.personalizedRecommendations || [
        "Schedule important tasks during peak energy hours",
        "Include regular breaks for optimal performance",
        "Align task scheduling with personal work style preferences",
      ];

      return {
        success: true,
        context,
        recommendations,
      };
    } catch (error) {
      console.error("❌ Error getting user context:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Check if user has completed onboarding with AI processing
   */
  async hasProcessedOnboardingData(userId: string): Promise<boolean> {
    try {
      const result = await this.getOnboardingData({
        userId,
        includeSummaryOnly: true,
      });

      return (
        result.success &&
        result.data?.processing_status === "processed" &&
        !!result.data?.ai_insights
      );
    } catch (error) {
      console.error("❌ Error checking onboarding status:", error);
      return false;
    }
  }

  /**
   * Get all users with pending AI processing (for batch processing)
   */
  async getUsersWithPendingProcessing(): Promise<{
    success: boolean;
    users?: Array<{
      user_id: string;
      conversation_text: string;
      basic_profile: any;
      additional_context: any;
    }>;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("onboarding_conversations")
        .select("user_id, conversation_text, basic_profile, additional_context")
        .eq("processing_status", "pending")
        .order("created_at", { ascending: true });

      if (error) {
        return {
          success: false,
          error: `Failed to get pending users: ${error.message}`,
        };
      }

      return {
        success: true,
        users: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Delete onboarding data for a user (GDPR compliance)
   */
  async deleteOnboardingData(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting onboarding data for user:", userId);

      const { error } = await supabase
        .from("onboarding_conversations")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error deleting onboarding data:", error);
        return {
          success: false,
          error: `Failed to delete onboarding data: ${error.message}`,
        };
      }

      console.log("✅ Onboarding data deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Exception deleting onboarding data:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Create the required database table if it doesn't exist
   * This is for development/setup purposes
   */
  async ensureTableExists(): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: In production, this should be handled by migrations
      // This is just for development setup
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS onboarding_conversations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          conversation_text TEXT NOT NULL,
          basic_profile JSONB NOT NULL DEFAULT '{}',
          additional_context JSONB NOT NULL DEFAULT '{}',
          ai_insights JSONB,
          summary JSONB,
          processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed')),
          ai_processing_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          
          -- Indexes for performance
          UNIQUE(user_id, created_at)
        );

        -- Enable RLS
        ALTER TABLE onboarding_conversations ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY IF NOT EXISTS "Users can read own onboarding data" 
          ON onboarding_conversations FOR SELECT 
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert own onboarding data" 
          ON onboarding_conversations FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update own onboarding data" 
          ON onboarding_conversations FOR UPDATE 
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete own onboarding data" 
          ON onboarding_conversations FOR DELETE 
          USING (auth.uid() = user_id);
      `;

      // Execute via Supabase SQL (this would typically be done via migrations)
      console.log(
        "🔧 Table creation SQL prepared. Run this in your Supabase SQL editor:"
      );
      console.log(createTableSQL);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Export singleton instance
export const onboardingStorageService = new OnboardingStorageService();
export default onboardingStorageService;
