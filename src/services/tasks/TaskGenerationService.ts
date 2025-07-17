// src/services/tasks/TaskGenerationService.ts
import { openAIService } from "@/services/api/openai";
import { supabase } from "@/services/api/supabase";
import { Task, TaskPriority, TaskStatus, TaskType } from "@/types/tasks";

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
    userPreferences: UserPreferences = {},
    relatedGoalId?: string // Add this parameter
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

      // Save tasks to database with proper goal relationship
      const savedTasks = await this.saveTasksToDatabase(
        userId,
        generatedTasks.tasks,
        relatedGoalId // Pass the actual goal ID
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
    tasks: any[],
    relatedGoalId?: string // Add this parameter
  ): Promise<Task[]> {
    const tasksToInsert = tasks.map((task) => ({
      user_id: userId,
      title: task.title || "Untitled Task",
      description: task.description || "",
      type: this.validateTaskType(task.type),
      priority: this.validatePriority(task.priority),
      status: TaskStatus.PENDING,
      estimated_duration: this.ensureInteger(task.estimated_duration),
      suggested_time_slot: task.suggested_time_slot || "morning",
      // FIX: Use the actual goal ID or set to null
      related_goal_id: relatedGoalId || null, // Use passed goal ID or null
      energy_level_required: this.validateEnergyLevel(
        task.energy_level_required
      ),
      difficulty_level: this.ensureInteger(task.difficulty_level, 1, 10),
      context_requirements: task.context_requirements || "",
      success_criteria: task.success_criteria || "Complete the task",
      scheduled_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("tasks")
      .insert(tasksToInsert)
      .select("*");

    if (error) {
      console.error("Error inserting tasks:", error);
      console.error("Task data that failed:", tasksToInsert);
      throw error;
    }

    console.log(`✅ Successfully created ${data?.length || 0} tasks`);
    return data || [];
  }

  // Validation helpers
  private validateTaskType(type: any): import("@/types/tasks").TaskTypeType {
    return Object.values(TaskType).includes(type) ? type : TaskType.ONE_TIME;
  }
  private validatePriority(
    priority: any
  ): import("@/types/tasks").TaskPriorityType {
    return Object.values(TaskPriority).includes(priority)
      ? priority
      : TaskPriority.MEDIUM;
  }
  private validateEnergyLevel(level: any): string {
    const allowed = ["low", "medium", "high"];
    return allowed.includes(level) ? level : "medium";
  }
  private ensureInteger(value: any, min = 1, max = 10): number {
    let num = 1;
    if (typeof value === "number") {
      num = Math.round(value);
    } else if (typeof value === "string") {
      const parsed = parseFloat(value);
      num = isNaN(parsed) ? min : Math.round(parsed);
    }
    if (num < min) num = min;
    if (num > max) num = max;
    return num;
  }

  // ...generateTaskId removed...

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
