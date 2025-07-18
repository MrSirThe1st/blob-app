// src/hooks/useOnboarding.ts
/**
 * Enhanced onboarding hook with real AI integration
 * Eliminates mock responses and provides proper error handling when AI is unavailable
 */

import { openAIService } from "@/services/api/openai";
import { onboardingCompletionService } from "@/services/onboarding/OnboardingCompletionService";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface OnboardingState {
  currentStep: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  isAIAvailable: boolean;
  completionResult?: any;
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
  const { userProfile, updateProfile, refreshProfile, isAuthenticated } =
    useAuth();

  const [state, setState] = useState<OnboardingState>({
    currentStep: userProfile?.onboardingStep || 1,
    isLoading: false,
    hasError: false,
    errorMessage: "",
    isAIAvailable: false,
  });

  // Local state to store onboarding data across steps
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  // Check AI availability on mount
  useEffect(() => {
    const checkAIAvailability = async () => {
      const isAvailable = openAIService.isServiceAvailable();
      setState((prev) => ({ ...prev, isAIAvailable: isAvailable }));

      if (isAvailable) {
        // Test the connection
        try {
          const testResult = await openAIService.testConnection();
          setState((prev) => ({ ...prev, isAIAvailable: testResult.success }));
        } catch (error) {
          console.warn("AI connection test failed:", error);
          setState((prev) => ({ ...prev, isAIAvailable: false }));
        }
      }
    };

    checkAIAvailability();
  }, []);

  // Ensure userProfile is loaded before onboarding starts
  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      refreshProfile();
    }
  }, [isAuthenticated, userProfile, refreshProfile]);

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
   * Validate if step data is sufficient to proceed
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
            (hasMeaningfulInput && additionalInput!.trim().length >= 20)
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

          // Move to next step
          setState((prev) => ({ ...prev, currentStep: currentStep + 1 }));
          return true;
        }

        // Step 5 is the final step - handle completion
        return true;
      } catch (error) {
        console.error("Error saving onboarding step:", error);
        setError("An unexpected error occurred. Please try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      state.currentStep,
      validateStepData,
      updateOnboardingData,
      updateProfile,
      setLoading,
      clearError,
      setError,
    ]
  );

  /**
   * Complete the entire onboarding process with AI
   */
  const completeOnboarding = useCallback(
    async (finalData?: Partial<OnboardingData>): Promise<boolean> => {
      if (!userProfile?.id) {
        setError("User profile not found. Please log in again.");
        return false;
      }

      setLoading(true);
      clearError();

      try {
        // Merge final data with existing onboarding data
        const completeOnboardingData = { ...onboardingData, ...finalData };

        // Check if we have a meaningful conversation
        const conversationText = completeOnboardingData.conversationText || "";
        if (conversationText.trim().length < 20) {
          setError(
            "Please provide more details about your goals and challenges to personalize your experience."
          );
          return false;
        }

        // Attempt AI-powered completion
        let result;
        if (state.isAIAvailable) {
          console.log("🤖 Attempting AI-powered onboarding completion...");
          result = await onboardingCompletionService.completeOnboardingWithAI(
            userProfile.id,
            completeOnboardingData
          );
        } else {
          console.log("📝 AI unavailable, offering manual completion...");
          // Don't automatically complete manually - inform user of the limitation
          setError(
            "AI services are currently unavailable. The personalized goal extraction and task generation features require AI to work properly. You can:\n\n1. Try again later when AI services are restored\n2. Contact support if the issue persists\n3. Continue with manual goal setup (less personalized)"
          );
          return false;
        }

        if (result.success) {
          // Update profile to mark onboarding as completed
          await updateProfile({
            onboardingCompleted: true,
            onboardingStep: 6, // Completed
          });
          // Immediately refresh profile so UI state is up to date
          await refreshProfile();

          // Store completion result for navigation
          setState((prev) => ({
            ...prev,
            completionResult: result,
            currentStep: 6,
          }));

          console.log("✅ Onboarding completed successfully:", result.message);
          return true;
        } else {
          setError(result.error || result.message);
          return false;
        }
      } catch (error) {
        console.error("❌ Error completing onboarding:", error);
        setError(
          "An unexpected error occurred during completion. Please try again."
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      userProfile?.id,
      onboardingData,
      state.isAIAvailable,
      updateProfile,
      refreshProfile,
      setLoading,
      clearError,
      setError,
    ]
  );

  /**
   * Complete onboarding manually (when AI is not available)
   */
  const completeOnboardingManually = useCallback(async (): Promise<boolean> => {
    if (!userProfile?.id) {
      setError("User profile not found. Please log in again.");
      return false;
    }

    setLoading(true);
    clearError();

    try {
      console.log("📝 Completing onboarding manually...");
      const result =
        await onboardingCompletionService.completeOnboardingManually(
          userProfile.id,
          onboardingData
        );

      if (result.success) {
        // Update profile to mark onboarding as completed
        await updateProfile({
          onboardingCompleted: true,
          onboardingStep: 6, // Completed
        });
        // Immediately refresh profile so UI state is up to date
        await refreshProfile();

        setState((prev) => ({
          ...prev,
          completionResult: result,
          currentStep: 6,
        }));

        console.log("✅ Manual onboarding completed:", result.message);
        return true;
      } else {
        setError(result.error || result.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Error in manual onboarding completion:", error);
      setError("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    userProfile?.id,
    onboardingData,
    updateProfile,
    refreshProfile,
    setLoading,
    clearError,
    setError,
  ]);

  /**
   * Retry AI processing later (for users who completed manually)
   */
  const retryWithAI = useCallback(async (): Promise<boolean> => {
    if (!userProfile?.id) {
      setError("User profile not found. Please log in again.");
      return false;
    }

    setLoading(true);
    clearError();

    try {
      console.log("🔄 Retrying with AI...");
      const result = await onboardingCompletionService.retryAIProcessing(
        userProfile.id
      );

      if (result.success) {
        setState((prev) => ({
          ...prev,
          completionResult: result,
        }));

        console.log("✅ AI processing completed:", result.message);
        return true;
      } else {
        setError(result.error || result.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Error retrying AI processing:", error);
      setError("Failed to process with AI. Please try again later.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, setLoading, clearError, setError]);

  /**
   * Skip to a specific step (for debugging or navigation)
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  }, []);

  /**
   * Reset onboarding (start over)
   */
  const resetOnboarding = useCallback(async () => {
    setOnboardingData({});
    setState((prev) => ({
      ...prev,
      currentStep: 1,
      hasError: false,
      errorMessage: "",
      completionResult: undefined,
    }));

    if (userProfile?.id) {
      await updateProfile({
        onboardingStep: 1,
        onboardingCompleted: false,
      });
    }
  }, [userProfile?.id, updateProfile]);

  return {
    // State
    currentStep: state.currentStep,
    loading: state.isLoading,
    error: state.errorMessage,
    hasError: state.hasError,
    isAIAvailable: state.isAIAvailable,
    completionResult: state.completionResult,
    onboardingData,

    // Actions
    saveStepAndContinue,
    completeOnboarding,
    completeOnboardingManually,
    retryWithAI,
    updateOnboardingData,
    goToStep,
    resetOnboarding,

    // Validation
    validateStepData,

    // Utilities
    clearError,
    isCompleted: userProfile?.onboardingCompleted || false,
    isLastStep: state.currentStep === 5,
    canProceed: (stepData: Partial<OnboardingData>, additionalInput?: string) =>
      validateStepData(state.currentStep, stepData, additionalInput),

    // AI Status helpers
    aiStatusMessage: state.isAIAvailable
      ? "AI services are available for personalized recommendations"
      : "AI services are currently unavailable. You can complete setup manually or try again later.",

    showAIUnavailableWarning: !state.isAIAvailable,
  };
};
