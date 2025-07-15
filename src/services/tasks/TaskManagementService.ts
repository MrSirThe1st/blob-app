// src/services/tasks/TaskManagementService.ts
import { supabase } from "@/services/api/supabase";
import { Task, TaskStatus, TaskStats, TaskStatusType } from "@/types/tasks";

export class TaskManagementService {
  // Get today's tasks
  async getTodaysTasks(userId: string): Promise<Task[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        goals (
          title,
          category
        )
      `
      )
      .eq("user_id", userId)
      .eq("scheduled_date", today)
      .order("priority", { ascending: false })
      .order("suggested_time_slot", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Complete a task
  async completeTask(taskId: string, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: TaskStatus.COMPLETED,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;

    // Award XP for task completion
    await this.awardTaskXP(userId, data);

    return data;
  }

  // Reschedule a task
  async rescheduleTask(
    taskId: string,
    userId: string,
    newDate: string,
    newTimeSlot?: string
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: TaskStatus.RESCHEDULED,
        scheduled_date: newDate,
        suggested_time_slot: newTimeSlot,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  // Update task status
  async updateTaskStatus(
    taskId: string,
    userId: string,
    status: TaskStatusType
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  // Get task statistics
  async getTaskStats(
    userId: string,
    timeframe: "day" | "week" | "month" = "week"
  ): Promise<TaskStats> {
    const { data, error } = await supabase
      .from("tasks")
      .select("status, priority, type, completed_at, created_at")
      .eq("user_id", userId)
      .gte("created_at", this.getTimeframeStart(timeframe));

    if (error) throw error;

    const tasks = data || [];

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      in_progress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
      completion_rate:
        tasks.length > 0
          ? (tasks.filter((t) => t.status === TaskStatus.COMPLETED).length /
              tasks.length) *
            100
          : 0,
    };
  }

  // Award XP for task completion
  private async awardTaskXP(
    userId: string,
    completedTask: Task
  ): Promise<number> {
    let xpAmount = 10; // Base XP

    // Bonus XP based on priority
    if (completedTask.priority === "high") xpAmount += 15;
    else if (completedTask.priority === "medium") xpAmount += 10;
    else xpAmount += 5;

    // Bonus XP based on difficulty
    xpAmount += (completedTask.difficulty_level || 1) * 5;

    // Award XP through existing gamification system
    const { data: userXP, error: fetchError } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user XP:", fetchError);
      return xpAmount;
    }

    if (userXP) {
      const { error: updateError } = await supabase
        .from("user_xp")
        .update({
          total_xp: userXP.total_xp + xpAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating user XP:", updateError);
      }
    }

    return xpAmount;
  }

  private getTimeframeStart(timeframe: "day" | "week" | "month"): string {
    const now = new Date();
    switch (timeframe) {
      case "day":
        return new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).toISOString();
      case "week":
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return weekStart.toISOString();
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      default:
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
    }
  }
}

// Export singleton instance
export const taskManagementService = new TaskManagementService();
