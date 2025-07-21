// src/services/onboarding/OnboardingCompletionService.ts
/**
 * Enhanced onboarding completion service with real AI integration
 * Eliminates mock responses and implements proper personalized goal/task generation
 */

import { ExtractedGoal, openAIService } from "@/services/api/openai";
import { supabase } from "@/services/api/supabase";
import { databaseService } from "@/services/database/DatabaseService";
import { goalsService } from "@/services/goals/GoalsService";
import { taskSystemOrchestrator } from "@/services/orchestrator/TaskSystemOrchestrator";
import { onboardingStorageService } from "./OnboardingStorageService";
import { onboardingTaskGenerationService } from "./OnboardingTaskGenerationService";

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

      // Step 5: Generate EVERYTHING in ONE AI request
      console.log("🤖 Generating complete onboarding setup with AI...");
      const completeSetup = await openAIService.generateCompleteOnboardingSetup(
        {
          conversationText,
          basicProfile,
          additionalContext,
          timeframe: "1_week", // Default timeframe
        }
      );

      // Update stored data with AI insights
      if (storageResult.success) {
        await onboardingStorageService.updateWithAIInsights(
          userId,
          completeSetup.aiInsights,
          completeSetup.summarized
        );
      }

      console.log(
        `✅ Generated complete setup: ${completeSetup.goals.length} goals, ${completeSetup.initialTasks.length} tasks`
      );

      // Step 6: Create goals in database
      const createdGoals = await this.createGoalsInDatabase(
        completeSetup.goals,
        userId,
        {
          aiInsights: completeSetup.aiInsights,
          summarized: completeSetup.summarized,
        }
      );

      // Step 7: Create initial tasks in database
      const createdTasks = await this.createTasksInDatabase(
        userId,
        completeSetup.initialTasks
      );

      console.log(
        `✅ Created ${createdGoals.length} goals and ${createdTasks.length} tasks`
      );

      // Step 8: Initialize task system (your existing logic)
      try {
        await taskSystemOrchestrator.initializeTaskSystem(userId);
        console.log("✅ Task system initialized");
      } catch (error) {
        console.error("❌ Task system initialization failed:", error);
        // Continue anyway - core onboarding is complete
      }

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
          tasksGenerated: createdTasks.length,
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
   * Map extracted goal categories to valid Goal categories
   */
  private static mapGoalCategory(
    category: string
  ):
    | "health"
    | "career"
    | "personal"
    | "learning"
    | "relationships"
    | "finance" {
    switch (category.toLowerCase()) {
      case "fitness":
        return "health";
      case "career":
        return "career";
      case "learning":
        return "learning";
      case "personal":
        return "personal";
      case "relationships":
        return "relationships";
      case "finance":
        return "finance";
      default:
        return "personal"; // Default fallback
    }
  }

  /**
   * Parse target date from AI response, handling various formats
   */
  private static parseTargetDate(targetDate?: string): string | undefined {
    if (!targetDate) return undefined;

    try {
      // Handle relative dates like "3 months", "6 weeks", etc.
      const relativeDateMatch = targetDate.match(/(\d+)\s*(month|week|day)s?/i);
      if (relativeDateMatch) {
        const amount = parseInt(relativeDateMatch[1]);
        const unit = relativeDateMatch[2].toLowerCase();
        const futureDate = new Date();

        switch (unit) {
          case "month":
            futureDate.setMonth(futureDate.getMonth() + amount);
            break;
          case "week":
            futureDate.setDate(futureDate.getDate() + amount * 7);
            break;
          case "day":
            futureDate.setDate(futureDate.getDate() + amount);
            break;
        }

        return futureDate.toISOString();
      }

      // Try to parse as a standard date
      const parsedDate = new Date(targetDate);

      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        console.warn(
          `Invalid target date: ${targetDate}, using default 3 months`
        );
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 3);
        return defaultDate.toISOString();
      }

      // Check if the date is in the past
      if (parsedDate < new Date()) {
        console.warn(
          `Target date is in the past: ${targetDate}, using 3 months from now`
        );
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        return futureDate.toISOString();
      }

      return parsedDate.toISOString();
    } catch (error) {
      console.error(`Error parsing target date: ${targetDate}`, error);
      // Default to 3 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      return defaultDate.toISOString();
    }
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
        console.log(
          `🎯 Creating goal: ${goal.title} with targetDate: ${goal.targetDate}`
        );

        // Prepare goal data for database
        const goalData = {
          title: goal.title,
          description: goal.description,
          category: this.mapGoalCategory(goal.category),
          priority: goal.priority,
          targetDate: this.parseTargetDate(goal.targetDate),
          userContext: goal.userContext,
        };

        // Create goal using your existing service
        const createdGoal = await goalsService.createGoal(userId, goalData);

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
   * Create tasks in database from AI-generated task list
   */
  private static async createTasksInDatabase(
    userId: string,
    aiGeneratedTasks: any[]
  ): Promise<any[]> {
    const createdTasks = [];

    for (const task of aiGeneratedTasks) {
      try {
        console.log(`📋 Creating task: ${task.title}`);

        // Prepare task data for database
        const taskData = {
          user_id: userId,
          title: task.title,
          description: task.description || "",
          type: task.type || "one_time",
          priority: task.priority || "medium",
          status: "pending",
          estimated_duration: task.estimatedDuration || 30,
          suggested_time_slot: task.timeSlot || "morning",
          energy_level_required: task.energyLevel || "medium",
          difficulty_level: Math.min(Math.max(task.difficulty || 1, 1), 10),
          context_requirements: `Generated from onboarding - ${task.category || "general"}`,
          success_criteria:
            task.successCriteria || "Complete the task successfully",
          scheduled_date: new Date().toISOString().split("T")[0], // Today
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Create task directly with supabase
        const { data, error } = await supabase
          .from("tasks")
          .insert(taskData)
          .select("*")
          .single();

        if (error) {
          console.error(`❌ Failed to create task: ${task.title}`, error);
        } else {
          console.log(`✅ Created task: ${task.title}`);
          createdTasks.push(data);
        }
      } catch (error) {
        console.error(`❌ Error creating task ${task.title}:`, error);
        // Continue with other tasks
      }
    }

    return createdTasks;
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
      try {
        await taskSystemOrchestrator.initializeTaskSystem(userId);
        console.log("✅ Task system initialized");
      } catch (error) {
        console.error("❌ Task system initialization failed:", error);
        // Continue anyway - core onboarding is complete
      }

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

      // Generate initial tasks from onboarding insights
      console.log("📋 Generating initial tasks from retry AI processing...");
      const taskGenerationResult =
        await onboardingTaskGenerationService.generateInitialTasks({
          userId,
          conversationText: conversation_text,
          basicProfile: basic_profile,
          aiInsights: conversationData.aiInsights,
          timeframe: "1_week",
        });

      const tasksGenerated = taskGenerationResult.success
        ? taskGenerationResult.tasksGenerated
        : 0;

      return {
        success: true,
        message: `Successfully processed your onboarding data with AI! Created ${createdGoals.length} personalized goals and ${tasksGenerated} initial tasks.`,
        redirectTo: "Goals",
        data: {
          goalsCreated: createdGoals.length,
          tasksGenerated: tasksGenerated, // Use actual generated tasks count
          nextSteps: [
            "Review your new AI-generated goals",
            "Check your initial tasks in the Today screen",
            "Generate more tasks for your goals",
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
