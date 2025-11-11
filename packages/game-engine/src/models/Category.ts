import {
  Category,
  CategoryDifficulty,
  ValidationRule,
  ValidationRuleType,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Category Model
 * Represents a game category (e.g., Name, Place, Animal, Thing)
 */
export class CategoryModel implements Category {
  id: string;
  name: string;
  description?: string;
  examples?: string[];
  validationRules?: ValidationRule[];
  isCustom: boolean;
  difficulty?: CategoryDifficulty;

  constructor(data: Partial<Category>) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description;
    this.examples = data.examples || [];
    this.validationRules = data.validationRules || [];
    this.isCustom = data.isCustom || false;
    this.difficulty = data.difficulty;
  }

  /**
   * Validates an answer against this category's rules
   */
  validateAnswer(answer: string, letter: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Empty answer check
    if (!answer || answer.trim().length === 0) {
      return { valid: false, errors: ['Answer cannot be empty'] };
    }

    const trimmedAnswer = answer.trim();

    // Check if answer starts with the required letter
    if (trimmedAnswer[0].toUpperCase() !== letter.toUpperCase()) {
      errors.push(`Answer must start with letter '${letter.toUpperCase()}'`);
    }

    // Apply custom validation rules
    if (this.validationRules) {
      for (const rule of this.validationRules) {
        const ruleResult = this.applyValidationRule(trimmedAnswer, rule);
        if (!ruleResult.valid) {
          errors.push(ruleResult.error || rule.errorMessage);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply a single validation rule
   */
  private applyValidationRule(
    answer: string,
    rule: ValidationRule
  ): { valid: boolean; error?: string } {
    switch (rule.type) {
      case ValidationRuleType.MIN_LENGTH:
        if (answer.length < rule.value) {
          return {
            valid: false,
            error: rule.errorMessage,
          };
        }
        break;

      case ValidationRuleType.MAX_LENGTH:
        if (answer.length > rule.value) {
          return {
            valid: false,
            error: rule.errorMessage,
          };
        }
        break;

      case ValidationRuleType.REGEX:
        const regex = new RegExp(rule.value);
        if (!regex.test(answer)) {
          return {
            valid: false,
            error: rule.errorMessage,
          };
        }
        break;

      case ValidationRuleType.DICTIONARY:
        // Dictionary validation would check against a word list
        // For now, we'll just accept anything
        // TODO: Implement dictionary validation
        break;

      case ValidationRuleType.CUSTOM:
        // Custom validation would be implemented by the user
        // For now, we'll just accept anything
        break;

      default:
        break;
    }

    return { valid: true };
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Category {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      examples: this.examples,
      validationRules: this.validationRules,
      isCustom: this.isCustom,
      difficulty: this.difficulty,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Category): CategoryModel {
    return new CategoryModel(data);
  }
}

/**
 * Built-in categories
 */
export const BUILTIN_CATEGORIES: Category[] = [
  {
    id: 'cat_name',
    name: 'Name',
    description: 'First names of people',
    examples: ['Alice', 'Bob', 'Charlie'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Name must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_place',
    name: 'Place',
    description: 'Cities, countries, or locations',
    examples: ['Paris', 'Brazil', 'Mount Everest'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Place must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_animal',
    name: 'Animal',
    description: 'Any living creature',
    examples: ['Elephant', 'Butterfly', 'Dolphin'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Animal must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_thing',
    name: 'Thing',
    description: 'Any object or item',
    examples: ['Table', 'Phone', 'Book'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Thing must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_food',
    name: 'Food',
    description: 'Any edible item',
    examples: ['Apple', 'Pizza', 'Chocolate'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Food must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_brand',
    name: 'Brand',
    description: 'Company or product brand',
    examples: ['Apple', 'Nike', 'Toyota'],
    isCustom: false,
    difficulty: CategoryDifficulty.MEDIUM,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Brand must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_movie',
    name: 'Movie',
    description: 'Movie or TV show title',
    examples: ['Inception', 'Friends', 'Avatar'],
    isCustom: false,
    difficulty: CategoryDifficulty.MEDIUM,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Movie must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_celebrity',
    name: 'Celebrity',
    description: 'Famous person',
    examples: ['Taylor Swift', 'Tom Hanks', 'Beyoncé'],
    isCustom: false,
    difficulty: CategoryDifficulty.MEDIUM,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Celebrity must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_sport',
    name: 'Sport',
    description: 'Sport or physical activity',
    examples: ['Basketball', 'Soccer', 'Tennis'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Sport must be at least 2 characters',
      },
    ],
  },
  {
    id: 'cat_country',
    name: 'Country',
    description: 'Any country in the world',
    examples: ['France', 'Japan', 'Brazil'],
    isCustom: false,
    difficulty: CategoryDifficulty.EASY,
    validationRules: [
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 2,
        errorMessage: 'Country must be at least 2 characters',
      },
    ],
  },
];
