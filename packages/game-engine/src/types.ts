/**
 * Core type definitions for NMAT Game Engine
 */

// ============================================================================
// Enums
// ============================================================================

export enum SessionStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  REVIEWING = 'reviewing',
  FINISHED = 'finished',
}

export enum RoundStatus {
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  ENDED = 'ended',
  VERIFYING = 'verifying',
  COMPLETED = 'completed',
}

export enum VerificationMode {
  NONE = 'none',
  VOTE = 'vote',
  HOST_ONLY = 'host_only',
}

export enum RuleType {
  DOUBLE_POINTS = 'double_points',
  SPEED_BONUS = 'speed_bonus',
  RARE_LETTER = 'rare_letter',
  STEAL_POINTS = 'steal_points',
  THEMED_ROUND = 'themed_round',
  WILDCARD = 'wildcard',
}

export enum CategoryDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum ValidationRuleType {
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  REGEX = 'regex',
  DICTIONARY = 'dictionary',
  CUSTOM = 'custom',
}

export enum AnswerStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum DecisionSource {
  VOTE = 'vote',
  HOST = 'host',
  AUTO = 'auto',
}

// ============================================================================
// Basic Interfaces
// ============================================================================

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  averageScore: number;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  stats: UserStats;
}

export interface Player {
  userId: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isConnected: boolean;
  score: number;
  roundScores: number[];
  answers: Map<number, RoundAnswers>;
  joinedAt: Date;
  lastSeenAt: Date;
}

// ============================================================================
// Category System
// ============================================================================

export interface ValidationRule {
  type: ValidationRuleType;
  value: any;
  errorMessage: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  examples?: string[];
  validationRules?: ValidationRule[];
  isCustom: boolean;
  difficulty?: CategoryDifficulty;
}

// ============================================================================
// Game Configuration
// ============================================================================

export interface PointSystem {
  uniqueAnswer: number;
  duplicateAnswer: number;
  noAnswer: number;
  allCategoriesBonus: number;
  speedBonus?: number;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  config: any;
  isActive: boolean;
}

export interface GameConfig {
  numberOfRounds: number;
  roundDuration: number;
  categories: Category[];
  customRules: CustomRule[];
  allowLateJoin: boolean;
  verificationMode: VerificationMode;
  pointSystem: PointSystem;
}

// ============================================================================
// Round & Answers
// ============================================================================

export interface RoundAnswers {
  [categoryId: string]: string;
}

export interface FinalDecision {
  decidedBy: DecisionSource;
  decidedAt: Date;
  accepted: boolean;
  decidedByUserId?: string;
}

export interface Vote {
  voterId: string;
  accept: boolean;
  timestamp: Date;
}

export interface Challenge {
  id: string;
  challengerId: string;
  playerId: string;
  categoryId: string;
  answer: string;
  reason?: string;
  createdAt: Date;
}

export interface AnswerVerification {
  categoryId: string;
  answer: string;
  status: AnswerStatus;
  challenges: Challenge[];
  votes: Vote[];
  finalDecision?: FinalDecision;
}

export interface Round {
  roundNumber: number;
  letter: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  playerAnswers: Map<string, RoundAnswers>;
  verificationStatus: Map<string, Map<string, AnswerVerification>>;
  scores: Map<string, number>;
  status: RoundStatus;
}

// ============================================================================
// Game Session
// ============================================================================

export interface GameSession {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  config: GameConfig;
  rounds: Round[];
  currentRound: number;
  status: SessionStatus;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

// ============================================================================
// Game Events
// ============================================================================

export interface GameEvent {
  type: string;
  timestamp: Date;
  data: any;
}

export interface RoundStartEvent extends GameEvent {
  type: 'round_start';
  data: {
    roundNumber: number;
    letter: string;
    duration: number;
  };
}

export interface RoundEndEvent extends GameEvent {
  type: 'round_end';
  data: {
    roundNumber: number;
  };
}

export interface AnswerSubmittedEvent extends GameEvent {
  type: 'answer_submitted';
  data: {
    userId: string;
    roundNumber: number;
    answers: RoundAnswers;
  };
}

export interface ChallengeCreatedEvent extends GameEvent {
  type: 'challenge_created';
  data: Challenge;
}

export interface VoteCastEvent extends GameEvent {
  type: 'vote_cast';
  data: {
    challengeId: string;
    vote: Vote;
  };
}

export interface ScoresUpdatedEvent extends GameEvent {
  type: 'scores_updated';
  data: {
    roundNumber: number;
    scores: Map<string, number>;
    totalScores: Map<string, number>;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type GameEventType =
  | RoundStartEvent
  | RoundEndEvent
  | AnswerSubmittedEvent
  | ChallengeCreatedEvent
  | VoteCastEvent
  | ScoresUpdatedEvent;

export interface GameStats {
  totalRounds: number;
  totalPlayers: number;
  averageScore: number;
  highestScore: number;
  winnerId: string;
  duration: number; // milliseconds
}

// ============================================================================
// Error Types
// ============================================================================

export class GameEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GameEngineError';
  }
}

export class ValidationError extends GameEngineError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class InvalidStateError extends GameEngineError {
  constructor(message: string, details?: any) {
    super(message, 'INVALID_STATE', details);
    this.name = 'InvalidStateError';
  }
}
