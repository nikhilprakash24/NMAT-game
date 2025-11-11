# NMAT Game - Networked Name-Place-Animal-Thing

> A modern, networked mobile version of the classic road trip game

## 🎮 About

NMAT Game brings the classic "Name-Place-Animal-Thing" game to mobile devices with real-time multiplayer, custom categories, verification systems, and beautiful UX suitable for both kids and adults.

## 📚 Documentation

- [Master Plan](./MASTER_PLAN.md) - Complete project roadmap and requirements
- [Architecture](./ARCHITECTURE.md) - Technical architecture and design decisions
- [Progress Tracker](./PROGRESS.md) - Current progress and milestones
- [Task Log](./TASK_LOG.md) - Detailed development log

## 🏗️ Project Structure

```
nmat-game/
├── packages/
│   ├── game-engine/    # Core game logic (framework-agnostic)
│   ├── backend/        # Node.js backend server
│   └── mobile/         # React Native mobile app
├── docs/               # Additional documentation
└── infrastructure/     # Docker, deployment configs
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for local backend)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd NMAT-game

# Install dependencies
npm run setup

# Start backend (development)
npm run dev:backend

# Start mobile app (development)
npm run dev:mobile
```

## 🛠️ Development

### Available Scripts

```bash
# Build all packages
npm run build

# Build specific package
npm run build:engine
npm run build:backend
npm run build:mobile

# Run tests
npm test                  # All packages
npm run test:engine       # Game engine only
npm run test:backend      # Backend only
npm run test:mobile       # Mobile only

# Linting & Formatting
npm run lint
npm run format
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Tech Stack

- **Frontend**: React Native, TypeScript, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, TypeScript
- **Database**: PostgreSQL (persistent), Redis (sessions/cache)
- **Real-time**: WebSocket (Socket.io)
- **Infrastructure**: Docker, Docker Compose

## 🎯 Features

- ✅ Real-time multiplayer gameplay
- ✅ Custom categories and themes
- ✅ Answer verification system with voting
- ✅ Host override capabilities
- ✅ Custom game rules
- ✅ Scoring and statistics
- ✅ Kid-friendly and adult-engaging UI
- ✅ Offline mode (single device)

## 📊 Current Status

**Phase**: Initial Setup
**Progress**: 10%

See [PROGRESS.md](./PROGRESS.md) for detailed status.

## 🤝 Contributing

This is currently a solo development project as an experiment in autonomous AI development. See [MASTER_PLAN.md](./MASTER_PLAN.md) for the full context.

## 📄 License

[License TBD]

## 📝 Notes

This project is being developed as an experiment to compare autonomous AI development vs. guided human-AI collaboration. All development decisions, implementations, and documentation are being tracked comprehensively.

---

**Last Updated**: 2025-11-10
**Version**: 0.1.0
