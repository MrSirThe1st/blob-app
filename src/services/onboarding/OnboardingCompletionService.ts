// src/services/onboarding/OnboardingCompletionService.ts
/**
 * Enhanced onboarding completion service with real AI integration
 * Eliminates mock responses and implements proper personalized goal/task generation
 */

import { openAIService, ExtractedGoal } from "@/services/api/openai";
import { onboardingStorageService } from "./OnboardingStorageService";
import { databaseService } from "@/services/database/DatabaseService";
import { goalsService } from "@/services/goals/GoalsService";
import { taskSystemOrchestrator } from "@/services/orchestrator/TaskSystemOrchestrator";

interface OnboardingData {
  energyPattern?: "morning" | "afternoon" | "evening";
  energyPatternNote?: string;
  workStyle?: "deep_focus" | "quick_sprints" | "flexible_mix";
  workStyleNote?: string;
  stressResponse?: "reduce" | "structure" | "support";
  stressResponseNote?: string;
  calendarConnected?: boolean;
  conversationText?: string;
}

interface CompletionResult {
  success: boolean;
  message: string;
  redirectTo: string;
  data?: {
    goalsCreated: number;
    tasksGenerated: number;
    nextSteps: string[];
    aiProcessed: boolean;
  };
  error?: string;
}

export class OnboardingCompletionService {
  /**
   * Complete onboarding with real AI integration
   * No fallbacks to mock data - either works with AI or informs user
   */
  static async completeOnboardingWithAI(
    userId: string,
    onboardingData: OnboardingData
  ): Promise<CompletionResult> {
    try {
      console.log(
        "🚀 Starting AI-powered onboarding completion for user:",
        userId
      );

      // Step 1: Check if AI is available
      if (!openAIService.isServiceAvailable()) {
        return this.handleAIUnavailable();
      }

      // Step 2: Test AI connection first
      const connectionTest = await openAIService.testConnection();
      if (!connectionTest.success) {
        console.error("❌ AI connection failed:", connectionTest.message);
        return this.handleAIUnavailable();
      }

      // Step 3: Initialize user database records
      const dbInit = await databaseService.initializeUserData(userId);
      if (!dbInit.success) {
        throw new Error(`Database initialization failed: ${dbInit.error}`);
      }

      // Step 4: Store raw onboarding data first
      const conversationText = onboardingData.conversationText || "";
      if (!conversationText || conversationText.trim().length < 20) {
        return {
          success: false,
          message:
            "Please provide more details about your goals and challenges in the conversation step.",
          redirectTo: "OnboardingStep5", // Go back to conversation step
          error: "Insufficient conversation data for personalization",
        };
      }

      const basicProfile = {
        chronotype: onboardingData.energyPattern,
        workStyle: onboardingData.workStyle,
        stressResponse: onboardingData.stressResponse,
      };

      const additionalContext = {
        energyPatternNote: onboardingData.energyPatternNote,
        workStyleNote: onboardingData.workStyleNote,
        stressResponseNote: onboardingData.stressResponseNote,
      };

      // Store initial data (without AI processing yet)
      const storageResult = await onboardingStorageService.storeOnboardingData(
        userId,
        conversationText,
        basicProfile,
        additionalContext
      );

      if (!storageResult.success) {
        console.error("Failed to store onboarding data:", storageResult.error);
        // Continue anyway, but log the issue
      }

      // Step 5: Process conversation with AI to extract insights
      console.log("🤖 Processing conversation with AI...");
      const conversationData =
        await openAIService.processOnboardingConversation(
          conversationText,
          basicProfile,
          additionalContext
        );

      // Update stored data with AI insights
      if (
        storageResult.success &&
        conversationData.aiInsights &&
        conversationData.summarized
      ) {
        await onboardingStorageService.updateWithAIInsights(
          userId,
          conversationData.aiInsights,
          conversationData.summarized
        );
      }

      // Step 6: Extract goals from conversation
      console.log("🎯 Extracting goals from conversation...");
      const extractedGoals = await openAIService.extractGoalsFromConversation({
        conversationText,
        basicProfile,
        additionalContext,
      });

      if (extractedGoals.length === 0) {
        return {
          success: false,
          message:
            "Unable to identify specific goals from your conversation. Please provide more details about what you want to achieve.",
          redirectTo: "OnboardingStep5",
          error: "No goals could be extracted from conversation",
        };
      }

      console.log(
        `✅ Extracted ${extractedGoals.length} goals:`,
        extractedGoals.map((g) => g.title)
      );

      // Step 7: Create goals in database with AI breakdowns
      const createdGoals = await this.createGoalsInDatabase(
        extractedGoals,
        userId,
        conversationData
      );

      // Step 8: Generate tasks for each goal
      let totalTasksGenerated = 0;
      for (const goal of createdGoals) {
        try {
          const userContext = conversationData.summarized?.userContext || "";
          const goalTasks = await openAIService.generateTasksFromGoal(
            goal.title,
            goal.description,
            {
              chronotype: basicProfile.chronotype,
              workStyle: basicProfile.workStyle,
              availableHours: 8, // Default, can be extracted from conversation
            },
            userContext
          );

          console.log(
            `📋 Generated ${goalTasks.length} tasks for goal: ${goal.title}`
          );
          totalTasksGenerated += goalTasks.length;

          // TODO: Store tasks in database
          // This would integrate with your existing task storage system
        } catch (taskError) {
          console.error(
            `Failed to generate tasks for goal ${goal.title}:`,
            taskError
          );
          // Continue with other goals
        }
      }

      // Step 9: Initialize task system (your existing logic)
      const taskSystemResult =
        await taskSystemOrchestrator.initializeTaskSystem(userId);

      const nextSteps = [
        "Review your personalized goals and tasks",
        "Complete your first scheduled task to earn XP",
        "Connect your calendar for better scheduling",
        "Explore the AI-powered daily planning features",
      ];

      return {
        success: true,
        message:
          "Welcome to Blob! Your AI-powered productivity system is personalized and ready.",
        redirectTo: "Home",
        data: {
          goalsCreated: createdGoals.length,
          tasksGenerated: totalTasksGenerated,
          nextSteps,
          aiProcessed: true,
        },
      };
    } catch (error) {
      console.error("❌ Error in AI onboarding completion:", error);

      // If it's an AI-related error, show appropriate message
      if (error instanceof Error && error.message.includes("API")) {
        return this.handleAIUnavailable();
      }

      return {
        success: false,
        message:
          "An unexpected error occurred during onboarding. Please try again.",
        redirectTo: "OnboardingStep5",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Handle when AI is not available - no fallback to mock data
   */
  private static handleAIUnavailable(): CompletionResult {
    return {
      success: false,
      message:
        "AI services are currently unavailable. The personalized goal extraction and task generation features require AI to work properly. Please try again later or contact support.",
      redirectTo: "OnboardingStep5",
      error: "AI service unavailable",
      data: {
        goalsCreated: 0,
        tasksGenerated: 0,
        nextSteps: [
          "Try onboarding again when AI services are available",
          "Contact support if the issue persists",
          "You can manually create goals and tasks in the meantime",
        ],
        aiProcessed: false,
      },
    };
  }

  /**
   * Create goals in database with AI-generated breakdowns
   */
  private static async createGoalsInDatabase(
    extractedGoals: ExtractedGoal[],
    userId: string,
    conversationData: any
  ): Promise<any[]> {
    const createdGoals = [];

    for (const goal of extractedGoals) {
      try {
        // Prepare goal data for database
        const goalData = {
          title: goal.title,
          description: goal.description,
          category: goal.category,
          priority: goal.priority,
          targetDate: goal.targetDate
            ? new Date(goal.targetDate).toISOString()
            : null,
          isActive: true,
          userId,
          aiBreakdown: {
            milestones: goal.breakdown?.milestones || [],
            suggestedTasks: goal.breakdown?.suggestedTasks || [],
            timeframe: goal.breakdown?.timeframe || "Not specified",
            userContext: goal.userContext,
            aiGenerated: true,
            extractedFrom: "onboarding_conversation",
          },
          userPreferences: {
            chronotype:
              conversationData.aiInsights?.workPreferences?.focusStyle,
            stressFactors: conversationData.aiInsights?.stressFactors,
            motivation: conversationData.aiInsights?.motivationType,
          },
        };

        // Create goal using your existing service
        const createdGoal = await goalsService.createGoal(goalData);

        if (createdGoal) {
          console.log(`✅ Created goal: ${goal.title}`);
          createdGoals.push(createdGoal);
        } else {
          console.error(`❌ Failed to create goal: ${goal.title}`);
        }
      } catch (error) {
        console.error(`❌ Error creating goal ${goal.title}:`, error);
        // Continue with other goals
      }
    }

    return createdGoals;
  }

  /**
   * Manual completion for when user prefers to set up goals manually
   */
  static async completeOnboardingManually(
    userId: string,
    onboardingData: OnboardingData
  ): Promise<CompletionResult> {
    try {
      console.log("📝 Completing onboarding manually for user:", userId);

      // Initialize user database records
      const dbInit = await databaseService.initializeUserData(userId);
      if (!dbInit.success) {
        throw new Error(`Database initialization failed: ${dbInit.error}`);
      }

      // Store basic onboarding data without AI processing
      if (onboardingData.conversationText) {
        const basicProfile = {
          chronotype: onboardingData.energyPattern,
          workStyle: onboardingData.workStyle,
          stressResponse: onboardingData.stressResponse,
        };

        const additionalContext = {
          energyPatternNote: onboardingData.energyPatternNote,
          workStyleNote: onboardingData.workStyleNote,
          stressResponseNote: onboardingData.stressResponseNote,
        };

        await onboardingStorageService.storeOnboardingData(
          userId,
          onboardingData.conversationText,
          basicProfile,
          additionalContext
        );
      }

      // Initialize task system
      const taskSystemResult =
        await taskSystemOrchestrator.initializeTaskSystem(userId);

      return {
        success: true,
        message:
          "Welcome to Blob! You can now manually create your goals and tasks.",
        redirectTo: "Home",
        data: {
          goalsCreated: 0,
          tasksGenerated: 0,
          nextSteps: [
            "Create your first goal manually",
            "Add tasks to work toward your goals",
            "Set up your daily schedule",
            "Try the AI features when they become available",
          ],
          aiProcessed: false,
        },
      };
    } catch (error) {
      console.error("❌ Error in manual onboarding completion:", error);
      return {
        success: false,
        message: "An error occurred setting up your account. Please try again.",
        redirectTo: "OnboardingStep5",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Retry AI processing for users who completed onboarding without AI
   */
  static async retryAIProcessing(userId: string): Promise<CompletionResult> {
    try {
      console.log("🔄 Retrying AI processing for user:", userId);

      // Check if AI is available
      if (!openAIService.isServiceAvailable()) {
        return this.handleAIUnavailable();
      }

      // Get stored onboarding data
      const storedData = await onboardingStorageService.getOnboardingData({
        userId,
      });
      if (!storedData.success || !storedData.data) {
        return {
          success: false,
          message:
            "No onboarding data found to process. Please complete onboarding first.",
          redirectTo: "Onboarding",
          error: "No stored onboarding data",
        };
      }

      const { conversation_text, basic_profile, additional_context } =
        storedData.data;

      // Process with AI
      const conversationData =
        await openAIService.processOnboardingConversation(
          conversation_text,
          basic_profile,
          additional_context
        );

      // Extract goals
      const extractedGoals = await openAIService.extractGoalsFromConversation({
        conversationText: conversation_text,
        basicProfile: basic_profile,
        additionalContext: additional_context,
      });

      // Update stored data with AI insights
      await onboardingStorageService.updateWithAIInsights(
        userId,
        conversationData.aiInsights,
        conversationData.summarized
      );

      // Create goals
      const createdGoals = await this.createGoalsInDatabase(
        extractedGoals,
        userId,
        conversationData
      );

      return {
        success: true,
        message: `Successfully processed your onboarding data with AI! Created ${createdGoals.length} personalized goals.`,
        redirectTo: "Goals",
        data: {
          goalsCreated: createdGoals.length,
          tasksGenerated: 0, // Tasks will be generated later
          nextSteps: [
            "Review your new AI-generated goals",
            "Generate tasks for your goals",
            "Update your daily schedule",
          ],
          aiProcessed: true,
        },
      };
    } catch (error) {
      console.error("❌ Error retrying AI processing:", error);
      return {
        success: false,
        message: "Failed to process your data with AI. Please try again later.",
        redirectTo: "Home",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const onboardingCompletionService = OnboardingCompletionService;
