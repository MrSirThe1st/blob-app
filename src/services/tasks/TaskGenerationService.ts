// src/services/tasks/TaskGenerationService.ts
import { supabase } from "@/services/api/supabase";
import { openAIService } from "@/services/api/openai";
import { Task, TaskStatus, TaskType, TaskPriority } from "@/types/tasks";

interface GoalBreakdown {
  weeklyTasks?: any[];
  dailyHabits?: any[];
  milestones?: any[];
}

interface UserPreferences {
  work_style?: string;
  [key: string]: any;
}

interface SchedulePreferences {
  work_hours?: string;
  energy_patterns?: string;
  preferred_task_duration?: number;
  [key: string]: any;
}

export class TaskGenerationService {
  // Generate daily tasks from AI goal breakdown
  async generateDailyTasks(
    userId: string,
    goalBreakdown: GoalBreakdown,
    userPreferences: UserPreferences = {}
  ): Promise<Task[]> {
    try {
      const { weeklyTasks, dailyHabits, milestones } = goalBreakdown;

      // Get user's current schedule and preferences
      const schedulePrefs = await this.getUserSchedulePreferences(userId);

      // Generate tasks using OpenAI
      const prompt = this.buildTaskGenerationPrompt(
        weeklyTasks || [],
        dailyHabits || [],
        milestones || [],
        schedulePrefs,
        userPreferences
      );

      const response = await openAIService.generateResponse({
        messages: [
          {
            role: "system",
            content:
              "You are a personal productivity assistant. Generate specific, actionable daily tasks based on the user's goals and preferences. Focus on creating tasks that build habits and move toward milestones.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        functions: [
          {
            name: "generate_daily_tasks",
            description: "Generate structured daily tasks",
            parameters: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      type: { type: "string", enum: Object.values(TaskType) },
                      priority: {
                        type: "string",
                        enum: Object.values(TaskPriority),
                      },
                      estimated_duration: { type: "number" },
                      suggested_time_slot: { type: "string" },
                      related_goal_id: { type: "string" },
                      energy_level_required: { type: "string" },
                      difficulty_level: { type: "number" },
                      context_requirements: { type: "string" },
                      success_criteria: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        ],
        function_call: { name: "generate_daily_tasks" },
      });

      if (!response.function_call?.arguments) {
        throw new Error("No function call response from OpenAI");
      }

      const generatedTasks = JSON.parse(response.function_call.arguments);

      // Save tasks to database
      const savedTasks = await this.saveTasksToDatabase(
        userId,
        generatedTasks.tasks
      );

      return savedTasks;
    } catch (error) {
      console.error("Error generating daily tasks:", error);
      throw new Error("Failed to generate daily tasks");
    }
  }

  private buildTaskGenerationPrompt(
    weeklyTasks: any[],
    dailyHabits: any[],
    milestones: any[],
    schedulePrefs: SchedulePreferences,
    userPrefs: UserPreferences
  ): string {
    return `
      Generate specific daily tasks for today based on:
      
      WEEKLY TASKS: ${JSON.stringify(weeklyTasks)}
      DAILY HABITS: ${JSON.stringify(dailyHabits)}
      MILESTONES: ${JSON.stringify(milestones)}
      
      USER PREFERENCES:
      - Work schedule: ${schedulePrefs.work_hours}
      - Energy patterns: ${schedulePrefs.energy_patterns}
      - Preferred task duration: ${schedulePrefs.preferred_task_duration}
      - Work style: ${userPrefs.work_style}
      
      REQUIREMENTS:
      1. Create 5-8 tasks for today
      2. Mix of habit-building and milestone progress
      3. Consider user's energy levels throughout the day
      4. Include specific success criteria for each task
      5. Estimate realistic time requirements
      6. Suggest optimal time slots based on task complexity
      
      Focus on creating tasks that feel achievable but meaningful.
    `;
  }

  private async saveTasksToDatabase(
    userId: string,
    tasks: any[]
  ): Promise<Task[]> {
    const tasksToInsert = tasks.map((task) => ({
      id: this.generateTaskId(),
      user_id: userId,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: TaskStatus.PENDING,
      estimated_duration: task.estimated_duration,
      suggested_time_slot: task.suggested_time_slot,
      related_goal_id: task.related_goal_id,
      energy_level_required: task.energy_level_required,
      difficulty_level: task.difficulty_level,
      context_requirements: task.context_requirements,
      success_criteria: task.success_criteria,
      scheduled_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("tasks")
      .insert(tasksToInsert)
      .select("*");

    if (error) throw error;
    return data || [];
  }

  private generateTaskId(): string {
    return "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  private async getUserSchedulePreferences(
    userId: string
  ): Promise<SchedulePreferences> {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.warn("No user preferences found, using defaults");
      return {};
    }

    return data || {};
  }
}

// Export singleton instance
export const taskGenerationService = new TaskGenerationService();
