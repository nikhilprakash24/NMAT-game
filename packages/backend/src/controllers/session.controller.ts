import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sessionManager } from '../services/SessionManager';
import { BUILTIN_CATEGORIES, DEFAULT_POINT_SYSTEM, TimerMode } from '@nmat/game-engine';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/sessions
 * Create a new game session
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      numberOfRounds = 3,
      roundDuration = 60,
      timerMode = TimerMode.FLEXIBLE,  // Default: flexible timer
      categories = BUILTIN_CATEGORIES.slice(0, 4),
      customRules = [],
      allowLateJoin = false,
      verificationMode = 'none',
    } = req.body;

    const hostId = uuidv4(); // In production, this would come from auth

    const session = sessionManager.createSession(hostId, {
      numberOfRounds,
      roundDuration,
      timerMode,
      categories,
      customRules,
      allowLateJoin,
      verificationMode,
      pointSystem: DEFAULT_POINT_SYSTEM,
    });

    const sessionData = session.getSession();

    res.status(201).json({
      status: 'success',
      data: {
        sessionId: sessionData.id,
        code: sessionData.code,
        hostId: sessionData.hostId,
        config: sessionData.config,
        status: sessionData.status,
        createdAt: sessionData.createdAt,
      },
    });

    logger.info('Session created via API', {
      sessionId: sessionData.id,
      code: sessionData.code,
    });
  } catch (error: any) {
    throw new AppError(error.message || 'Failed to create session', 500);
  }
});

/**
 * GET /api/sessions/:id
 * Get session details
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const session = sessionManager.getSession(id);

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  const sessionData = session.getSession();

  res.json({
    status: 'success',
    data: sessionData,
  });
});

/**
 * GET /api/sessions/code/:code
 * Get session by join code
 */
router.get('/code/:code', async (req: Request, res: Response) => {
  const { code } = req.params;

  const session = sessionManager.getSessionByCode(code);

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  const sessionData = session.getSession();

  res.json({
    status: 'success',
    data: sessionData,
  });
});

/**
 * DELETE /api/sessions/:id
 * Delete a session (host only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const session = sessionManager.getSession(id);

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  // In production, check if requester is the host

  sessionManager.deleteSession(id);

  res.json({
    status: 'success',
    message: 'Session deleted',
  });
});

/**
 * GET /api/sessions
 * List all active sessions (for debugging)
 */
router.get('/', async (_req: Request, res: Response) => {
  const sessions = sessionManager.getAllSessions();

  const sessionList = sessions.map((session) => {
    const data = session.getSession();
    return {
      id: data.id,
      code: data.code,
      status: data.status,
      players: data.players.length,
      createdAt: data.createdAt,
    };
  });

  res.json({
    status: 'success',
    data: {
      total: sessionList.length,
      sessions: sessionList,
    },
  });
});

export default router;
