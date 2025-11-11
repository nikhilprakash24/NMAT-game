import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react';
import { HandwrittenText, Button, Card } from '../components';
import { colors, spacing } from '../theme';
import { useAppSelector } from '../store';
import { socketService } from '../services/socket.service';

const LobbyScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { sessionCode, sessionId } = route.params;
  const players = useAppSelector(state => state.lobby.players);
  const userId = useAppSelector(state => state.user.userId);
  const isHost = players.find(p => p.userId === userId)?.isHost || false;

  const handleStart = () => {
    socketService.startGame(sessionId);
  };

  useEffect(() => {
    // Listen for game start
    const handleGameStarted = () => {
      navigation.navigate('GamePlay', { sessionId });
    };

    socketService.on('game:started', handleGameStarted);

    return () => {
      socketService.off('game:started', handleGameStarted);
    };
  }, [sessionId, navigation]);

  return (
    <View style={styles.container}>
      <Card color="yellow" style={styles.header}>
        <HandwrittenText variant="heading" size="xxl" center>
          Game Lobby
        </HandwrittenText>
        <HandwrittenText variant="heading" size="xl" center color={colors.ink.highlight}>
          Code: {sessionCode}
        </HandwrittenText>
        <HandwrittenText variant="handwritten" size="md" center color={colors.ink.secondary}>
          Share this code with friends!
        </HandwrittenText>
      </Card>

      <Card color="white" style={styles.players}>
        <HandwrittenText variant="heading" size="lg">
          👥 Players ({players.length})
        </HandwrittenText>
        <FlatList
          data={players}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <View style={styles.player}>
              <HandwrittenText variant="handwritten" size="md">
                {item.isHost ? '👑 ' : ''}{item.username}
              </HandwrittenText>
              <HandwrittenText variant="handwritten" size="sm" color={colors.ink.secondary}>
                {item.isConnected ? '🟢 Online' : '🔴 Offline'}
              </HandwrittenText>
            </View>
          )}
        />
      </Card>

      {isHost && (
        <Button onPress={handleStart} variant="primary" size="large" fullWidth>
          Start Game 🚀
        </Button>
      )}

      {!isHost && (
        <Card color="green">
          <HandwrittenText variant="handwritten" size="md" center>
            Waiting for host to start...
          </HandwrittenText>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream, padding: spacing.lg },
  header: { marginBottom: spacing.lg },
  players: { flex: 1, marginBottom: spacing.lg },
  player: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm },
});

export default LobbyScreen;
