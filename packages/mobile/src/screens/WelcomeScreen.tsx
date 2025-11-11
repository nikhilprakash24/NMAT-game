import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { HandwrittenText, Button, Card } from '../components';
import { colors, spacing } from '../theme';
import { WelcomeScreenNavigationProp } from '../navigation/types';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

/**
 * Welcome Screen
 * Beautiful animated welcome with handwritten title
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Title Card */}
      <Animated.View
        style={[
          styles.titleCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Card color="yellow" elevated>
          <HandwrittenText
            variant="heading"
            size="xxxl"
            color={colors.ink.primary}
            center
            style={styles.title}
          >
            Name
          </HandwrittenText>
          <HandwrittenText
            variant="heading"
            size="xxxl"
            color={colors.ink.primary}
            center
            style={styles.title}
          >
            Place
          </HandwrittenText>
          <HandwrittenText
            variant="heading"
            size="xxxl"
            color={colors.ink.primary}
            center
            style={styles.title}
          >
            Animal
          </HandwrittenText>
          <HandwrittenText
            variant="heading"
            size="xxxl"
            color={colors.ink.primary}
            center
            style={styles.title}
          >
            Thing
          </HandwrittenText>

          <View style={styles.underline} />

          <HandwrittenText
            variant="handwritten"
            size="md"
            color={colors.ink.secondary}
            center
            style={styles.subtitle}
          >
            The classic road trip game, reimagined
          </HandwrittenText>
        </Card>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Button
          onPress={() => navigation.navigate('CreateGame')}
          variant="primary"
          size="large"
          fullWidth
          style={styles.button}
        >
          Create New Game
        </Button>

        <Button
          onPress={() => navigation.navigate('JoinGame')}
          variant="secondary"
          size="large"
          fullWidth
          style={styles.button}
        >
          Join Game
        </Button>
      </Animated.View>

      {/* Decorative elements */}
      <View style={styles.decoration}>
        <HandwrittenText
          variant="handwritten"
          size="sm"
          color={colors.ink.light}
          center
        >
          ✨ Play with friends near or far ✨
        </HandwrittenText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.cream,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  titleCard: {
    marginBottom: spacing.xxl,
  },
  title: {
    marginVertical: spacing.xs,
  },
  underline: {
    width: '80%',
    height: 2,
    backgroundColor: colors.ink.primary,
    alignSelf: 'center',
    marginVertical: spacing.md,
    opacity: 0.3,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
  decoration: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default WelcomeScreen;
