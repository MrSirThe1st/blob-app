// src/services/onboarding/OnboardingCompletionService.ts
import { openAIService } from "@/services/api/openai";
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

interface ExtractedGoal {
  title: string;
  description: string;
  category:
    | "fitness"
    | "career"
    | "learning"
    | "personal"
    | "finance"
    | "relationships";
  priority: "low" | "medium" | "high";
  targetDate?: string;
  userContext: string;
}

interface CompletionResult {
  success: boolean;
  message: string;
  redirectTo: string;
  data?: {
    goalsCreated: number;
    tasksGenerated: number;
    nextSteps: string[];
  };
}

export class OnboardingCompletionService {
  /**
   * Complete the entire onboarding process:
   * 1. Extract goals from conversation
   * 2. Create goals automatically
   * 3. Generate tasks and schedule
   * 4. Initialize task system
   */
  static async completeOnboardingWithGoalGeneration(
    userId: string,
    onboardingData: OnboardingData
  ): Promise<CompletionResult> {
    try {
      console.log(
        "🚀 Starting automated onboarding completion for user:",
        userId
      );

      // Step 1: Initialize user database records
      await databaseService.initializeUserData(userId);

      // Step 2: Extract goals from conversation
      const extractedGoals = await this.extractGoalsFromConversation(
        onboardingData,
        userId
      );

      if (extractedGoals.length === 0) {
        // Fallback: Create default goals if extraction fails
        const defaultGoals = this.createDefaultGoals(onboardingData);
        extractedGoals.push(...defaultGoals);
      }

      // Step 3: Create goals in database with AI breakdowns
      const createdGoals = await this.createGoalsInDatabase(
        extractedGoals,
        userId,
        onboardingData
      );

      // Step 4: Initialize complete task system
      const taskSystemResult =
        await taskSystemOrchestrator.initializeTaskSystem(userId);

      if (taskSystemResult.success) {
        return {
          success: true,
          message:
            "Welcome to Blob! Your personalized productivity system is ready.",
          redirectTo: "Today", // Send them straight to see their tasks
          data: {
            goalsCreated: createdGoals.length,
            tasksGenerated: taskSystemResult.data?.tasksGenerated || 0,
            nextSteps: [
              "Check your Today screen for your first personalized tasks",
              "Explore your Goals to see your AI-generated plan",
              "Complete tasks to start earning XP and building habits",
              "Use the AI assistant anytime you need help",
            ],
          },
        };
      } else {
        // Goals created but task system failed - still success
        return {
          success: true,
          message:
            "Goals created successfully! Tasks will be generated shortly.",
          redirectTo: "Goals",
          data: {
            goalsCreated: createdGoals.length,
            tasksGenerated: 0,
            nextSteps: [
              "Review your automatically created goals",
              "Tasks will be generated in the background",
              "Check your Today screen in a few moments",
            ],
          },
        };
      }
    } catch (error) {
      console.error("Error in automated onboarding completion:", error);

      // Fallback to manual goal creation flow
      return {
        success: false,
        message: "Welcome to Blob! Let's start by setting up your first goal.",
        redirectTo: "Goals", // Send to manual goal creation
      };
    }
  }

  /**
   * Extract goals from user's onboarding conversation using AI
   */
  private static async extractGoalsFromConversation(
    onboardingData: OnboardingData,
    userId: string
  ): Promise<ExtractedGoal[]> {
    try {
      const { conversationText, ...profileData } = onboardingData;

      if (!conversationText || conversationText.trim().length < 20) {
        console.log("Insufficient conversation data for goal extraction");
        return [];
      }

      // Enhanced AI prompt for goal extraction
      const extractedGoals = await openAIService.extractGoalsForCreation(
        conversationText,
        profileData
      );

      return extractedGoals;
    } catch (error) {
      console.error("Error extracting goals from conversation:", error);
      return [];
    }
  }

  /**
   * Create default goals based on user preferences if AI extraction fails
   */
  private static createDefaultGoals(
    onboardingData: OnboardingData
  ): ExtractedGoal[] {
    const defaultGoals: ExtractedGoal[] = [];

    // Default based on work style
    if (onboardingData.workStyle === "deep_focus") {
      defaultGoals.push({
        title: "Improve Focus and Deep Work",
        description:
          "Develop better concentration skills and establish focused work sessions",
        category: "personal",
        priority: "high",
        userContext: "User prefers deep focus work sessions",
      });
    } else if (onboardingData.workStyle === "quick_sprints") {
      defaultGoals.push({
        title: "Master Task Management",
        description:
          "Improve efficiency in completing multiple tasks throughout the day",
        category: "personal",
        priority: "high",
        userContext: "User prefers quick task sprints and variety",
      });
    }

    // Default based on energy pattern
    if (onboardingData.energyPattern === "morning") {
      defaultGoals.push({
        title: "Optimize Morning Routine",
        description:
          "Create a powerful morning routine to maximize peak energy hours",
        category: "personal",
        priority: "medium",
        userContext: "User is most energetic in the morning",
      });
    }

    // Always include a general productivity goal
    defaultGoals.push({
      title: "Build Better Daily Habits",
      description:
        "Establish consistent daily routines that support long-term success",
      category: "personal",
      priority: "medium",
      userContext: "General productivity improvement goal",
    });

    // Ensure we always have at least 2 goals
    if (defaultGoals.length < 2) {
      defaultGoals.push({
        title: "Learn New Skills",
        description: "Continuously develop new abilities and knowledge",
        category: "learning",
        priority: "medium",
        userContext: "Default learning and growth goal",
      });
    }

    return defaultGoals.slice(0, 3); // Limit to 3 goals maximum
  }

  /**
   * Create goals in database with full AI breakdowns
   */
  private static async createGoalsInDatabase(
    extractedGoals: ExtractedGoal[],
    userId: string,
    onboardingData: OnboardingData
  ): Promise<any[]> {
    const createdGoals = [];

    for (const goalData of extractedGoals) {
      try {
        // Add user context from onboarding
        const enhancedContext = this.buildUserContext(goalData, onboardingData);

        const goalRequest = {
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          priority: goalData.priority,
          targetDate: goalData.targetDate,
          userContext: enhancedContext,
        };

        // FIX: GoalsService.createGoal expects (userId, request) not (request, userId)
        const createdGoal = await goalsService.createGoal(userId, goalRequest);

        if (createdGoal) {
          createdGoals.push(createdGoal);
          console.log(`✅ Created goal: ${goalData.title}`);
        }
      } catch (error) {
        console.error(`Error creating goal "${goalData.title}":`, error);
        // Continue with other goals even if one fails
      }
    }

    return createdGoals;
  }

  /**
   * Build enhanced user context for goal creation
   */
  private static buildUserContext(
    goalData: ExtractedGoal,
    onboardingData: OnboardingData
  ): string {
    const contextParts = [goalData.userContext];

    if (onboardingData.energyPattern) {
      contextParts.push(`Peak energy: ${onboardingData.energyPattern}`);
    }

    if (onboardingData.workStyle) {
      contextParts.push(`Work style: ${onboardingData.workStyle}`);
    }

    if (onboardingData.stressResponse) {
      contextParts.push(`Stress response: ${onboardingData.stressResponse}`);
    }

    if (onboardingData.energyPatternNote) {
      contextParts.push(`Energy note: ${onboardingData.energyPatternNote}`);
    }

    if (onboardingData.workStyleNote) {
      contextParts.push(`Work note: ${onboardingData.workStyleNote}`);
    }

    return contextParts.join(". ");
  }
}

// Export for easy use in onboarding flow
export const onboardingCompletionService = OnboardingCompletionService;
