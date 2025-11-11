/**
 * Handwritten Card Aesthetic - Color Palette
 * Warm, nostalgic colors inspired by vintage index cards and notebooks
 */

export const colors = {
  // Primary - Warm vintage paper tones
  primary: {
    cream: '#FFF8E7',        // Main background (aged paper)
    lightCream: '#FFFDF5',   // Lighter variant
    darkCream: '#F5EDDC',    // Darker variant for depth
  },

  // Secondary - Index card colors
  card: {
    yellow: '#FFF9C4',       // Yellow index card
    pink: '#FFE4E1',         // Pink index card
    blue: '#E3F2FD',         // Blue index card
    green: '#E8F5E9',        // Green index card
    white: '#FAFAFA',        // White card
  },

  // Ink - Handwriting colors
  ink: {
    primary: '#2C3E50',      // Main text (dark blue-grey)
    secondary: '#546E7A',    // Secondary text
    light: '#78909C',        // Disabled/light text
    highlight: '#FF6B6B',    // Important highlights (red pen)
    blue: '#4A90E2',         // Blue pen
    green: '#27AE60',        // Green checkmark
  },

  // Accents
  accent: {
    gold: '#FFD700',         // Gold star/winner
    bronze: '#CD7F32',       // Third place
    silver: '#C0C0C0',       // Second place
  },

  // UI States
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Shadows and borders
  shadow: 'rgba(0, 0, 0, 0.1)',
  darkShadow: 'rgba(0, 0, 0, 0.2)',
  border: '#E0E0E0',
  lightBorder: '#F0F0F0',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  lightOverlay: 'rgba(0, 0, 0, 0.3)',
};

export type ColorPalette = typeof colors;
