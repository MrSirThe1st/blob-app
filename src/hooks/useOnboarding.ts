// src/hooks/useOnboarding.ts
/**
 * Enhanced onboarding hook that properly handles the 5-step flow with text inputs
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
  stressResponse?: "less_slower" | "structure" | "support";
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
   * Validate onboarding step data based on your actual design
   */
  const validateStepData = useCallback(
    (step: number, data: Partial<OnboardingData>): boolean => {
      switch (step) {
        case 1: // Energy Pattern - Required selection
          return !!data.energyPattern;
        case 2: // Work Style - Required selection
          return !!data.workStyle;
        case 3: // Stress Response - Required selection
          return !!data.stressResponse;
        case 4: // Calendar Connection - Always optional
          return true;
        case 5: // Open Conversation - Require meaningful text (minimum 20 characters)
          return (
            !!data.conversationText && data.conversationText.trim().length >= 20
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
    async (stepData: Partial<OnboardingData>): Promise<boolean> => {
      const currentStep = state.currentStep;

      // Merge with existing data
      const updatedData = { ...onboardingData, ...stepData };

      if (!validateStepData(currentStep, updatedData)) {
        setError(getValidationMessage(currentStep));
        return false;
      }

      setLoading(true);
      clearError();

      try {
        // Update local state
        updateOnboardingData(stepData);

        // For steps 1-3, save immediately to profile for persistence
        let profileUpdates: any = {
          onboardingStep: currentStep + 1,
        };

        switch (currentStep) {
          case 1:
            profileUpdates.chronotype = stepData.energyPattern;
            break;
          case 2:
            profileUpdates.workStyle = stepData.workStyle;
            break;
          case 3:
            profileUpdates.motivationType = stepData.stressResponse; // Map to existing field
            break;
          case 4:
            profileUpdates.calendarConnected =
              stepData.calendarConnected || false;
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
      onboardingData,
      updateProfile,
      validateStepData,
      setLoading,
      setError,
      clearError,
      updateOnboardingData,
    ]
  );

  /**
   * Complete final onboarding step with AI processing
   */
  const completeOnboarding = useCallback(
    async (conversationText: string): Promise<boolean> => {
      const finalData = { ...onboardingData, conversationText };

      if (!validateStepData(5, finalData)) {
        setError(
          "Please share at least 20 characters about yourself to help Blob understand you better."
        );
        return false;
      }

      setLoading(true);
      clearError();

      try {
        // Combine all text inputs for AI processing
        const allTextInputs = [
          finalData.energyPatternNote,
          finalData.workStyleNote,
          finalData.stressResponseNote,
          conversationText,
        ]
          .filter(Boolean)
          .join("\n\n");

        // Prepare basic profile for AI
        const basicProfile = {
          chronotype: finalData.energyPattern || userProfile?.chronotype,
          workStyle: finalData.workStyle || userProfile?.workStyle,
          stressResponse:
            finalData.stressResponse || userProfile?.motivationType,
        };

        // Process with AI
        let aiInsights;
        try {
          aiInsights = await openAIService.processDetailedOnboardingInput(
            allTextInputs,
            basicProfile
          );
        } catch (aiError) {
          console.warn("AI processing failed, using fallback:", aiError);
          // Continue without AI insights rather than blocking onboarding
          aiInsights = null;
        }

        // Save final profile updates
        const finalProfileUpdates = {
          onboardingCompleted: true,
          onboardingStep: 0, // Reset since completed
          ...(aiInsights && { aiPersonality: aiInsights }),
        };

        const { error } = await updateProfile(finalProfileUpdates);

        if (error) {
          setError("Failed to save your information. Please try again.");
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
    [
      onboardingData,
      userProfile,
      updateProfile,
      validateStepData,
      setLoading,
      setError,
      clearError,
    ]
  );

  /**
   * Skip calendar connection and move to conversation
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
        return "Please select when you feel most energetic.";
      case 2:
        return "Please select your preferred work style.";
      case 3:
        return "Please select how you handle stress.";
      case 4:
        return "Calendar connection is optional, you can continue.";
      case 5:
        return "Please share at least 20 characters about yourself to help Blob understand you better.";
      default:
        return "Please complete the required information.";
    }
  }, []);

  /**
   * Check if we can proceed from current step
   */
  const canProceed = useCallback(
    (stepData: Partial<OnboardingData>): boolean => {
      const mergedData = { ...onboardingData, ...stepData };
      return validateStepData(state.currentStep, mergedData);
    },
    [state.currentStep, onboardingData, validateStepData]
  );

  /**
   * Get onboarding progress percentage
   */
  const getProgress = useCallback((): number => {
    return Math.round(((state.currentStep - 1) / 5) * 100);
  }, [state.currentStep]);

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
    skipCalendarConnection,
    goBackStep,
    clearError,

    // Validation
    validateStepData,
    getValidationMessage,
    canProceed,

    // Computed
    isOnboardingComplete: userProfile?.onboardingCompleted || false,
    isAIConfigured: openAIService.isConfigured(),
  };
};
