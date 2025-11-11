/**
 * NMAT Game Engine
 * Core game logic for the Networked Name-Place-Animal-Thing game
 *
 * @packageDocumentation
 */

// Export all types
export * from './types';

// Export models
export { CategoryModel, BUILTIN_CATEGORIES } from './models/Category';
export { GameSessionManager } from './models/GameSession';

// Export scoring system
export { ScoringSystem, DEFAULT_POINT_SYSTEM } from './scoring/ScoringSystem';

// Export utilities
export {
  generateRandomLetter,
  generateLetterByDifficulty,
  isRareLetter,
  getLetterDifficulty,
  generateLetterSequence,
  generateBalancedSequence,
} from './utils/letterGenerator';
