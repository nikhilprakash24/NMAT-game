import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { socketService } from '../services/socket.service';
import {
  setConnected,
  setUser,
} from '../store/slices/userSlice';
import {
  joinedLobby,
  playerJoined,
  playerLeft,
  playerConnectionChanged,
  updatePlayers,
} from '../store/slices/lobbySlice';
import {
  gameStarted,
  roundStarted,
  roundEnded,
  answersRevealed,
  roundScores,
  gameFinished,
} from '../store/slices/gameSlice';

/**
 * useSocket Hook
 * Integrates Socket.io events with Redux state
 */
export const useSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Connect to server
    socketService.connect().then((userId) => {
      dispatch(setUser({ userId, username: '' })); // Username set later
      dispatch(setConnected(true));
    }).catch((error) => {
      console.error('Failed to connect:', error);
      dispatch(setConnected(false));
    });

    // Setup event listeners

    // Lobby events
    socketService.on('lobby:player-joined', ({ player, allPlayers }) => {
      dispatch(playerJoined(player));
      dispatch(updatePlayers(allPlayers));
    });

    socketService.on('lobby:player-left', ({ playerId, allPlayers }) => {
      dispatch(playerLeft(playerId));
      dispatch(updatePlayers(allPlayers));
    });

    socketService.on('lobby:player-connected', ({ playerId }) => {
      dispatch(playerConnectionChanged({ userId: playerId, isConnected: true }));
    });

    socketService.on('lobby:player-disconnected', ({ playerId }) => {
      dispatch(playerConnectionChanged({ userId: playerId, isConnected: false }));
    });

    // Game events
    socketService.on('game:started', () => {
      dispatch(gameStarted());
    });

    socketService.on('game:round-started', (data) => {
      dispatch(roundStarted(data));
    });

    socketService.on('game:round-ended', () => {
      dispatch(roundEnded());
    });

    socketService.on('game:answers-revealed', ({ allAnswers }) => {
      dispatch(answersRevealed(allAnswers));
    });

    socketService.on('game:round-scores', ({ scores, totalScores }) => {
      dispatch(roundScores({ scores, totalScores }));
    });

    socketService.on('game:finished', ({ finalScores, winner }) => {
      dispatch(gameFinished({ finalScores, winner }));
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  return {
    socket: socketService,
    isConnected: socketService.isConnected(),
  };
};
