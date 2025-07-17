// src/services/orchestrator/TaskSystemOrchestrator.ts
import { supabase } from "@/services/api/supabase";
import { aiSchedulingEngine } from "@/services/scheduling/AISchedulingEngine";
import { taskGenerationService } from "@/services/tasks/TaskGenerationService";
import { taskManagementService } from "@/services/tasks/TaskManagementService";
import { TaskPriority, TaskType } from "@/types/tasks";

interface InitializationResult {
  success: boolean;
  message: string;
  redirectTo?: string;
  data?: {
    tasksGenerated: number;
    todaySchedule: any;
    weeklySchedule: any;
    nextSteps: string[];
  };
}

interface TaskCompletionResult {
  success: boolean;
  task: any;
  xp_awarded: number;
  celebration: string;
  achievements: any[];
}

interface RecurringTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  estimated_duration: number;
  energy_level_required: string;
  difficulty_level: number;
  related_goal_id: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  description: string;
  target_date: string;
  progress: number;
  is_completed: boolean;
  created_at: string;
}

export class TaskSystemOrchestrator {
  // Initialize complete task system for a user
  async initializeTaskSystem(userId: string): Promise<InitializationResult> {
    try {
      console.log(`Initializing task system for user ${userId}`);

      // 1. Check if user has active goals
      const activeGoals = await this.getActiveGoals(userId);

      if (activeGoals.length === 0) {
        return {
          success: false,
          message: "No active goals found. Please create goals first.",
          redirectTo: "goals",
        };
      }

      // 2. Generate tasks from goals
      const generatedTasks = await this.generateTasksFromGoals(
        userId,
        activeGoals
      );

      // 3. Create today's schedule
      const todaySchedule =
        await aiSchedulingEngine.generateDailySchedule(userId);

      // 4. Set up weekly recurring schedule (simplified for MVP)
      const weeklySchedule = await this.setupBasicWeeklySchedule(userId);

      return {
        success: true,
        message: "Task system initialized successfully!",
        data: {
          tasksGenerated: generatedTasks.length,
          todaySchedule: todaySchedule,
          weeklySchedule: weeklySchedule,
          nextSteps: [
            "Check your Today screen for daily tasks",
            "Review and adjust your schedule as needed",
            "Complete tasks to earn XP and build habits",
          ],
        },
      };
    } catch (error) {
      console.error("Error initializing task system:", error);
      throw new Error(
        `Failed to initialize task system: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Generate tasks from existing AI goal breakdowns
  private async generateTasksFromGoals(
    userId: string,
    goals: any[]
  ): Promise<any[]> {
    const allGeneratedTasks: any[] = [];

    for (const goal of goals) {
      if (goal.ai_breakdown) {
        try {
          // Extract tasks from AI breakdown
          const { weeklyTasks, dailyHabits, milestones } = goal.ai_breakdown;

          // Generate actionable daily tasks
          const tasks = await taskGenerationService.generateDailyTasks(
            userId,
            { weeklyTasks, dailyHabits, milestones },
            goal.user_preferences || {}
          );

          allGeneratedTasks.push(...tasks);

          // Create weekly recurring tasks for habits
          if (dailyHabits) {
            await this.createRecurringHabits(userId, dailyHabits, goal.id);
          }

          // Set up milestone tracking
          if (milestones) {
            await this.setupMilestoneTracking(userId, milestones, goal.id);
          }
        } catch (error) {
          console.error(`Error generating tasks for goal ${goal.id}:`, error);
        }
      }
    }

    return allGeneratedTasks;
  }

  // Create recurring daily habits
  private async createRecurringHabits(
    userId: string,
    dailyHabits: any[],
    goalId: string
  ): Promise<void> {
    if (!dailyHabits || dailyHabits.length === 0) return;

    const habitTasks: RecurringTask[] = dailyHabits.map((habit) => ({
      // Let the database auto-generate UUID for id
      user_id: userId,
      title: habit.title || habit,
      description: habit.description || `Daily habit: ${habit.title || habit}`,
      type: TaskType.DAILY_HABIT,
      priority: habit.priority || TaskPriority.MEDIUM,
      status: "pending",
      estimated_duration: this.ensureInteger(habit.duration),
      energy_level_required: habit.energy_level || "medium",
      difficulty_level: this.ensureDifficultyLevel(habit.difficulty),
      related_goal_id: goalId,
      is_recurring: true,
      recurrence_pattern: "daily",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // For MVP, we'll create these as regular tasks that repeat daily
    // Later you can create a proper recurring_tasks table
    for (const habit of habitTasks) {
      try {
        const { error } = await supabase.from("tasks").insert({
          // id omitted, let DB generate
          user_id: habit.user_id,
          title: habit.title,
          description: habit.description,
          type: habit.type,
          priority: habit.priority,
          status: habit.status,
          estimated_duration: habit.estimated_duration,
          energy_level_required: habit.energy_level_required,
          difficulty_level: habit.difficulty_level,
          related_goal_id: habit.related_goal_id,
          scheduled_date: new Date().toISOString().split("T")[0],
          created_at: habit.created_at,
          updated_at: habit.updated_at,
        });

        if (error) {
          console.error("Error creating recurring habit:", error);
        }
      } catch (error) {
        console.error("Error inserting habit task:", error);
      }
    }
  }

  // Ensure integer and valid range for difficulty_level (1-5)
  private ensureDifficultyLevel(value: any): number {
    let num = 2;
    if (typeof value === "number") {
      num = Math.round(value);
    } else if (typeof value === "string") {
      const parsed = parseFloat(value);
      num = isNaN(parsed) ? 2 : Math.round(parsed);
    }
    if (num < 1) num = 1;
    if (num > 5) num = 5;
    return num;
  }

  // Helper for estimated_duration
  private ensureInteger(value: any): number {
    if (typeof value === "number") {
      return Math.round(value);
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 30 : Math.round(parsed);
    }
    return 30;
  }

  // Set up milestone tracking with deadlines
  private async setupMilestoneTracking(
    userId: string,
    milestones: any[],
    goalId: string
  ): Promise<void> {
    if (!milestones || milestones.length === 0) return;

    const milestoneRecords: Milestone[] = milestones.map((milestone) => ({
      id: this.generateMilestoneId(),
      user_id: userId,
      goal_id: goalId,
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.target_date,
      progress: 0,
      is_completed: false,
      created_at: new Date().toISOString(),
    }));

    // For MVP, we'll store these in a simple format
    // Later you can create a proper milestones table
    try {
      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: userId,
          milestones: milestoneRecords,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        console.error("Error storing milestones:", error);
      }
    } catch (error) {
      console.error("Error setting up milestone tracking:", error);
    }
  }

  // Simplified weekly schedule setup for MVP
  private async setupBasicWeeklySchedule(userId: string): Promise<any> {
    try {
      const weekStart = this.getWeekStart();
      const weekDays = this.getWeekDays(weekStart);

      const weeklySchedule: Record<string, any> = {};

      // Generate schedule for next 3 days (simplified for MVP)
      for (let i = 0; i < 3; i++) {
        const day = weekDays[i];
        try {
          const daySchedule = await aiSchedulingEngine.generateDailySchedule(
            userId,
            day
          );
          weeklySchedule[day] = daySchedule;
        } catch (error) {
          console.error(`Error generating schedule for ${day}:`, error);
          weeklySchedule[day] = {
            error: "Failed to generate schedule for this day",
          };
        }

        // Small delay to avoid API rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return weeklySchedule;
    } catch (error) {
      console.error("Error setting up weekly schedule:", error);
      return {};
    }
  }

  // Real-time task completion handling
  async handleTaskCompletion(
    userId: string,
    taskId: string,
    completionData: any = {}
  ): Promise<TaskCompletionResult> {
    try {
      // 1. Mark task as completed
      const completedTask = await taskManagementService.completeTask(
        taskId,
        userId
      );

      // 2. Award XP (this is handled in TaskManagementService)
      const xpAwarded = await this.calculateTaskXP(completedTask);

      // 3. Update goal progress if applicable
      if (completedTask.related_goal_id) {
        await this.updateGoalProgress(
          completedTask.related_goal_id,
          completedTask
        );
      }

      // 4. Generate celebration message
      const celebrationMessage = this.generateCelebrationMessage(
        completedTask,
        xpAwarded
      );

      return {
        success: true,
        task: completedTask,
        xp_awarded: xpAwarded,
        celebration: celebrationMessage,
        achievements: [], // TODO: Implement achievement checking
      };
    } catch (error) {
      console.error("Error handling task completion:", error);
      throw error;
    }
  }

  // Update goal progress when related tasks are completed
  private async updateGoalProgress(
    goalId: string,
    completedTask: any
  ): Promise<void> {
    try {
      const { data: goal, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (error) throw error;

      // Calculate new progress based on task completion
      const progressIncrement = this.calculateProgressIncrement(
        completedTask,
        goal
      );
      const newProgress = Math.min(100, goal.progress + progressIncrement);

      await supabase
        .from("goals")
        .update({
          progress: newProgress,
          last_progress_update: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId);

      // Check if goal is completed
      if (newProgress >= 100) {
        await this.handleGoalCompletion(goalId, goal);
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  }

  // Utility functions
  private calculateDaysUntil(targetDate: string): number {
    const today = new Date();
    const target = new Date(targetDate);
    const timeDiff = target.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  private calculateProgressIncrement(completedTask: any, goal: any): number {
    // Base increment based on task priority and difficulty
    let increment = 5; // Base 5% progress

    if (completedTask.priority === TaskPriority.HIGH) increment += 5;
    if (completedTask.priority === TaskPriority.MEDIUM) increment += 2;

    increment += (completedTask.difficulty_level || 1) * 2;

    // Adjust based on goal category
    if (
      goal.category === "health" &&
      completedTask.type === TaskType.DAILY_HABIT
    ) {
      increment += 3; // Bonus for health habits
    }

    return Math.min(increment, 15); // Cap at 15% per task
  }

  private calculateTaskXP(completedTask: any): number {
    let xpAmount = 10; // Base XP

    // Bonus XP based on priority
    if (completedTask.priority === TaskPriority.HIGH) xpAmount += 15;
    else if (completedTask.priority === TaskPriority.MEDIUM) xpAmount += 10;
    else xpAmount += 5;

    // Bonus XP based on difficulty
    xpAmount += (completedTask.difficulty_level || 1) * 5;

    return xpAmount;
  }

  private generateCelebrationMessage(
    completedTask: any,
    xpAwarded: number
  ): string {
    const messages = [
      `🎉 Great job completing "${completedTask.title}"! You earned ${xpAwarded} XP!`,
      `✨ Task complete! "${completedTask.title}" is done and you're ${xpAwarded} XP closer to your goals!`,
      `🚀 Awesome! You just finished "${completedTask.title}" and gained ${xpAwarded} XP!`,
      `💪 Well done! "${completedTask.title}" is checked off your list. +${xpAwarded} XP!`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  private async getActiveGoals(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  }

  private getWeekDays(weekStart: string): string[] {
    const days: string[] = [];
    const start = new Date(weekStart);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day.toISOString().split("T")[0]);
    }

    return days;
  }

  private generateMilestoneId(): string {
    return (
      "milestone_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  private async handleGoalCompletion(goalId: string, goal: any): Promise<void> {
    // Award bonus XP for goal completion
    await supabase
      .from("goals")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", goalId);

    // Award bonus XP
    const bonusXP = 100; // Bonus for completing a goal

    const { data: userXP } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", goal.user_id)
      .single();

    if (userXP) {
      await supabase
        .from("user_xp")
        .update({
          total_xp: userXP.total_xp + bonusXP,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", goal.user_id);
    }

    console.log(`Goal ${goalId} completed! Awarded ${bonusXP} bonus XP.`);
  }
}

// Export singleton instance
export const taskSystemOrchestrator = new TaskSystemOrchestrator();
