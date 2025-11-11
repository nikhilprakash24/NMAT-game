/**
 * Main theme export
 * Handwritten Card Aesthetic Theme
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, cardShadow, lightShadow } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows: {
    card: cardShadow,
    light: lightShadow,
  },
};

export type Theme = typeof theme;

// Export individual modules for convenience
export { colors, typography, spacing, borderRadius, cardShadow, lightShadow };
