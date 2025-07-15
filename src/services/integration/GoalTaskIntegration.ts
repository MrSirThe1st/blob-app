// src/services/integration/GoalTaskIntegration.ts
// This connects your existing Goal Creation System with the Task Management

import { taskSystemOrchestrator } from "@/services/orchestrator/TaskSystemOrchestrator";
import { taskGenerationService } from "@/services/tasks/TaskGenerationService";

export class GoalTaskIntegration {
  // Call this after a goal is created successfully
  static async handleGoalCreated(
    goalId: string,
    userId: string,
    goalData: any
  ): Promise<void> {
    try {
      console.log(`Integrating new goal ${goalId} with task system`);

      // If goal has AI breakdown, generate immediate tasks
      if (goalData.ai_breakdown) {
        await taskGenerationService.generateDailyTasks(
          userId,
          goalData.ai_breakdown,
          goalData.user_preferences || {}
        );
      }

      // Reinitialize the task system to include the new goal
      await taskSystemOrchestrator.initializeTaskSystem(userId);

      console.log(`Successfully integrated goal ${goalId} with task system`);
    } catch (error) {
      console.error("Error integrating goal with task system:", error);
      // Don't throw error - goal creation should still succeed even if task integration fails
    }
  }

  // Call this when a goal is updated
  static async handleGoalUpdated(
    goalId: string,
    userId: string,
    updatedData: any
  ): Promise<void> {
    try {
      // If AI breakdown was updated, regenerate tasks
      if (updatedData.ai_breakdown) {
        await taskGenerationService.generateDailyTasks(
          userId,
          updatedData.ai_breakdown,
          updatedData.user_preferences || {}
        );
      }
    } catch (error) {
      console.error("Error updating goal tasks:", error);
    }
  }

  // Call this when a goal is completed
  static async handleGoalCompleted(
    goalId: string,
    userId: string
  ): Promise<void> {
    try {
      // Mark related tasks as completed or remove them
      // This is handled by the orchestrator's handleGoalCompletion method
      console.log(
        `Goal ${goalId} completed, tasks will be automatically handled`
      );
    } catch (error) {
      console.error("Error handling goal completion:", error);
    }
  }
}

// Easy integration functions for your existing GoalsScreen.tsx
export const integrationHelpers = {
  // Add this to your handleGoalCreated function in GoalsScreen.tsx
  onGoalCreated: async (newGoal: any, userId: string) => {
    await GoalTaskIntegration.handleGoalCreated(newGoal.id, userId, newGoal);
  },

  // Add this to your goal update functions
  onGoalUpdated: async (goalId: string, userId: string, updates: any) => {
    await GoalTaskIntegration.handleGoalUpdated(goalId, userId, updates);
  },

  // Add this when goals are marked complete
  onGoalCompleted: async (goalId: string, userId: string) => {
    await GoalTaskIntegration.handleGoalCompleted(goalId, userId);
  },
};
