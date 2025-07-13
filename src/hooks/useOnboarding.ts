// src/hooks/useOnboarding.ts
/**
 * Complete onboarding hook that properly handles the 5-step flow with text inputs
 */
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "./useAuth";
import { openAIService } from "@/services/api/openai";

interface OnboardingState {
  currentStep: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

// Data structure that matches your onboarding flow design
interface OnboardingData {
  // Step 1: Energy Pattern
  energyPattern?: "morning" | "afternoon" | "evening";
  energyPatternNote?: string;

  // Step 2: Work Style
  workStyle?: "deep_focus" | "quick_sprints" | "flexible_mix";
  workStyleNote?: string;

  // Step 3: Stress Response
  stressResponse?: "reduce" | "structure" | "support";
  stressResponseNote?: string;

  // Step 4: Calendar (optional)
  calendarConnected?: boolean;

  // Step 5: Open Conversation
  conversationText?: string;
}

export const useOnboarding = () => {
  const { userProfile, updateProfile } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    currentStep: userProfile?.onboardingStep || 1,
    isLoading: false,
    hasError: false,
    errorMessage: "",
  });

  // Local state to store onboarding data across steps
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

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
   * Validate if step data is sufficient to proceed (either selection OR meaningful text)
   */
  const validateStepData = useCallback(
    (
      step: number,
      data: Partial<OnboardingData>,
      additionalInput?: string
    ): boolean => {
      const hasMeaningfulInput =
        additionalInput && additionalInput.trim().length >= 10;

      switch (step) {
        case 1: // Energy Pattern - Either selection OR text
          return !!data.energyPattern || hasMeaningfulInput;
        case 2: // Work Style - Either selection OR text
          return !!data.workStyle || hasMeaningfulInput;
        case 3: // Stress Response - Either selection OR text
          return !!data.stressResponse || hasMeaningfulInput;
        case 4: // Calendar Connection - Always optional
          return true;
        case 5: // Open Conversation - Require meaningful text (minimum 20 characters)
          return (
            (!!data.conversationText &&
              data.conversationText.trim().length >= 20) ||
            hasMeaningfulInput
          );
        default:
          return false;
      }
    },
    []
  );

  /**
   * Update local onboarding data
   */
  const updateOnboardingData = useCallback(
    (updates: Partial<OnboardingData>) => {
      setOnboardingData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  /**
   * Save step data and continue to next step
   */
  const saveStepAndContinue = useCallback(
    async (
      stepData: Partial<OnboardingData>,
      additionalInput?: string
    ): Promise<boolean> => {
      const currentStep = state.currentStep;

      // Validate step data
      if (!validateStepData(currentStep, stepData, additionalInput)) {
        return false; // Let the screen handle the validation message
      }

      setLoading(true);
      clearError();

      try {
        // Merge additional input into step data
        const completeStepData = { ...stepData };
        if (additionalInput && additionalInput.trim()) {
          switch (currentStep) {
            case 1:
              completeStepData.energyPatternNote = additionalInput.trim();
              break;
            case 2:
              completeStepData.workStyleNote = additionalInput.trim();
              break;
            case 3:
              completeStepData.stressResponseNote = additionalInput.trim();
              break;
            case 5:
              completeStepData.conversationText = additionalInput.trim();
              break;
          }
        }

        // Update local state
        updateOnboardingData(completeStepData);

        // Prepare profile updates
        let profileUpdates: any = {
          onboardingStep: currentStep + 1,
          onboardingCompleted: false, // Keep false until all steps complete
        };

        switch (currentStep) {
          case 1:
            if (completeStepData.energyPattern) {
              profileUpdates.chronotype = completeStepData.energyPattern;
            }
            break;
          case 2:
            if (completeStepData.workStyle) {
              profileUpdates.workStyle = completeStepData.workStyle;
            }
            break;
          case 3:
            if (completeStepData.stressResponse) {
              profileUpdates.motivationType = completeStepData.stressResponse;
            }
            break;
          case 4:
            profileUpdates.calendarConnected =
              completeStepData.calendarConnected || false;
            break;
        }

        // Save to profile (except for step 5 which is handled separately)
        if (currentStep < 5) {
          const { error } = await updateProfile(profileUpdates);

          if (error) {
            setError("Failed to save your information. Please try again.");
            return false;
          }
        }

        // Update current step
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
      validateStepData,
      setLoading,
      setError,
      clearError,
      updateOnboardingData,
      updateProfile,
    ]
  );

  /**
   * Complete the onboarding process (called only from step 5)
   */
  const completeOnboarding = useCallback(
    async (conversationText: string): Promise<boolean> => {
      setLoading(true);
      clearError();

      try {
        // Final data includes conversation
        const finalData = { ...onboardingData, conversationText };

        // Save final onboarding data
        const profileUpdates = {
          onboardingCompleted: true, // Only set true here
          onboardingStep: 0, // Reset since completed
          onboardingNotes: {
            energyPatternNote: finalData.energyPatternNote,
            workStyleNote: finalData.workStyleNote,
            stressResponseNote: finalData.stressResponseNote,
            conversationText: finalData.conversationText,
          },
        };

        const { error } = await updateProfile(profileUpdates);

        if (error) {
          setError("Failed to complete onboarding. Please try again.");
          return false;
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
        setError("Failed to complete onboarding. Please try again.");
        return false;
      }
    },
    [onboardingData, updateProfile, setLoading, setError, clearError]
  );

  /**
   * Go back to previous step
   */
  const goBackStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [state.currentStep]);

  /**
   * Check if we can proceed from current step with given data and input
   */
  const canProceedWithData = useCallback(
    (stepData: Partial<OnboardingData>, additionalInput?: string): boolean => {
      return validateStepData(state.currentStep, stepData, additionalInput);
    },
    [state.currentStep, validateStepData]
  );

  /**
   * Get onboarding progress percentage
   */
  const getProgress = useCallback((): number => {
    return Math.round(((state.currentStep - 1) / 5) * 100);
  }, [state.currentStep]);

  return {
    // State
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    hasError: state.hasError,
    errorMessage: state.errorMessage,
    progress: getProgress(),
    onboardingData,

    // Actions
    updateOnboardingData,
    saveStepAndContinue,
    completeOnboarding,
    goBackStep,
    clearError,

    // Validation
    validateStepData,
    canProceedWithData,

    // Computed
    isOnboardingComplete: userProfile?.onboardingCompleted === true,
  };
};
