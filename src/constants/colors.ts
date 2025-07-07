/**
 * Blob AI Color System
 * Updated to match screenshot design: FAF8F4 background, E4E4E4 stroke, EB6423 orange, 4CAF50 green
 */

export const Colors = {
  // Primary Brand Colors - Updated Orange Theme
  primary: {
    50: "#FFF7F1", // Lightest orange tint
    100: "#FFEDD8", // Very light orange
    200: "#FED7AA", // Light orange
    300: "#FDBA74", // Medium light orange
    400: "#FB923C", // Medium orange
    500: "#EB6423", // Main brand orange (from screenshot)
    600: "#D45617", // Darker orange
    700: "#B8470F", // Dark orange
    800: "#9A3412", // Very dark orange
    900: "#7C2D12", // Darkest orange
    main: "#EB6423", // Alias for 500 - Main brand color
    light: "#FDBA74", // Alias for 300 - Light variant
    dark: "#D45617", // Alias for 600 - Dark variant
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
    main: "#0EA5E9", // Alias for 500
    light: "#38BDF8", // Alias for 400
    dark: "#0284C7", // Alias for 600
  },

  // Neutral Colors - Updated based on screenshot
  neutral: {
    50: "#FAF8F4", // Background from screenshot
    100: "#F5F2EE", // Very light neutral
    200: "#E4E4E4", // Stroke color from screenshot
    300: "#D1D1D1", // Medium light gray
    400: "#A1A1A1", // Medium gray
    500: "#737373", // Main neutral
    600: "#525252", // Dark gray
    700: "#404040", // Darker gray
    800: "#262626", // Very dark gray
    900: "#171717", // Almost black
    main: "#737373", // Alias for 500
    light: "#A1A1A1", // Alias for 400
    dark: "#525252", // Alias for 600
  },

  // Semantic Colors
  success: {
    light: "#E8F5E8",
    main: "#4CAF50", // Green from screenshot
    dark: "#388E3C",
  },

  warning: {
    light: "#FFF3CD",
    main: "#FFB020",
    dark: "#E09900",
  },

  error: {
    light: "#FFEBEE",
    main: "#F44336",
    dark: "#D32F2F",
  },

  info: {
    light: "#E3F2FD",
    main: "#2196F3",
    dark: "#1976D2",
  },

  // Background Colors - Updated to match screenshot
  background: {
    primary: "#FAF8F4", // Main app background (from screenshot)
    secondary: "#FFFFFF", // Card backgrounds
    tertiary: "#F5F2EE", // Input backgrounds
    accent: "#FFF7F1", // Highlighted sections
    card: "#FFFFFF", // White card backgrounds for contrast
  },

  // Text Colors - High contrast for readability
  text: {
    primary: "#171717", // Main text - very dark for contrast
    secondary: "#404040", // Secondary text - dark gray
    tertiary: "#737373", // Muted text - medium gray
    muted: "#A1A1A1", // Very muted text
    inverse: "#FFFFFF", // Text on dark backgrounds
    onPrimary: "#FFFFFF", // Text on primary color backgrounds
    accent: "#EB6423", // Accent text (brand color)
  },

  // Border Colors - Updated to match screenshot
  border: {
    light: "#F5F2EE", // Very light borders
    medium: "#E4E4E4", // Medium borders (stroke from screenshot)
    dark: "#D1D1D1", // Dark borders
    accent: "#EB6423", // Accent borders
    default: "#E4E4E4", // Default border color (from screenshot)
    subtle: "#F5F2EE", // Subtle borders
  },

  // Special Colors for Gamification
  gamification: {
    xp: "#FFB020", // XP points color
    level: "#8B5CF6", // Level indicators
    streak: "#F44336", // Streak indicators
    achievement: "#4CAF50", // Achievement badges (green from screenshot)
  },

  // Calendar and Schedule Colors
  schedule: {
    work: "#3B82F6", // Work tasks
    personal: "#4CAF50", // Personal tasks (green from screenshot)
    fitness: "#EF4444", // Fitness activities
    learning: "#8B5CF6", // Learning/education
    social: "#F59E0B", // Social activities
    break: "#737373", // Break time
  },

  // Transparency Overlays
  overlay: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.3)",
    dark: "rgba(0, 0, 0, 0.7)",
    accent: "rgba(235, 100, 35, 0.1)", // Updated with new primary color
  },

  // Glass Effect Colors
  glass: {
    background: "rgba(255, 255, 255, 0.25)",
    border: "rgba(255, 255, 255, 0.18)",
    shadow: "rgba(0, 0, 0, 0.1)",
    blur: "rgba(255, 255, 255, 0.15)",
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
    background: Colors.primary.main,
    text: Colors.text.onPrimary,
    border: Colors.primary.dark,
  },
  secondaryButton: {
    background: Colors.background.secondary,
    text: Colors.text.primary,
    border: Colors.border.default,
  },
  dangerButton: {
    background: Colors.error.main,
    text: Colors.text.onPrimary,
    border: Colors.error.dark,
  },
  card: {
    background: Colors.background.card,
    text: Colors.text.primary,
    border: Colors.border.subtle,
  },
  input: {
    background: Colors.background.tertiary,
    text: Colors.text.primary,
    border: Colors.border.default,
    focusBorder: Colors.primary.main,
  },
  glass: {
    background: Colors.glass.background,
    border: Colors.glass.border,
    shadow: Colors.glass.shadow,
  },
} as const;
