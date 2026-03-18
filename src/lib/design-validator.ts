/**
 * 🔍 Design Validator v2.0
 * 
 * Валидация сгенерированного дизайна на соответствие
 * стандартам качества, доступности и UX.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type IssueType = 'error' | 'warning' | 'info';
export type IssueCategory = 
  | 'accessibility'
  | 'contrast'
  | 'layout'
  | 'components'
  | 'imports'
  | 'tailwind'
  | 'ux'
  | 'performance';

export interface DesignIssue {
  type: IssueType;
  category: IssueCategory;
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface ValidationResult {
  score: number;        // 0-100
  passed: boolean;      // score >= threshold
  issues: DesignIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export interface ValidationOptions {
  minScore?: number;
  strictMode?: boolean;
  checkAccessibility?: boolean;
  checkContrast?: boolean;
  checkTailwind?: boolean;
  checkImports?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

const FORBIDDEN_PATTERNS = [
  {
    pattern: /style={{/,
    message: 'Inline styles detected',
    suggestion: 'Use Tailwind classes instead',
    category: 'tailwind' as IssueCategory,
  },
  {
    pattern: /className="[^"]*text-white[^"]*bg-white/,
    message: 'Invisible white text on white bg',
    category: 'contrast' as IssueCategory,
    severity: 'error' as IssueType,
  },
  {
    pattern: /className="[^"]*text-black[^"]*bg-black/,
    message: 'Invisible black text on black bg',
    category: 'contrast' as IssueCategory,
    severity: 'error' as IssueType,
  },
  {
    pattern: /text-\[\d+px\]/,
    message: 'Arbitrary pixel font sizes',
    suggestion: 'Use Tailwind font scale',
    category: 'tailwind' as IssueCategory,
  },
  {
    pattern: /w-\[\d+px\].*h-\[\d+px\]/,
    message: 'Fixed pixel dimensions',
    suggestion: 'Use responsive units',
    category: 'tailwind' as IssueCategory,
  },
];

const REQUIRED_PATTERNS = [
  { pattern: /import.*from ['"]@\/components\/ui/, files: ['*.tsx'], message: 'Should import UI components' },
  { pattern: /import.*cn.*from ['"]@\/lib\/utils/, files: ['*.tsx'], message: 'Should use cn() for class merging' },
  { pattern: /className=/, files: ['*.tsx'], message: 'Should use Tailwind classes' },
];

const ACCESSIBILITY_CHECKS = [
  { pattern: /<img[^>]*(?!alt=)/, message: 'Image missing alt attribute', category: 'accessibility' as IssueCategory },
  { pattern: /<button[^>]*(?!aria-)/, message: 'Button may need aria attributes', category: 'accessibility' as IssueCategory },
  { pattern: /<a[^>]*href="#"[^>]*>/, message: 'Empty href="#" link', category: 'ux' as IssueCategory },
  { pattern: /onClick=[^}]*}\s*>(?![^<]*<\/button)/, message: 'Clickable non-button element', category: 'accessibility' as IssueCategory },
];

const UX_CHECKS = [
  { pattern: /placeholder=".*[а-яА-Я]{20,}/, message: 'Very long placeholder text', category: 'ux' as IssueCategory },
  { pattern: /text-xs.*text-muted/, message: 'Very small muted text may be hard to read', category: 'ux' as IssueCategory },
  { pattern: /<form[^>]*(?!onSubmit)/, message: 'Form without onSubmit handler', category: 'ux' as IssueCategory },
];

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Валидировать файлы проекта
 */
export function validateDesign(
  files: Record<string, string>,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    minScore = 70,
    strictMode = false,
    checkAccessibility = true,
    checkContrast = true,
    checkTailwind = true,
    checkImports = true,
  } = options;

  const issues: DesignIssue[] = [];

  for (const [path, content] of Object.entries(files)) {
    // Skip non-code files
    if (!path.match(/\.(tsx?|jsx?)$/)) continue;

    // Check forbidden patterns
    for (const { pattern, message, suggestion, category, severity } of FORBIDDEN_PATTERNS) {
      if (category === 'contrast' && !checkContrast) continue;
      if (pattern.test(content)) {
        issues.push({
          type: severity ?? (strictMode ? 'error' : 'warning'),
          category: category ?? 'tailwind',
          file: path,
          message,
          suggestion,
          autoFixable: false,
        });
      }
    }

    // Check required patterns for component files
    if (path.includes('/components/') || path.includes('/pages/')) {
      if (checkImports) {
        // Check for proper imports
        if (!content.includes("from '@/components/ui") && !content.includes("from \"@/components/ui")) {
          if (content.includes('Button') || content.includes('Card') || content.includes('Input')) {
            issues.push({
              type: 'warning',
              category: 'imports',
              file: path,
              message: 'UI components should be imported from @/components/ui',
              suggestion: "Import from '@/components/ui/component-name'",
            });
          }
        }

        // Check for cn utility
        if (content.includes('className=') && content.includes('+') && !content.includes('cn(')) {
          issues.push({
            type: 'warning',
            category: 'tailwind',
            file: path,
            message: 'String concatenation in className',
            suggestion: 'Use cn() from @/lib/utils for class merging',
            autoFixable: true,
          });
        }
      }

      // Accessibility checks
      if (checkAccessibility) {
        for (const { pattern, message, category } of ACCESSIBILITY_CHECKS) {
          if (pattern.test(content)) {
            issues.push({
              type: 'warning',
              category,
              file: path,
              message,
            });
          }
        }
      }

      // UX checks
      for (const { pattern, message, category } of UX_CHECKS) {
        if (pattern.test(content)) {
          issues.push({
            type: 'info',
            category,
            file: path,
            message,
          });
        }
      }
    }

    // Check for proper Tailwind usage
    if (checkTailwind) {
      // Check for semantic color usage
      const rawColors = content.match(/(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|gray)-\d{2,3}/g);
      if (rawColors && rawColors.length > 5) {
        issues.push({
          type: 'warning',
          category: 'tailwind',
          file: path,
          message: 'Heavy use of raw Tailwind colors instead of semantic tokens',
          suggestion: 'Use semantic colors: bg-background, text-foreground, bg-primary, etc.',
        });
      }
    }

    // Check for responsive design
    if (path.includes('App.tsx') || path.includes('/pages/')) {
      if (!content.includes('md:') && !content.includes('lg:') && !content.includes('sm:')) {
        issues.push({
          type: 'info',
          category: 'layout',
          file: path,
          message: 'No responsive breakpoints detected',
          suggestion: 'Add responsive classes like sm:, md:, lg: for different screen sizes',
        });
      }
    }

    // Check for animations
    if (path.includes('App.tsx') || path.includes('/components/')) {
      if (!content.includes('motion.') && !content.includes('animate-') && !content.includes('transition-')) {
        issues.push({
          type: 'info',
          category: 'ux',
          file: path,
          message: 'No animations detected',
          suggestion: 'Consider adding framer-motion or Tailwind transitions for better UX',
        });
      }
    }
  }

  // Calculate score
  const errorWeight = 10;
  const warningWeight = 3;
  const infoWeight = 3;
  
  const summary = {
    errors: issues.filter(i => i.type === 'error').length,
    warnings: issues.filter(i => i.type === 'warning').length,
    info: issues.filter(i => i.type === 'info').length,
  };

  const totalDeduction = 
    summary.errors * errorWeight +
    summary.warnings * warningWeight +
    summary.info * infoWeight;

  const score = Math.max(0, Math.min(100, 100 - totalDeduction));

  return {
    score,
    passed: score >= minScore,
    issues,
    summary,
  };
}

/**
 * Получить краткий отчёт о валидации
 */
export function getValidationSummary(result: ValidationResult): string {
  const { score, passed, summary } = result;
  
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  
  return `
Design Validation: ${status} (Score: ${score}/100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Errors: ${summary.errors}
⚠️ Warnings: ${summary.warnings}
ℹ️ Info: ${summary.info}
${result.issues.slice(0, 5).map(i => `  ${i.type === 'error' ? '❌' : i.type === 'warning' ? '⚠️' : 'ℹ️'} ${i.file}: ${i.message}`).join('\n')}
${result.issues.length > 5 ? `  ... and ${result.issues.length - 5} more` : ''}
`;
}

/**
 * Автоматически исправить некоторые проблемы
 */
export function autoFixDesignIssues(
  files: Record<string, string>,
  issues: DesignIssue[]
): Record<string, string> {
  const fixed = { ...files };

  for (const issue of issues) {
    if (!issue.autoFixable) continue;

    const content = fixed[issue.file];
    if (!content) continue;

    // Add more auto-fix rules here
    // Example: Replace string concatenation with cn()
    if (issue.message === 'String concatenation in className') {
      // This would need a more sophisticated parser
      // For now, just flag it
    }
  }

  return fixed;
}

/**
 * Проверить контрастность цветов
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  // Simplified contrast check
  // In production, use proper color parsing and WCAG formula
  
  const ratio = 4.5; // Placeholder
  
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}
