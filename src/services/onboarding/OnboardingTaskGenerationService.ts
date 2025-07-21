// src/services/onboarding/OnboardingTaskGenerationService.ts
/**
 * Service to generate initial tasks directly from onboarding data and AI insights
 * This bridges the gap between onboarding completion and task system initialization
 */

import { openAIService } from "@/services/api/openai";
import { Task, TaskPriority, TaskStatus, TaskType } from "@/types/tasks";
import { onboardingStorageService } from "./OnboardingStorageService";

// Custom interface for onboarding-generated tasks
interface OnboardingGeneratedTask {
  title: string;
  description: string;
  type: "daily_habit" | "weekly_task" | "one_time";
  priority: "high" | "medium" | "low";
  estimatedDuration: number;
  timeSlot?: string;
  energyLevel?: string;
  difficulty?: number;
  successCriteria?: string;
  category?: string;
}

interface OnboardingTaskGenerationRequest {
  userId: string;
  conversationText: string;
  basicProfile: {
    chronotype?: string;
    workStyle?: string;
    stressResponse?: string;
  };
  aiInsights?: {
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
  timeframe?: "2_days" | "1_week" | "2_weeks"; // Default to 1_week
}

interface TaskGenerationResult {
  success: boolean;
  tasksGenerated: number;
  tasks: Task[];
  error?: string;
  recommendations?: string[];
}

export class OnboardingTaskGenerationService {
  /**
   * Generate initial tasks based on onboarding insights
   * This is called after onboarding completion to provide immediate value
   */
  async generateInitialTasks(
    request: OnboardingTaskGenerationRequest
  ): Promise<TaskGenerationResult> {
    try {
      console.log("🎯 Generating initial tasks from onboarding data...");

      if (!openAIService.isServiceAvailable()) {
        throw new Error("AI service is not available for task generation");
      }

      // Generate tasks using AI based on onboarding insights
      const generatedTasks =
        await this.generateTasksFromOnboardingInsights(request);

      if (generatedTasks.length === 0) {
        return {
          success: false,
          tasksGenerated: 0,
          tasks: [],
          error: "No tasks could be generated from the provided insights",
        };
      }

      // Save tasks to database
      const savedTasks = await this.saveOnboardingTasksToDatabase(
        request.userId,
        generatedTasks,
        request.timeframe || "1_week"
      );

      console.log(
        `✅ Generated ${savedTasks.length} initial tasks from onboarding`
      );

      return {
        success: true,
        tasksGenerated: savedTasks.length,
        tasks: savedTasks,
        recommendations: this.generateTaskRecommendations(request.aiInsights),
      };
    } catch (error) {
      console.error("❌ Error generating initial tasks:", error);
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate tasks from AI based on onboarding conversation and insights
   */
  private async generateTasksFromOnboardingInsights(
    request: OnboardingTaskGenerationRequest
  ): Promise<OnboardingGeneratedTask[]> {
    // Use existing OpenAI service method to generate tasks
    // We'll create a goal-like structure from onboarding data
    const mockGoalTitle = "Initial Productivity Setup";
    const mockGoalDescription = `Based on onboarding conversation: ${request.conversationText.substring(0, 200)}...`;

    const userProfile = {
      chronotype: request.basicProfile.chronotype,
      workStyle: request.basicProfile.workStyle,
      availableHours: 8, // Default
    };

    const userContext = `
User Goals: ${request.aiInsights?.primaryGoals?.join(", ") || "General productivity"}
Challenges: ${request.aiInsights?.challenges?.join(", ") || "Time management"}
Lifestyle: ${request.aiInsights?.lifestyle || "Busy professional"}
Motivation: ${request.aiInsights?.motivationType || "Achievement-oriented"}
Availability: ${request.aiInsights?.availabilityPattern || "Standard work hours"}
`;

    try {
      // Use the existing generateTasksFromGoal method
      const generatedTasks = await openAIService.generateTasksFromGoal(
        mockGoalTitle,
        mockGoalDescription,
        userProfile,
        userContext
      );

      // Convert to our onboarding task format
      return generatedTasks.map(
        (task, index): OnboardingGeneratedTask => ({
          title: task.title,
          description: task.description,
          type: this.inferTaskTypeFromDescription(
            task.description,
            task.category
          ),
          priority: task.priority as "high" | "medium" | "low",
          estimatedDuration: task.estimatedDuration,
          timeSlot: this.inferTimeSlotFromTask(task),
          energyLevel: this.inferEnergyLevelFromPriority(task.priority),
          difficulty: this.inferDifficultyFromDuration(task.estimatedDuration),
          successCriteria: `Complete: ${task.title}`,
          category: task.category,
        })
      );
    } catch (error) {
      console.error("Error generating tasks from onboarding insights:", error);
      throw error;
    }
  }

  /**
   * Save onboarding-generated tasks to database with proper scheduling
   */
  private async saveOnboardingTasksToDatabase(
    userId: string,
    generatedTasks: OnboardingGeneratedTask[],
    timeframe: string
  ): Promise<Task[]> {
    const today = new Date();
    const savedTasks: Task[] = [];

    for (let i = 0; i < generatedTasks.length; i++) {
      const task = generatedTasks[i];

      try {
        // Determine scheduling based on task type and timeframe
        const scheduledDate = this.calculateScheduledDate(
          today,
          task.type as any,
          timeframe,
          i
        );

        const taskData: Omit<Task, "id" | "created_at" | "updated_at"> = {
          user_id: userId,
          title: task.title,
          description: task.description || "",
          type: this.validateTaskType(task.type as any),
          priority: this.validatePriority(task.priority as any),
          status: TaskStatus.PENDING,
          estimated_duration: task.estimatedDuration || 30,
          suggested_time_slot: task.timeSlot || "morning",
          related_goal_id: undefined, // These are pre-goal tasks
          energy_level_required: this.validateEnergyLevel(
            task.energyLevel || "medium"
          ),
          difficulty_level: Math.min(Math.max(task.difficulty || 1, 1), 10),
          context_requirements: `Generated from onboarding - ${task.category || "general"}`,
          success_criteria:
            task.successCriteria || "Complete the task successfully",
          scheduled_date: scheduledDate,
          completed_at: undefined,
        };

        // Use existing task management service to create the task
        const savedTask = await this.createTaskInDatabase(taskData);
        if (savedTask) {
          savedTasks.push(savedTask);
        }
      } catch (error) {
        console.error(`Error saving task "${task.title}":`, error);
        // Continue with other tasks
      }
    }

    return savedTasks;
  }

  /**
   * Calculate when a task should be scheduled based on type and timeframe
   */
  private calculateScheduledDate(
    today: Date,
    taskType: string,
    timeframe: string,
    index: number
  ): string {
    const todayStr = today.toISOString().split("T")[0];

    switch (taskType) {
      case "daily_habit":
        // Daily habits start today
        return todayStr;

      case "one_time":
        // Setup tasks scheduled for today or tomorrow
        const setupDate = new Date(today);
        setupDate.setDate(today.getDate() + (index % 2)); // Alternate today/tomorrow
        return setupDate.toISOString().split("T")[0];

      case "weekly_task":
      default:
        // Weekly tasks distributed over the timeframe
        const days =
          timeframe === "2_days" ? 2 : timeframe === "2_weeks" ? 14 : 7;
        const dayOffset = Math.floor((index * days) / 10); // Distribute evenly
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + dayOffset);
        return scheduledDate.toISOString().split("T")[0];
    }
  }

  /**
   * Create a single task in database using existing service
   */
  private async createTaskInDatabase(
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task | null> {
    try {
      // Import supabase directly since we need to create the task
      const { supabase } = await import("@/services/api/supabase");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating task:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createTaskInDatabase:", error);
      return null;
    }
  }

  /**
   * Generate recommendations based on AI insights
   */
  private generateTaskRecommendations(aiInsights?: any): string[] {
    const recommendations: string[] = [
      "Start with easier tasks to build momentum",
      "Review and adjust task timing based on your energy levels",
    ];

    if (aiInsights?.workPreferences?.energyPeaks) {
      recommendations.push(
        `Schedule demanding tasks during your peak energy times: ${aiInsights.workPreferences.energyPeaks.join(", ")}`
      );
    }

    if (aiInsights?.stressFactors?.length > 0) {
      recommendations.push(
        "Consider stress management techniques when tackling challenging tasks"
      );
    }

    if (aiInsights?.motivationType) {
      recommendations.push(
        `Leverage your motivation style (${aiInsights.motivationType}) when planning your day`
      );
    }

    return recommendations;
  }

  /**
   * Validation helpers
   */
  private validateTaskType(
    type: any
  ): (typeof TaskType)[keyof typeof TaskType] {
    const validTypes = Object.values(TaskType) as string[];
    return validTypes.includes(type) ? type : TaskType.WEEKLY_TASK;
  }

  private validatePriority(
    priority: any
  ): (typeof TaskPriority)[keyof typeof TaskPriority] {
    const validPriorities = Object.values(TaskPriority) as string[];
    return validPriorities.includes(priority) ? priority : TaskPriority.MEDIUM;
  }

  private validateEnergyLevel(level: any): "low" | "medium" | "high" {
    const validLevels = ["low", "medium", "high"];
    return validLevels.includes(level) ? level : "medium";
  }

  /**
   * Helper methods to infer task properties
   */
  private inferTaskTypeFromDescription(
    description: string,
    category?: string
  ): "daily_habit" | "weekly_task" | "one_time" {
    const lowerDesc = description.toLowerCase();

    if (
      lowerDesc.includes("daily") ||
      lowerDesc.includes("every day") ||
      lowerDesc.includes("habit")
    ) {
      return "daily_habit";
    }

    if (
      lowerDesc.includes("setup") ||
      lowerDesc.includes("install") ||
      lowerDesc.includes("configure") ||
      lowerDesc.includes("create")
    ) {
      return "one_time";
    }

    return "weekly_task";
  }

  private inferTimeSlotFromTask(task: any): string {
    const description = task.description?.toLowerCase() || "";
    const category = task.category?.toLowerCase() || "";

    if (
      description.includes("morning") ||
      description.includes("wake") ||
      description.includes("breakfast")
    ) {
      return "morning";
    }

    if (
      description.includes("evening") ||
      description.includes("night") ||
      description.includes("dinner")
    ) {
      return "evening";
    }

    if (category.includes("work") || category.includes("productivity")) {
      return "morning";
    }

    return "afternoon";
  }

  private inferEnergyLevelFromPriority(priority: string): string {
    switch (priority) {
      case "high":
        return "high";
      case "low":
        return "low";
      default:
        return "medium";
    }
  }

  private inferDifficultyFromDuration(duration: number): number {
    if (duration <= 15) return 1;
    if (duration <= 30) return 2;
    if (duration <= 60) return 3;
    if (duration <= 90) return 4;
    return 5;
  }

  /**
   * Retry task generation for users who completed onboarding without initial tasks
   */
  async retryTaskGeneration(userId: string): Promise<TaskGenerationResult> {
    try {
      // Get stored onboarding data
      const onboardingData = await onboardingStorageService.getOnboardingData({
        userId,
      });

      if (!onboardingData.success || !onboardingData.data) {
        return {
          success: false,
          tasksGenerated: 0,
          tasks: [],
          error: "No onboarding data found to generate tasks from",
        };
      }

      const { conversation_text, basic_profile, ai_insights } =
        onboardingData.data;

      return await this.generateInitialTasks({
        userId,
        conversationText: conversation_text,
        basicProfile: basic_profile,
        aiInsights: ai_insights,
      });
    } catch (error) {
      console.error("Error retrying task generation:", error);
      return {
        success: false,
        tasksGenerated: 0,
        tasks: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const onboardingTaskGenerationService =
  new OnboardingTaskGenerationService();
export default onboardingTaskGenerationService;
