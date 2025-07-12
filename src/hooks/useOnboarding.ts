// src/hooks/useOnboarding.ts
/**
 * Custom hook for managing onboarding state and validation
 */
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "./useAuth";
import { openAIService, schedulingService, API_CONFIG } from "@/services/api";

interface OnboardingState {
  currentStep: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

interface OnboardingData {
  chronotype?: "morning" | "evening" | "flexible";
  workStyle?: "deep_focus" | "multitasking" | "balanced";
  workStartTime?: string;
  workEndTime?: string;
  breakDuration?: number;
  stressResponse?: "less_slower" | "structure" | "support";
  detailedInput?: string;
}

export const useOnboarding = () => {
  const { userProfile, updateProfile } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    currentStep: userProfile?.onboardingStep || 1,
    isLoading: false,
    hasError: false,
    errorMessage: "",
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      hasError: !!error,
      errorMessage: error,
      isLoading: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, hasError: false, errorMessage: "" }));
  }, []);

  /**
   * Validate onboarding step data
   */
  const validateStepData = useCallback((step: number, data: any): boolean => {
    switch (step) {
      case 1: // Energy Pattern
        return !!data.chronotype;
      case 2: // Personality/Work Style
        return !!data.workStyle;
      case 3: // Work Schedule
        if (!data.workStartTime || !data.workEndTime) return false;
        const startHour = parseInt(data.workStartTime.split(":")[0]);
        const endHour = parseInt(data.workEndTime.split(":")[0]);
        return endHour > startHour;
      case 4: // Stress Response
        return !!data.stressResponse;
      case 5: // Detailed Input
        return (
          data.detailedInput &&
          data.detailedInput.trim().length >=
            API_CONFIG.MIN_ONBOARDING_INPUT_LENGTH
        );
      default:
        return false;
    }
  }, []);

  /**
   * Save step data and progress to next step
   */
  const saveStepAndContinue = useCallback(
    async (stepData: Partial<OnboardingData>): Promise<boolean> => {
      const currentStep = state.currentStep;

      if (!validateStepData(currentStep, stepData)) {
        setError("Please complete all required fields before continuing.");
        return false;
      }

      setLoading(true);
      clearError();

      try {
        // Prepare update data based on step
        let updateData: any = {
          onboardingStep: currentStep + 1,
        };

        switch (currentStep) {
          case 1:
            updateData.chronotype = stepData.chronotype;
            break;
          case 2:
            updateData.workStyle = stepData.workStyle;
            break;
          case 3:
            updateData.workStartTime = stepData.workStartTime;
            updateData.workEndTime = stepData.workEndTime;
            updateData.breakDuration = stepData.breakDuration;
            break;
          case 4:
            updateData.motivationType = stepData.stressResponse; // Using motivationType for stress response
            break;
        }

        const { error } = await updateProfile(updateData);

        if (error) {
          setError("Failed to save your information. Please try again.");
          return false;
        }

        setState((prev) => ({
          ...prev,
          currentStep: currentStep + 1,
          isLoading: false,
          hasError: false,
        }));

        return true;
      } catch (error) {
        console.error("Error saving onboarding step:", error);
        setError("An unexpected error occurred. Please try again.");
        return false;
      }
    },
    [
      state.currentStep,
      updateProfile,
      validateStepData,
      setLoading,
      setError,
      clearError,
    ]
  );

  /**
   * Complete onboarding with detailed user input
   */
  const completeOnboarding = useCallback(
    async (detailedInput: string): Promise<boolean> => {
      if (!validateStepData(5, { detailedInput })) {
        setError(
          `Please provide at least ${API_CONFIG.MIN_ONBOARDING_INPUT_LENGTH} characters about yourself.`
        );
        return false;
      }

      setLoading(true);
      clearError();

      try {
        // Process detailed input with AI
        const basicProfile = {
          chronotype: userProfile?.chronotype,
          workStyle: userProfile?.workStyle,
          stressResponse: userProfile?.motivationType, // We stored stress response here
        };

        const aiInsights = await openAIService.processDetailedOnboardingInput(
          detailedInput.trim(),
          basicProfile
        );

        // Save AI insights and mark onboarding complete
        const { error } = await updateProfile({
          aiPersonality: aiInsights,
          onboardingCompleted: true,
          onboardingStep: 0, // Reset since completed
        });

        if (error) {
          setError("Failed to save your information. Please try again.");
          return false;
        }

        // Generate first schedule in background
        if (userProfile?.id) {
          try {
            await schedulingService.generateDailySchedule(userProfile.id);
            console.log("✅ First schedule generated successfully");
          } catch (scheduleError) {
            console.warn(
              "⚠️ Failed to generate initial schedule, will create on first app use"
            );
          }
        }

        setState((prev) => ({
          ...prev,
          currentStep: 0,
          isLoading: false,
          hasError: false,
        }));

        return true;
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setError("Failed to process your information. Please try again.");
        return false;
      }
    },
    [
      userProfile,
      updateProfile,
      validateStepData,
      setLoading,
      setError,
      clearError,
    ]
  );

  /**
   * Skip calendar connection (placeholder for future feature)
   */
  const skipCalendarConnection = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: 5 }));
  }, []);

  /**
   * Get validation message for current step
   */
  const getValidationMessage = useCallback((step: number): string => {
    switch (step) {
      case 1:
        return "Please select your energy pattern.";
      case 2:
        return "Please select your work style.";
      case 3:
        return "Please set your work hours with valid start and end times.";
      case 4:
        return "Please select how you handle stress.";
      case 5:
        return `Please share at least ${API_CONFIG.MIN_ONBOARDING_INPUT_LENGTH} characters about yourself.`;
      default:
        return "Please complete the required information.";
    }
  }, []);

  /**
   * Check if OpenAI service is configured
   */
  const isAIConfigured = useCallback((): boolean => {
    return openAIService.isConfigured();
  }, []);

  /**
   * Get onboarding progress percentage
   */
  const getProgress = useCallback((): number => {
    return Math.round((state.currentStep / 5) * 100);
  }, [state.currentStep]);

  return {
    // State
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    hasError: state.hasError,
    errorMessage: state.errorMessage,
    progress: getProgress(),

    // Actions
    saveStepAndContinue,
    completeOnboarding,
    skipCalendarConnection,
    clearError,

    // Validation
    validateStepData,
    getValidationMessage,
    isAIConfigured,

    // Computed
    isOnboardingComplete: userProfile?.onboardingCompleted || false,
    canProceed: (stepData: any) =>
      validateStepData(state.currentStep, stepData),
  };
};
