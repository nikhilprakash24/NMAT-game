import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, cardShadow, borderRadius, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  color?: keyof typeof colors.card;
  style?: ViewStyle;
  elevated?: boolean;
}

/**
 * Card Component
 * Looks like a physical index card with subtle texture and shadow
 */
export const Card: React.FC<CardProps> = ({
  children,
  color = 'white',
  style,
  elevated = true,
}) => {
  const cardColor = colors.card[color];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardColor },
        elevated && cardShadow,
        style,
      ]}
    >
      {/* Subtle paper texture overlay */}
      <View style={styles.textureOverlay} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: colors.ink.primary,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
