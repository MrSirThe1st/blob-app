// src/hooks/useScheduling.ts
import { useState, useEffect, useCallback } from "react";
import { aiSchedulingEngine } from "@/services/scheduling/AISchedulingEngine";
import { schedulingService } from "@/services/scheduling/SchedulingService";

interface TimeBlock {
  startTime: string;
  endTime: string;
  taskId: string;
  taskTitle: string;
  type: string;
  priority: string;
  energyLevel: "low" | "medium" | "high";
  optimizationReason: string;
}

interface AISchedule {
  timeBlocks: TimeBlock[];
  bufferBlocks: Array<{
    startTime: string;
    endTime: string;
    purpose: string;
  }>;
  recommendations: string[];
  energyOptimization: {
    highEnergyTasks: string[];
    lowEnergyTasks: string[];
    energyBreaks: string[];
  };
  workLifeBalance: {
    workTime: number;
    personalTime: number;
    breakTime: number;
    balanceScore: number;
  };
  optimizationScore?: number;
  adaptability?: number;
}

export const useScheduling = (userId: string | undefined) => {
  const [schedule, setSchedule] = useState<AISchedule | null>(null);
  const [basicSchedule, setBasicSchedule] = useState<any>(null); // Your existing schedule type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate AI-optimized schedule
  const generateAISchedule = useCallback(
    async (date?: string) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const aiSchedule = await aiSchedulingEngine.generateDailySchedule(
          userId,
          date
        );
        setSchedule(aiSchedule);

        return aiSchedule;
      } catch (err) {
        console.error("Error generating AI schedule:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate AI schedule"
        );

        // Fallback to basic scheduling
        try {
          const fallbackSchedule =
            await schedulingService.generateDailySchedule(userId, date);
          setBasicSchedule(fallbackSchedule);
        } catch (fallbackError) {
          console.error("Fallback scheduling also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Generate basic schedule (your existing service)
  const generateBasicSchedule = useCallback(
    async (date?: string) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const basic = await schedulingService.generateDailySchedule(
          userId,
          date
        );
        setBasicSchedule(basic);

        return basic;
      } catch (err) {
        console.error("Error generating basic schedule:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate schedule"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Get existing schedule for a date
  const getSchedule = useCallback(
    async (date: string) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const existing = await schedulingService.getSchedule(userId, date);
        setBasicSchedule(existing);

        return existing;
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch schedule"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Initialize with today's schedule
  useEffect(() => {
    if (userId) {
      const today = new Date().toISOString().split("T")[0];

      // First try to get existing schedule
      getSchedule(today).then((existing) => {
        // If no existing schedule, generate a new one
        if (!existing) {
          generateAISchedule(today);
        }
      });
    }
  }, [userId, getSchedule, generateAISchedule]);

  return {
    // State
    schedule, // AI-optimized schedule
    basicSchedule, // Your existing schedule format
    loading,
    error,

    // Actions
    generateAISchedule,
    generateBasicSchedule,
    getSchedule,

    // Utilities
    clearError: () => setError(null),
    hasAISchedule: !!schedule,
    hasBasicSchedule: !!basicSchedule,

    // Get the best available schedule
    getBestSchedule: () => schedule || basicSchedule,
  };
};
