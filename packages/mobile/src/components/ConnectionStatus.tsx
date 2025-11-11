import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { HandwrittenText } from './';
import { colors, spacing } from '../theme';
import { useAppSelector } from '../store';

/**
 * ConnectionStatus Component
 * Shows Socket.io connection status at top of screen
 */
export const ConnectionStatus: React.FC = () => {
  const isConnected = useAppSelector(state => state.user.isConnected);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const prevConnected = useRef(isConnected);

  useEffect(() => {
    // Show banner when connection state changes
    if (prevConnected.current !== isConnected) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(isConnected ? 2000 : 0), // Hide success after 2s, keep error visible
        Animated.timing(slideAnim, {
          toValue: isConnected ? -100 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      prevConnected.current = isConnected;
    }
  }, [isConnected]);

  const backgroundColor = isConnected
    ? colors.accent.green
    : colors.error;

  const icon = isConnected ? '🟢' : '🔴';
  const message = isConnected
    ? 'Connected!'
    : 'Connection lost. Reconnecting...';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <HandwrittenText variant="handwritten" size="sm" color="white" center>
        {icon} {message}
      </HandwrittenText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10, // Extra padding for status bar
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
