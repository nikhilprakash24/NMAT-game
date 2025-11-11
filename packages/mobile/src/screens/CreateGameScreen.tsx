import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { HandwrittenText, Button, Card, LinedInput } from '../components';
import { colors, spacing } from '../theme';
import { BUILTIN_CATEGORIES, TimerMode } from '@nmat/game-engine';

interface CreateGameScreenProps {
  navigation: any;
}

/**
 * CreateGameScreen
 * Configure game settings and create new session
 */
const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ navigation }) => {
  const [numberOfRounds, setNumberOfRounds] = useState('3');
  const [roundDuration, setRoundDuration] = useState('60');
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.FLEXIBLE);
  const [selectedCategories, setSelectedCategories] = useState(
    BUILTIN_CATEGORIES.slice(0, 4).map(c => c.id)
  );
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numberOfRounds: parseInt(numberOfRounds),
          roundDuration: parseInt(roundDuration),
          timerMode,
          categories: BUILTIN_CATEGORIES.filter(c => selectedCategories.includes(c.id)),
          customRules: [],
          allowLateJoin: false,
          verificationMode: 'none',
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        navigation.navigate('Lobby', {
          sessionCode: data.data.code,
          sessionId: data.data.sessionId,
        });
      }
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Button onPress={() => navigation.goBack()} variant="outline" size="small">
          ← Back
        </Button>
      </View>

      <Card color="yellow" style={styles.titleCard}>
        <HandwrittenText variant="heading" size="xxl" center>
          Create New Game
        </HandwrittenText>
      </Card>

      <Card color="white" style={styles.section}>
        <HandwrittenText variant="heading" size="lg">
          ⚙️ Settings
        </HandwrittenText>
        <LinedInput
          label="Rounds"
          value={numberOfRounds}
          onChangeText={setNumberOfRounds}
          keyboardType="number-pad"
        />
        <LinedInput
          label="Duration (sec)"
          value={roundDuration}
          onChangeText={setRoundDuration}
          keyboardType="number-pad"
        />
      </Card>

      <Card color="blue" style={styles.section}>
        <HandwrittenText variant="heading" size="lg">
          📝 Categories
        </HandwrittenText>
        {BUILTIN_CATEGORIES.map(cat => (
          <View key={cat.id} style={styles.row}>
            <HandwrittenText variant="handwritten">{cat.name}</HandwrittenText>
            <Switch
              value={selectedCategories.includes(cat.id)}
              onValueChange={() => toggleCategory(cat.id)}
            />
          </View>
        ))}
      </Card>

      <Button
        onPress={handleCreateGame}
        loading={loading}
        fullWidth
      >
        Create Game ✨
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  titleCard: { marginBottom: spacing.lg },
  section: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm },
});

export default CreateGameScreen;
