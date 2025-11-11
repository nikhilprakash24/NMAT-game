# NMAT Game - Master Project Plan
**Project**: Networked Name-Place-Animal-Thing Mobile Game
**Started**: 2025-11-10
**Status**: Planning Phase
**Branch**: `claude/npat-game-planning-011CV17TmUnDjXXG8chDTXd6`

---

## 🎯 Project Vision

Create a modern, networked mobile version of the classic "Name-Place-Animal-Thing" game suitable for road trips, family gatherings, and casual play. The game must be intuitive enough for kids yet engaging for adults.

## 📋 Core Requirements

### Gameplay Features
1. **Multiplayer Networking** - Real-time networked gameplay
2. **Category System** - Multiple themes/categories (Countries, Foods, Brands, etc.)
3. **Verification System** - Players can challenge answers with vote-based confirmation
4. **Custom Rules** - Add/remove rules before game starts
5. **Override Capability** - Game host can override verification decisions
6. **Scoring System** - Track points per round and overall
7. **Round Review** - Review all answers after each round
8. **Configurable Settings**:
   - Number of players (2-8)
   - Number of rounds (1-20)
   - Timer per round (optional)
   - Categories to include

### Non-Functional Requirements
1. **UX/UI** - Kid-friendly AND adult-appealing design
2. **Performance** - Low latency for real-time gameplay
3. **Reliability** - Handle network interruptions gracefully
4. **Accessibility** - Support various screen sizes and orientations
5. **Offline Mode** - Single-device pass-and-play option

---

## 🏗️ System Architecture

### Tech Stack Decision

**Frontend (Mobile App)**
- **React Native** with TypeScript
  - Cross-platform (iOS & Android)
  - Great community support
  - Excellent UI libraries (React Native Paper, NativeBase)
  - Hot reload for faster development

**Backend**
- **Node.js** with Express & TypeScript
  - JavaScript/TypeScript consistency across stack
  - Excellent WebSocket support
  - Fast development cycle

**Real-time Communication**
- **Socket.io**
  - Built on WebSocket with fallbacks
  - Room-based architecture perfect for game sessions
  - Auto-reconnection handling
  - Event-based communication

**Database**
- **PostgreSQL** for persistent data (user profiles, game history)
- **Redis** for session state and real-time game data
  - Fast in-memory operations
  - Perfect for temporary game state
  - Built-in pub/sub for scaling

**Infrastructure**
- Docker for containerization
- Docker Compose for local development
- Ready for cloud deployment (AWS, GCP, Azure)

---

## 📊 Development Phases

### Phase 1: Core Game Logic & Data Models (Week 1)
**Goal**: Build the foundation without networking

**Tasks**:
1. ✅ Project structure setup
2. ✅ TypeScript configurations
3. ✅ Game state management (pure logic)
4. ✅ Category system implementation
5. ✅ Scoring algorithm
6. ✅ Validation rules engine
7. ✅ Unit tests for core logic

**Deliverables**:
- Game engine package (pure TypeScript)
- Comprehensive test suite
- Documentation of game rules

---

### Phase 2: Backend Services (Week 2)
**Goal**: Create robust backend infrastructure

**Tasks**:
1. ✅ Express server setup
2. ✅ WebSocket/Socket.io integration
3. ✅ Room/session management
4. ✅ Player connection handling
5. ✅ Game state synchronization
6. ✅ Redis integration for state management
7. ✅ PostgreSQL schema design
8. ✅ API endpoints (REST + WebSocket)
9. ✅ Integration tests

**Deliverables**:
- Working backend server
- API documentation
- Database schema
- Connection recovery mechanisms

---

### Phase 3: Mobile Frontend - Basic UI (Week 3)
**Goal**: Create beautiful, functional mobile interface

**Tasks**:
1. ✅ React Native project setup
2. ✅ Navigation structure (React Navigation)
3. ✅ UI component library integration
4. ✅ Home screen
5. ✅ Game lobby screen
6. ✅ Game play screen
7. ✅ Results/scoring screen
8. ✅ Settings screen
9. ✅ Responsive design for tablets
10. ✅ Theme system (light/dark mode)

**Deliverables**:
- Functional mobile app
- UI/UX documentation
- Screenshots/demos

---

### Phase 4: Networking Integration (Week 4)
**Goal**: Connect frontend to backend

**Tasks**:
1. ✅ Socket.io client integration
2. ✅ State management (Redux Toolkit or Zustand)
3. ✅ Real-time game synchronization
4. ✅ Lobby creation/joining
5. ✅ Player presence system
6. ✅ Reconnection handling
7. ✅ Loading states and error handling
8. ✅ Network indicator UI

**Deliverables**:
- Fully networked gameplay
- Offline mode fallback
- Network resilience

---

### Phase 5: Advanced Features (Week 5)
**Goal**: Implement verification system and custom rules

**Tasks**:
1. ✅ Verification/challenge system
2. ✅ Voting mechanism
3. ✅ Host override controls
4. ✅ Custom rule builder UI
5. ✅ Rule validation logic
6. ✅ Category management system
7. ✅ Add custom categories
8. ✅ Pre-game configuration screen

**Deliverables**:
- Complete verification system
- Custom rules engine
- Configuration UI

---

### Phase 6: Polish & Optimization (Week 6)
**Goal**: Production-ready quality

**Tasks**:
1. ✅ Performance optimization
2. ✅ Animation polish
3. ✅ Sound effects (optional)
4. ✅ Haptic feedback
5. ✅ Accessibility improvements
6. ✅ Error message improvements
7. ✅ Loading state polish
8. ✅ Edge case handling
9. ✅ End-to-end testing
10. ✅ Beta testing with real users

**Deliverables**:
- Production-ready app
- Performance benchmarks
- User testing feedback

---

### Phase 7: Deployment & Documentation (Week 7)
**Goal**: Ship it!

**Tasks**:
1. ✅ Backend deployment setup
2. ✅ Database setup (production)
3. ✅ CI/CD pipeline
4. ✅ Mobile app build (APK/IPA)
5. ✅ App store submission prep
6. ✅ User documentation
7. ✅ Admin documentation
8. ✅ Monitoring setup
9. ✅ Analytics integration

**Deliverables**:
- Deployed backend
- Installable mobile apps
- Complete documentation

---

## 🎮 Game Rules & Mechanics

### Classic NPAT Rules
- **Round Start**: Random letter is selected
- **Timer**: Players have 60-120 seconds to fill answers
- **Categories**: Typically 4-10 categories
- **Scoring**:
  - Unique answer: 10 points
  - Multiple players same answer: 5 points
  - No answer or invalid: 0 points
  - Bonus for all categories filled: +10 points

### Custom Rules Examples
- **Double Points Round**: Random rounds give 2x points
- **Speed Bonus**: First to submit gets +5 points
- **Rare Letter Bonus**: Q, X, Z letters give extra points
- **Themed Rounds**: All categories must relate to a theme
- **Challenge Mode**: Players can steal points by challenging

### Verification System
1. After round ends, answers displayed to all players
2. Any player can challenge any answer
3. Voting period (30 seconds)
4. Majority vote decides (host has tiebreaker)
5. Host can override any decision
6. Points adjusted after verification

---

## 📁 Project Structure

```
NMAT-game/
├── docs/                          # All documentation
│   ├── MASTER_PLAN.md            # This file
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── TASK_LOG.md               # Detailed task log
│   ├── PROGRESS.md               # Progress tracking
│   ├── API_DOCS.md               # API documentation
│   └── USER_GUIDE.md             # User manual
│
├── packages/
│   ├── game-engine/              # Core game logic (pure TS)
│   │   ├── src/
│   │   │   ├── models/           # Data models
│   │   │   ├── rules/            # Game rules engine
│   │   │   ├── scoring/          # Scoring algorithms
│   │   │   └── validation/       # Answer validation
│   │   └── tests/
│   │
│   ├── backend/                  # Node.js backend
│   │   ├── src/
│   │   │   ├── controllers/      # Route controllers
│   │   │   ├── services/         # Business logic
│   │   │   ├── models/           # DB models
│   │   │   ├── socket/           # Socket.io handlers
│   │   │   └── middleware/       # Express middleware
│   │   ├── tests/
│   │   └── Dockerfile
│   │
│   └── mobile/                   # React Native app
│       ├── src/
│       │   ├── components/       # Reusable components
│       │   ├── screens/          # Screen components
│       │   ├── navigation/       # Navigation setup
│       │   ├── store/            # State management
│       │   ├── services/         # API/Socket services
│       │   ├── hooks/            # Custom hooks
│       │   ├── theme/            # Styling/theme
│       │   └── utils/            # Utilities
│       └── tests/
│
├── infrastructure/
│   ├── docker-compose.yml        # Local development
│   ├── docker-compose.prod.yml   # Production setup
│   └── nginx/                    # Reverse proxy config
│
├── scripts/
│   ├── setup.sh                  # Initial setup script
│   ├── test.sh                   # Run all tests
│   └── deploy.sh                 # Deployment script
│
└── README.md                     # Main README
```

---

## 🧪 Testing Strategy

### Unit Tests
- All game logic functions
- Scoring algorithms
- Validation rules
- Utility functions
- Target: 90%+ coverage

### Integration Tests
- API endpoints
- WebSocket events
- Database operations
- Redis operations
- Target: 80%+ coverage

### E2E Tests
- Complete game flow
- Multiplayer scenarios
- Network failure recovery
- UI interactions
- Target: Major user paths covered

### Manual Testing
- UX/UI polish
- Different devices
- Network conditions
- Edge cases
- Beta user feedback

---

## 🚀 Success Metrics

### Technical
- [ ] < 100ms average API response time
- [ ] < 50ms WebSocket event latency
- [ ] 99%+ uptime
- [ ] Supports 100+ concurrent games
- [ ] < 2s cold start time for mobile app
- [ ] < 50MB mobile app size

### User Experience
- [ ] Intuitive onboarding (< 30s to understand)
- [ ] Kid-friendly design (tested with 8-12 age group)
- [ ] Adult engagement (positive feedback from 18+ users)
- [ ] < 3 taps to start a game
- [ ] Graceful offline mode

### Quality
- [ ] Zero critical bugs
- [ ] 90%+ test coverage
- [ ] Accessibility compliance (WCAG 2.1 Level AA)
- [ ] Performance score > 90 on Lighthouse

---

## 🔄 Branching Strategy

### Main Branches
- `claude/npat-game-planning-011CV17TmUnDjXXG8chDTXd6` - Main development branch
- `feature/*` - Feature branches
- `experiment/*` - Experimental features
- `bugfix/*` - Bug fixes

### Branch Workflow
1. Create feature branch from main dev branch
2. Implement and test feature
3. Merge back to main dev branch
4. Document in TASK_LOG.md

---

## 📅 Timeline

- **Week 1**: Core game logic ✅ (Current focus)
- **Week 2**: Backend services
- **Week 3**: Mobile frontend basics
- **Week 4**: Networking integration
- **Week 5**: Advanced features
- **Week 6**: Polish & optimization
- **Week 7**: Deployment

**Note**: Timeline is aggressive but achievable with focused work.

---

## 🎯 Current Status

**Phase**: Planning & Initial Setup
**Progress**: 5%
**Next Step**: Create project structure and setup development environment

---

## 📝 Notes & Decisions

### Design Decisions
1. **Why React Native?** Cross-platform with single codebase, great for MVP
2. **Why Socket.io?** Best real-time framework with fallbacks and room support
3. **Why PostgreSQL + Redis?** Postgres for persistence, Redis for speed
4. **Why TypeScript?** Type safety reduces bugs, better DX, scales well
5. **Monorepo?** Yes - easier to share types between frontend/backend

### Future Considerations
- [ ] Push notifications for game invites
- [ ] Friend system
- [ ] Leaderboards
- [ ] Achievement system
- [ ] In-game chat
- [ ] Replay system
- [ ] Tournament mode
- [ ] AI opponent for solo play
- [ ] Internationalization (i18n)
- [ ] Analytics dashboard for admins

---

## 🆘 Risk Assessment

### Technical Risks
1. **Network Latency**: Mitigated by optimistic UI updates and Redis caching
2. **Scalability**: Redis pub/sub allows horizontal scaling
3. **Mobile Performance**: Profile early, optimize often
4. **Cross-platform Issues**: Test on both iOS and Android regularly

### Project Risks
1. **Scope Creep**: Stick to MVP first, additional features later
2. **Time Estimation**: Built in buffer time per phase
3. **Technical Debt**: Refactor as we go, comprehensive testing

---

**Last Updated**: 2025-11-10
**Next Review**: After Phase 1 completion
