export {
  getCurrentUser,
  getUserProfile,
  isAuthenticated,
  supabase,
} from "./supabase";
export type { Database } from "./supabase";

// Authentication service
export { authService } from "./auth";
export type {
  AuthResult,
  SignInData,
  SignUpData,
  UserProfileData,
} from "./auth";

// OpenAI service
export { openAIService } from "./openai";
export type {
  ChatMessage,
  OnboardingConversationData,
  ScheduleRequest,
  ScheduleResponse,
  GeneratedTask,
} from "./openai";

// Scheduling service
export { schedulingService } from "../scheduling/SchedulingService";
export type {
  Task,
  Schedule,
  ScheduledTask,
  UserAvailability,
  UserPreferences,
} from "../scheduling/SchedulingService";

// Authentication utilities
export {
  AuthErrorCode,
  authUtils,
  getAuthErrorCode,
  getAuthErrorMessage,
  getPasswordStrength,
  validateEmail,
  validatePassword,
  validateSignInForm,
  validateSignUpForm,
} from "./auth-utils";
export type { AuthFormData, ValidationResult } from "./auth-utils";

// Error handling constants
export const ErrorMessages = {
  NETWORK_ERROR:
    "Network connection failed. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_NOT_FOUND: "User not found.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  OPENAI_NOT_CONFIGURED: "AI service is not properly configured.",
  SCHEDULE_GENERATION_FAILED: "Failed to generate schedule. Using default.",
} as const;

// Success messages
export const SuccessMessages = {
  ACCOUNT_CREATED:
    "Account created successfully! Please check your email for verification.",
  LOGIN_SUCCESS: "Welcome back! You have been signed in successfully.",
  LOGOUT_SUCCESS: "You have been signed out successfully.",
  PASSWORD_RESET_SENT: "Password reset email sent. Please check your inbox.",
  PASSWORD_UPDATED: "Password updated successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  ONBOARDING_COMPLETED:
    "Onboarding completed! Generating your first schedule...",
  SCHEDULE_GENERATED: "Your personalized schedule has been created!",
  TASK_COMPLETED: "Great job! Task completed and XP awarded.",
} as const;

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  MIN_ONBOARDING_INPUT_LENGTH: 50,
  MAX_ONBOARDING_INPUT_LENGTH: 2000,
} as const;

// Helper function to handle API errors consistently
export const handleApiError = (error: any, context: string = "API") => {
  console.error(`${context} Error:`, error);

  // Log additional context for debugging
  if (error?.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
  }

  return getAuthErrorMessage(error);
};

// Helper function to create standardized API responses
export const createApiResponse = <T>(
  data: T | null,
  error: any = null,
  message: string = ""
) => ({
  data,
  error,
  message,
  success: !error && data !== null,
  timestamp: new Date().toISOString(),
});

// Type for standardized API responses
export interface ApiResponse<T> {
  data: T | null;
  error: any;
  message: string;
  success: boolean;
  timestamp: string;
}
