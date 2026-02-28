// UI for generating React projects
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  Loader2, 
  Rocket, 
  Layout, 
  ShoppingBag,
  Briefcase,
  BarChart3,
  Palette,
  Zap,
  Layers,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectGenerator } from '@/hooks/useProjectGenerator';
import { ProjectStructure } from '@/types/project';

interface ProjectGeneratorProps {
  onProjectGenerated: (project: ProjectStructure) => void;
  className?: string;
}

const TEMPLATES = [
  { id: 'landing', label: 'Лендинг', icon: Layout, description: 'SaaS лендинг с Hero, Features, Pricing' },
  { id: 'dashboard', label: 'Дашборд', icon: BarChart3, description: 'Админ-панель с графиками' },
  { id: 'ecommerce', label: 'Магазин', icon: ShoppingBag, description: 'E-commerce с каталогом' },
  { id: 'portfolio', label: 'Портфолио', icon: Briefcase, description: 'Личное портфолио' },
  { id: 'saas', label: 'SaaS App', icon: Layers, description: 'Интерфейс SaaS продукта' },
] as const;

const STYLES = [
  { id: 'modern', label: 'Современный', icon: Zap, description: 'Градиенты, тени, glass' },
  { id: 'minimal', label: 'Минимализм', icon: Minimize2, description: 'Чистый, много пространства' },
  { id: 'brutalist', label: 'Брутализм', icon: Layers, description: 'Смелый, контрастный' },
  { id: 'glassmorphism', label: 'Glassmorphism', icon: Palette, description: 'Блюр, прозрачность' },
] as const;

export function ProjectGenerator({ onProjectGenerated, className }: ProjectGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState<string>('landing');
  const [style, setStyle] = useState<string>('modern');
  
  const { generate, isGenerating, progress, error } = useProjectGenerator();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const result = await generate(prompt, {
      template: template as 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'saas',
      style: style as 'minimal' | 'modern' | 'brutalist' | 'glassmorphism',
    });
    
    if (result.success && result.project) {
      onProjectGenerated(result.project);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Template Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Шаблон</label>
        <div className="grid grid-cols-5 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                template === t.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <t.icon className={cn(
                'w-4 h-4',
                template === t.id ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Стиль</label>
        <div className="grid grid-cols-4 gap-2">
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                style === s.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <s.icon className={cn(
                'w-4 h-4',
                style === s.id ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className="text-[10px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Описание проекта</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опиши что нужно создать... Например: Лендинг для AI-стартапа с тёмной темой, градиентами и 3D-эффектами"
          className="min-h-[80px] text-sm"
        />
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-medium">{progress.message}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
              style={{ 
                width: progress.stage === 'generating' ? '30%' : 
                       progress.stage === 'parsing' ? '60%' : 
                       progress.stage === 'validating' ? '90%' : 
                       progress.stage === 'complete' ? '100%' : '0%' 
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Генерирую...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            Создать React проект
          </>
        )}
      </Button>

      {/* Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-muted-foreground">Быстрые примеры:</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            'AI платформа для анализа данных',
            'Фитнес-трекер с графиками',
            'Портфолио 3D дизайнера',
            'Маркетплейс NFT',
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              className="px-2 py-1 text-[10px] rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectGenerator;
