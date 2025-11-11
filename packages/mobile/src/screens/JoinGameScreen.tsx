import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HandwrittenText, Button, Card, LinedInput, Loading, NetworkError } from '../components';
import { colors, spacing } from '../theme';
import { socketService } from '../services/socket.service';
import { useAppSelector, useAppDispatch } from '../store';
import { setUser } from '../store/slices/userSlice';
import { joinedLobby } from '../store/slices/lobbySlice';

const JoinGameScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code || !username) {
      setError('Please enter code and name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get session by code first
      const response = await fetch(`http://localhost:3000/api/sessions/code/${code}`);

      if (!response.ok) {
        throw new Error('Game not found');
      }

      const data = await response.json();

      if (data.status === 'success') {
        // Join via socket
        socketService.joinLobby(code, username);

        // Navigate to lobby
        navigation.navigate('Lobby', {
          sessionCode: code,
          sessionId: data.data.id,
        });
      } else {
        setError('Game not found. Please check the code.');
      }
    } catch (err) {
      setError('Failed to join game. Please check your connection and try again.');
      console.error('Join game error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button onPress={() => navigation.goBack()} variant="outline" size="small">
          ← Back
        </Button>
      </View>

      <Card color="pink" style={styles.card}>
        <HandwrittenText variant="heading" size="xxl" center>
          Join Game
        </HandwrittenText>
        <HandwrittenText variant="handwritten" size="md" color={colors.ink.secondary} center>
          Enter the 6-digit code
        </HandwrittenText>
      </Card>

      <Card color="white">
        <LinedInput
          label="Game Code"
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          placeholder="ABC123"
          autoCapitalize="characters"
          maxLength={6}
        />
        <LinedInput
          label="Your Name"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your name"
        />
        {error ? (
          <HandwrittenText variant="handwritten" size="sm" color={colors.error}>
            {error}
          </HandwrittenText>
        ) : null}
      </Card>

      <View style={styles.footer}>
        <Button onPress={handleJoin} loading={loading} fullWidth size="large">
          Join Game 🎮
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  card: { marginBottom: spacing.lg },
  footer: { marginTop: spacing.xl },
});

export default JoinGameScreen;
