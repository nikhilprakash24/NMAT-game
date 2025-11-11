import {
  RoundAnswers,
  PointSystem,
  AnswerStatus,
  AnswerVerification,
  CustomRule,
  RuleType,
} from '../types';
import { isRareLetter } from '../utils/letterGenerator';

/**
 * Scoring System
 * Handles all score calculations for the game
 */
export class ScoringSystem {
  private pointSystem: PointSystem;
  private customRules: CustomRule[];

  constructor(pointSystem: PointSystem, customRules: CustomRule[] = []) {
    this.pointSystem = pointSystem;
    this.customRules = customRules;
  }

  /**
   * Calculate scores for a round
   * @param allAnswers Map of userId -> answers
   * @param verifications Map of userId -> categoryId -> verification
   * @param letter The letter for this round
   * @param submissionTimes Optional map of userId -> submission timestamp
   * @returns Map of userId -> score for this round
   */
  calculateRoundScores(
    allAnswers: Map<string, RoundAnswers>,
    verifications: Map<string, Map<string, AnswerVerification>>,
    letter: string,
    submissionTimes?: Map<string, number>
  ): Map<string, number> {
    const scores = new Map<string, number>();
    const categoryAnswerCounts = this.countAnswersByCategory(
      allAnswers,
      verifications
    );

    // Calculate base scores for each player
    for (const [userId, answers] of allAnswers.entries()) {
      let userScore = 0;
      const userVerifications = verifications.get(userId);

      if (!userVerifications) {
        scores.set(userId, 0);
        continue;
      }

      // Score each category
      for (const [categoryId, answer] of Object.entries(answers)) {
        const verification = userVerifications.get(categoryId);

        if (!verification || verification.status === AnswerStatus.REJECTED) {
          // No points for rejected or missing verification
          continue;
        }

        if (verification.status === AnswerStatus.PENDING) {
          // Don't score pending answers yet
          continue;
        }

        // Answer is accepted
        const answerCount = categoryAnswerCounts.get(categoryId)?.get(answer.toLowerCase()) || 0;

        if (answerCount === 1) {
          // Unique answer
          userScore += this.pointSystem.uniqueAnswer;
        } else {
          // Duplicate answer
          userScore += this.pointSystem.duplicateAnswer;
        }
      }

      // Bonus for filling all categories
      if (this.hasAllCategoriesFilled(answers, userVerifications)) {
        userScore += this.pointSystem.allCategoriesBonus;
      }

      // Apply custom rules
      userScore = this.applyCustomRules(
        userScore,
        userId,
        answers,
        letter,
        submissionTimes
      );

      scores.set(userId, userScore);
    }

    // Apply speed bonus if enabled
    if (this.pointSystem.speedBonus && submissionTimes) {
      this.applySpeedBonus(scores, submissionTimes);
    }

    return scores;
  }

  /**
   * Count how many times each answer appears per category
   */
  private countAnswersByCategory(
    allAnswers: Map<string, RoundAnswers>,
    verifications: Map<string, Map<string, AnswerVerification>>
  ): Map<string, Map<string, number>> {
    const counts = new Map<string, Map<string, number>>();

    for (const [userId, answers] of allAnswers.entries()) {
      const userVerifications = verifications.get(userId);
      if (!userVerifications) continue;

      for (const [categoryId, answer] of Object.entries(answers)) {
        const verification = userVerifications.get(categoryId);

        // Only count accepted answers
        if (verification?.status !== AnswerStatus.ACCEPTED) {
          continue;
        }

        if (!counts.has(categoryId)) {
          counts.set(categoryId, new Map());
        }

        const categoryMap = counts.get(categoryId)!;
        const normalizedAnswer = answer.toLowerCase().trim();
        categoryMap.set(
          normalizedAnswer,
          (categoryMap.get(normalizedAnswer) || 0) + 1
        );
      }
    }

    return counts;
  }

  /**
   * Check if player filled all categories with accepted answers
   */
  private hasAllCategoriesFilled(
    answers: RoundAnswers,
    verifications: Map<string, AnswerVerification>
  ): boolean {
    const categoryIds = Object.keys(answers);

    for (const categoryId of categoryIds) {
      const verification = verifications.get(categoryId);
      if (
        !verification ||
        verification.status !== AnswerStatus.ACCEPTED ||
        !answers[categoryId]?.trim()
      ) {
        return false;
      }
    }

    return categoryIds.length > 0;
  }

  /**
   * Apply custom rules to modify score
   */
  private applyCustomRules(
    baseScore: number,
    userId: string,
    answers: RoundAnswers,
    letter: string,
    submissionTimes?: Map<string, number>
  ): number {
    let modifiedScore = baseScore;

    for (const rule of this.customRules) {
      if (!rule.isActive) continue;

      switch (rule.type) {
        case RuleType.DOUBLE_POINTS:
          // Double points for this round
          modifiedScore *= 2;
          break;

        case RuleType.RARE_LETTER:
          // Bonus for rare letters (Q, X, Z)
          if (isRareLetter(letter)) {
            const bonus = rule.config?.bonusPoints || 10;
            modifiedScore += bonus;
          }
          break;

        case RuleType.SPEED_BONUS:
          // Handled separately in applySpeedBonus
          break;

        case RuleType.WILDCARD:
          // Wildcard allows skipping one category without penalty
          // This is handled in the "all categories filled" bonus logic
          break;

        case RuleType.THEMED_ROUND:
          // Themed rounds could give bonus if all answers match theme
          // Implementation depends on theme detection
          break;

        case RuleType.STEAL_POINTS:
          // If player successfully challenges, they steal points
          // This is handled in the verification/challenge system
          break;

        default:
          break;
      }
    }

    return Math.floor(modifiedScore);
  }

  /**
   * Apply speed bonus to first submitter
   */
  private applySpeedBonus(
    scores: Map<string, number>,
    submissionTimes: Map<string, number>
  ): void {
    if (!this.pointSystem.speedBonus) return;

    // Find the earliest submission
    let earliestUserId: string | null = null;
    let earliestTime = Infinity;

    for (const [userId, time] of submissionTimes.entries()) {
      if (time < earliestTime) {
        earliestTime = time;
        earliestUserId = userId;
      }
    }

    // Award speed bonus
    if (earliestUserId) {
      const currentScore = scores.get(earliestUserId) || 0;
      scores.set(
        earliestUserId,
        currentScore + this.pointSystem.speedBonus
      );
    }
  }

  /**
   * Calculate final game scores
   */
  calculateFinalScores(
    roundScores: Map<number, Map<string, number>>
  ): Map<string, number> {
    const finalScores = new Map<string, number>();

    for (const [_roundNumber, scores] of roundScores.entries()) {
      for (const [userId, score] of scores.entries()) {
        const currentTotal = finalScores.get(userId) || 0;
        finalScores.set(userId, currentTotal + score);
      }
    }

    return finalScores;
  }

  /**
   * Determine winner(s)
   */
  determineWinners(finalScores: Map<string, number>): string[] {
    if (finalScores.size === 0) return [];

    const maxScore = Math.max(...Array.from(finalScores.values()));
    const winners: string[] = [];

    for (const [userId, score] of finalScores.entries()) {
      if (score === maxScore) {
        winners.push(userId);
      }
    }

    return winners;
  }

  /**
   * Get ranking of players
   */
  getRanking(finalScores: Map<string, number>): Array<{
    userId: string;
    score: number;
    rank: number;
  }> {
    const sorted = Array.from(finalScores.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([userId, score], index) => ({
        userId,
        score,
        rank: index + 1,
      }));

    return sorted;
  }

  /**
   * Calculate statistics for the game
   */
  calculateGameStats(
    finalScores: Map<string, number>,
    numberOfRounds: number
  ): {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalPoints: number;
  } {
    const scores = Array.from(finalScores.values());

    if (scores.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalPoints: 0,
      };
    }

    const totalPoints = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalPoints / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    return {
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      totalPoints,
    };
  }
}

/**
 * Default point system
 */
export const DEFAULT_POINT_SYSTEM: PointSystem = {
  uniqueAnswer: 10,
  duplicateAnswer: 5,
  noAnswer: 0,
  allCategoriesBonus: 10,
  speedBonus: 5,
};
