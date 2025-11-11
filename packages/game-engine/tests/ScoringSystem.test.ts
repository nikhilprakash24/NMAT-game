import { ScoringSystem, DEFAULT_POINT_SYSTEM } from '../src/scoring/ScoringSystem';
import {
  RoundAnswers,
  AnswerVerification,
  AnswerStatus,
  PointSystem,
} from '../src/types';

describe('ScoringSystem', () => {
  let scoringSystem: ScoringSystem;
  const pointSystem: PointSystem = { ...DEFAULT_POINT_SYSTEM };

  beforeEach(() => {
    scoringSystem = new ScoringSystem(pointSystem);
  });

  describe('calculateRoundScores', () => {
    it('should award points for unique answers', () => {
      const allAnswers = new Map<string, RoundAnswers>([
        ['player1', { cat1: 'Apple', cat2: 'Australia' }],
        ['player2', { cat1: 'Ant', cat2: 'America' }],
      ]);

      const verifications = new Map([
        [
          'player1',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
            [
              'cat2',
              {
                categoryId: 'cat2',
                answer: 'Australia',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
        [
          'player2',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Ant',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
            [
              'cat2',
              {
                categoryId: 'cat2',
                answer: 'America',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
      ]);

      const scores = scoringSystem.calculateRoundScores(
        allAnswers,
        verifications,
        'A'
      );

      // Both players have unique answers for both categories
      // 2 categories * 10 points + 10 bonus for all filled = 30
      expect(scores.get('player1')).toBe(30);
      expect(scores.get('player2')).toBe(30);
    });

    it('should award reduced points for duplicate answers', () => {
      const allAnswers = new Map<string, RoundAnswers>([
        ['player1', { cat1: 'Apple' }],
        ['player2', { cat1: 'Apple' }], // Duplicate
      ]);

      const verifications = new Map([
        [
          'player1',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
        [
          'player2',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
      ]);

      const scores = scoringSystem.calculateRoundScores(
        allAnswers,
        verifications,
        'A'
      );

      // Duplicate answers get 5 points each
      expect(scores.get('player1')).toBe(5);
      expect(scores.get('player2')).toBe(5);
    });

    it('should not award points for rejected answers', () => {
      const allAnswers = new Map<string, RoundAnswers>([
        ['player1', { cat1: 'Apple', cat2: 'Australia' }],
      ]);

      const verifications = new Map([
        [
          'player1',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
            [
              'cat2',
              {
                categoryId: 'cat2',
                answer: 'Australia',
                status: AnswerStatus.REJECTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
      ]);

      const scores = scoringSystem.calculateRoundScores(
        allAnswers,
        verifications,
        'A'
      );

      // Only 1 accepted answer, no bonus (not all filled)
      expect(scores.get('player1')).toBe(10);
    });

    it('should award bonus for completing all categories', () => {
      const allAnswers = new Map<string, RoundAnswers>([
        ['player1', { cat1: 'Apple', cat2: 'Australia', cat3: 'Ant' }],
      ]);

      const verifications = new Map([
        [
          'player1',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
            [
              'cat2',
              {
                categoryId: 'cat2',
                answer: 'Australia',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
            [
              'cat3',
              {
                categoryId: 'cat3',
                answer: 'Ant',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
      ]);

      const scores = scoringSystem.calculateRoundScores(
        allAnswers,
        verifications,
        'A'
      );

      // 3 unique answers (30) + all categories bonus (10) = 40
      expect(scores.get('player1')).toBe(40);
    });

    it('should handle case insensitive duplicate detection', () => {
      const allAnswers = new Map<string, RoundAnswers>([
        ['player1', { cat1: 'Apple' }],
        ['player2', { cat1: 'apple' }], // Same answer, different case
      ]);

      const verifications = new Map([
        [
          'player1',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'Apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
        [
          'player2',
          new Map([
            [
              'cat1',
              {
                categoryId: 'cat1',
                answer: 'apple',
                status: AnswerStatus.ACCEPTED,
                challenges: [],
                votes: [],
              } as AnswerVerification,
            ],
          ]),
        ],
      ]);

      const scores = scoringSystem.calculateRoundScores(
        allAnswers,
        verifications,
        'A'
      );

      // Should be treated as duplicates
      expect(scores.get('player1')).toBe(5);
      expect(scores.get('player2')).toBe(5);
    });
  });

  describe('calculateFinalScores', () => {
    it('should sum scores across all rounds', () => {
      const roundScores = new Map([
        [
          1,
          new Map([
            ['player1', 20],
            ['player2', 15],
          ]),
        ],
        [
          2,
          new Map([
            ['player1', 25],
            ['player2', 30],
          ]),
        ],
        [
          3,
          new Map([
            ['player1', 15],
            ['player2', 20],
          ]),
        ],
      ]);

      const finalScores = scoringSystem.calculateFinalScores(roundScores);

      expect(finalScores.get('player1')).toBe(60);
      expect(finalScores.get('player2')).toBe(65);
    });
  });

  describe('determineWinners', () => {
    it('should return single winner', () => {
      const finalScores = new Map([
        ['player1', 100],
        ['player2', 80],
        ['player3', 90],
      ]);

      const winners = scoringSystem.determineWinners(finalScores);

      expect(winners).toHaveLength(1);
      expect(winners[0]).toBe('player1');
    });

    it('should return multiple winners in case of tie', () => {
      const finalScores = new Map([
        ['player1', 100],
        ['player2', 100],
        ['player3', 80],
      ]);

      const winners = scoringSystem.determineWinners(finalScores);

      expect(winners).toHaveLength(2);
      expect(winners).toContain('player1');
      expect(winners).toContain('player2');
    });

    it('should return empty array for no players', () => {
      const finalScores = new Map();
      const winners = scoringSystem.determineWinners(finalScores);
      expect(winners).toHaveLength(0);
    });
  });

  describe('getRanking', () => {
    it('should return players ranked by score', () => {
      const finalScores = new Map([
        ['player1', 80],
        ['player2', 100],
        ['player3', 90],
      ]);

      const ranking = scoringSystem.getRanking(finalScores);

      expect(ranking).toHaveLength(3);
      expect(ranking[0]).toEqual({
        userId: 'player2',
        score: 100,
        rank: 1,
      });
      expect(ranking[1]).toEqual({
        userId: 'player3',
        score: 90,
        rank: 2,
      });
      expect(ranking[2]).toEqual({
        userId: 'player1',
        score: 80,
        rank: 3,
      });
    });
  });

  describe('calculateGameStats', () => {
    it('should calculate correct statistics', () => {
      const finalScores = new Map([
        ['player1', 100],
        ['player2', 80],
        ['player3', 70],
      ]);

      const stats = scoringSystem.calculateGameStats(finalScores, 5);

      expect(stats.highestScore).toBe(100);
      expect(stats.lowestScore).toBe(70);
      expect(stats.totalPoints).toBe(250);
      expect(stats.averageScore).toBe(83); // Rounded from 83.33
    });

    it('should handle empty scores', () => {
      const finalScores = new Map();
      const stats = scoringSystem.calculateGameStats(finalScores, 5);

      expect(stats.highestScore).toBe(0);
      expect(stats.lowestScore).toBe(0);
      expect(stats.totalPoints).toBe(0);
      expect(stats.averageScore).toBe(0);
    });
  });
});
