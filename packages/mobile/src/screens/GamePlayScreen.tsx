import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { HandwrittenText, Card, LinedInput, Button } from '../components';
import { colors, spacing } from '../theme';
import { GamePlayScreenNavigationProp, GamePlayScreenRouteProp } from '../navigation/types';

const { width, height } = Dimensions.get('window');

interface GamePlayScreenProps {
  navigation: GamePlayScreenNavigationProp;
  route: GamePlayScreenRouteProp;
}

/**
 * GamePlay Screen
 * Beautiful handwritten card interface for playing the game
 * Each category appears as a card being written on
 */
const GamePlayScreen: React.FC<GamePlayScreenProps> = ({ navigation, route }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentLetter] = useState('A'); // Will come from Socket.io
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Animation refs for card entrance
  const cardAnims = useRef<Animated.Value[]>([]).current;
  const letterAnim = useRef(new Animated.Value(0)).current;

  // Mock categories (will come from Socket.io)
  const categories = [
    { id: '1', name: 'Name', color: 'yellow' as const },
    { id: '2', name: 'Place', color: 'pink' as const },
    { id: '3', name: 'Animal', color: 'blue' as const },
    { id: '4', name: 'Thing', color: 'green' as const },
  ];

  useEffect(() => {
    // Initialize animations for each card
    categories.forEach((_, index) => {
      if (!cardAnims[index]) {
        cardAnims[index] = new Animated.Value(0);
      }
    });

    // Staggered card entrance animation
    Animated.stagger(
      150,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();

    // Letter bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(letterAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(letterAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    // TODO: Send answers via Socket.io
    console.log('Submitting answers:', answers);
    // Navigate to results or wait for other players
  };

  const getTimerColor = () => {
    if (timeRemaining > 30) return colors.success;
    if (timeRemaining > 10) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Letter Display - Bouncing animation */}
      <Animated.View
        style={[
          styles.letterContainer,
          {
            transform: [
              {
                scale: letterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <Card color="white" elevated>
          <View style={styles.letterContent}>
            <HandwrittenText
              variant="handwritten"
              size="sm"
              color={colors.ink.secondary}
            >
              Today's letter is...
            </HandwrittenText>
            <HandwrittenText
              variant="heading"
              size="xxxl"
              color={colors.ink.highlight}
              center
              style={styles.letter}
            >
              {currentLetter}
            </HandwrittenText>
          </View>
        </Card>
      </Animated.View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <HandwrittenText
          variant="heading"
          size="xl"
          color={getTimerColor()}
          center
        >
          ⏱ {timeRemaining}s
        </HandwrittenText>
      </View>

      {/* Category Cards - Animated entrance */}
      <ScrollView
        style={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => {
          const anim = cardAnims[index] || new Animated.Value(0);

          return (
            <Animated.View
              key={category.id}
              style={[
                styles.cardWrapper,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [width, 0],
                      }),
                    },
                    {
                      rotate: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-5deg', '0deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Card color={category.color} elevated>
                <HandwrittenText
                  variant="heading"
                  size="lg"
                  color={colors.ink.primary}
                  style={styles.categoryTitle}
                >
                  {category.name}
                </HandwrittenText>

                <LinedInput
                  value={answers[category.id] || ''}
                  onChangeText={(text) =>
                    setAnswers({ ...answers, [category.id]: text })
                  }
                  placeholder={`A ${category.name.toLowerCase()}...`}
                  showLine
                  autoCapitalize="words"
                  style={styles.input}
                />
              </Card>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          onPress={handleSubmit}
          variant="primary"
          size="large"
          fullWidth
          disabled={timeRemaining === 0}
        >
          Submit Answers ✓
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.cream,
    padding: spacing.md,
  },
  letterContainer: {
    marginBottom: spacing.md,
  },
  letterContent: {
    alignItems: 'center',
  },
  letter: {
    marginTop: spacing.sm,
  },
  timerContainer: {
    marginBottom: spacing.md,
  },
  cardsContainer: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  categoryTitle: {
    marginBottom: spacing.sm,
  },
  input: {
    fontSize: 20,
  },
  submitContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});

export default GamePlayScreen;
