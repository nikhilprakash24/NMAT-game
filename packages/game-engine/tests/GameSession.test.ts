import { GameSessionManager } from '../src/models/GameSession';
import { BUILTIN_CATEGORIES } from '../src/models/Category';
import {
  GameConfig,
  SessionStatus,
  RoundStatus,
  VerificationMode,
  DEFAULT_POINT_SYSTEM,
} from '../src';

describe('GameSessionManager', () => {
  let gameSession: GameSessionManager;
  let config: GameConfig;

  beforeEach(() => {
    config = {
      numberOfRounds: 3,
      roundDuration: 60,
      categories: BUILTIN_CATEGORIES.slice(0, 4), // Name, Place, Animal, Thing
      customRules: [],
      allowLateJoin: false,
      verificationMode: VerificationMode.NONE,
      pointSystem: DEFAULT_POINT_SYSTEM,
    };

    gameSession = new GameSessionManager('host-123', config);
  });

  describe('constructor', () => {
    it('should create a new game session', () => {
      expect(gameSession.getSessionId()).toBeDefined();
      expect(gameSession.getJoinCode()).toBeDefined();
      expect(gameSession.getJoinCode()).toHaveLength(6);
      expect(gameSession.getStatus()).toBe(SessionStatus.WAITING);
    });

    it('should set the host correctly', () => {
      const session = gameSession.getSession();
      expect(session.hostId).toBe('host-123');
    });
  });

  describe('addPlayer', () => {
    it('should add a new player', () => {
      const player = gameSession.addPlayer('player-1', 'Alice');

      expect(player.userId).toBe('player-1');
      expect(player.username).toBe('Alice');
      expect(player.isConnected).toBe(true);
      expect(player.score).toBe(0);
    });

    it('should make first player the host', () => {
      const player1 = gameSession.addPlayer('player-1', 'Alice');
      expect(player1.isHost).toBe(true);

      const player2 = gameSession.addPlayer('player-2', 'Bob');
      expect(player2.isHost).toBe(false);
    });

    it('should not duplicate players', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-1', 'Alice'); // Add again

      const players = gameSession.getPlayers();
      expect(players).toHaveLength(1);
    });

    it('should reconnect existing player', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.markPlayerDisconnected('player-1');

      const player = gameSession.getPlayer('player-1');
      expect(player?.isConnected).toBe(false);

      gameSession.addPlayer('player-1', 'Alice');
      const reconnected = gameSession.getPlayer('player-1');
      expect(reconnected?.isConnected).toBe(true);
    });

    it('should throw error if joining after game started and late join disabled', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');
      gameSession.startGame();

      expect(() => {
        gameSession.addPlayer('player-3', 'Charlie');
      }).toThrow('Cannot join game after it has started');
    });
  });

  describe('removePlayer', () => {
    it('should remove a player', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.removePlayer('player-1');

      expect(gameSession.getPlayers()).toHaveLength(0);
    });

    it('should transfer host when host leaves', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');

      expect(gameSession.getPlayer('player-1')?.isHost).toBe(true);

      gameSession.removePlayer('player-1');

      expect(gameSession.getPlayer('player-2')?.isHost).toBe(true);
      expect(gameSession.getSession().hostId).toBe('player-2');
    });

    it('should throw error when removing non-existent player', () => {
      expect(() => {
        gameSession.removePlayer('non-existent');
      }).toThrow('Player not found');
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');
    });

    it('should start the game and first round', () => {
      gameSession.startGame();

      expect(gameSession.getStatus()).toBe(SessionStatus.PLAYING);
      expect(gameSession.getSession().startedAt).toBeDefined();

      const round = gameSession.getCurrentRound();
      expect(round).toBeDefined();
      expect(round?.roundNumber).toBe(1);
      expect(round?.letter).toMatch(/^[A-Z]$/);
    });

    it('should throw error if already started', () => {
      gameSession.startGame();

      expect(() => {
        gameSession.startGame();
      }).toThrow('Game has already started');
    });

    it('should throw error if less than 2 players', () => {
      gameSession.removePlayer('player-2');

      expect(() => {
        gameSession.startGame();
      }).toThrow('Need at least 2 players to start');
    });
  });

  describe('submitAnswers', () => {
    beforeEach(() => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');
      gameSession.startGame();

      // Wait for round to be in progress
      const round = gameSession.getCurrentRound();
      if (round) {
        round.status = RoundStatus.IN_PROGRESS;
      }
    });

    it('should accept valid answers', () => {
      const round = gameSession.getCurrentRound();
      expect(round).toBeDefined();

      const letter = round!.letter;
      const answers = {
        [config.categories[0].id]: `${letter}lice`, // Name
        [config.categories[1].id]: `${letter}ustralia`, // Place
      };

      expect(() => {
        gameSession.submitAnswers('player-1', round!.roundNumber, answers);
      }).not.toThrow();

      const playerAnswers = round!.playerAnswers.get('player-1');
      expect(playerAnswers).toBeDefined();
    });

    it('should throw error for invalid round number', () => {
      const answers = { [config.categories[0].id]: 'Alice' };

      expect(() => {
        gameSession.submitAnswers('player-1', 999, answers);
      }).toThrow('Invalid round number');
    });

    it('should throw error for non-existent player', () => {
      const round = gameSession.getCurrentRound()!;
      const answers = { [config.categories[0].id]: 'Alice' };

      expect(() => {
        gameSession.submitAnswers('non-existent', round.roundNumber, answers);
      }).toThrow('Player not found');
    });
  });

  describe('updateConfig', () => {
    it('should update config before game starts', () => {
      gameSession.updateConfig({
        numberOfRounds: 5,
      });

      expect(gameSession.getSession().config.numberOfRounds).toBe(5);
    });

    it('should throw error if trying to update after game starts', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');
      gameSession.startGame();

      expect(() => {
        gameSession.updateConfig({ numberOfRounds: 5 });
      }).toThrow('Cannot update config after game has started');
    });
  });

  describe('getters', () => {
    it('should return session ID', () => {
      const id = gameSession.getSessionId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should return join code', () => {
      const code = gameSession.getJoinCode();
      expect(code).toHaveLength(6);
    });

    it('should return players', () => {
      gameSession.addPlayer('player-1', 'Alice');
      const players = gameSession.getPlayers();
      expect(players).toHaveLength(1);
      expect(players[0].username).toBe('Alice');
    });

    it('should return player by ID', () => {
      gameSession.addPlayer('player-1', 'Alice');
      const player = gameSession.getPlayer('player-1');
      expect(player?.username).toBe('Alice');
    });

    it('should return null for non-existent player', () => {
      const player = gameSession.getPlayer('non-existent');
      expect(player).toBeNull();
    });

    it('should check if user is host', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');

      expect(gameSession.isHost('player-1')).toBe(true);
      expect(gameSession.isHost('player-2')).toBe(false);
    });
  });

  describe('round management', () => {
    beforeEach(() => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.addPlayer('player-2', 'Bob');
      gameSession.startGame();
    });

    it('should get current round', () => {
      const round = gameSession.getCurrentRound();
      expect(round).toBeDefined();
      expect(round?.roundNumber).toBe(1);
    });

    it('should get round by number', () => {
      const round = gameSession.getRound(1);
      expect(round).toBeDefined();
      expect(round?.roundNumber).toBe(1);
    });

    it('should return null for non-existent round', () => {
      const round = gameSession.getRound(999);
      expect(round).toBeNull();
    });
  });

  describe('connection management', () => {
    it('should mark player as disconnected', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.markPlayerDisconnected('player-1');

      const player = gameSession.getPlayer('player-1');
      expect(player?.isConnected).toBe(false);
    });

    it('should mark player as reconnected', () => {
      gameSession.addPlayer('player-1', 'Alice');
      gameSession.markPlayerDisconnected('player-1');
      gameSession.markPlayerReconnected('player-1');

      const player = gameSession.getPlayer('player-1');
      expect(player?.isConnected).toBe(true);
    });

    it('should not throw when disconnecting non-existent player', () => {
      expect(() => {
        gameSession.markPlayerDisconnected('non-existent');
      }).not.toThrow();
    });
  });
});
