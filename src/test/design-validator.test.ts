/**
 * 🧪 Design Validator Tests
 */
import { describe, it, expect } from 'vitest';
import { 
  validateDesign, 
  getValidationSummary, 
  autoFixDesignIssues,
  checkColorContrast,
  type ValidationResult,
  type DesignIssue
} from '@/lib/design-validator';

describe('Design Validator', () => {
  
  describe('validateDesign', () => {
    
    it('should pass for valid React code', () => {
      const files = {
        'src/App.tsx': `
          import { Button } from '@/components/ui/button';
          import { cn } from '@/lib/utils';
          
          export default function App() {
            return (
              <div className="min-h-screen bg-background md:flex">
                <Button className={cn("transition-all", "hover:scale-105")}>
                  Click me
                </Button>
              </div>
            );
          }
        `,
        'src/main.tsx': `
          import React from 'react';
          import ReactDOM from 'react-dom/client';
          import App from './App';
          import './index.css';
          
          ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
        `,
        'src/index.css': '@tailwind base; @tailwind components; @tailwind utilities;',
      };
      
      const result = validateDesign(files);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
    });
    
    it('should detect inline styles', () => {
      const files = {
        'src/App.tsx': `
          export default function App() {
            return <div style={{ color: 'red', fontSize: 16 }}>Hello</div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const inlineStyleIssue = result.issues.find(i => 
        i.message.includes('Inline styles')
      );
      
      expect(inlineStyleIssue).toBeDefined();
    });
    
    it('should detect invisible text (white on white)', () => {
      const files = {
        'src/App.tsx': `
          export default function App() {
            return <div className="text-white bg-white">Hidden</div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const contrastIssue = result.issues.find(i => 
        i.message.includes('Invisible white text')
      );
      
      expect(contrastIssue).toBeDefined();
      expect(contrastIssue?.type).toBe('error');
    });
    
    it('should detect invisible text (black on black)', () => {
      const files = {
        'src/App.tsx': `
          export default function App() {
            return <div className="text-black bg-black">Hidden</div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const contrastIssue = result.issues.find(i => 
        i.message.includes('Invisible black text')
      );
      
      expect(contrastIssue).toBeDefined();
    });
    
    it('should detect hardcoded pixel values', () => {
      const files = {
        'src/components/Box.tsx': `
          export default function Box() {
            return <div className="w-[500px] h-[300px] text-[14px]">Box</div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const pixelIssues = result.issues.filter(i => 
        i.message.includes('pixel')
      );
      
      expect(pixelIssues.length).toBeGreaterThanOrEqual(1);
    });
    
    it('should suggest cn() for string concatenation', () => {
      const files = {
        'src/components/Button.tsx': `
          export default function Button({ active }) {
            return (
              <button className={"base-class " + (active ? "active" : "")}>
                Click
              </button>
            );
          }
        `,
      };
      
      const result = validateDesign(files);
      const cnIssue = result.issues.find(i => 
        i.message.includes('concatenation')
      );
      
      expect(cnIssue).toBeDefined();
      expect(cnIssue?.suggestion).toContain('cn()');
    });
    
    it('should detect missing responsive breakpoints', () => {
      const files = {
        'src/App.tsx': `
          export default function App() {
            return <div className="flex gap-4 p-4">Static layout</div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const responsiveIssue = result.issues.find(i => 
        i.message.includes('responsive')
      );
      
      expect(responsiveIssue).toBeDefined();
      expect(responsiveIssue?.type).toBe('info');
    });
    
    it('should detect missing animations', () => {
      const files = {
        'src/App.tsx': `
          export default function App() {
            return <div className="flex gap-4">No animations</div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const animationIssue = result.issues.find(i => 
        i.message.includes('animation')
      );
      
      expect(animationIssue).toBeDefined();
    });
    
    it('should pass files with animations', () => {
      const files = {
        'src/App.tsx': `
          import { motion } from 'framer-motion';
          
          export default function App() {
            return <motion.div animate={{ opacity: 1 }}>Animated</motion.div>;
          }
        `,
      };
      
      const result = validateDesign(files);
      const animationIssue = result.issues.find(i => 
        i.message.includes('animation')
      );
      
      // Should NOT have animation warning
      expect(animationIssue).toBeUndefined();
    });
    
    it('should detect raw Tailwind colors overuse', () => {
      const files = {
        'src/components/Card.tsx': `
          export default function Card() {
            return (
              <div className="bg-blue-500 text-red-600 border-green-400">
                <span className="text-purple-300 bg-pink-200">
                  <i className="text-yellow-500 border-gray-600">Colors</i>
                </span>
              </div>
            );
          }
        `,
      };
      
      const result = validateDesign(files);
      const colorIssue = result.issues.find(i => 
        i.message.includes('semantic tokens')
      );
      
      expect(colorIssue).toBeDefined();
    });
    
    it('should work with strictMode', () => {
      const files = {
        'src/App.tsx': `
          export default function App() {
            return <div style={{ color: 'red' }}>Inline style</div>;
          }
        `,
      };
      
      const normalResult = validateDesign(files, { strictMode: false });
      const strictResult = validateDesign(files, { strictMode: true });
      
      // Strict mode should have more/equal errors
      expect(strictResult.summary.errors).toBeGreaterThanOrEqual(
        normalResult.summary.errors
      );
    });
    
    it('should respect minScore option', () => {
      const files = {
        'src/App.tsx': `export default function App() { return <div>Simple</div>; }`,
      };
      
      const lowThreshold = validateDesign(files, { minScore: 30 });
      const highThreshold = validateDesign(files, { minScore: 95 });
      
      // Same score, different pass status
      expect(lowThreshold.score).toBe(highThreshold.score);
      expect(lowThreshold.passed).not.toBe(highThreshold.passed);
    });
    
    it('should skip non-code files', () => {
      const files = {
        'README.md': '# Project',
        'package.json': '{ "name": "test" }',
        'image.png': 'binary data',
      };
      
      const result = validateDesign(files);
      
      expect(result.issues).toHaveLength(0);
      expect(result.score).toBe(100);
    });
    
  });
  
  describe('getValidationSummary', () => {
    
    it('should return formatted summary for passed validation', () => {
      const result = {
        score: 85,
        passed: true,
        issues: [],
        summary: { errors: 0, warnings: 2, info: 1 },
      };
      
      const summary = getValidationSummary(result);
      
      expect(summary).toContain('PASSED');
      expect(summary).toContain('85/100');
    });
    
    it('should return formatted summary for failed validation', () => {
      const result = {
        score: 45,
        passed: false,
        issues: [
          { type: 'error' as const, category: 'contrast' as const, file: 'App.tsx', message: 'Low contrast' },
        ],
        summary: { errors: 3, warnings: 2, info: 0 },
      };
      
      const summary = getValidationSummary(result);
      
      expect(summary).toContain('FAILED');
      expect(summary).toContain('45/100');
      expect(summary).toContain('App.tsx');
    });
    
    it('should show "and X more" for many issues', () => {
      const issues = Array.from({ length: 10 }, (_, i) => ({
        type: 'warning' as const,
        category: 'tailwind' as const,
        file: `file${i}.tsx`,
        message: `Issue ${i}`,
      }));
      
      const result = {
        score: 50,
        passed: false,
        issues,
        summary: { errors: 0, warnings: 10, info: 0 },
      };
      
      const summary = getValidationSummary(result);
      
      expect(summary).toContain('and 5 more');
    });
    
  });
  
  describe('autoFixDesignIssues', () => {
    
    it('should return copy of files', () => {
      const files = {
        'src/App.tsx': 'const App = () => <div>Hello</div>;',
      };
      
      const fixed = autoFixDesignIssues(files, []);
      
      expect(fixed).not.toBe(files); // Different reference
      expect(fixed['src/App.tsx']).toBe(files['src/App.tsx']);
    });
    
    it('should skip non-autofixable issues', () => {
      const files = {
        'src/App.tsx': '<div style={{color: "red"}}>Test</div>',
      };
      
      const issues = [{
        type: 'error' as const,
        category: 'tailwind' as const,
        file: 'src/App.tsx',
        message: 'Inline styles',
        autoFixable: false,
      }];
      
      const fixed = autoFixDesignIssues(files, issues);
      
      // File unchanged since issue is not auto-fixable
      expect(fixed['src/App.tsx']).toBe(files['src/App.tsx']);
    });
    
  });
  
  describe('checkColorContrast', () => {
    
    it('should return contrast ratio information', () => {
      const result = checkColorContrast('#000000', '#FFFFFF');
      
      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('passesAA');
      expect(result).toHaveProperty('passesAAA');
      expect(typeof result.ratio).toBe('number');
    });
    
    it('should have proper AA/AAA thresholds', () => {
      const result = checkColorContrast('#000', '#fff');
      
      // AA requires 4.5:1, AAA requires 7:1
      if (result.ratio >= 7) {
        expect(result.passesAAA).toBe(true);
        expect(result.passesAA).toBe(true);
      } else if (result.ratio >= 4.5) {
        expect(result.passesAA).toBe(true);
      }
    });
    
  });
  
  describe('Score Calculation', () => {
    
    it('should deduct points based on issue severity', () => {
      const filesWithError = {
        'src/App.tsx': `<div className="text-white bg-white">Error</div>`,
      };
      
      const filesWithWarning = {
        'src/App.tsx': `<div className="w-[100px]">Warning</div>`,
      };
      
      const errorResult = validateDesign(filesWithError);
      const warningResult = validateDesign(filesWithWarning);
      
      // Errors should deduct more than warnings
      expect(errorResult.score).toBeLessThan(warningResult.score);
    });
    
    it('should not go below 0', () => {
      const filesWithManyIssues = {
        'src/App.tsx': `
          <div style={{color:'red',background:'blue',width:100,height:100,margin:10,padding:10}}>
            <div className="text-white bg-white text-black bg-black">
              <span className="text-[12px] w-[100px] h-[200px]">Many issues</span>
            </div>
          </div>
        `,
      };
      
      const result = validateDesign(filesWithManyIssues);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
    
    it('should not go above 100', () => {
      const perfectFiles = {
        'src/main.tsx': `ReactDOM.render(<App />, root);`,
      };
      
      const result = validateDesign(perfectFiles);
      
      expect(result.score).toBeLessThanOrEqual(100);
    });
    
  });
  
});
