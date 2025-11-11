import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { HandwrittenText } from './HandwrittenText';
import { colors, spacing, borderRadius, cardShadow } from '../theme';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

/**
 * Button Component
 * Hand-drawn style button with subtle animations
 */
export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.card.white;
    switch (variant) {
      case 'primary':
        return colors.ink.blue;
      case 'secondary':
        return colors.card.yellow;
      case 'outline':
        return 'transparent';
      default:
        return colors.ink.blue;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.ink.light;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.ink.primary;
      case 'outline':
        return colors.ink.blue;
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      case 'medium':
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
        },
        variant === 'outline' && {
          borderWidth: 2,
          borderColor: colors.ink.blue,
        },
        !disabled && cardShadow,
        fullWidth && { width: '100%' },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <HandwrittenText
          variant="heading"
          size="lg"
          color={getTextColor()}
          center
        >
          {children}
        </HandwrittenText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
