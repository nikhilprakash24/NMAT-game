/**
 * Typography - Handwritten aesthetic
 * Mix of handwritten and clean fonts for readability
 */

export const typography = {
  // Handwritten fonts (will be loaded via expo-font)
  fonts: {
    handwritten: 'Caveat',           // Main handwriting font
    handwrittenBold: 'Caveat-Bold',  // Bold handwriting
    heading: 'PatrickHand',          // Headers/titles
    body: 'System',                  // Clean readable font for long text
    mono: 'Courier',                 // Code/numbers
  },

  // Font sizes (responsive)
  sizes: {
    xxxl: 48,    // Giant titles
    xxl: 36,     // Big titles
    xl: 28,      // Section headers
    lg: 24,      // Card headers
    md: 18,      // Body text
    sm: 14,      // Small text
    xs: 12,      // Tiny text
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },

  // Letter spacing (for handwritten feel)
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export type Typography = typeof typography;
