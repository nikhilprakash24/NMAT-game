import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { HandwrittenText, Card } from './';
import { colors, spacing } from '../theme';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading Component
 * Shows an animated loading state with optional message
 */
export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const content = (
    <Animated.View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Card color="yellow" style={styles.card}>
        <ActivityIndicator size="large" color={colors.ink.primary} />
        <HandwrittenText variant="handwritten" size="md" center style={styles.text}>
          {message}
        </HandwrittenText>
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
    zIndex: 1000,
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
    alignItems: 'center',
  },
  text: {
    marginTop: spacing.md,
  },
});
