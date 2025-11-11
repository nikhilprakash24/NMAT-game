import { io, Socket } from 'socket.io-client';
import { RoundAnswers } from '@nmat/game-engine';

// Socket.io event types (matching backend)
interface ServerToClientEvents {
  connected: (data: { userId: string; sessionId?: string }) => void;
  error: (data: { code: string; message: string }) => void;

  // Lobby events
  'lobby:player-joined': (data: { player: any; totalPlayers: number; allPlayers: any[] }) => void;
  'lobby:player-left': (data: { playerId: string; totalPlayers: number; allPlayers: any[] }) => void;
  'lobby:player-connected': (data: { playerId: string }) => void;
  'lobby:player-disconnected': (data: { playerId: string }) => void;

  // Game events
  'game:starting': (data: { countdown: number }) => void;
  'game:started': (data: { sessionId: string }) => void;
  'game:round-started': (data: { roundNumber: number; letter: string; duration: number; categories: any[] }) => void;
  'game:round-ended': (data: { roundNumber: number }) => void;
  'game:answers-revealed': (data: { roundNumber: number; allAnswers: Record<string, RoundAnswers> }) => void;
  'game:challenge-created': (data: { challenge: any }) => void;
  'game:vote-cast': (data: { challengeId: string; voterId: string; accept: boolean }) => void;
  'game:verification-complete': (data: { roundNumber: number }) => void;
  'game:round-scores': (data: { roundNumber: number; scores: Record<string, number>; totalScores: Record<string, number> }) => void;
  'game:finished': (data: { finalScores: Record<string, number>; winner: any; stats: any }) => void;
  'game:state-update': (data: { session: any }) => void;
}

interface ClientToServerEvents {
  'lobby:join': (data: { sessionCode: string; username: string; avatar?: string }) => void;
  'lobby:leave': (data: { sessionId: string }) => void;
  'game:start': (data: { sessionId: string }) => void;
  'game:submit-answers': (data: { sessionId: string; roundNumber: number; answers: RoundAnswers }) => void;
  'game:challenge': (data: { sessionId: string; playerId: string; categoryId: string; reason?: string }) => void;
  'game:vote': (data: { sessionId: string; challengeId: string; accept: boolean }) => void;
  'game:host-override': (data: { sessionId: string; playerId: string; categoryId: string; accept: boolean }) => void;
  'game:finalize-verification': (data: { sessionId: string }) => void;
  'game:proceed-next-round': (data: { sessionId: string }) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Socket Service
 * Manages WebSocket connection to backend
 */
class SocketService {
  private socket: TypedSocket | null = null;
  private serverUrl: string = 'http://localhost:3000'; // Will be env variable
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Connect to server
   */
  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket.id);
        return;
      }

      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }) as TypedSocket;

      // Connection events
      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.socket?.id);
      });

      this.socket.on('connected', ({ userId }) => {
        console.log('✅ Server confirmed connection:', userId);
        resolve(userId);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
      });

      // Error handling
      this.socket.on('error', ({ code, message }) => {
        console.error('❌ Server error:', code, message);
        this.emit('error', { code, message });
      });

      // Setup all event listeners
      this.setupEventListeners();
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join a game lobby
   */
  joinLobby(sessionCode: string, username: string, avatar?: string) {
    this.emit('lobby:join', { sessionCode, username, avatar });
  }

  /**
   * Leave lobby
   */
  leaveLobby(sessionId: string) {
    this.emit('lobby:leave', { sessionId });
  }

  /**
   * Start game (host only)
   */
  startGame(sessionId: string) {
    this.emit('game:start', { sessionId });
  }

  /**
   * Submit answers for round
   */
  submitAnswers(sessionId: string, roundNumber: number, answers: RoundAnswers) {
    this.emit('game:submit-answers', { sessionId, roundNumber, answers });
  }

  /**
   * Challenge an answer
   */
  challengeAnswer(sessionId: string, playerId: string, categoryId: string, reason?: string) {
    this.emit('game:challenge', { sessionId, playerId, categoryId, reason });
  }

  /**
   * Vote on a challenge
   */
  voteOnChallenge(sessionId: string, challengeId: string, accept: boolean) {
    this.emit('game:vote', { sessionId, challengeId, accept });
  }

  /**
   * Host override
   */
  hostOverride(sessionId: string, playerId: string, categoryId: string, accept: boolean) {
    this.emit('game:host-override', { sessionId, playerId, categoryId, accept });
  }

  /**
   * Finalize verification
   */
  finalizeVerification(sessionId: string) {
    this.emit('game:finalize-verification', { sessionId });
  }

  /**
   * Proceed to next round
   */
  proceedToNextRound(sessionId: string) {
    this.emit('game:proceed-next-round', { sessionId });
  }

  /**
   * Register event handler
   */
  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    // Also register with socket if connected
    if (this.socket) {
      this.socket.on(event as any, handler as any);
    }
  }

  /**
   * Remove event handler
   */
  off(event: keyof ServerToClientEvents, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event as any, handler as any);
    }
  }

  /**
   * Emit event to server
   */
  private emit<K extends keyof ClientToServerEvents>(
    event: K,
    data: Parameters<ClientToServerEvents[K]>[0]
  ) {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Cannot emit, not connected:', event);
      return;
    }
    this.socket.emit(event as any, data as any);
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // Register all stored handlers
    for (const [event, handlers] of this.eventHandlers.entries()) {
      for (const handler of handlers) {
        this.socket.on(event as any, handler as any);
      }
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const socketService = new SocketService();
