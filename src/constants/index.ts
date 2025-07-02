/**
 * Central export for all constants
 * Import any design system constants from here
 */

// Design system exports
export * from "./colors";
export * from "./fonts";
export * from "./spacing";

// Re-export commonly used values for convenience
export { Colors } from "./colors";
export { Typography, FontSize, FontWeight } from "./fonts";
export {
  Spacing,
  Padding,
  Margin,
  BorderRadius,
  Layout,
  CommonSpacing,
} from "./spacing";

// App-specific constants
export const AppConfig = {
  name: "Blob AI",
  version: "1.0.0",

  // AI Configuration
  ai: {
    maxTokens: 2000,
    temperature: 0.7,
    defaultModel: "gpt-4",
  },

  // Schedule Configuration
  schedule: {
    defaultWorkingHours: {
      start: "09:00",
      end: "17:00",
    },
    breakDuration: 15, // minutes
    maxTasksPerDay: 12,
    planningHorizon: 7, // days
  },

  // Gamification Configuration
  gamification: {
    xpPerTask: 10,
    xpPerGoal: 100,
    levelThreshold: 1000, // XP needed per level
    streakBonus: 1.5, // multiplier for streak days
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Calendar Integration
  calendar: {
    syncInterval: 300000, // 5 minutes in milliseconds
    lookaheadDays: 7,
    defaultEventDuration: 60, // minutes
  },

  // Notifications
  notifications: {
    reminderOffset: 15, // minutes before task
    dailyPlanningTime: "08:00",
    weeklyReviewTime: "Sunday 18:00",
  },
} as const;

// Screen names for navigation
export const ScreenNames = {
  // Auth/Onboarding
  Welcome: "Welcome",
  Login: "Login",
  Signup: "Signup",
  Onboarding: "Onboarding",

  // Main Tabs
  Home: "Home",
  Tasks: "Tasks",
  Goals: "Goals",
  Buddy: "Buddy",
  Insights: "Insights",
  Fitness: "Fitness",

  // Modals/Overlays
  TaskDetail: "TaskDetail",
  GoalCreation: "GoalCreation",
  Settings: "Settings",
  Profile: "Profile",
  AIChat: "AIChat",
  Calendar: "Calendar",
} as const;

// Storage keys for persistent data
export const StorageKeys = {
  // User data
  userToken: "user_token",
  userProfile: "user_profile",
  userPreferences: "user_preferences",

  // App state
  onboardingComplete: "onboarding_complete",
  lastSync: "last_sync",
  selectedGoals: "selected_goals",

  // Cache
  taskCache: "task_cache",
  scheduleCache: "schedule_cache",
  calendarCache: "calendar_cache",

  // Settings
  notificationSettings: "notification_settings",
  themeSettings: "theme_settings",
  privacySettings: "privacy_settings",
} as const;

// Feature flags for gradual rollout
export const FeatureFlags = {
  // Core features
  aiScheduling: true,
  calendarSync: true,
  gamification: true,

  // Social features
  buddySystem: false, // Phase 3 feature
  socialSharing: false,

  // Advanced features
  healthIntegration: false, // Phase 4 feature
  smartDevices: false,
  analytics: false,

  // Experimental features
  voiceInput: false,
  offlineMode: false,
  darkMode: true,
} as const;

// Error messages
export const ErrorMessages = {
  // Network errors
  networkError:
    "Network connection failed. Please check your internet connection.",
  timeoutError: "Request timed out. Please try again.",
  serverError: "Server error. Please try again later.",

  // Authentication errors
  invalidCredentials: "Invalid email or password.",
  userNotFound: "User not found.",
  emailAlreadyExists: "An account with this email already exists.",

  // AI errors
  aiError: "AI service unavailable. Please try again.",
  aiTimeout: "AI request timed out. Please try again.",
  aiQuotaExceeded: "AI usage limit reached. Please try again later.",

  // Calendar errors
  calendarPermission: "Calendar access permission required.",
  calendarSyncError: "Failed to sync calendar. Please try again.",

  // Generic errors
  unknownError: "An unexpected error occurred. Please try again.",
  validationError: "Please check your input and try again.",
} as const;

// Success messages
export const SuccessMessages = {
  taskCompleted: "Great job! Task completed.",
  goalAchieved: "Congratulations! Goal achieved.",
  profileUpdated: "Profile updated successfully.",
  settingsSaved: "Settings saved successfully.",
  calendarSynced: "Calendar synced successfully.",
  accountCreated: "Account created successfully.",
} as const;

// Animation configurations
export const Animations = {
  // Timing
  quick: 150,
  normal: 300,
  slow: 500,

  // Easing curves
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",

  // Blob-specific animations
  blob: {
    morph: 800, // Blob shape morphing
    float: 2000, // Floating animation
    pulse: 1000, // Pulsing effect
  },

  // UI animations
  slideIn: 250,
  fadeIn: 200,
  scaleIn: 150,
  bounceIn: 400,
} as const;

// Type exports for better TypeScript support
export type ScreenName = keyof typeof ScreenNames;
export type StorageKey = keyof typeof StorageKeys;
export type FeatureFlag = keyof typeof FeatureFlags;
export type ErrorMessage = keyof typeof ErrorMessages;
export type SuccessMessage = keyof typeof SuccessMessages;
