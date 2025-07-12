// src/services/scheduling/SchedulingService.ts
/**
 * Basic Scheduling Algorithm Service
 * Handles task scheduling, optimization, and calendar integration
 */

import {
  openAIService,
  GeneratedTask,
  ScheduleRequest,
  ScheduleResponse,
} from "../api/openai";
import { supabase } from "../api/supabase";

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // in minutes
  priority: "high" | "medium" | "low";
  category: string;
  deadline?: string;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  date: string;
  tasks: ScheduledTask[];
  totalScheduledHours: number;
  isGenerated: boolean;
  generatedAt: string;
  lastModified: string;
}

export interface ScheduledTask extends Task {
  startTime: string;
  endTime: string;
  isFlexible: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  completionStatus: "pending" | "in_progress" | "completed" | "skipped";
}

export interface UserAvailability {
  workStartTime: string;
  workEndTime: string;
  breakDuration: number;
  availableHours: number;
  blockedTimes: Array<{
    startTime: string;
    endTime: string;
    reason: string;
  }>;
}

export interface UserPreferences {
  chronotype: "morning" | "evening" | "flexible";
  workStyle: "deep_focus" | "multitasking" | "balanced";
  preferredTaskDuration: number; // in minutes
  maxDailyHours: number;
}

class SchedulingService {
  /**
   * Generate a daily schedule for a user
   */
  async generateDailySchedule(
    userId: string,
    date: string = new Date().toISOString().split("T")[0]
  ): Promise<Schedule | null> {
    try {
      // Get user profile and preferences
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        console.error("User profile not found");
        return null;
      }

      // Get user's goals and AI insights
      const userGoals = await this.getUserGoals(userId);
      const aiInsights = userProfile.ai_personality?.aiInsights;

      // Calculate available time
      const availability = this.calculateAvailability(userProfile, date);

      // Prepare request for AI schedule generation
      const scheduleRequest: ScheduleRequest = {
        userProfile: {
          chronotype: userProfile.chronotype,
          workStyle: userProfile.work_style,
          workStartTime: userProfile.work_start_time,
          workEndTime: userProfile.work_end_time,
          breakDuration: userProfile.break_duration || 60,
        },
        goals: userGoals,
        availableHours: availability.availableHours,
        existingCommitments: [], // TODO: Add calendar integration
      };

      // Generate schedule using AI
      const aiSchedule =
        await openAIService.generateDailySchedule(scheduleRequest);

      // Create schedule object
      const schedule: Schedule = {
        id: `schedule_${userId}_${date}`,
        userId,
        date,
        tasks: aiSchedule.tasks.map((task) => ({
          ...task,
          isCompleted: false,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completionStatus: "pending" as const,
        })),
        totalScheduledHours: aiSchedule.totalScheduledHours,
        isGenerated: true,
        generatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      // Save schedule to database
      await this.saveSchedule(schedule);

      return schedule;
    } catch (error) {
      console.error("Error generating daily schedule:", error);
      return this.getDefaultSchedule(userId, date);
    }
  }

  /**
   * Get user's schedule for a specific date
   */
  async getSchedule(userId: string, date: string): Promise<Schedule | null> {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .single();

      if (error || !data) {
        console.log("No schedule found for date:", date);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        tasks: data.tasks || [],
        totalScheduledHours: data.total_scheduled_hours || 0,
        isGenerated: data.is_generated || false,
        generatedAt: data.generated_at,
        lastModified: data.last_modified,
      };
    } catch (error) {
      console.error("Error getting schedule:", error);
      return null;
    }
  }

  /**
   * Update task completion status
   */
  async updateTaskCompletion(
    userId: string,
    taskId: string,
    status: "completed" | "in_progress" | "skipped",
    actualStartTime?: string,
    actualEndTime?: string
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const schedule = await this.getSchedule(userId, today);

      if (!schedule) {
        console.error("Schedule not found for task update");
        return false;
      }

      // Update task in schedule
      const updatedTasks = schedule.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completionStatus: status,
            isCompleted: status === "completed",
            actualStartTime: actualStartTime || task.actualStartTime,
            actualEndTime: actualEndTime || task.actualEndTime,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      });

      const updatedSchedule = {
        ...schedule,
        tasks: updatedTasks,
        lastModified: new Date().toISOString(),
      };

      // Save updated schedule
      await this.saveSchedule(updatedSchedule);

      // Update user XP if task completed
      if (status === "completed") {
        await this.updateUserXP(
          userId,
          this.calculateTaskXP(schedule.tasks.find((t) => t.id === taskId)!)
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating task completion:", error);
      return false;
    }
  }

  /**
   * Get today's schedule or generate if none exists
   */
  async getTodaysSchedule(userId: string): Promise<Schedule> {
    const today = new Date().toISOString().split("T")[0];

    let schedule = await this.getSchedule(userId, today);

    if (!schedule) {
      console.log("No schedule found for today, generating new one...");
      schedule = await this.generateDailySchedule(userId, today);
    }

    return schedule || this.getDefaultSchedule(userId, today);
  }

  /**
   * Calculate user's available time for a given date
   */
  private calculateAvailability(
    userProfile: any,
    date: string
  ): UserAvailability {
    const workStart = userProfile.work_start_time || "09:00";
    const workEnd = userProfile.work_end_time || "17:00";
    const breakDuration = userProfile.break_duration || 60;

    // Calculate total work hours
    const startHour = parseInt(workStart.split(":")[0]);
    const endHour = parseInt(workEnd.split(":")[0]);
    const totalWorkHours = endHour - startHour;

    // Subtract break time
    const availableHours = totalWorkHours - breakDuration / 60;

    return {
      workStartTime: workStart,
      workEndTime: workEnd,
      breakDuration,
      availableHours: Math.max(availableHours, 1), // Minimum 1 hour
      blockedTimes: [], // TODO: Add calendar integration
    };
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error getting user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  }

  /**
   * Get user's goals from AI insights
   */
  private async getUserGoals(userId: string): Promise<string[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const aiInsights = userProfile?.ai_personality?.aiInsights;

      if (aiInsights?.primaryGoals) {
        return aiInsights.primaryGoals;
      }

      // Fallback goals
      return [
        "Increase productivity",
        "Achieve work-life balance",
        "Personal development",
      ];
    } catch (error) {
      console.error("Error getting user goals:", error);
      return ["General productivity improvement"];
    }
  }

  /**
   * Save schedule to database
   */
  private async saveSchedule(schedule: Schedule): Promise<boolean> {
    try {
      const { error } = await supabase.from("schedules").upsert({
        id: schedule.id,
        user_id: schedule.userId,
        date: schedule.date,
        tasks: schedule.tasks,
        total_scheduled_hours: schedule.totalScheduledHours,
        is_generated: schedule.isGenerated,
        generated_at: schedule.generatedAt,
        last_modified: schedule.lastModified,
      });

      if (error) {
        console.error("Error saving schedule:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in saveSchedule:", error);
      return false;
    }
  }

  /**
   * Calculate XP for a completed task
   */
  private calculateTaskXP(task: ScheduledTask): number {
    const baseXP = 10;
    const priorityMultiplier = {
      high: 2,
      medium: 1.5,
      low: 1,
    };
    const durationBonus = Math.floor(task.estimatedDuration / 30) * 5; // 5 XP per 30 minutes

    return baseXP * priorityMultiplier[task.priority] + durationBonus;
  }

  /**
   * Update user XP
   */
  private async updateUserXP(
    userId: string,
    xpGained: number
  ): Promise<boolean> {
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from("users")
        .select("xp_total, current_level")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching user XP:", fetchError);
        return false;
      }

      const newXP = (currentProfile.xp_total || 0) + xpGained;
      const newLevel = Math.floor(newXP / 100) + 1; // Level up every 100 XP

      const { error: updateError } = await supabase
        .from("users")
        .update({
          xp_total: newXP,
          current_level: newLevel,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user XP:", updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateUserXP:", error);
      return false;
    }
  }

  /**
   * Get default schedule for fallback scenarios
   */
  private getDefaultSchedule(userId: string, date: string): Schedule {
    const defaultTasks: ScheduledTask[] = [
      {
        id: `default_morning_${date}`,
        title: "Morning Planning",
        description: "Review your goals and plan your day",
        estimatedDuration: 15,
        priority: "high",
        category: "planning",
        isCompleted: false,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startTime: `${date}T08:00:00`,
        endTime: `${date}T08:15:00`,
        isFlexible: false,
        completionStatus: "pending",
      },
      {
        id: `default_focus_${date}`,
        title: "Focus Work Session",
        description: "Work on your most important task",
        estimatedDuration: 90,
        priority: "high",
        category: "work",
        isCompleted: false,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startTime: `${date}T09:00:00`,
        endTime: `${date}T10:30:00`,
        isFlexible: true,
        completionStatus: "pending",
      },
      {
        id: `default_break_${date}`,
        title: "Break & Recharge",
        description: "Take a refreshing break",
        estimatedDuration: 15,
        priority: "medium",
        category: "health",
        isCompleted: false,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startTime: `${date}T10:30:00`,
        endTime: `${date}T10:45:00`,
        isFlexible: false,
        completionStatus: "pending",
      },
    ];

    return {
      id: `default_schedule_${userId}_${date}`,
      userId,
      date,
      tasks: defaultTasks,
      totalScheduledHours: 2,
      isGenerated: false,
      generatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  }

  /**
   * Get completion statistics for a user
   */
  async getCompletionStats(
    userId: string,
    days: number = 7
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalXP: number;
    currentStreak: number;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // This would typically query a tasks table, but for MVP we'll use schedules
      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);

      if (error) {
        console.error("Error getting completion stats:", error);
        return {
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          totalXP: 0,
          currentStreak: 0,
        };
      }

      let totalTasks = 0;
      let completedTasks = 0;

      schedules?.forEach((schedule) => {
        if (schedule.tasks) {
          totalTasks += schedule.tasks.length;
          completedTasks += schedule.tasks.filter(
            (task: any) => task.completionStatus === "completed"
          ).length;
        }
      });

      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Get current user XP
      const { data: userProfile } = await supabase
        .from("users")
        .select("xp_total, current_streak")
        .eq("id", userId)
        .single();

      return {
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate),
        totalXP: userProfile?.xp_total || 0,
        currentStreak: userProfile?.current_streak || 0,
      };
    } catch (error) {
      console.error("Error calculating completion stats:", error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        totalXP: 0,
        currentStreak: 0,
      };
    }
  }

  /**
   * Regenerate schedule for a specific date
   */
  async regenerateSchedule(
    userId: string,
    date: string
  ): Promise<Schedule | null> {
    try {
      // Delete existing schedule
      await supabase
        .from("schedules")
        .delete()
        .eq("user_id", userId)
        .eq("date", date);

      // Generate new schedule
      return await this.generateDailySchedule(userId, date);
    } catch (error) {
      console.error("Error regenerating schedule:", error);
      return null;
    }
  }

  /**
   * Add a manual task to today's schedule
   */
  async addManualTask(
    userId: string,
    task: Omit<
      ScheduledTask,
      | "id"
      | "userId"
      | "createdAt"
      | "updatedAt"
      | "completionStatus"
      | "isCompleted"
    >
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const schedule = await this.getSchedule(userId, today);

      if (!schedule) {
        console.error("No schedule found to add task to");
        return false;
      }

      const newTask: ScheduledTask = {
        ...task,
        id: `manual_${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionStatus: "pending",
        isCompleted: false,
      };

      const updatedSchedule = {
        ...schedule,
        tasks: [...schedule.tasks, newTask],
        lastModified: new Date().toISOString(),
      };

      return await this.saveSchedule(updatedSchedule);
    } catch (error) {
      console.error("Error adding manual task:", error);
      return false;
    }
  }

  /**
   * Remove a task from today's schedule
   */
  async removeTask(userId: string, taskId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const schedule = await this.getSchedule(userId, today);

      if (!schedule) {
        console.error("No schedule found to remove task from");
        return false;
      }

      const updatedTasks = schedule.tasks.filter((task) => task.id !== taskId);

      const updatedSchedule = {
        ...schedule,
        tasks: updatedTasks,
        lastModified: new Date().toISOString(),
      };

      return await this.saveSchedule(updatedSchedule);
    } catch (error) {
      console.error("Error removing task:", error);
      return false;
    }
  }

  /**
   * Update task time slots
   */
  async updateTaskTime(
    userId: string,
    taskId: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const schedule = await this.getSchedule(userId, today);

      if (!schedule) {
        console.error("No schedule found to update task time");
        return false;
      }

      const updatedTasks = schedule.tasks.map((task) => {
        if (task.id === taskId) {
          const startDate = new Date(startTime);
          const endDate = new Date(endTime);
          const duration =
            (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes

          return {
            ...task,
            startTime,
            endTime,
            estimatedDuration: duration,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      });

      const updatedSchedule = {
        ...schedule,
        tasks: updatedTasks,
        lastModified: new Date().toISOString(),
      };

      return await this.saveSchedule(updatedSchedule);
    } catch (error) {
      console.error("Error updating task time:", error);
      return false;
    }
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return openAIService.isConfigured();
  }
}

// Export singleton instance
export const schedulingService = new SchedulingService();
export default schedulingService;
