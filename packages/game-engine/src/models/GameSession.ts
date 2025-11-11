import { v4 as uuidv4 } from 'uuid';
import {
  GameSession,
  Player,
  GameConfig,
  Round,
  RoundAnswers,
  SessionStatus,
  RoundStatus,
  AnswerVerification,
  AnswerStatus,
  Challenge,
  Vote,
  DecisionSource,
  FinalDecision,
  GameStats,
  InvalidStateError,
  ValidationError,
  VerificationMode,
} from '../types';
import { generateRandomLetter } from '../utils/letterGenerator';
import { ScoringSystem } from '../scoring/ScoringSystem';
import { CategoryModel } from './Category';

/**
 * GameSession Manager
 * Main class for managing game state and lifecycle
 */
export class GameSessionManager {
  private session: GameSession;
  private scoringSystem: ScoringSystem;
  private roundStartTimes: Map<number, number> = new Map();
  private submissionTimes: Map<number, Map<string, number>> = new Map();

  constructor(hostId: string, config: GameConfig) {
    this.session = {
      id: uuidv4(),
      code: this.generateJoinCode(),
      hostId,
      players: [],
      config,
      rounds: [],
      currentRound: 0,
      status: SessionStatus.WAITING,
      createdAt: new Date(),
    };

    this.scoringSystem = new ScoringSystem(
      config.pointSystem,
      config.customRules
    );
  }

  /**
   * Generate a 6-character join code
   */
  private generateJoinCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Add a player to the session
   */
  addPlayer(userId: string, username: string, avatar?: string): Player {
    // Check if player already exists
    const existing = this.session.players.find((p) => p.userId === userId);
    if (existing) {
      existing.isConnected = true;
      existing.lastSeenAt = new Date();
      return existing;
    }

    // Check if game has started and late join is not allowed
    if (
      this.session.status !== SessionStatus.WAITING &&
      !this.session.config.allowLateJoin
    ) {
      throw new InvalidStateError('Cannot join game after it has started');
    }

    const player: Player = {
      userId,
      username,
      avatar,
      isHost: this.session.players.length === 0, // First player is host
      isConnected: true,
      score: 0,
      roundScores: [],
      answers: new Map(),
      joinedAt: new Date(),
      lastSeenAt: new Date(),
    };

    this.session.players.push(player);
    return player;
  }

  /**
   * Remove a player from the session
   */
  removePlayer(userId: string): void {
    const index = this.session.players.findIndex((p) => p.userId === userId);
    if (index === -1) {
      throw new ValidationError('Player not found');
    }

    const player = this.session.players[index];

    // If host is leaving, transfer host to another player
    if (player.isHost && this.session.players.length > 1) {
      const newHost = this.session.players.find((p) => p.userId !== userId);
      if (newHost) {
        newHost.isHost = true;
        this.session.hostId = newHost.userId;
      }
    }

    this.session.players.splice(index, 1);
  }

  /**
   * Mark player as disconnected
   */
  markPlayerDisconnected(userId: string): void {
    const player = this.session.players.find((p) => p.userId === userId);
    if (player) {
      player.isConnected = false;
      player.lastSeenAt = new Date();
    }
  }

  /**
   * Mark player as reconnected
   */
  markPlayerReconnected(userId: string): void {
    const player = this.session.players.find((p) => p.userId === userId);
    if (player) {
      player.isConnected = true;
      player.lastSeenAt = new Date();
    }
  }

  /**
   * Start the game
   */
  startGame(): void {
    if (this.session.status !== SessionStatus.WAITING) {
      throw new InvalidStateError('Game has already started');
    }

    if (this.session.players.length < 2) {
      throw new ValidationError('Need at least 2 players to start');
    }

    this.session.status = SessionStatus.PLAYING;
    this.session.startedAt = new Date();

    // Start first round
    this.startNextRound();
  }

  /**
   * Start the next round
   */
  private startNextRound(): void {
    if (this.session.currentRound >= this.session.config.numberOfRounds) {
      this.finishGame();
      return;
    }

    const roundNumber = this.session.currentRound + 1;
    const letter = generateRandomLetter();

    const round: Round = {
      roundNumber,
      letter,
      startTime: new Date(),
      duration: this.session.config.roundDuration,
      playerAnswers: new Map(),
      verificationStatus: new Map(),
      scores: new Map(),
      status: RoundStatus.STARTING,
    };

    this.session.rounds.push(round);
    this.session.currentRound = roundNumber;
    this.roundStartTimes.set(roundNumber, Date.now());
    this.submissionTimes.set(roundNumber, new Map());

    // After a brief delay, move to IN_PROGRESS
    setTimeout(() => {
      if (round.status === RoundStatus.STARTING) {
        round.status = RoundStatus.IN_PROGRESS;
      }
    }, 3000); // 3 second countdown
  }

  /**
   * Submit answers for a round
   */
  submitAnswers(
    userId: string,
    roundNumber: number,
    answers: RoundAnswers
  ): void {
    const round = this.getCurrentRound();

    if (!round || round.roundNumber !== roundNumber) {
      throw new ValidationError('Invalid round number');
    }

    if (round.status !== RoundStatus.IN_PROGRESS) {
      throw new InvalidStateError('Round is not accepting answers');
    }

    const player = this.session.players.find((p) => p.userId === userId);
    if (!player) {
      throw new ValidationError('Player not found');
    }

    // Validate answers against categories
    const validatedAnswers: RoundAnswers = {};
    const verifications = new Map<string, AnswerVerification>();

    for (const category of this.session.config.categories) {
      const answer = answers[category.id] || '';

      if (answer.trim()) {
        const categoryModel = new CategoryModel(category);
        const validation = categoryModel.validateAnswer(answer, round.letter);

        validatedAnswers[category.id] = answer.trim();

        // Create verification entry
        const verification: AnswerVerification = {
          categoryId: category.id,
          answer: answer.trim(),
          status:
            this.session.config.verificationMode === VerificationMode.NONE
              ? AnswerStatus.ACCEPTED
              : AnswerStatus.PENDING,
          challenges: [],
          votes: [],
        };

        // Auto-accept if no verification mode or if validation failed badly
        if (
          !validation.valid &&
          this.session.config.verificationMode === VerificationMode.NONE
        ) {
          verification.status = AnswerStatus.REJECTED;
          verification.finalDecision = {
            decidedBy: DecisionSource.AUTO,
            decidedAt: new Date(),
            accepted: false,
          };
        }

        verifications.set(category.id, verification);
      }
    }

    // Store answers and verifications
    round.playerAnswers.set(userId, validatedAnswers);
    round.verificationStatus.set(userId, verifications);
    player.answers.set(roundNumber, validatedAnswers);

    // Record submission time for speed bonus
    const roundSubmissions = this.submissionTimes.get(roundNumber);
    if (roundSubmissions) {
      roundSubmissions.set(userId, Date.now());
    }

    // Check if all players have submitted
    this.checkAllPlayersSubmitted(round);
  }

  /**
   * Check if all connected players have submitted
   */
  private checkAllPlayersSubmitted(round: Round): void {
    const connectedPlayers = this.session.players.filter(
      (p) => p.isConnected
    ).length;
    const submittedCount = round.playerAnswers.size;

    if (submittedCount >= connectedPlayers) {
      this.endRound();
    }
  }

  /**
   * End the current round
   */
  endRound(): void {
    const round = this.getCurrentRound();

    if (!round) {
      throw new InvalidStateError('No active round');
    }

    if (round.status === RoundStatus.ENDED || round.status === RoundStatus.COMPLETED) {
      return; // Already ended
    }

    round.status = RoundStatus.ENDED;
    round.endTime = new Date();

    // If verification is needed, move to VERIFYING status
    if (this.session.config.verificationMode !== VerificationMode.NONE) {
      round.status = RoundStatus.VERIFYING;
    } else {
      // Auto-complete and calculate scores
      this.completeRound();
    }
  }

  /**
   * Create a challenge for an answer
   */
  createChallenge(
    challengerId: string,
    playerId: string,
    categoryId: string,
    reason?: string
  ): Challenge {
    const round = this.getCurrentRound();

    if (!round || round.status !== RoundStatus.VERIFYING) {
      throw new InvalidStateError('Cannot challenge outside verification phase');
    }

    const verifications = round.verificationStatus.get(playerId);
    if (!verifications) {
      throw new ValidationError('Player has no answers to challenge');
    }

    const verification = verifications.get(categoryId);
    if (!verification) {
      throw new ValidationError('No answer for this category');
    }

    const challenge: Challenge = {
      id: uuidv4(),
      challengerId,
      playerId,
      categoryId,
      answer: verification.answer,
      reason,
      createdAt: new Date(),
    };

    verification.challenges.push(challenge);
    return challenge;
  }

  /**
   * Cast a vote on a challenge
   */
  castVote(voterId: string, challengeId: string, accept: boolean): void {
    const round = this.getCurrentRound();

    if (!round || round.status !== RoundStatus.VERIFYING) {
      throw new InvalidStateError('Cannot vote outside verification phase');
    }

    // Find the challenge
    let targetVerification: AnswerVerification | null = null;

    for (const verifications of round.verificationStatus.values()) {
      for (const verification of verifications.values()) {
        const challenge = verification.challenges.find(
          (c) => c.id === challengeId
        );
        if (challenge) {
          targetVerification = verification;
          break;
        }
      }
      if (targetVerification) break;
    }

    if (!targetVerification) {
      throw new ValidationError('Challenge not found');
    }

    // Check if user already voted
    const existingVote = targetVerification.votes.find(
      (v) => v.voterId === voterId
    );
    if (existingVote) {
      // Update existing vote
      existingVote.accept = accept;
      existingVote.timestamp = new Date();
    } else {
      // Add new vote
      const vote: Vote = {
        voterId,
        accept,
        timestamp: new Date(),
      };
      targetVerification.votes.push(vote);
    }
  }

  /**
   * Host override decision
   */
  hostOverride(categoryId: string, playerId: string, accept: boolean): void {
    if (!this.isHost(this.session.hostId)) {
      throw new ValidationError('Only host can override');
    }

    const round = this.getCurrentRound();

    if (!round || round.status !== RoundStatus.VERIFYING) {
      throw new InvalidStateError('Cannot override outside verification phase');
    }

    const verifications = round.verificationStatus.get(playerId);
    if (!verifications) {
      throw new ValidationError('Player not found');
    }

    const verification = verifications.get(categoryId);
    if (!verification) {
      throw new ValidationError('Answer not found');
    }

    verification.status = accept ? AnswerStatus.ACCEPTED : AnswerStatus.REJECTED;
    verification.finalDecision = {
      decidedBy: DecisionSource.HOST,
      decidedAt: new Date(),
      accepted: accept,
      decidedByUserId: this.session.hostId,
    };
  }

  /**
   * Finalize verification (resolve all votes)
   */
  finalizeVerification(): void {
    const round = this.getCurrentRound();

    if (!round || round.status !== RoundStatus.VERIFYING) {
      throw new InvalidStateError('No verification in progress');
    }

    // Resolve all pending verifications
    for (const verifications of round.verificationStatus.values()) {
      for (const verification of verifications.values()) {
        if (verification.status === AnswerStatus.PENDING) {
          // If there are votes, decide by majority
          if (verification.votes.length > 0) {
            const acceptVotes = verification.votes.filter((v) => v.accept).length;
            const rejectVotes = verification.votes.filter((v) => !v.accept).length;

            const accepted = acceptVotes > rejectVotes;

            verification.status = accepted
              ? AnswerStatus.ACCEPTED
              : AnswerStatus.REJECTED;

            verification.finalDecision = {
              decidedBy: DecisionSource.VOTE,
              decidedAt: new Date(),
              accepted,
            };
          } else {
            // No votes or challenges, auto-accept
            verification.status = AnswerStatus.ACCEPTED;
            verification.finalDecision = {
              decidedBy: DecisionSource.AUTO,
              decidedAt: new Date(),
              accepted: true,
            };
          }
        }
      }
    }

    this.completeRound();
  }

  /**
   * Complete the round and calculate scores
   */
  private completeRound(): void {
    const round = this.getCurrentRound();

    if (!round) {
      throw new InvalidStateError('No active round');
    }

    // Calculate scores
    const roundScores = this.scoringSystem.calculateRoundScores(
      round.playerAnswers,
      round.verificationStatus,
      round.letter,
      this.submissionTimes.get(round.roundNumber)
    );

    round.scores = roundScores;
    round.status = RoundStatus.COMPLETED;

    // Update player scores
    for (const [userId, score] of roundScores.entries()) {
      const player = this.session.players.find((p) => p.userId === userId);
      if (player) {
        player.roundScores.push(score);
        player.score += score;
      }
    }

    // Move to reviewing status
    this.session.status = SessionStatus.REVIEWING;
  }

  /**
   * Move to next round (after reviewing current round)
   */
  proceedToNextRound(): void {
    if (this.session.status !== SessionStatus.REVIEWING) {
      throw new InvalidStateError('Not in review phase');
    }

    if (this.session.currentRound >= this.session.config.numberOfRounds) {
      this.finishGame();
    } else {
      this.session.status = SessionStatus.PLAYING;
      this.startNextRound();
    }
  }

  /**
   * Finish the game
   */
  private finishGame(): void {
    this.session.status = SessionStatus.FINISHED;
    this.session.finishedAt = new Date();
  }

  /**
   * Get current round
   */
  getCurrentRound(): Round | null {
    if (this.session.rounds.length === 0) return null;
    return this.session.rounds[this.session.rounds.length - 1];
  }

  /**
   * Get round by number
   */
  getRound(roundNumber: number): Round | null {
    return (
      this.session.rounds.find((r) => r.roundNumber === roundNumber) || null
    );
  }

  /**
   * Check if user is host
   */
  isHost(userId: string): boolean {
    return this.session.hostId === userId;
  }

  /**
   * Get game statistics
   */
  getGameStats(): GameStats {
    const finalScores = new Map<string, number>();

    for (const player of this.session.players) {
      finalScores.set(player.userId, player.score);
    }

    const winners = this.scoringSystem.determineWinners(finalScores);
    const stats = this.scoringSystem.calculateGameStats(
      finalScores,
      this.session.config.numberOfRounds
    );

    const duration = this.session.finishedAt
      ? this.session.finishedAt.getTime() - this.session.startedAt!.getTime()
      : 0;

    return {
      totalRounds: this.session.rounds.length,
      totalPlayers: this.session.players.length,
      averageScore: stats.averageScore,
      highestScore: stats.highestScore,
      winnerId: winners[0] || '',
      duration,
    };
  }

  /**
   * Get session data
   */
  getSession(): GameSession {
    return this.session;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.session.id;
  }

  /**
   * Get join code
   */
  getJoinCode(): string {
    return this.session.code;
  }

  /**
   * Get all players
   */
  getPlayers(): Player[] {
    return this.session.players;
  }

  /**
   * Get player by ID
   */
  getPlayer(userId: string): Player | null {
    return this.session.players.find((p) => p.userId === userId) || null;
  }

  /**
   * Get session status
   */
  getStatus(): SessionStatus {
    return this.session.status;
  }

  /**
   * Update game configuration (only allowed before game starts)
   */
  updateConfig(config: Partial<GameConfig>): void {
    if (this.session.status !== SessionStatus.WAITING) {
      throw new InvalidStateError('Cannot update config after game has started');
    }

    this.session.config = {
      ...this.session.config,
      ...config,
    };

    // Update scoring system if point system or rules changed
    if (config.pointSystem || config.customRules) {
      this.scoringSystem = new ScoringSystem(
        this.session.config.pointSystem,
        this.session.config.customRules
      );
    }
  }
}
