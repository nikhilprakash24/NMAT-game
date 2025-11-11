# NMAT Game - Backend Server

Node.js backend server with Socket.io for real-time multiplayer NMAT game.

## Features

- **Express.js** REST API for session management
- **Socket.io** real-time WebSocket communication
- **In-memory session management** (scalable to Redis)
- **Comprehensive logging** with Winston
- **Error handling** middleware
- **Input validation** with Joi
- **Type-safe** Socket.io events

## API Endpoints

### Sessions

- `POST /api/sessions` - Create new game session
- `GET /api/sessions/:id` - Get session details
- `GET /api/sessions/code/:code` - Get session by join code
- `DELETE /api/sessions/:id` - Delete session
- `GET /api/sessions` - List all active sessions

### Health

- `GET /health` - Health check endpoint

## Socket.io Events

### Client → Server

- `lobby:join` - Join game session
- `lobby:leave` - Leave game session
- `game:start` - Start game (host only)
- `game:submit-answers` - Submit answers for round
- `game:challenge` - Challenge another player's answer
- `game:vote` - Vote on a challenge
- `game:host-override` - Host override verification (host only)
- `game:finalize-verification` - Finalize verification phase
- `game:proceed-next-round` - Move to next round

### Server → Client

- `connected` - Connection established
- `error` - Error occurred
- `lobby:player-joined` - Player joined session
- `lobby:player-left` - Player left session
- `lobby:player-connected` - Player reconnected
- `lobby:player-disconnected` - Player disconnected
- `game:starting` - Game starting countdown
- `game:started` - Game started
- `game:round-started` - New round started
- `game:round-ended` - Round ended
- `game:answers-revealed` - All answers revealed
- `game:challenge-created` - Challenge created
- `game:vote-cast` - Vote cast
- `game:verification-complete` - Verification complete
- `game:round-scores` - Round scores calculated
- `game:finished` - Game finished
- `game:state-update` - Game state updated

## Development

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Running

```bash
# Development mode with auto-reload
npm run dev

# Build
npm run build

# Production mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins
- `LOG_LEVEL` - Logging level (info/debug/error)

## Architecture

```
src/
├── server.ts              # Entry point
├── app.ts                 # Express app setup
├── config/                # Configuration
│   └── index.ts
├── controllers/           # HTTP route controllers
│   └── session.controller.ts
├── services/              # Business logic
│   └── SessionManager.ts
├── socket/                # Socket.io handlers
│   ├── types.ts
│   └── gameSocket.ts
├── middleware/            # Express middleware
│   ├── error.middleware.ts
│   └── validation.middleware.ts
└── utils/                 # Utilities
    └── logger.ts
```

## Scaling

Current implementation uses in-memory session storage. For production scaling:

1. **Redis** for session state
2. **Socket.io Redis adapter** for multi-server support
3. **PostgreSQL** for persistent game history
4. **Load balancer** (Nginx/HAProxy) for multiple instances

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console - Development mode

## License

[License TBD]
