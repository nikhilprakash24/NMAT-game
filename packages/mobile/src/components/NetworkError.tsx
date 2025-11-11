import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { HandwrittenText, Button, Card } from './';
import { colors, spacing } from '../theme';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

/**
 * NetworkError Component
 * Displays network error with retry button
 */
export const NetworkError: React.FC<NetworkErrorProps> = ({
  message = 'Connection failed',
  onRetry,
  fullScreen = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const content = (
    <Animated.View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] },
      ]}
    >
      <Card color="pink" style={styles.card}>
        <HandwrittenText variant="heading" size="xxl" center>
          😕
        </HandwrittenText>
        <HandwrittenText variant="heading" size="lg" center>
          Oops!
        </HandwrittenText>
        <HandwrittenText
          variant="handwritten"
          size="md"
          center
          color={colors.ink.secondary}
          style={styles.message}
        >
          {message}
        </HandwrittenText>
        {onRetry && (
          <Button onPress={onRetry} variant="primary" size="large" fullWidth>
            Try Again 🔄
          </Button>
        )}
      </Card>
    </Animated.View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreenWrapper}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  fullScreenWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  card: {
    padding: spacing.xl,
  },
  message: {
    marginVertical: spacing.md,
  },
});
