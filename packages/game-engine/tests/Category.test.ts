import { CategoryModel, BUILTIN_CATEGORIES } from '../src/models/Category';
import { CategoryDifficulty, ValidationRuleType } from '../src/types';

describe('Category Model', () => {
  describe('constructor', () => {
    it('should create a category with default values', () => {
      const category = new CategoryModel({ name: 'Test' });
      expect(category.name).toBe('Test');
      expect(category.id).toBeDefined();
      expect(category.isCustom).toBe(false);
    });

    it('should create a category with provided values', () => {
      const category = new CategoryModel({
        id: 'custom-id',
        name: 'Custom Category',
        description: 'A custom category',
        isCustom: true,
        difficulty: CategoryDifficulty.HARD,
      });

      expect(category.id).toBe('custom-id');
      expect(category.name).toBe('Custom Category');
      expect(category.description).toBe('A custom category');
      expect(category.isCustom).toBe(true);
      expect(category.difficulty).toBe(CategoryDifficulty.HARD);
    });
  });

  describe('validateAnswer', () => {
    let category: CategoryModel;

    beforeEach(() => {
      category = new CategoryModel({
        name: 'Name',
        validationRules: [
          {
            type: ValidationRuleType.MIN_LENGTH,
            value: 2,
            errorMessage: 'Must be at least 2 characters',
          },
        ],
      });
    });

    it('should accept valid answer starting with correct letter', () => {
      const result = category.validateAnswer('Alice', 'A');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject answer starting with wrong letter', () => {
      const result = category.validateAnswer('Bob', 'A');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("must start with letter 'A'");
    });

    it('should reject empty answer', () => {
      const result = category.validateAnswer('', 'A');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Answer cannot be empty');
    });

    it('should reject answer with only whitespace', () => {
      const result = category.validateAnswer('   ', 'A');
      expect(result.valid).toBe(false);
    });

    it('should handle case insensitive letter matching', () => {
      const result1 = category.validateAnswer('alice', 'A');
      expect(result1.valid).toBe(true);

      const result2 = category.validateAnswer('Alice', 'a');
      expect(result2.valid).toBe(true);
    });

    it('should validate minimum length', () => {
      const result = category.validateAnswer('A', 'A');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Must be at least 2 characters');
    });
  });

  describe('validation rules', () => {
    it('should validate max length', () => {
      const category = new CategoryModel({
        name: 'Short',
        validationRules: [
          {
            type: ValidationRuleType.MAX_LENGTH,
            value: 5,
            errorMessage: 'Too long',
          },
        ],
      });

      const valid = category.validateAnswer('Alice', 'A');
      expect(valid.valid).toBe(true);

      const invalid = category.validateAnswer('Alexander', 'A');
      expect(invalid.valid).toBe(false);
      expect(invalid.errors).toContain('Too long');
    });

    it('should validate regex pattern', () => {
      const category = new CategoryModel({
        name: 'Alpha Only',
        validationRules: [
          {
            type: ValidationRuleType.REGEX,
            value: '^[A-Za-z]+$',
            errorMessage: 'Only letters allowed',
          },
        ],
      });

      const valid = category.validateAnswer('Alice', 'A');
      expect(valid.valid).toBe(true);

      const invalid = category.validateAnswer('Alice123', 'A');
      expect(invalid.valid).toBe(false);
      expect(invalid.errors).toContain('Only letters allowed');
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const original = new CategoryModel({
        name: 'Test Category',
        description: 'Test description',
        difficulty: CategoryDifficulty.MEDIUM,
      });

      const json = original.toJSON();
      const restored = CategoryModel.fromJSON(json);

      expect(restored.name).toBe(original.name);
      expect(restored.description).toBe(original.description);
      expect(restored.difficulty).toBe(original.difficulty);
    });
  });

  describe('BUILTIN_CATEGORIES', () => {
    it('should have expected built-in categories', () => {
      expect(BUILTIN_CATEGORIES.length).toBeGreaterThan(0);

      const names = BUILTIN_CATEGORIES.map((c) => c.name);
      expect(names).toContain('Name');
      expect(names).toContain('Place');
      expect(names).toContain('Animal');
      expect(names).toContain('Thing');
    });

    it('should have all built-in categories marked as not custom', () => {
      BUILTIN_CATEGORIES.forEach((category) => {
        expect(category.isCustom).toBe(false);
      });
    });

    it('should have valid IDs for all built-in categories', () => {
      BUILTIN_CATEGORIES.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(category.id.length).toBeGreaterThan(0);
      });
    });
  });
});
