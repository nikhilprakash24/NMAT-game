import {
  generateRandomLetter,
  generateLetterByDifficulty,
  isRareLetter,
  getLetterDifficulty,
  generateLetterSequence,
  generateBalancedSequence,
} from '../src/utils/letterGenerator';

describe('Letter Generator', () => {
  describe('generateRandomLetter', () => {
    it('should generate a valid letter', () => {
      const letter = generateRandomLetter();
      expect(letter).toMatch(/^[A-Z]$/);
    });

    it('should generate different letters over multiple calls', () => {
      const letters = new Set<string>();
      for (let i = 0; i < 50; i++) {
        letters.add(generateRandomLetter());
      }
      // Should have at least some variety
      expect(letters.size).toBeGreaterThan(5);
    });
  });

  describe('generateLetterByDifficulty', () => {
    it('should generate easy letters', () => {
      const easyLetters = ['A', 'B', 'C', 'D', 'E', 'M', 'P', 'S', 'T'];
      const letter = generateLetterByDifficulty('easy');
      expect(easyLetters).toContain(letter);
    });

    it('should generate medium letters', () => {
      const mediumLetters = ['F', 'G', 'H', 'I', 'L', 'N', 'O', 'R', 'W'];
      const letter = generateLetterByDifficulty('medium');
      expect(mediumLetters).toContain(letter);
    });

    it('should generate hard letters', () => {
      const hardLetters = ['J', 'K', 'U', 'V', 'Y', 'Q', 'X', 'Z'];
      const letter = generateLetterByDifficulty('hard');
      expect(hardLetters).toContain(letter);
    });
  });

  describe('isRareLetter', () => {
    it('should identify rare letters', () => {
      expect(isRareLetter('Q')).toBe(true);
      expect(isRareLetter('X')).toBe(true);
      expect(isRareLetter('Z')).toBe(true);
    });

    it('should identify common letters', () => {
      expect(isRareLetter('A')).toBe(false);
      expect(isRareLetter('B')).toBe(false);
      expect(isRareLetter('S')).toBe(false);
    });

    it('should handle lowercase', () => {
      expect(isRareLetter('q')).toBe(true);
      expect(isRareLetter('x')).toBe(true);
    });
  });

  describe('getLetterDifficulty', () => {
    it('should return easy for easy letters', () => {
      expect(getLetterDifficulty('A')).toBe('easy');
      expect(getLetterDifficulty('S')).toBe('easy');
    });

    it('should return medium for medium letters', () => {
      expect(getLetterDifficulty('F')).toBe('medium');
      expect(getLetterDifficulty('L')).toBe('medium');
    });

    it('should return hard for hard letters', () => {
      expect(getLetterDifficulty('Q')).toBe('hard');
      expect(getLetterDifficulty('X')).toBe('hard');
    });
  });

  describe('generateLetterSequence', () => {
    it('should generate correct number of letters', () => {
      const sequence = generateLetterSequence(5);
      expect(sequence).toHaveLength(5);
    });

    it('should generate all valid letters', () => {
      const sequence = generateLetterSequence(10);
      sequence.forEach((letter) => {
        expect(letter).toMatch(/^[A-Z]$/);
      });
    });

    it('should avoid immediate repeats when requested', () => {
      const sequence = generateLetterSequence(10, true);
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).not.toBe(sequence[i - 1]);
      }
    });
  });

  describe('generateBalancedSequence', () => {
    it('should generate correct number of letters', () => {
      const sequence = generateBalancedSequence(9);
      expect(sequence).toHaveLength(9);
    });

    it('should have balanced difficulty distribution', () => {
      const sequence = generateBalancedSequence(9);
      const difficulties = sequence.map((letter) => getLetterDifficulty(letter));

      const easy = difficulties.filter((d) => d === 'easy').length;
      const medium = difficulties.filter((d) => d === 'medium').length;
      const hard = difficulties.filter((d) => d === 'hard').length;

      // Should have roughly equal distribution
      expect(easy).toBeGreaterThan(0);
      expect(medium).toBeGreaterThan(0);
      expect(hard).toBeGreaterThan(0);
    });

    it('should avoid consecutive duplicates', () => {
      const sequence = generateBalancedSequence(10);
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).not.toBe(sequence[i - 1]);
      }
    });
  });
});
