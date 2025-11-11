/**
 * Spacing system
 * Consistent spacing throughout the app
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999, // Fully rounded
};

export const cardShadow = {
  // Elevated card shadow (like a raised index card)
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5, // Android
};

export const lightShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
