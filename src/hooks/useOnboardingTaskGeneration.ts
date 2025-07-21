// src/hooks/useOnboardingTaskGeneration.ts
/**
 * Hook to manage onboarding task generation
 * Provides utilities to generate tasks from onboarding data
 */

import { onboardingTaskGenerationService } from "@/services/onboarding/OnboardingTaskGenerationService";
import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";

interface TaskGenerationState {
  loading: boolean;
  error: string | null;
  lastGenerationResult: any | null;
}

export const useOnboardingTaskGeneration = () => {
  const { userProfile } = useAuth();
  const [state, setState] = useState<TaskGenerationState>({
    loading: false,
    error: null,
    lastGenerationResult: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Generate initial tasks from user's onboarding data
   */
  const generateInitialTasks = useCallback(
    async (timeframe: "2_days" | "1_week" | "2_weeks" = "1_week") => {
      if (!userProfile?.id) {
        setError("User profile not found. Please log in again.");
        return null;
      }

      setLoading(true);
      clearError();

      try {
        console.log("🎯 Generating initial tasks from onboarding...");

        const result =
          await onboardingTaskGenerationService.retryTaskGeneration(
            userProfile.id
          );

        if (result.success) {
          setState((prev) => ({
            ...prev,
            lastGenerationResult: result,
            error: null,
          }));

          console.log(
            `✅ Generated ${result.tasksGenerated} tasks successfully`
          );
          return result;
        } else {
          setError(result.error || "Failed to generate tasks");
          return null;
        }
      } catch (error) {
        console.error("❌ Error generating initial tasks:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userProfile?.id, setLoading, clearError, setError]
  );

  /**
   * Check if user can generate tasks (has onboarding data)
   */
  const canGenerateTasks = useCallback(async (): Promise<boolean> => {
    if (!userProfile?.id) return false;

    try {
      // This will throw an error if no onboarding data exists
      const result = await onboardingTaskGenerationService.retryTaskGeneration(
        userProfile.id
      );
      return (
        result.success ||
        result.error !== "No onboarding data found to generate tasks from"
      );
    } catch {
      return false;
    }
  }, [userProfile?.id]);

  return {
    // State
    loading: state.loading,
    error: state.error,
    lastResult: state.lastGenerationResult,

    // Actions
    generateInitialTasks,
    canGenerateTasks,
    clearError,

    // Utilities
    hasError: !!state.error,
    tasksGenerated: state.lastGenerationResult?.tasksGenerated || 0,
    recommendations: state.lastGenerationResult?.recommendations || [],
  };
};

export default useOnboardingTaskGeneration;
