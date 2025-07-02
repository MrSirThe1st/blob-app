/**
 * Blob AI Color System
 * Based on organic, warm, and energetic blob philosophy
 */

export const Colors = {
  // Primary Brand Colors - Blob Orange Theme
  primary: {
    50: "#FFF7ED", // Lightest orange tint
    100: "#FFEDD5", // Very light orange
    200: "#FED7AA", // Light orange
    300: "#FDBA74", // Medium light orange
    400: "#FB923C", // Medium orange
    500: "#FF6B35", // Main brand orange
    600: "#EA580C", // Darker orange
    700: "#C2410C", // Dark orange
    800: "#9A3412", // Very dark orange
    900: "#7C2D12", // Darkest orange
  },

  // Secondary Colors - Complementary Blues
  secondary: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    200: "#BAE6FD",
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9", // Main secondary blue
    600: "#0284C7",
    700: "#0369A1",
    800: "#075985",
    900: "#0C4A6E",
  },

  // Neutral Colors - Warm grays
  neutral: {
    50: "#FAFAF9", // Almost white
    100: "#F5F5F4", // Very light gray
    200: "#E7E5E4", // Light gray
    300: "#D6D3D1", // Medium light gray
    400: "#A8A29E", // Medium gray
    500: "#78716C", // Main neutral
    600: "#57534E", // Dark gray
    700: "#44403C", // Darker gray
    800: "#292524", // Very dark gray
    900: "#1C1917", // Almost black
  },

  // Semantic Colors
  success: {
    light: "#D1FAE5",
    main: "#10B981",
    dark: "#047857",
  },

  warning: {
    light: "#FEF3C7",
    main: "#F59E0B",
    dark: "#D97706",
  },

  error: {
    light: "#FEE2E2",
    main: "#EF4444",
    dark: "#DC2626",
  },

  info: {
    light: "#DBEAFE",
    main: "#3B82F6",
    dark: "#1D4ED8",
  },

  // Background Colors
  background: {
    primary: "#FFFFFF", // Main app background
    secondary: "#FAFAF9", // Card backgrounds
    tertiary: "#F5F5F4", // Input backgrounds
    accent: "#FFF7ED", // Highlighted sections
  },

  // Text Colors
  text: {
    primary: "#1C1917", // Main text
    secondary: "#44403C", // Secondary text
    tertiary: "#78716C", // Muted text
    inverse: "#FFFFFF", // Text on dark backgrounds
    accent: "#FF6B35", // Accent text (brand color)
  },

  // Border Colors
  border: {
    light: "#E7E5E4", // Light borders
    medium: "#D6D3D1", // Medium borders
    dark: "#A8A29E", // Dark borders
    accent: "#FF6B35", // Accent borders
  },

  // Special Colors for Gamification
  gamification: {
    xp: "#F59E0B", // XP points color
    level: "#8B5CF6", // Level indicators
    streak: "#EF4444", // Streak indicators
    achievement: "#10B981", // Achievement badges
  },

  // Calendar and Schedule Colors
  schedule: {
    work: "#3B82F6", // Work tasks
    personal: "#10B981", // Personal tasks
    fitness: "#EF4444", // Fitness activities
    learning: "#8B5CF6", // Learning/education
    social: "#F59E0B", // Social activities
    break: "#6B7280", // Break time
  },

  // Transparency Overlays
  overlay: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.3)",
    dark: "rgba(0, 0, 0, 0.7)",
    accent: "rgba(255, 107, 53, 0.1)",
  },
} as const;

// Type for color keys
export type ColorKey = keyof typeof Colors;

// Helper function to get color with opacity
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Common color combinations
export const ColorCombinations = {
  primaryButton: {
    background: Colors.primary[500],
    text: Colors.text.inverse,
    border: Colors.primary[600],
  },
  secondaryButton: {
    background: Colors.background.secondary,
    text: Colors.text.primary,
    border: Colors.border.medium,
  },
  dangerButton: {
    background: Colors.error.main,
    text: Colors.text.inverse,
    border: Colors.error.dark,
  },
  card: {
    background: Colors.background.secondary,
    text: Colors.text.primary,
    border: Colors.border.light,
  },
  input: {
    background: Colors.background.tertiary,
    text: Colors.text.primary,
    border: Colors.border.medium,
    focusBorder: Colors.primary[500],
  },
} as const;
