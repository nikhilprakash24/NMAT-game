import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  TypedSocket,
} from './types';
import { sessionManager } from '../services/SessionManager';
import logger from '../utils/logger';
import { GameSessionManager, RoundAnswers } from '@nmat/game-engine';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function setupGameSocket(io: TypedServer) {
  io.on('connection', (socket: TypedSocket) => {
    // Generate userId for this connection
    const userId = uuidv4();
    socket.data.userId = userId;

    logger.info('Client connected', {
      socketId: socket.id,
      userId,
    });

    socket.emit('connected', { userId });

    // Lobby: Join game session
    socket.on('lobby:join', async ({ sessionCode, username, avatar }) => {
      try {
        const session = sessionManager.getSessionByCode(sessionCode);

        if (!session) {
          socket.emit('error', {
            code: 'SESSION_NOT_FOUND',
            message: 'Game session not found',
          });
          return;
        }

        const sessionId = session.getSessionId();

        // Add player to session
        const player = session.addPlayer(userId, username, avatar);
        socket.data.username = username;
        socket.data.sessionId = sessionId;

        // Join socket room
        await socket.join(sessionId);

        // Notify all players in the room
        io.to(sessionId).emit('lobby:player-joined', {
          player,
          totalPlayers: session.getPlayers().length,
          allPlayers: session.getPlayers(),
        });

        logger.info('Player joined session', {
          userId,
          username,
          sessionId,
          code: sessionCode,
        });
      } catch (error: any) {
        logger.error('Error joining session:', error);
        socket.emit('error', {
          code: 'JOIN_FAILED',
          message: error.message || 'Failed to join session',
        });
      }
    });

    // Lobby: Leave game session
    socket.on('lobby:leave', ({ sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        session.removePlayer(userId);
        socket.leave(sessionId);

        io.to(sessionId).emit('lobby:player-left', {
          playerId: userId,
          totalPlayers: session.getPlayers().length,
          allPlayers: session.getPlayers(),
        });

        logger.info('Player left session', { userId, sessionId });
      } catch (error: any) {
        logger.error('Error leaving session:', error);
      }
    });

    // Game: Start game
    socket.on('game:start', ({ sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('error', {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          });
          return;
        }

        // Check if user is host
        if (!session.isHost(userId)) {
          socket.emit('error', {
            code: 'NOT_HOST',
            message: 'Only host can start the game',
          });
          return;
        }

        // Start countdown
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          io.to(sessionId).emit('game:starting', { countdown });
          countdown--;

          if (countdown < 0) {
            clearInterval(countdownInterval);

            // Start game
            session.startGame();
            io.to(sessionId).emit('game:started', { sessionId });

            // Emit round started
            const round = session.getCurrentRound();
            if (round) {
              io.to(sessionId).emit('game:round-started', {
                roundNumber: round.roundNumber,
                letter: round.letter,
                duration: round.duration,
                categories: session.getSession().config.categories,
              });
            }

            logger.info('Game started', { sessionId });
          }
        }, 1000);
      } catch (error: any) {
        logger.error('Error starting game:', error);
        socket.emit('error', {
          code: 'START_FAILED',
          message: error.message || 'Failed to start game',
        });
      }
    });

    // Game: Submit answers
    socket.on('game:submit-answers', ({ sessionId, roundNumber, answers }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        session.submitAnswers(userId, roundNumber, answers);

        logger.info('Answers submitted', {
          userId,
          sessionId,
          roundNumber,
        });

        // Check if round should end (all players submitted)
        const round = session.getCurrentRound();
        if (round && round.status === 'ended') {
          handleRoundEnd(io, session, sessionId);
        }
      } catch (error: any) {
        logger.error('Error submitting answers:', error);
        socket.emit('error', {
          code: 'SUBMIT_FAILED',
          message: error.message || 'Failed to submit answers',
        });
      }
    });

    // Game: Challenge answer
    socket.on('game:challenge', ({ sessionId, playerId, categoryId, reason }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        const challenge = session.createChallenge(
          userId,
          playerId,
          categoryId,
          reason
        );

        io.to(sessionId).emit('game:challenge-created', { challenge });

        logger.info('Challenge created', {
          sessionId,
          challengerId: userId,
          playerId,
          categoryId,
        });
      } catch (error: any) {
        logger.error('Error creating challenge:', error);
        socket.emit('error', {
          code: 'CHALLENGE_FAILED',
          message: error.message || 'Failed to create challenge',
        });
      }
    });

    // Game: Vote on challenge
    socket.on('game:vote', ({ sessionId, challengeId, accept }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        session.castVote(userId, challengeId, accept);

        io.to(sessionId).emit('game:vote-cast', {
          challengeId,
          voterId: userId,
          accept,
        });

        logger.info('Vote cast', { sessionId, challengeId, userId, accept });
      } catch (error: any) {
        logger.error('Error casting vote:', error);
      }
    });

    // Game: Host override
    socket.on('game:host-override', ({ sessionId, playerId, categoryId, accept }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        if (!session.isHost(userId)) {
          socket.emit('error', {
            code: 'NOT_HOST',
            message: 'Only host can override',
          });
          return;
        }

        session.hostOverride(categoryId, playerId, accept);

        io.to(sessionId).emit('game:state-update', {
          session: session.getSession(),
        });

        logger.info('Host override', {
          sessionId,
          hostId: userId,
          playerId,
          categoryId,
          accept,
        });
      } catch (error: any) {
        logger.error('Error with host override:', error);
      }
    });

    // Game: Finalize verification
    socket.on('game:finalize-verification', ({ sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        session.finalizeVerification();

        const round = session.getCurrentRound();
        if (round) {
          // Emit round scores
          const roundScores: Record<string, number> = {};
          const totalScores: Record<string, number> = {};

          round.scores.forEach((score, playerId) => {
            roundScores[playerId] = score;
          });

          session.getPlayers().forEach((player) => {
            totalScores[player.userId] = player.score;
          });

          io.to(sessionId).emit('game:round-scores', {
            roundNumber: round.roundNumber,
            scores: roundScores,
            totalScores,
          });
        }

        logger.info('Verification finalized', { sessionId });
      } catch (error: any) {
        logger.error('Error finalizing verification:', error);
      }
    });

    // Game: Proceed to next round
    socket.on('game:proceed-next-round', ({ sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) return;

        session.proceedToNextRound();

        const sessionData = session.getSession();

        if (sessionData.status === 'finished') {
          // Game finished
          const stats = session.getGameStats();
          const finalScores: Record<string, number> = {};

          session.getPlayers().forEach((player) => {
            finalScores[player.userId] = player.score;
          });

          const winner = session.getPlayer(stats.winnerId);

          io.to(sessionId).emit('game:finished', {
            finalScores,
            winner,
            stats,
          });

          logger.info('Game finished', { sessionId, winner: stats.winnerId });
        } else {
          // Next round started
          const round = session.getCurrentRound();
          if (round) {
            io.to(sessionId).emit('game:round-started', {
              roundNumber: round.roundNumber,
              letter: round.letter,
              duration: round.duration,
              categories: sessionData.config.categories,
            });
          }
        }
      } catch (error: any) {
        logger.error('Error proceeding to next round:', error);
      }
    });

    // Disconnection
    socket.on('disconnect', () => {
      const { sessionId } = socket.data;

      if (sessionId) {
        const session = sessionManager.getSession(sessionId);
        if (session) {
          session.markPlayerDisconnected(userId);

          io.to(sessionId).emit('lobby:player-disconnected', {
            playerId: userId,
          });
        }
      }

      logger.info('Client disconnected', {
        socketId: socket.id,
        userId,
        sessionId,
      });
    });
  });

  logger.info('Socket.io game handlers initialized');
}

/**
 * Handle round end
 */
function handleRoundEnd(
  io: TypedServer,
  session: GameSessionManager,
  sessionId: string
) {
  const round = session.getCurrentRound();
  if (!round) return;

  io.to(sessionId).emit('game:round-ended', {
    roundNumber: round.roundNumber,
  });

  // Reveal answers
  const allAnswers: Record<string, RoundAnswers> = {};
  round.playerAnswers.forEach((answers, playerId) => {
    allAnswers[playerId] = answers;
  });

  io.to(sessionId).emit('game:answers-revealed', {
    roundNumber: round.roundNumber,
    allAnswers,
  });

  // If no verification needed, auto-proceed
  if (session.getSession().config.verificationMode === 'none') {
    session.finalizeVerification();

    const roundScores: Record<string, number> = {};
    const totalScores: Record<string, number> = {};

    round.scores.forEach((score, playerId) => {
      roundScores[playerId] = score;
    });

    session.getPlayers().forEach((player) => {
      totalScores[player.userId] = player.score;
    });

    io.to(sessionId).emit('game:round-scores', {
      roundNumber: round.roundNumber,
      scores: roundScores,
      totalScores,
    });
  }
}
