// src/hooks/useTaskSystem.ts
import { useState, useEffect, useCallback } from "react";
import { taskSystemOrchestrator } from "@/services/orchestrator/TaskSystemOrchestrator";
import { taskManagementService } from "@/services/tasks/TaskManagementService";
import { aiSchedulingEngine } from "@/services/scheduling/AISchedulingEngine";
import { Task } from "@/types/tasks";

interface TaskSystemState {
  tasks: Task[];
  schedule: any;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface TaskCompletionResult {
  success: boolean;
  task: any;
  xp_awarded: number;
  celebration: string;
  achievements: any[];
}

export const useTaskSystem = (userId: string | undefined) => {
  const [state, setState] = useState<TaskSystemState>({
    tasks: [],
    schedule: null,
    loading: false,
    error: null,
    initialized: false,
  });

  const updateState = (updates: Partial<TaskSystemState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Initialize task system
  const initializeSystem = useCallback(async () => {
    if (!userId) return;

    try {
      updateState({ loading: true, error: null });

      const result = await taskSystemOrchestrator.initializeTaskSystem(userId);

      if (result.success) {
        updateState({
          schedule: result.data?.todaySchedule,
          initialized: true,
        });

        // Load today's tasks
        await loadTodaysTasks();

        return result;
      } else {
        updateState({ error: result.message });
        return result;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize task system";
      updateState({ error: errorMessage });
      throw err;
    } finally {
      updateState({ loading: false });
    }
  }, [userId]);

  // Load today's tasks
  const loadTodaysTasks = useCallback(async () => {
    if (!userId) return;

    try {
      updateState({ loading: true, error: null });

      const tasks = await taskManagementService.getTodaysTasks(userId);
      updateState({ tasks });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tasks";
      updateState({ error: errorMessage });
    } finally {
      updateState({ loading: false });
    }
  }, [userId]);

  // Complete a task
  const completeTask = useCallback(
    async (
      taskId: string,
      completionData: any = {}
    ): Promise<TaskCompletionResult | null> => {
      if (!userId) return null;

      try {
        const result = await taskSystemOrchestrator.handleTaskCompletion(
          userId,
          taskId,
          {
            completed_at: new Date().toISOString(),
            ...completionData,
          }
        );

        // Refresh tasks after completion
        await loadTodaysTasks();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to complete task";
        updateState({ error: errorMessage });
        throw err;
      }
    },
    [userId, loadTodaysTasks]
  );

  // Generate new schedule
  const generateSchedule = useCallback(
    async (date?: string) => {
      if (!userId) return;

      try {
        updateState({ loading: true, error: null });

        const schedule = await aiSchedulingEngine.generateDailySchedule(
          userId,
          date
        );
        updateState({ schedule });

        return schedule;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate schedule";
        updateState({ error: errorMessage });
        throw err;
      } finally {
        updateState({ loading: false });
      }
    },
    [userId]
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
        await loadTodaysTasks();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reschedule task";
        updateState({ error: errorMessage });
        throw err;
      }
    },
    [userId, loadTodaysTasks]
  );

  // Get task statistics
  const getTaskStats = useCallback(
    async (timeframe: "day" | "week" | "month" = "day") => {
      if (!userId) return null;

      try {
        return await taskManagementService.getTaskStats(userId, timeframe);
      } catch (err) {
        console.error("Error getting task stats:", err);
        return null;
      }
    },
    [userId]
  );

  // Initialize system when userId changes
  useEffect(() => {
    if (userId && !state.initialized) {
      initializeSystem();
    }
  }, [userId, state.initialized, initializeSystem]);

  // Auto-refresh tasks periodically
  useEffect(() => {
    if (!userId || !state.initialized) return;

    const interval = setInterval(
      () => {
        loadTodaysTasks();
      },
      5 * 60 * 1000
    ); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [userId, state.initialized, loadTodaysTasks]);

  return {
    // State
    tasks: state.tasks,
    schedule: state.schedule,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // Actions
    initializeSystem,
    loadTodaysTasks,
    completeTask,
    rescheduleTask,
    generateSchedule,
    getTaskStats,

    // Utilities
    clearError: () => updateState({ error: null }),
    refresh: async () => {
      await Promise.all([loadTodaysTasks(), generateSchedule()]);
    },

    // Computed properties
    hasTasks: state.tasks.length > 0,
    hasSchedule: !!state.schedule,
    completedTasks: state.tasks.filter((t) => t.status === "completed"),
    pendingTasks: state.tasks.filter((t) => t.status === "pending"),

    // Task system orchestrator for advanced usage
    orchestrator: taskSystemOrchestrator,
  };
};
