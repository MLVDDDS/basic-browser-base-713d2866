import { describe, it, expect } from 'vitest';
import {
  MODEL_CONFIGS,
  TASK_MODEL_MAPPINGS,
  ESCALATION_RULES,
  getModelConfig,
  getModelForTask,
  getAllowedTiersForTask,
  canUseTierForTask,
  getNextTier,
  canEscalate,
  compareTiers,
  getTierDisplayName,
  getTierDescription,
  estimateCost,
  getRecommendedTier,
  formatTierBadge,
  getAvailableTiers,
  getTaskTypes,
  type ModelTier,
} from '@/lib/model-config';

describe('Model Configuration', () => {
  describe('MODEL_CONFIGS', () => {
    it('should have all required tiers', () => {
      expect(MODEL_CONFIGS).toHaveProperty('fast');
      expect(MODEL_CONFIGS).toHaveProperty('balanced');
      expect(MODEL_CONFIGS).toHaveProperty('quality');
      expect(MODEL_CONFIGS).toHaveProperty('expert');
    });

    it('should have valid config structure for each tier', () => {
      const tiers: ModelTier[] = ['fast', 'balanced', 'quality', 'expert'];
      
      tiers.forEach(tier => {
        const config = MODEL_CONFIGS[tier];
        expect(config.tier).toBe(tier);
        expect(config.model).toBeDefined();
        expect(config.modelId).toBeDefined();
        expect(config.displayName).toBeDefined();
        expect(config.maxTokens).toBeGreaterThan(0);
        expect(config.temperature).toBeGreaterThanOrEqual(0);
        expect(config.temperature).toBeLessThanOrEqual(1);
        expect(config.description).toBeDefined();
        expect(config.costPerMToken.input).toBeGreaterThanOrEqual(0);
        expect(config.costPerMToken.output).toBeGreaterThanOrEqual(0);
        expect(config.avgLatencyMs).toBeGreaterThan(0);
        expect(Array.isArray(config.capabilities)).toBe(true);
        expect(Array.isArray(config.useCases)).toBe(true);
      });
    });

    it('should have increasing maxTokens as tier increases', () => {
      expect(MODEL_CONFIGS.fast.maxTokens).toBeLessThanOrEqual(MODEL_CONFIGS.balanced.maxTokens);
      expect(MODEL_CONFIGS.balanced.maxTokens).toBeLessThanOrEqual(MODEL_CONFIGS.quality.maxTokens);
      expect(MODEL_CONFIGS.quality.maxTokens).toBeLessThanOrEqual(MODEL_CONFIGS.expert.maxTokens);
    });
  });

  describe('TASK_MODEL_MAPPINGS', () => {
    it('should have mappings for common task types', () => {
      const taskTypes = TASK_MODEL_MAPPINGS.map(m => m.taskType);
      
      expect(taskTypes).toContain('generate_component');
      expect(taskTypes).toContain('fix_syntax');
      expect(taskTypes).toContain('auto_debug');
      expect(taskTypes).toContain('validate');
    });

    it('should have valid allowedTiers for each mapping', () => {
      TASK_MODEL_MAPPINGS.forEach(mapping => {
        expect(mapping.allowedTiers.length).toBeGreaterThan(0);
        expect(mapping.allowedTiers).toContain(mapping.defaultTier);
      });
    });
  });

  describe('ESCALATION_RULES', () => {
    it('should have escalation rules', () => {
      expect(ESCALATION_RULES.length).toBeGreaterThan(0);
    });

    it('should have valid tier transitions', () => {
      const validTiers: ModelTier[] = ['fast', 'balanced', 'quality', 'expert'];
      
      ESCALATION_RULES.forEach(rule => {
        expect(validTiers).toContain(rule.fromTier);
        expect(validTiers).toContain(rule.toTier);
        expect(rule.maxAttempts).toBeGreaterThan(0);
        expect(rule.conditions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getModelConfig', () => {
    it('should return correct config for each tier', () => {
      expect(getModelConfig('fast').tier).toBe('fast');
      expect(getModelConfig('balanced').tier).toBe('balanced');
      expect(getModelConfig('quality').tier).toBe('quality');
      expect(getModelConfig('expert').tier).toBe('expert');
    });
  });

  describe('getModelForTask', () => {
    it('should return config for known task types', () => {
      const config = getModelForTask('fix_syntax');
      expect(config.tier).toBe('fast');
    });

    it('should return balanced for unknown task types', () => {
      const config = getModelForTask('unknown_task_type');
      expect(config.tier).toBe('balanced');
    });
  });

  describe('getAllowedTiersForTask', () => {
    it('should return allowed tiers for known tasks', () => {
      const tiers = getAllowedTiersForTask('fix_syntax');
      expect(tiers).toContain('fast');
    });

    it('should return balanced for unknown tasks', () => {
      const tiers = getAllowedTiersForTask('unknown');
      expect(tiers).toEqual(['balanced']);
    });
  });

  describe('canUseTierForTask', () => {
    it('should return true for allowed tier', () => {
      expect(canUseTierForTask('fast', 'fix_syntax')).toBe(true);
    });

    it('should return false for disallowed tier', () => {
      expect(canUseTierForTask('expert', 'fix_syntax')).toBe(false);
    });
  });

  describe('getNextTier', () => {
    it('should return next tier in order', () => {
      expect(getNextTier('fast')).toBe('balanced');
      expect(getNextTier('balanced')).toBe('quality');
      expect(getNextTier('quality')).toBe('expert');
      expect(getNextTier('expert')).toBe('expert');
    });
  });

  describe('canEscalate', () => {
    it('should return true for non-expert tiers', () => {
      expect(canEscalate('fast')).toBe(true);
      expect(canEscalate('balanced')).toBe(true);
      expect(canEscalate('quality')).toBe(true);
    });

    it('should return false for expert tier', () => {
      expect(canEscalate('expert')).toBe(false);
    });
  });

  describe('compareTiers', () => {
    it('should correctly compare tiers', () => {
      expect(compareTiers('fast', 'balanced')).toBeLessThan(0);
      expect(compareTiers('balanced', 'balanced')).toBe(0);
      expect(compareTiers('expert', 'fast')).toBeGreaterThan(0);
    });
  });

  describe('getTierDisplayName', () => {
    it('should return display names', () => {
      expect(getTierDisplayName('fast')).toContain('Fast');
      expect(getTierDisplayName('expert')).toContain('Expert');
    });
  });

  describe('getTierDescription', () => {
    it('should return descriptions', () => {
      expect(getTierDescription('fast').length).toBeGreaterThan(0);
      expect(getTierDescription('expert').length).toBeGreaterThan(0);
    });
  });

  describe('estimateCost', () => {
    it('should calculate cost correctly', () => {
      const cost = estimateCost('balanced', 1000000, 500000);
      
      expect(cost.inputCost).toBeGreaterThan(0);
      expect(cost.outputCost).toBeGreaterThan(0);
      expect(cost.totalCost).toBe(cost.inputCost + cost.outputCost);
    });

    it('should return zero for zero tokens', () => {
      const cost = estimateCost('fast', 0, 0);
      expect(cost.totalCost).toBe(0);
    });
  });

  describe('getRecommendedTier', () => {
    it('should recommend fast for simple syntax fixes', () => {
      const tier = getRecommendedTier({
        taskType: 'fix_syntax',
        fileCount: 1,
        errorSeverity: 'low',
        previousAttempts: 0,
      });
      expect(tier).toBe('fast');
    });

    it('should upgrade for critical errors', () => {
      const tier = getRecommendedTier({
        taskType: 'fix_syntax',
        fileCount: 1,
        errorSeverity: 'critical',
        previousAttempts: 0,
      });
      expect(tier).toBe('quality');
    });

    it('should upgrade after multiple attempts', () => {
      const tier = getRecommendedTier({
        taskType: 'fix_syntax',
        fileCount: 1,
        errorSeverity: 'low',
        previousAttempts: 2,
      });
      expect(compareTiers(tier, 'fast')).toBeGreaterThan(0);
    });

    it('should upgrade for many files', () => {
      const tier = getRecommendedTier({
        taskType: 'validate',
        fileCount: 10,
        previousAttempts: 0,
      });
      expect(tier).toBe('quality');
    });
  });

  describe('formatTierBadge', () => {
    it('should return badge info for all tiers', () => {
      const tiers: ModelTier[] = ['fast', 'balanced', 'quality', 'expert'];
      
      tiers.forEach(tier => {
        const badge = formatTierBadge(tier);
        expect(badge.label).toBeDefined();
        expect(badge.color).toMatch(/^bg-/);
        expect(badge.icon).toBeDefined();
      });
    });
  });

  describe('getAvailableTiers', () => {
    it('should return all tiers in order', () => {
      const tiers = getAvailableTiers();
      expect(tiers).toEqual(['fast', 'balanced', 'quality', 'expert']);
    });
  });

  describe('getTaskTypes', () => {
    it('should return all task types', () => {
      const taskTypes = getTaskTypes();
      expect(taskTypes.length).toBe(TASK_MODEL_MAPPINGS.length);
    });
  });
});
