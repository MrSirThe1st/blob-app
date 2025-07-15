// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from "react";
import { taskManagementService } from "@/services/tasks/TaskManagementService";
import { taskGenerationService } from "@/services/tasks/TaskGenerationService";
import { Task, TaskStats } from "@/types/tasks";

export const useTasks = (userId: string | undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    completion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load today's tasks
  const loadTasks = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [todaysTasks, stats] = await Promise.all([
        taskManagementService.getTodaysTasks(userId),
        taskManagementService.getTaskStats(userId, "day"),
      ]);

      setTasks(todaysTasks);
      setTaskStats(stats);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Complete a task
  const completeTask = useCallback(
    async (taskId: string) => {
      if (!userId) return;

      try {
        await taskManagementService.completeTask(taskId, userId);
        // Reload tasks to reflect changes
        await loadTasks();
      } catch (err) {
        console.error("Error completing task:", err);
        setError(
          err instanceof Error ? err.message : "Failed to complete task"
        );
      }
    },
    [userId, loadTasks]
  );

  // Reschedule a task
  const rescheduleTask = useCallback(
    async (taskId: string, newDate: string, newTimeSlot?: string) => {
      if (!userId) return;

      try {
        await taskManagementService.rescheduleTask(
          taskId,
          userId,
          newDate,
          newTimeSlot
        );
        // Reload tasks to reflect changes
        await loadTasks();
      } catch (err) {
        console.error("Error rescheduling task:", err);
        setError(
          err instanceof Error ? err.message : "Failed to reschedule task"
        );
      }
    },
    [userId, loadTasks]
  );

  // Generate tasks from goals
  const generateTasksFromGoals = useCallback(
    async (goals: any[]) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        for (const goal of goals) {
          if (goal.ai_breakdown) {
            await taskGenerationService.generateDailyTasks(
              userId,
              goal.ai_breakdown,
              goal.user_preferences || {}
            );
          }
        }

        // Reload tasks to show newly generated ones
        await loadTasks();
      } catch (err) {
        console.error("Error generating tasks from goals:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate tasks"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId, loadTasks]
  );

  // Load tasks when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId, loadTasks]);

  return {
    // State
    tasks,
    taskStats,
    loading,
    error,

    // Actions
    loadTasks,
    completeTask,
    rescheduleTask,
    generateTasksFromGoals,

    // Utilities
    clearError: () => setError(null),
  };
};
