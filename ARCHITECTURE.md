# NMAT Game - Technical Architecture

**Version**: 1.0
**Last Updated**: 2025-11-10
**Status**: Design Phase

---

## 📐 System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Clients                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Player 1   │  │   Player 2   │  │   Player N   │      │
│  │ React Native │  │ React Native │  │ React Native │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │         WebSocket (Socket.io)       │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                     API Gateway / Load Balancer              │
│                         (Nginx/HAProxy)                       │
└─────────┬────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────┐
│                   Backend Server(s)                        │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Node.js + Express + Socket.io            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │   │
│  │  │   HTTP   │  │ WebSocket│  │  Game Logic  │     │   │
│  │  │   API    │  │ Handlers │  │    Engine    │     │   │
│  │  └──────────┘  └──────────┘  └──────────────┘     │   │
│  └───────┬────────────────┬──────────────────────────┘   │
└──────────┼────────────────┼──────────────────────────────┘
           │                │
    ┌──────▼──────┐  ┌─────▼──────┐
    │  PostgreSQL │  │   Redis    │
    │ (Persistent │  │ (Sessions, │
    │    Data)    │  │   Cache)   │
    └─────────────┘  └────────────┘
```

---

## 🏛️ Architecture Patterns

### 1. Monorepo Structure
- **Shared Code**: Types, interfaces, game logic
- **Independent Packages**: Backend, mobile, game-engine
- **Benefits**: Code reuse, type safety, easier refactoring

### 2. Clean Architecture (Backend)
```
Presentation Layer (Controllers/Routes)
         ↓
Business Logic Layer (Services)
         ↓
Data Access Layer (Repositories)
         ↓
Data Layer (Database/Redis)
```

### 3. Component-Based Architecture (Frontend)
```
Screens (Pages)
    ↓
Feature Components
    ↓
Presentational Components
    ↓
Atomic Components
```

---

## 📦 Package Structure

### Package: `game-engine`
**Purpose**: Pure game logic, framework-agnostic
**Technologies**: TypeScript
**Exports**: Game state, rules, scoring, validation

```typescript
// Core exports
export class GameState { ... }
export class RulesEngine { ... }
export class ScoringSystem { ... }
export class CategoryManager { ... }
export class VerificationSystem { ... }
```

### Package: `backend`
**Purpose**: Server-side API and WebSocket handling
**Technologies**: Node.js, Express, Socket.io, TypeScript

```typescript
// Main server structure
src/
├── server.ts              // Entry point
├── config/                // Configuration
├── controllers/           // HTTP controllers
│   ├── game.controller.ts
│   ├── lobby.controller.ts
│   └── user.controller.ts
├── services/              // Business logic
│   ├── game.service.ts
│   ├── lobby.service.ts
│   └── verification.service.ts
├── socket/                // Socket.io handlers
│   ├── game.socket.ts
│   ├── lobby.socket.ts
│   └── middleware.ts
├── models/                // Database models
│   ├── User.model.ts
│   ├── GameSession.model.ts
│   └── GameHistory.model.ts
├── repositories/          // Data access
│   ├── user.repository.ts
│   └── game.repository.ts
└── middleware/            // Express middleware
    ├── auth.middleware.ts
    ├── error.middleware.ts
    └── validation.middleware.ts
```

### Package: `mobile`
**Purpose**: React Native mobile application
**Technologies**: React Native, TypeScript, Socket.io-client

```typescript
src/
├── App.tsx                // Root component
├── navigation/            // Navigation setup
│   ├── RootNavigator.tsx
│   └── GameNavigator.tsx
├── screens/               // Screen components
│   ├── HomeScreen.tsx
│   ├── LobbyScreen.tsx
│   ├── GamePlayScreen.tsx
│   ├── ResultsScreen.tsx
│   └── SettingsScreen.tsx
├── components/            // Reusable components
│   ├── common/            // Atomic components
│   ├── game/              // Game-specific
│   └── lobby/             // Lobby-specific
├── store/                 // State management
│   ├── slices/
│   │   ├── gameSlice.ts
│   │   ├── lobbySlice.ts
│   │   └── userSlice.ts
│   └── store.ts
├── services/              // External services
│   ├── api.service.ts
│   ├── socket.service.ts
│   └── storage.service.ts
├── hooks/                 // Custom React hooks
│   ├── useGame.ts
│   ├── useSocket.ts
│   └── useNetworkStatus.ts
├── theme/                 // Styling
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── utils/                 // Utilities
    ├── validators.ts
    └── helpers.ts
```

---

## 🗄️ Data Models

### Core Domain Models

#### User
```typescript
interface User {
  id: string;              // UUID
  username: string;        // Display name
  avatar?: string;         // Avatar URL or emoji
  createdAt: Date;
  stats: UserStats;
}

interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  averageScore: number;
}
```

#### Game Session
```typescript
interface GameSession {
  id: string;                    // Session ID
  code: string;                  // 6-digit join code
  hostId: string;                // Host user ID
  players: Player[];             // Connected players
  config: GameConfig;            // Game configuration
  state: GameState;              // Current game state
  rounds: Round[];               // All rounds
  currentRound: number;          // Current round index
  status: SessionStatus;         // 'waiting' | 'playing' | 'finished'
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

enum SessionStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  REVIEWING = 'reviewing',
  FINISHED = 'finished'
}
```

#### Player
```typescript
interface Player {
  userId: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isConnected: boolean;
  score: number;              // Total score
  roundScores: number[];      // Score per round
  answers: Map<number, RoundAnswers>;  // Round -> Answers
  joinedAt: Date;
  lastSeenAt: Date;
}
```

#### Game Configuration
```typescript
interface GameConfig {
  numberOfRounds: number;           // 1-20
  roundDuration: number;            // seconds (60-300)
  categories: Category[];           // Selected categories
  customRules: CustomRule[];        // Custom rules
  allowLateJoin: boolean;           // Can join mid-game
  verificationMode: VerificationMode;
  pointSystem: PointSystem;
}

enum VerificationMode {
  NONE = 'none',                    // Auto-accept all
  VOTE = 'vote',                    // Player voting
  HOST_ONLY = 'host_only'           // Only host decides
}

interface PointSystem {
  uniqueAnswer: number;             // Default: 10
  duplicateAnswer: number;          // Default: 5
  noAnswer: number;                 // Default: 0
  allCategoriesBonus: number;       // Default: 10
  speedBonus?: number;              // Optional: first submit bonus
}
```

#### Category
```typescript
interface Category {
  id: string;
  name: string;                     // e.g., "Country", "Food"
  description?: string;
  examples?: string[];              // Example valid answers
  validationRules?: ValidationRule[];
  isCustom: boolean;                // User-created vs built-in
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'regex' | 'dictionary' | 'custom';
  value: any;
  errorMessage: string;
}
```

#### Round
```typescript
interface Round {
  roundNumber: number;
  letter: string;                   // The chosen letter
  startTime: Date;
  endTime?: Date;
  duration: number;                 // seconds
  playerAnswers: Map<string, RoundAnswers>;  // UserId -> Answers
  verificationStatus: Map<string, Map<string, AnswerVerification>>;
  scores: Map<string, number>;      // UserId -> Score for this round
  status: RoundStatus;
}

enum RoundStatus {
  STARTING = 'starting',            // Countdown
  IN_PROGRESS = 'in_progress',      // Players answering
  ENDED = 'ended',                  // Time up
  VERIFYING = 'verifying',          // Verification phase
  COMPLETED = 'completed'           // Scores finalized
}

interface RoundAnswers {
  [categoryId: string]: string;     // CategoryId -> Answer
}

interface AnswerVerification {
  categoryId: string;
  answer: string;
  status: 'pending' | 'accepted' | 'rejected';
  challenges: Challenge[];
  votes: Vote[];
  finalDecision?: {
    decidedBy: 'vote' | 'host' | 'auto';
    decidedAt: Date;
    accepted: boolean;
  };
}
```

#### Challenge & Verification
```typescript
interface Challenge {
  id: string;
  challengerId: string;             // Who challenged
  playerId: string;                 // Whose answer
  categoryId: string;
  answer: string;
  reason?: string;
  createdAt: Date;
}

interface Vote {
  voterId: string;
  accept: boolean;                  // true = accept, false = reject
  timestamp: Date;
}
```

#### Custom Rule
```typescript
interface CustomRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  config: any;                      // Rule-specific config
  isActive: boolean;
}

enum RuleType {
  DOUBLE_POINTS = 'double_points',       // 2x points for round
  SPEED_BONUS = 'speed_bonus',           // First to submit bonus
  RARE_LETTER = 'rare_letter',           // Bonus for Q,X,Z
  STEAL_POINTS = 'steal_points',         // Challenge success steals
  THEMED_ROUND = 'themed_round',         // All answers must relate
  WILDCARD = 'wildcard'                  // Skip one category
}
```

---

## 🔌 API Design

### REST Endpoints

#### Authentication & Users
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/users/:id               - Get user profile
PUT    /api/users/:id               - Update user profile
GET    /api/users/:id/stats         - Get user statistics
```

#### Game Sessions
```
POST   /api/sessions                - Create new game session
GET    /api/sessions/:id            - Get session details
PUT    /api/sessions/:id/config     - Update session config (host only)
DELETE /api/sessions/:id            - Delete session (host only)
POST   /api/sessions/join           - Join session by code
```

#### Categories
```
GET    /api/categories              - List all categories
POST   /api/categories              - Create custom category
PUT    /api/categories/:id          - Update custom category
DELETE /api/categories/:id          - Delete custom category
```

#### Game History
```
GET    /api/history                 - Get user's game history
GET    /api/history/:sessionId      - Get specific game details
```

### WebSocket Events

#### Client → Server Events

##### Lobby Events
```typescript
// Join lobby
socket.emit('lobby:join', {
  sessionCode: string,
  user: { userId: string, username: string }
});

// Leave lobby
socket.emit('lobby:leave', { sessionId: string });

// Start game (host only)
socket.emit('game:start', { sessionId: string });
```

##### Game Events
```typescript
// Submit answers
socket.emit('game:submit-answers', {
  sessionId: string,
  roundNumber: number,
  answers: RoundAnswers
});

// Challenge answer
socket.emit('game:challenge', {
  sessionId: string,
  roundNumber: number,
  playerId: string,
  categoryId: string,
  reason?: string
});

// Vote on challenge
socket.emit('game:vote', {
  sessionId: string,
  challengeId: string,
  accept: boolean
});

// Host override
socket.emit('game:host-override', {
  sessionId: string,
  playerId: string,
  categoryId: string,
  accept: boolean
});
```

#### Server → Client Events

##### Lobby Events
```typescript
// Player joined
socket.on('lobby:player-joined', {
  player: Player,
  totalPlayers: number
});

// Player left
socket.on('lobby:player-left', {
  playerId: string,
  totalPlayers: number
});

// Game starting
socket.on('game:starting', {
  countdown: number  // seconds until start
});
```

##### Game Events
```typescript
// Round started
socket.on('game:round-started', {
  roundNumber: number,
  letter: string,
  duration: number,
  categories: Category[]
});

// Round ended
socket.on('game:round-ended', {
  roundNumber: number
});

// Answers revealed
socket.on('game:answers-revealed', {
  roundNumber: number,
  allAnswers: Map<string, RoundAnswers>
});

// Challenge created
socket.on('game:challenge-created', {
  challenge: Challenge
});

// Verification complete
socket.on('game:verification-complete', {
  roundNumber: number,
  scores: Map<string, number>
});

// Round scores
socket.on('game:round-scores', {
  roundNumber: number,
  scores: Map<string, number>,
  totalScores: Map<string, number>
});

// Game finished
socket.on('game:finished', {
  finalScores: Map<string, number>,
  winner: Player,
  stats: GameStats
});
```

##### Connection Events
```typescript
// Player connected/disconnected
socket.on('player:connection-changed', {
  playerId: string,
  isConnected: boolean
});

// Error
socket.on('error', {
  code: string,
  message: string
});
```

---

## 🔐 Security & Authentication

### Authentication Strategy
- **JWT Tokens**: Stateless authentication
- **Token Storage**: Secure storage (iOS Keychain, Android Keystore)
- **Token Refresh**: Automatic refresh before expiry
- **Guest Mode**: Anonymous play with temporary IDs

### WebSocket Security
- **Connection Auth**: JWT validation on connect
- **Room Authorization**: Verify user is in session
- **Rate Limiting**: Prevent spam/abuse
- **Input Validation**: Sanitize all user inputs

### Data Security
- **Password Hashing**: bcrypt with salt
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CORS**: Restricted origins

---

## 🎮 Game Flow

### Session Lifecycle

```
1. Host Creates Session
   └─> Session enters 'waiting' state
   └─> Generate unique join code
   └─> Open WebSocket room

2. Players Join
   └─> Enter join code
   └─> Connect to WebSocket room
   └─> Receive current session state

3. Host Configures Game
   └─> Select categories
   └─> Set number of rounds
   └─> Set round duration
   └─> Configure custom rules
   └─> Configure verification mode

4. Host Starts Game
   └─> Session enters 'playing' state
   └─> Generate first letter
   └─> Broadcast round start

5. For Each Round:

   a. Round Start
      └─> 3-second countdown
      └─> Display letter & categories
      └─> Start timer

   b. Players Answer
      └─> Type answers for each category
      └─> Can edit until submit or time up
      └─> Submit answers (locks them in)

   c. Round End
      └─> Timer expires or all submitted
      └─> Collect all answers
      └─> Enter verification phase

   d. Verification (if enabled)
      └─> Display all answers
      └─> Players can challenge
      └─> Voting period (30s)
      └─> Host can override

   e. Scoring
      └─> Calculate scores based on:
          - Unique vs duplicate answers
          - Accepted vs rejected answers
          - Bonus points (all filled, speed, etc.)
      └─> Update player scores

   f. Results Display
      └─> Show round scores
      └─> Show running totals
      └─> Highlight winner of round

6. Game End
   └─> All rounds completed
   └─> Calculate final scores
   └─> Declare winner
   └─> Show statistics
   └─> Save to history
   └─> Option to rematch

7. Session Cleanup
   └─> Close WebSocket room
   └─> Archive session data
   └─> Disconnect all players
```

---

## 🗃️ Database Schema

### PostgreSQL Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),  -- NULL for guest users
  avatar VARCHAR(255),
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  stats JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### game_sessions
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id),
  config JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP
);

CREATE INDEX idx_sessions_code ON game_sessions(code);
CREATE INDEX idx_sessions_host ON game_sessions(host_id);
CREATE INDEX idx_sessions_status ON game_sessions(status);
```

#### game_history
```sql
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id),
  player_id UUID REFERENCES users(id),
  final_score INTEGER NOT NULL,
  placement INTEGER NOT NULL,
  rounds_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_player ON game_history(player_id);
CREATE INDEX idx_history_session ON game_history(session_id);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  examples TEXT[],
  validation_rules JSONB,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  difficulty VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_custom ON categories(is_custom);
CREATE INDEX idx_categories_creator ON categories(created_by);
```

### Redis Data Structures

#### Active Sessions (Hash)
```
Key: session:{sessionId}
Value: {
  code: string,
  hostId: string,
  players: Player[],
  config: GameConfig,
  state: GameState,
  currentRound: number,
  ...
}
TTL: 24 hours
```

#### Round Data (Hash)
```
Key: round:{sessionId}:{roundNumber}
Value: {
  letter: string,
  startTime: timestamp,
  answers: {...},
  verifications: {...}
}
TTL: 24 hours
```

#### Player Connections (Set)
```
Key: connections:{sessionId}
Value: Set of userId strings
```

#### Leaderboard (Sorted Set)
```
Key: leaderboard:all-time
Score: total points
Member: userId
```

---

## 📱 Mobile App Architecture

### State Management: Redux Toolkit

```typescript
// Store structure
{
  user: UserState,
  lobby: LobbyState,
  game: GameState,
  ui: UIState,
  network: NetworkState
}

// Slices
- userSlice: Current user, profile, stats
- lobbySlice: Current lobby state, players
- gameSlice: Active game state, rounds, scores
- uiSlice: Modal state, loading, errors
- networkSlice: Connection status, latency
```

### Navigation Structure

```
RootNavigator (Stack)
├── AuthNavigator (Stack)
│   ├── Welcome
│   ├── Login
│   └── Register
│
└── MainNavigator (Stack)
    ├── Home
    ├── LobbyNavigator (Stack)
    │   ├── CreateLobby
    │   ├── JoinLobby
    │   └── LobbyRoom
    │
    ├── GameNavigator (Stack)
    │   ├── GamePlay
    │   ├── Verification
    │   └── RoundResults
    │
    ├── Results (Modal)
    ├── Settings (Modal)
    └── Profile (Modal)
```

### Component Library
- **UI Framework**: React Native Paper (Material Design)
- **Icons**: React Native Vector Icons
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **Forms**: React Hook Form

---

## 🚀 Performance Considerations

### Backend
- **Redis Caching**: Cache frequently accessed data
- **Database Indexing**: Proper indexes on query columns
- **Connection Pooling**: Reuse DB connections
- **WebSocket Optimization**: Binary protocols for large data
- **Horizontal Scaling**: Stateless design with Redis pub/sub

### Frontend
- **Code Splitting**: Lazy load screens
- **Memoization**: React.memo for expensive renders
- **Virtual Lists**: For long player/history lists
- **Image Optimization**: Compressed avatars, lazy loading
- **Optimistic UI**: Instant feedback, sync in background

### Network
- **Compression**: Gzip/Brotli for HTTP, MessagePack for WS
- **Debouncing**: Throttle rapid events
- **Reconnection**: Exponential backoff
- **Offline Support**: Queue actions, sync when online

---

## 🧪 Testing Strategy

### Unit Tests
- Game logic (game-engine package)
- Utility functions
- Redux reducers
- API service functions

### Integration Tests
- API endpoints
- WebSocket events
- Database operations
- Redis operations

### E2E Tests
- Complete game flow
- Multiplayer scenarios
- Network failure recovery
- UI interactions

### Tools
- **Jest**: Unit & integration testing
- **React Native Testing Library**: Component testing
- **Detox**: E2E mobile testing
- **Supertest**: API testing
- **Socket.io-client**: WebSocket testing

---

## 📊 Monitoring & Observability

### Logging
- **Winston**: Structured logging
- **Log Levels**: Error, Warn, Info, Debug
- **Correlation IDs**: Track requests across services

### Metrics
- **Active Sessions**: Current game count
- **Connected Players**: Real-time player count
- **Response Times**: API & WebSocket latency
- **Error Rates**: 4xx, 5xx errors

### Alerts
- High error rates
- Database connection issues
- Redis connection issues
- High response times (> 1s)

---

## 🔮 Future Architecture Considerations

### Scalability
- **Microservices**: Split into game-service, lobby-service, etc.
- **Message Queue**: RabbitMQ/Kafka for async processing
- **CDN**: Static assets delivery
- **Multi-region**: Deploy in multiple regions

### Advanced Features
- **AI Service**: Separate service for AI opponent
- **Analytics Service**: Real-time analytics dashboard
- **Notification Service**: Push notifications
- **Chat Service**: In-game chat with moderation

---

**Last Updated**: 2025-11-10 23:58 UTC
**Next Review**: After Phase 1 implementation
