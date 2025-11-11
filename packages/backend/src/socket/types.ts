import { Socket } from 'socket.io';
import { RoundAnswers, Challenge } from '@nmat/game-engine';

/**
 * Socket.io Event Types
 */

// Client -> Server Events
export interface ClientToServerEvents {
  // Lobby events
  'lobby:join': (data: { sessionCode: string; username: string; avatar?: string }) => void;
  'lobby:leave': (data: { sessionId: string }) => void;

  // Game events
  'game:start': (data: { sessionId: string }) => void;
  'game:submit-answers': (data: {
    sessionId: string;
    roundNumber: number;
    answers: RoundAnswers;
  }) => void;

  // Verification events
  'game:challenge': (data: {
    sessionId: string;
    playerId: string;
    categoryId: string;
    reason?: string;
  }) => void;
  'game:vote': (data: {
    sessionId: string;
    challengeId: string;
    accept: boolean;
  }) => void;
  'game:host-override': (data: {
    sessionId: string;
    playerId: string;
    categoryId: string;
    accept: boolean;
  }) => void;
  'game:finalize-verification': (data: { sessionId: string }) => void;
  'game:proceed-next-round': (data: { sessionId: string }) => void;

  // Config events
  'game:update-config': (data: { sessionId: string; config: any }) => void;
}

// Server -> Client Events
export interface ServerToClientEvents {
  // Connection events
  'connected': (data: { userId: string; sessionId?: string }) => void;
  'error': (data: { code: string; message: string }) => void;

  // Lobby events
  'lobby:player-joined': (data: {
    player: any;
    totalPlayers: number;
    allPlayers: any[];
  }) => void;
  'lobby:player-left': (data: {
    playerId: string;
    totalPlayers: number;
    allPlayers: any[];
  }) => void;
  'lobby:player-connected': (data: { playerId: string }) => void;
  'lobby:player-disconnected': (data: { playerId: string }) => void;

  // Game events
  'game:starting': (data: { countdown: number }) => void;
  'game:started': (data: { sessionId: string }) => void;
  'game:round-started': (data: {
    roundNumber: number;
    letter: string;
    duration: number;
    categories: any[];
  }) => void;
  'game:round-ended': (data: { roundNumber: number }) => void;
  'game:answers-revealed': (data: {
    roundNumber: number;
    allAnswers: Record<string, RoundAnswers>;
  }) => void;

  // Verification events
  'game:challenge-created': (data: { challenge: Challenge }) => void;
  'game:vote-cast': (data: {
    challengeId: string;
    voterId: string;
    accept: boolean;
  }) => void;
  'game:verification-complete': (data: { roundNumber: number }) => void;

  // Scoring events
  'game:round-scores': (data: {
    roundNumber: number;
    scores: Record<string, number>;
    totalScores: Record<string, number>;
  }) => void;

  // Game finished
  'game:finished': (data: {
    finalScores: Record<string, number>;
    winner: any;
    stats: any;
  }) => void;

  // State sync
  'game:state-update': (data: { session: any }) => void;
}

// Inter-server events (for scaling)
export interface InterServerEvents {
  ping: () => void;
}

// Socket data
export interface SocketData {
  userId: string;
  username: string;
  sessionId?: string;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
