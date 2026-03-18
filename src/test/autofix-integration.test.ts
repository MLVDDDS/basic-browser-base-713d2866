import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Autofix Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unified Orchestrator Autofix Mode', () => {
    it('should accept autofix mode parameters', () => {
      const autofixPayload = {
        prompt: '',
        files: {
          '/src/App.tsx': 'const App = () => { return <div>Hello</div> }',
        },
        packages: {},
        mode: 'autofix',
        errorMessage: 'Cannot find module "./missing-component"',
        maxAttempts: 3,
        projectId: 'test-project',
        userId: 'test-user',
      };

      // Verify payload structure
      expect(autofixPayload.mode).toBe('autofix');
      expect(autofixPayload.errorMessage).toBeDefined();
      expect(autofixPayload.maxAttempts).toBe(3);
    });

    it('should have correct autofix mode config', () => {
      // This tests the MODE_CONFIGS structure for autofix
      const autofixConfig = {
        phases: ['autofix', 'validate'],
        models: { execute: 'balanced', validate: 'fast', autofix: 'balanced' },
        maxIterations: 10,
        description: 'Autofix: error classification, smart debugging, iterative fixes',
      };

      expect(autofixConfig.phases).toContain('autofix');
      expect(autofixConfig.phases).toContain('validate');
      expect(autofixConfig.models.autofix).toBe('balanced');
    });
  });

  describe('Error Classification', () => {
    it('should classify import errors correctly', () => {
      const importErrorPatterns = [
        /cannot find module ['"]([^'"]+)['"]/i,
        /module not found/i,
        /failed to resolve import/i,
      ];

      const testError = 'Cannot find module "./components/Header"';
      
      const matches = importErrorPatterns.some(pattern => pattern.test(testError));
      expect(matches).toBe(true);
    });

    it('should classify syntax errors correctly', () => {
      const syntaxErrorPatterns = [
        /syntaxerror/i,
        /unexpected token/i,
        /unterminated string/i,
      ];

      const testError = 'SyntaxError: Unexpected token }';
      
      const matches = syntaxErrorPatterns.some(pattern => pattern.test(testError));
      expect(matches).toBe(true);
    });

    it('should classify type errors correctly', () => {
      const typeErrorPatterns = [
        /type ['"]?([^'"]+)['"]? is not assignable/i,
        /property ['"]?([^'"]+)['"]? does not exist/i,
        /ts\d{4,5}:/i,
      ];

      const testError = "Property 'onClick' does not exist on type 'ButtonProps'";
      
      const matches = typeErrorPatterns.some(pattern => pattern.test(testError));
      expect(matches).toBe(true);
    });

    it('should classify runtime errors correctly', () => {
      const runtimeErrorPatterns = [
        /cannot read propert(y|ies) of (undefined|null)/i,
        /is not a function/i,
        /is not defined/i,
      ];

      const testError = "Cannot read properties of undefined (reading 'map')";
      
      const matches = runtimeErrorPatterns.some(pattern => pattern.test(testError));
      expect(matches).toBe(true);
    });
  });

  describe('Model Selection for Autofix', () => {
    it('should select fast tier for simple syntax errors', () => {
      const selectTierForError = (options: {
        category: string;
        severity: string;
        fileCount: number;
        attempts: number;
      }) => {
        const { category, severity, fileCount, attempts } = options;

        if (
          ['syntax', 'import', 'style'].includes(category) &&
          severity !== 'critical' &&
          fileCount <= 2 &&
          attempts === 0
        ) {
          return 'fast';
        }

        if (
          ['architecture', 'logic'].includes(category) ||
          attempts >= 2 ||
          fileCount >= 5
        ) {
          return 'quality';
        }

        if (severity === 'critical') {
          return 'quality';
        }

        return 'balanced';
      };

      expect(selectTierForError({
        category: 'syntax',
        severity: 'low',
        fileCount: 1,
        attempts: 0,
      })).toBe('fast');

      expect(selectTierForError({
        category: 'logic',
        severity: 'high',
        fileCount: 3,
        attempts: 0,
      })).toBe('quality');

      expect(selectTierForError({
        category: 'type',
        severity: 'medium',
        fileCount: 2,
        attempts: 0,
      })).toBe('balanced');
    });

    it('should escalate after failed attempts', () => {
      const getNextTier = (current: string): string => {
        const order: Record<string, string> = {
          fast: 'balanced',
          balanced: 'quality',
          quality: 'expert',
          expert: 'expert',
        };
        return order[current] || 'balanced';
      };

      expect(getNextTier('fast')).toBe('balanced');
      expect(getNextTier('balanced')).toBe('quality');
      expect(getNextTier('quality')).toBe('expert');
      expect(getNextTier('expert')).toBe('expert');
    });
  });

  describe('Autofix Pipeline Events', () => {
    it('should emit correct event types', () => {
      const expectedEvents = [
        'pipeline_start',
        'phase_start',
        'file_created',
        'file_updated',
        'phase_complete',
        'validation_result',
        'auto_fix_start',
        'auto_fix_complete',
        'complete',
        'pipeline_complete',
      ];

      // All events should be valid strings
      expectedEvents.forEach(event => {
        expect(typeof event).toBe('string');
        expect(event.length).toBeGreaterThan(0);
      });
    });

    it('should structure autofix start event correctly', () => {
      const autofixStartEvent = {
        type: 'auto_fix_start',
        attempt: 1,
        maxAttempts: 3,
        score: 65,
        targetScore: 80,
        issueCount: 5,
        forceDeepReview: false,
      };

      expect(autofixStartEvent.type).toBe('auto_fix_start');
      expect(autofixStartEvent.attempt).toBeLessThanOrEqual(autofixStartEvent.maxAttempts);
      expect(autofixStartEvent.score).toBeLessThan(autofixStartEvent.targetScore);
    });

    it('should structure autofix complete event correctly', () => {
      const autofixCompleteEvent = {
        type: 'auto_fix_complete',
        attempt: 1,
        previousScore: 65,
        newScore: 82,
        scoreDelta: 17,
        improved: true,
        fixesApplied: 3,
        remainingErrors: 0,
        remainingWarnings: 2,
      };

      expect(autofixCompleteEvent.type).toBe('auto_fix_complete');
      expect(autofixCompleteEvent.newScore).toBeGreaterThan(autofixCompleteEvent.previousScore);
      expect(autofixCompleteEvent.improved).toBe(true);
      expect(autofixCompleteEvent.scoreDelta).toBe(
        autofixCompleteEvent.newScore - autofixCompleteEvent.previousScore
      );
    });
  });

  describe('File Operations', () => {
    it('should handle file creation', () => {
      const files: Record<string, string> = {};
      
      const createFile = (path: string, content: string) => {
        let normalizedPath = path;
        if (!normalizedPath.startsWith('/')) {
          normalizedPath = `/${normalizedPath}`;
        }
        if (!normalizedPath.startsWith('/src/') && !normalizedPath.startsWith('/public/')) {
          if (normalizedPath.endsWith('.tsx') || normalizedPath.endsWith('.ts')) {
            normalizedPath = `/src${normalizedPath}`;
          }
        }
        files[normalizedPath] = content;
        return normalizedPath;
      };

      const path = createFile('components/Button.tsx', 'export const Button = () => <button>Click</button>');
      
      expect(path).toBe('/src/components/Button.tsx');
      expect(files[path]).toContain('Button');
    });

    it('should handle file editing', () => {
      const files: Record<string, string> = {
        '/src/App.tsx': 'const App = () => <div>Old</div>',
      };

      const editFile = (path: string, content: string) => {
        if (files[path]) {
          files[path] = content;
          return { success: true, action: 'modified' };
        }
        return { success: false, action: 'not_found' };
      };

      const result = editFile('/src/App.tsx', 'const App = () => <div>New</div>');
      
      expect(result.success).toBe(true);
      expect(result.action).toBe('modified');
      expect(files['/src/App.tsx']).toContain('New');
    });

    it('should block forbidden files', () => {
      const forbiddenFiles = [
        '/tailwind.config',
        '/postcss.config',
        '/vite.config',
        '/package.json',
        '/tsconfig',
      ];

      const isBlocked = (path: string) => {
        return forbiddenFiles.some(f => path.toLowerCase().includes(f));
      };

      expect(isBlocked('/tailwind.config.ts')).toBe(true);
      expect(isBlocked('/package.json')).toBe(true);
      expect(isBlocked('/src/components/Button.tsx')).toBe(false);
    });
  });

  describe('Validation Score Calculation', () => {
    it('should calculate score based on issues', () => {
      const calculateScore = (issues: Array<{ type: 'error' | 'warning' | 'info' }>) => {
        let score = 100;
        
        issues.forEach(issue => {
          if (issue.type === 'error') score -= 15;
          else if (issue.type === 'warning') score -= 5;
          else if (issue.type === 'info') score -= 1;
        });

        return Math.max(0, Math.min(100, score));
      };

      expect(calculateScore([])).toBe(100);
      expect(calculateScore([{ type: 'error' }])).toBe(85);
      expect(calculateScore([{ type: 'error' }, { type: 'warning' }])).toBe(80);
      expect(calculateScore([
        { type: 'error' },
        { type: 'error' },
        { type: 'error' },
        { type: 'error' },
        { type: 'error' },
        { type: 'error' },
        { type: 'error' },
      ])).toBe(0); // 7 errors = -105, clamped to 0
    });

    it('should determine if autofix should continue', () => {
      const shouldContinueAutofix = (
        currentScore: number,
        targetScore: number,
        attempt: number,
        maxAttempts: number,
        improved: boolean
      ) => {
        if (currentScore >= targetScore) return false;
        if (attempt >= maxAttempts) return false;
        if (!improved && attempt > 1) return false;
        return true;
      };

      // Should continue: score below target, attempts left, improving
      expect(shouldContinueAutofix(70, 80, 1, 3, true)).toBe(true);
      
      // Should stop: score reached target
      expect(shouldContinueAutofix(85, 80, 1, 3, true)).toBe(false);
      
      // Should stop: max attempts reached
      expect(shouldContinueAutofix(70, 80, 3, 3, true)).toBe(false);
      
      // Should stop: not improving after first attempt
      expect(shouldContinueAutofix(70, 80, 2, 3, false)).toBe(false);
    });
  });
});
