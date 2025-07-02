/**
 * Blob AI Typography System
 * Friendly, modern, and readable typography hierarchy
 */

export const FontFamily = {
  // Primary font family (system fonts for best performance)
  primary: {
    regular: "System",
    medium: "System",
    semiBold: "System",
    bold: "System",
  },

  // Alternative font families (if custom fonts are added later)
  secondary: {
    regular: "System",
    medium: "System",
    bold: "System",
  },

  // Monospace for code or technical content
  mono: {
    regular: "Courier",
    bold: "Courier-Bold",
  },
} as const;

export const FontSize = {
  // Display sizes (for hero sections, large headings)
  display: {
    large: 48, // Hero text
    medium: 40, // Large display text
    small: 32, // Medium display text
  },

  // Heading sizes
  heading: {
    h1: 28, // Main page titles
    h2: 24, // Section titles
    h3: 20, // Subsection titles
    h4: 18, // Card titles
    h5: 16, // Small headings
    h6: 14, // Smallest headings
  },

  // Body text sizes
  body: {
    large: 18, // Large body text
    medium: 16, // Default body text
    small: 14, // Small body text
    xs: 12, // Extra small text
  },

  // Caption and label sizes
  caption: {
    large: 14, // Large captions
    medium: 12, // Default captions
    small: 10, // Small captions
  },

  // Button text sizes
  button: {
    large: 18, // Large buttons
    medium: 16, // Default buttons
    small: 14, // Small buttons
  },
} as const;

export const FontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  extraBold: "800",
} as const;

export const LineHeight = {
  // Tight line heights for headings
  tight: 1.1,

  // Normal line heights for body text
  normal: 1.4,

  // Relaxed line heights for long-form content
  relaxed: 1.6,

  // Loose line heights for better readability
  loose: 1.8,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

// Typography variants for consistent styling
export const Typography = {
  // Display styles
  displayLarge: {
    fontSize: FontSize.display.large,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },

  displayMedium: {
    fontSize: FontSize.display.medium,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },

  displaySmall: {
    fontSize: FontSize.display.small,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight.tight,
    letterSpacing: LetterSpacing.normal,
  },

  // Heading styles
  h1: {
    fontSize: FontSize.heading.h1,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight.tight,
    letterSpacing: LetterSpacing.normal,
  },

  h2: {
    fontSize: FontSize.heading.h2,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.tight,
    letterSpacing: LetterSpacing.normal,
  },

  h3: {
    fontSize: FontSize.heading.h3,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  h4: {
    fontSize: FontSize.heading.h4,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  h5: {
    fontSize: FontSize.heading.h5,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  h6: {
    fontSize: FontSize.heading.h6,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },

  // Body styles
  bodyLarge: {
    fontSize: FontSize.body.large,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.relaxed,
    letterSpacing: LetterSpacing.normal,
  },

  bodyMedium: {
    fontSize: FontSize.body.medium,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  bodySmall: {
    fontSize: FontSize.body.small,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  bodyXS: {
    fontSize: FontSize.body.xs,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },

  // Caption styles
  captionLarge: {
    fontSize: FontSize.caption.large,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },

  captionMedium: {
    fontSize: FontSize.caption.medium,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },

  captionSmall: {
    fontSize: FontSize.caption.small,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wider,
  },

  // Button styles
  buttonLarge: {
    fontSize: FontSize.button.large,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },

  buttonMedium: {
    fontSize: FontSize.button.medium,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },

  buttonSmall: {
    fontSize: FontSize.button.small,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wider,
  },

  // Special styles
  overline: {
    fontSize: FontSize.caption.small,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: "uppercase" as const,
  },

  // AI conversation styles
  aiMessage: {
    fontSize: FontSize.body.medium,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.relaxed,
    letterSpacing: LetterSpacing.normal,
  },

  userMessage: {
    fontSize: FontSize.body.medium,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  // Task and schedule text
  taskTitle: {
    fontSize: FontSize.body.medium,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  taskDescription: {
    fontSize: FontSize.body.small,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  timeLabel: {
    fontSize: FontSize.caption.medium,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
  },
} as const;

// Type exports for TypeScript
export type FontFamilyKey = keyof typeof FontFamily;
export type FontSizeKey = keyof typeof FontSize;
export type FontWeightKey = keyof typeof FontWeight;
export type TypographyVariant = keyof typeof Typography;
