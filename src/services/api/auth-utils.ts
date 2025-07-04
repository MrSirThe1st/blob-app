/**
 * Authentication utilities
 * Helper functions for auth validation and error handling
 */

import { AuthError } from "@supabase/supabase-js";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}

// Auth error types for better error handling
export enum AuthErrorCode {
  INVALID_EMAIL = "invalid_email",
  WEAK_PASSWORD = "weak_password",
  EMAIL_ALREADY_EXISTS = "email_already_exists",
  INVALID_CREDENTIALS = "invalid_credentials",
  USER_NOT_FOUND = "user_not_found",
  NETWORK_ERROR = "network_error",
  UNKNOWN_ERROR = "unknown_error",
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please enter a valid email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
      );
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: string[] = [];

  if (!confirmPassword) {
    errors.push("Please confirm your password");
  } else if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate full name
 */
export const validateFullName = (fullName: string): ValidationResult => {
  const errors: string[] = [];

  if (!fullName || !fullName.trim()) {
    errors.push("Full name is required");
  } else if (fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  } else if (fullName.trim().length > 50) {
    errors.push("Full name must be less than 50 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate sign up form
 */
export const validateSignUpForm = (
  formData: AuthFormData
): ValidationResult => {
  const allErrors: string[] = [];

  // Validate email
  const emailValidation = validateEmail(formData.email);
  allErrors.push(...emailValidation.errors);

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  allErrors.push(...passwordValidation.errors);

  // Validate password confirmation
  if (formData.confirmPassword !== undefined) {
    const confirmPasswordValidation = validatePasswordConfirmation(
      formData.password,
      formData.confirmPassword
    );
    allErrors.push(...confirmPasswordValidation.errors);
  }

  // Validate full name (optional but if provided, validate it)
  if (formData.fullName !== undefined && formData.fullName.trim()) {
    const fullNameValidation = validateFullName(formData.fullName);
    allErrors.push(...fullNameValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Validate sign in form
 */
export const validateSignInForm = (
  formData: AuthFormData
): ValidationResult => {
  const allErrors: string[] = [];

  // Basic email validation (less strict for sign in)
  if (!formData.email || !formData.email.trim()) {
    allErrors.push("Email is required");
  }

  // Basic password validation (just check if provided)
  if (!formData.password || !formData.password.trim()) {
    allErrors.push("Password is required");
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Convert Supabase auth error to user-friendly message
 */
export const getAuthErrorMessage = (error: AuthError | any): string => {
  if (!error) return "An unknown error occurred";

  const message = error.message?.toLowerCase() || "";

  // Map Supabase errors to user-friendly messages
  if (message.includes("invalid login credentials")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  if (
    message.includes("email already registered") ||
    message.includes("user already registered")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (message.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }

  if (message.includes("signup is disabled")) {
    return "Account registration is currently disabled. Please contact support.";
  }

  if (message.includes("email not confirmed")) {
    return "Please check your email and click the confirmation link before signing in.";
  }

  if (
    message.includes("invalid refresh token") ||
    message.includes("refresh_token_not_found")
  ) {
    return "Your session has expired. Please sign in again.";
  }

  if (message.includes("network")) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  // Return original message if no mapping found
  return error.message || "An unexpected error occurred. Please try again.";
};

/**
 * Get auth error code for programmatic handling
 */
export const getAuthErrorCode = (error: AuthError | any): AuthErrorCode => {
  if (!error) return AuthErrorCode.UNKNOWN_ERROR;

  const message = error.message?.toLowerCase() || "";

  if (message.includes("invalid login credentials")) {
    return AuthErrorCode.INVALID_CREDENTIALS;
  }

  if (message.includes("email already registered")) {
    return AuthErrorCode.EMAIL_ALREADY_EXISTS;
  }

  if (message.includes("invalid email")) {
    return AuthErrorCode.INVALID_EMAIL;
  }

  if (message.includes("password should be at least")) {
    return AuthErrorCode.WEAK_PASSWORD;
  }

  if (message.includes("user not found")) {
    return AuthErrorCode.USER_NOT_FOUND;
  }

  if (message.includes("network")) {
    return AuthErrorCode.NETWORK_ERROR;
  }

  return AuthErrorCode.UNKNOWN_ERROR;
};

/**
 * Check if password meets minimum security requirements
 */
export const getPasswordStrength = (
  password: string
): {
  strength: "weak" | "medium" | "strong";
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  // Determine strength
  let strength: "weak" | "medium" | "strong";
  if (score < 3) {
    strength = "weak";
  } else if (score < 5) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return { strength, score, feedback };
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "@$!%*?&";

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Format auth form data
 */
export const formatAuthFormData = (formData: AuthFormData): AuthFormData => {
  return {
    email: sanitizeInput(formData.email).toLowerCase(),
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    fullName: formData.fullName ? sanitizeInput(formData.fullName) : undefined,
  };
};

/**
 * Check if email is disposable/temporary
 */
export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    "10minutemail.com",
    "tempmail.org",
    "guerrillamail.com",
    "mailinator.com",
    "throwaway.email",
    // Add more as needed
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.includes(domain);
};

/**
 * Auth utilities export
 */
export const authUtils = {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateFullName,
  validateSignUpForm,
  validateSignInForm,
  getAuthErrorMessage,
  getAuthErrorCode,
  getPasswordStrength,
  generateSecurePassword,
  sanitizeInput,
  formatAuthFormData,
  isDisposableEmail,
};

export default authUtils;
