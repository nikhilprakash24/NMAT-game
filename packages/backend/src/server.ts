import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import config from './config';
import logger from './utils/logger';
import { setupGameSocket } from './socket/gameSocket';
import { sessionManager } from './services/SessionManager';

// Create Express app
const app = createApp();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    credentials: true,
  },
});

// Setup Socket.io handlers
setupGameSocket(io);

// Cleanup old sessions periodically (every hour)
setInterval(() => {
  sessionManager.cleanupOldSessions();
}, 60 * 60 * 1000);

// Start server
server.listen(config.port, () => {
  logger.info(`Server started`, {
    port: config.port,
    env: config.nodeEnv,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', { promise, reason });
  process.exit(1);
});

export { server, io };
