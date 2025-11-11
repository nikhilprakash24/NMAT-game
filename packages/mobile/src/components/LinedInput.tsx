import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { HandwrittenText } from './HandwrittenText';
import { colors, spacing, typography, borderRadius } from '../theme';

interface LinedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  showLine?: boolean; // Show underline like ruled paper
}

/**
 * LinedInput Component
 * Input that looks like writing on lined paper
 */
export const LinedInput: React.FC<LinedInputProps> = ({
  label,
  error,
  showLine = true,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <HandwrittenText
          variant="handwritten"
          size="sm"
          color={colors.ink.secondary}
          style={styles.label}
        >
          {label}
        </HandwrittenText>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            showLine && styles.lined,
            error && styles.errorInput,
            style,
          ]}
          placeholderTextColor={colors.ink.light}
          {...props}
        />
      </View>

      {error && (
        <HandwrittenText
          variant="handwritten"
          size="sm"
          color={colors.error}
          style={styles.error}
        >
          {error}
        </HandwrittenText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    fontFamily: typography.fonts.handwritten,
    fontSize: typography.sizes.lg,
    color: colors.ink.primary,
    padding: spacing.md,
    backgroundColor: colors.primary.cream,
    borderRadius: borderRadius.md,
    minHeight: 50,
  },
  lined: {
    borderBottomWidth: 2,
    borderBottomColor: colors.ink.light,
    borderStyle: 'solid',
  },
  errorInput: {
    borderBottomColor: colors.error,
  },
  error: {
    marginTop: spacing.xs,
  },
});
