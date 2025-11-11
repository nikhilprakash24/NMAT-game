import { GameSessionManager, GameConfig, RoundAnswers } from '@nmat/game-engine';
import logger from '../utils/logger';

/**
 * SessionManager
 * Manages all active game sessions in memory
 * In production, this would use Redis for distributed state
 */
export class SessionManager {
  private sessions: Map<string, GameSessionManager> = new Map();
  private sessionsByCode: Map<string, string> = new Map(); // code -> sessionId

  /**
   * Create a new game session
   */
  createSession(hostId: string, config: GameConfig): GameSessionManager {
    const session = new GameSessionManager(hostId, config);
    const sessionId = session.getSessionId();
    const code = session.getJoinCode();

    this.sessions.set(sessionId, session);
    this.sessionsByCode.set(code, sessionId);

    logger.info('Session created', {
      sessionId,
      code,
      hostId,
    });

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): GameSessionManager | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get session by join code
   */
  getSessionByCode(code: string): GameSessionManager | null {
    const sessionId = this.sessionsByCode.get(code);
    if (!sessionId) return null;
    return this.getSession(sessionId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const code = session.getJoinCode();
      this.sessionsByCode.delete(code);
      this.sessions.delete(sessionId);

      logger.info('Session deleted', { sessionId, code });
    }
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): GameSessionManager[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get number of active sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Clean up old/finished sessions
   */
  cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionData = session.getSession();
      const age = now - sessionData.createdAt.getTime();

      // Delete finished sessions older than maxAge
      if (
        sessionData.status === 'finished' &&
        age > maxAgeMs
      ) {
        this.deleteSession(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up old sessions', { count: cleaned });
    }

    return cleaned;
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
