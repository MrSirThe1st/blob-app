/**
 * Blob AI Spacing System
 * Consistent spacing values based on 8px grid system
 * Follows organic, flowing design principles
 */

// Base spacing unit (8px)
const BASE_UNIT = 8;

export const Spacing = {
  // Micro spacing (for fine adjustments)
  xs: BASE_UNIT * 0.5, // 4px
  sm: BASE_UNIT, // 8px

  // Standard spacing
  md: BASE_UNIT * 2, // 16px - Default spacing
  lg: BASE_UNIT * 3, // 24px
  xl: BASE_UNIT * 4, // 32px

  // Large spacing
  "2xl": BASE_UNIT * 5, // 40px
  "3xl": BASE_UNIT * 6, // 48px
  "4xl": BASE_UNIT * 8, // 64px
  "5xl": BASE_UNIT * 10, // 80px

  // Extra large spacing (for major sections)
  "6xl": BASE_UNIT * 12, // 96px
  "7xl": BASE_UNIT * 16, // 128px
  "8xl": BASE_UNIT * 20, // 160px
} as const;

// Padding presets for common use cases
export const Padding = {
  // Screen padding (outer container padding)
  screen: {
    horizontal: Spacing.md, // 16px
    vertical: Spacing.lg, // 24px
    top: Spacing["2xl"], // 40px (accounting for status bar)
    bottom: Spacing.xl, // 32px (accounting for safe area)
  },

  // Card padding
  card: {
    small: Spacing.sm, // 8px
    medium: Spacing.md, // 16px
    large: Spacing.lg, // 24px
    xl: Spacing.xl, // 32px
  },

  // Button padding
  button: {
    small: {
      horizontal: Spacing.md, // 16px
      vertical: Spacing.sm, // 8px
    },
    medium: {
      horizontal: Spacing.lg, // 24px
      vertical: Spacing.md, // 16px
    },
    large: {
      horizontal: Spacing.xl, // 32px
      vertical: Spacing.lg, // 24px
    },
  },

  // Input field padding
  input: {
    horizontal: Spacing.md, // 16px
    vertical: Spacing.md, // 16px
  },

  // Modal padding
  modal: {
    horizontal: Spacing.lg, // 24px
    vertical: Spacing["2xl"], // 40px
  },

  // List item padding
  listItem: {
    horizontal: Spacing.md, // 16px
    vertical: Spacing.md, // 16px
  },
} as const;

// Margin presets for common use cases
export const Margin = {
  // Component margins
  component: {
    small: Spacing.sm, // 8px
    medium: Spacing.md, // 16px
    large: Spacing.lg, // 24px
    xl: Spacing.xl, // 32px
  },

  // Section margins (between major UI sections)
  section: {
    small: Spacing.lg, // 24px
    medium: Spacing["2xl"], // 40px
    large: Spacing["3xl"], // 48px
  },

  // Element margins (between related elements)
  element: {
    xs: Spacing.xs, // 4px
    small: Spacing.sm, // 8px
    medium: Spacing.md, // 16px
  },
} as const;

// Border radius values for consistent rounded corners
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8, // Default border radius
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999, // For circular elements

  // Blob-specific radius values (more organic)
  blob: {
    small: 12, // Small blob elements
    medium: 20, // Medium blob elements
    large: 32, // Large blob elements
    xl: 48, // Extra large blob elements
  },
} as const;

// Layout dimensions
export const Layout = {
  // Container max widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Component heights
  height: {
    button: {
      small: 32,
      medium: 48,
      large: 56,
    },
    input: 48,
    header: 56,
    tabBar: 64,
    searchBar: 44,
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    "2xl": 128,
  },

  // Minimum touch target size (for accessibility)
  touchTarget: 44,
} as const;

// Gap values for flexbox/grid layouts
export const Gap = {
  xs: Spacing.xs, // 4px
  sm: Spacing.sm, // 8px
  md: Spacing.md, // 16px
  lg: Spacing.lg, // 24px
  xl: Spacing.xl, // 32px
  "2xl": Spacing["2xl"], // 40px
} as const;

// Inset values for positioning
export const Inset = {
  xs: Spacing.xs, // 4px
  sm: Spacing.sm, // 8px
  md: Spacing.md, // 16px
  lg: Spacing.lg, // 24px
  xl: Spacing.xl, // 32px
} as const;

// Shadow/elevation spacing
export const Elevation = {
  // Shadow blur radius
  shadow: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
    "2xl": 24,
  },

  // Shadow offset
  offset: {
    sm: 1,
    md: 2,
    lg: 4,
    xl: 8,
  },
} as const;

// Animation timing values
export const Timing = {
  // Animation durations (in milliseconds)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Animation delays
  delay: {
    none: 0,
    short: 100,
    medium: 200,
    long: 400,
  },
} as const;

// Utility function to get responsive spacing
export const getResponsiveSpacing = (
  mobile: keyof typeof Spacing,
  tablet?: keyof typeof Spacing,
  desktop?: keyof typeof Spacing
) => ({
  mobile: Spacing[mobile],
  tablet: tablet ? Spacing[tablet] : Spacing[mobile],
  desktop: desktop
    ? Spacing[desktop]
    : tablet
      ? Spacing[tablet]
      : Spacing[mobile],
});

// Type exports
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type LayoutKey = keyof typeof Layout;

// Common spacing combinations for quick use
export const CommonSpacing = {
  // Card spacing
  cardPadding: Padding.card.medium,
  cardMargin: Margin.component.medium,
  cardRadius: BorderRadius.md,

  // Button spacing
  buttonPaddingH: Padding.button.medium.horizontal,
  buttonPaddingV: Padding.button.medium.vertical,
  buttonRadius: BorderRadius.lg,
  buttonGap: Gap.sm,

  // Input spacing
  inputPadding: Padding.input.horizontal,
  inputRadius: BorderRadius.md,
  inputMargin: Margin.element.medium,

  // List spacing
  listItemPadding: Padding.listItem.horizontal,
  listItemGap: Gap.sm,
  listSectionGap: Gap.lg,

  // Screen layout
  screenPaddingH: Padding.screen.horizontal,
  screenPaddingV: Padding.screen.vertical,
  sectionGap: Gap.xl,

  // Navigation
  tabBarHeight: Layout.height.tabBar,
  headerHeight: Layout.height.header,

  // Touch targets
  minTouchTarget: Layout.touchTarget,
  iconSize: Layout.icon.md,

  // Blob-specific spacing
  blobRadius: BorderRadius.blob.medium,
  blobPadding: Spacing.lg,
  blobMargin: Spacing.md,
} as const;
