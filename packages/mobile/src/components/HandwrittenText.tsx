import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../theme';

interface HandwrittenTextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'body' | 'handwritten';
  size?: keyof typeof typography.sizes;
  color?: string;
  style?: TextStyle;
  bold?: boolean;
  center?: boolean;
}

/**
 * HandwrittenText Component
 * Text that looks handwritten with appropriate fonts
 */
export const HandwrittenText: React.FC<HandwrittenTextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  color = colors.ink.primary,
  style,
  bold = false,
  center = false,
}) => {
  const getFontFamily = () => {
    switch (variant) {
      case 'heading':
        return typography.fonts.heading;
      case 'handwritten':
        return bold ? typography.fonts.handwrittenBold : typography.fonts.handwritten;
      case 'body':
      default:
        return typography.fonts.body;
    }
  };

  return (
    <Text
      style={[
        styles.text,
        {
          fontFamily: getFontFamily(),
          fontSize: typography.sizes[size],
          color,
          textAlign: center ? 'center' : 'left',
        },
        bold && variant === 'body' && { fontWeight: '600' },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    lineHeight: typography.lineHeights.normal * 20, // Base lineheight
  },
});
