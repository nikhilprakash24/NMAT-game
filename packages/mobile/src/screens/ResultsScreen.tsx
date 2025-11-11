import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, FlatList } from 'react-native';
import { HandwrittenText, Button, Card } from '../components';
import { colors, spacing } from '../theme';
import { useAppSelector } from '../store';

const ResultsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation }) => {
  const totalScores = useAppSelector(state => state.game.totalScores);
  const winner = useAppSelector(state => state.game.winner);
  const players = useAppSelector(state => state.lobby.players);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const sortedPlayers = players
    .map(p => ({ ...p, score: totalScores[p.userId] || 0 }))
    .sort((a, b) => b.score - a.score);

  const getMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return String(index + 1) + '.';
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.winner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Card color="yellow">
          <HandwrittenText variant="heading" size="xxxl" center>
            🎉
          </HandwrittenText>
          <HandwrittenText variant="heading" size="xxl" center>
            {winner?.username || sortedPlayers[0]?.username}
          </HandwrittenText>
          <HandwrittenText variant="heading" size="xl" center color={colors.ink.secondary}>
            Wins!
          </HandwrittenText>
          <HandwrittenText variant="heading" size="lg" center color={colors.accent.gold}>
            {sortedPlayers[0]?.score} points
          </HandwrittenText>
        </Card>
      </Animated.View>

      <Card color="white" style={styles.scores}>
        <HandwrittenText variant="heading" size="lg">
          📊 Final Scores
        </HandwrittenText>
        <FlatList
          data={sortedPlayers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => (
            <View style={styles.scoreRow}>
              <HandwrittenText variant="heading" size="lg">
                {getMedal(index)}
              </HandwrittenText>
              <HandwrittenText variant="handwritten" size="md" style={styles.name}>
                {item.username}
              </HandwrittenText>
              <HandwrittenText variant="heading" size="lg" color={colors.ink.highlight}>
                {item.score}
              </HandwrittenText>
            </View>
          )}
        />
      </Card>

      <Button onPress={() => navigation.navigate('Welcome')} variant="primary" fullWidth size="large">
        Play Again 🔄
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream, padding: spacing.lg },
  winner: { marginBottom: spacing.lg },
  scores: { flex: 1, marginBottom: spacing.lg },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  name: { flex: 1, marginHorizontal: spacing.md },
});

export default ResultsScreen;
