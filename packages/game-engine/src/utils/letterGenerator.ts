/**
 * Letter Generator Utility
 * Generates random letters for game rounds with weighted probabilities
 */

// Letter frequencies based on English usage (adjusted for game fun)
const LETTER_WEIGHTS: { [key: string]: number } = {
  A: 8,
  B: 6,
  C: 7,
  D: 6,
  E: 8,
  F: 5,
  G: 5,
  H: 5,
  I: 7,
  J: 3,
  K: 4,
  L: 6,
  M: 7,
  N: 6,
  O: 7,
  P: 6,
  Q: 1, // Rare letter
  R: 7,
  S: 8,
  T: 8,
  U: 5,
  V: 4,
  W: 5,
  X: 1, // Rare letter
  Y: 4,
  Z: 1, // Rare letter
};

const RARE_LETTERS = ['Q', 'X', 'Z'];
const EASY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'M', 'P', 'S', 'T'];
const MEDIUM_LETTERS = ['F', 'G', 'H', 'I', 'L', 'N', 'O', 'R', 'W'];
const HARD_LETTERS = ['J', 'K', 'U', 'V', 'Y', ...RARE_LETTERS];

/**
 * Generate a random letter based on weighted probabilities
 */
export function generateRandomLetter(): string {
  const letters = Object.keys(LETTER_WEIGHTS);
  const weights = Object.values(LETTER_WEIGHTS);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  let random = Math.random() * totalWeight;

  for (let i = 0; i < letters.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return letters[i];
    }
  }

  // Fallback (should never reach here)
  return 'A';
}

/**
 * Generate a letter based on difficulty
 */
export function generateLetterByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  let letterPool: string[];

  switch (difficulty) {
    case 'easy':
      letterPool = EASY_LETTERS;
      break;
    case 'medium':
      letterPool = MEDIUM_LETTERS;
      break;
    case 'hard':
      letterPool = HARD_LETTERS;
      break;
    default:
      return generateRandomLetter();
  }

  return letterPool[Math.floor(Math.random() * letterPool.length)];
}

/**
 * Check if a letter is rare
 */
export function isRareLetter(letter: string): boolean {
  return RARE_LETTERS.includes(letter.toUpperCase());
}

/**
 * Get difficulty of a letter
 */
export function getLetterDifficulty(
  letter: string
): 'easy' | 'medium' | 'hard' {
  const upperLetter = letter.toUpperCase();

  if (EASY_LETTERS.includes(upperLetter)) return 'easy';
  if (MEDIUM_LETTERS.includes(upperLetter)) return 'medium';
  return 'hard';
}

/**
 * Generate a sequence of letters for multiple rounds
 * Ensures no immediate repeats and balanced difficulty
 */
export function generateLetterSequence(
  numberOfRounds: number,
  avoidRepeats = true
): string[] {
  const sequence: string[] = [];
  let lastLetter = '';

  for (let i = 0; i < numberOfRounds; i++) {
    let letter: string;

    do {
      letter = generateRandomLetter();
    } while (avoidRepeats && letter === lastLetter && numberOfRounds > 1);

    sequence.push(letter);
    lastLetter = letter;
  }

  return sequence;
}

/**
 * Generate balanced sequence (mix of difficulties)
 */
export function generateBalancedSequence(numberOfRounds: number): string[] {
  const sequence: string[] = [];
  const difficulties: Array<'easy' | 'medium' | 'hard'> = [];

  // Create a balanced difficulty distribution
  for (let i = 0; i < numberOfRounds; i++) {
    if (i % 3 === 0) difficulties.push('easy');
    else if (i % 3 === 1) difficulties.push('medium');
    else difficulties.push('hard');
  }

  // Shuffle difficulties
  for (let i = difficulties.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
  }

  // Generate letters based on difficulty
  let lastLetter = '';
  for (const difficulty of difficulties) {
    let letter: string;

    do {
      letter = generateLetterByDifficulty(difficulty);
    } while (letter === lastLetter);

    sequence.push(letter);
    lastLetter = letter;
  }

  return sequence;
}
