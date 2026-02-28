/**
 * 🎯 BuilderHeader v2.0
 * Simplified header without credits display and auto-healing UI
 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Send,
  Loader2,
  Library,
  Upload,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EffectDefinition } from '@/types/siteSpec';
import type { ProjectStructure } from '@/types/project';
import type { ProjectVersion } from '@/hooks/useProjectVersions';
import { ProjectCodePanel } from './ProjectCodePanel';
import { ProjectGithubControl } from './ProjectGithubControl';

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type ProjectType = 'website' | 'tma';

interface BuilderHeaderProps {
  projectType: ProjectType;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  tmaScale: number;
  onTmaScaleChange: (scale: number) => void;
  
  // Credits - kept for internal logic but not displayed
  credits: number;
  
  // Undo/Redo - removed from UI per requirements
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  futureLength: number;
  onUndo: () => void;
  onRedo: () => void;
  
  // Auto-healing - kept for internal logic but not displayed
  autoHealingEnabled: boolean;
  onAutoHealingToggle: () => void;
  isHealing: boolean;
  healingQueue: number;
  healingStats: { processed: number; success: number; failed: number };
  
  // Library
  isLibraryOpen: boolean;
  onLibraryOpenChange: (open: boolean) => void;
  libraryCategory: string;
  onLibraryCategoryChange: (category: string) => void;
  filteredEffects: EffectDefinition[];
  onApplyEffect: (effect: EffectDefinition) => void;
  
  // Publish
  project: { id?: string; name?: string; published_url?: string | null } | null;
  currentProjectStructure: ProjectStructure | null;
  versions: ProjectVersion[];
  isVersionsLoading?: boolean;
  onRestoreVersion: (versionId: string) => void;
  isPublishing: boolean;
  onPublish: () => void;
  user: { id: string } | null;
}

const tmaScaleOptions = [
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
];

const LibraryItem = ({ effect, onApply }: { effect: EffectDefinition; onApply: () => void }) => (
  <button
    onClick={onApply}
    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-medium">{effect.name}</span>
      <span className={cn(
        'text-[9px] px-1.5 py-0.5 rounded-full',
        effect.performance === 'light' && 'bg-green-500/10 text-green-500',
        effect.performance === 'medium' && 'bg-yellow-500/10 text-yellow-500',
        effect.performance === 'heavy' && 'bg-red-500/10 text-red-500',
      )}>
        {effect.performance === 'light' ? 'Лёгкий' : effect.performance === 'medium' ? 'Средний' : 'Тяжёлый'}
      </span>
    </div>
    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{effect.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground capitalize">{effect.type}</span>
    </div>
  </button>
);

export function BuilderHeader({
  projectType,
  viewMode,
  onViewModeChange,
  tmaScale,
  onTmaScaleChange,
  // credits - not displayed
  // canUndo, canRedo, onUndo, onRedo - removed from UI
  isLibraryOpen,
  onLibraryOpenChange,
  libraryCategory,
  onLibraryCategoryChange,
  filteredEffects,
  onApplyEffect,
  project,
  currentProjectStructure,
  versions,
  isVersionsLoading = false,
  onRestoreVersion,
  isPublishing,
  onPublish,
}: BuilderHeaderProps) {
  return (
    <header className="h-16 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-full items-center gap-3 px-4">
      <Link 
        to="/dashboard" 
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>
      
      <Logo size="sm" />

      {project?.name ? (
        <div className="hidden max-w-[240px] truncate rounded-md border border-border/60 bg-muted/35 px-2.5 py-1 text-[11px] text-muted-foreground lg:block">
          {project.name}
        </div>
      ) : null}
      
      <div className={cn(
        'hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:flex',
        projectType === 'tma' 
          ? 'bg-[#3390EC]/10 text-[#3390EC]' 
          : 'bg-primary/10 text-primary'
      )}>
        {projectType === 'tma' ? (
          <><Send className="w-3 h-3" /> TMA</>
        ) : (
          <><Globe className="w-3 h-3" /> Сайт</>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/25 px-2 py-1">
        {/* View Mode - working viewport switcher */}
        {projectType === 'tma' ? (
          <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-0.5">
            {tmaScaleOptions.map(({ value, label }) => (
              <Button 
                key={value} 
                variant={tmaScale === value ? 'secondary' : 'ghost'} 
                size="sm" 
                className={cn(
                  "h-7 px-3 text-xs font-medium transition-all",
                  tmaScale === value && "shadow-sm"
                )}
                onClick={() => onTmaScaleChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        ) : (
          <div data-tour="view-modes" className="flex items-center bg-muted/50 rounded-lg p-1 gap-0.5">
            {([
              { mode: 'desktop' as ViewMode, icon: Monitor, label: 'Десктоп' }, 
              { mode: 'tablet' as ViewMode, icon: Tablet, label: 'Планшет' }, 
              { mode: 'mobile' as ViewMode, icon: Smartphone, label: 'Мобильный' }
            ]).map(({ mode, icon: Icon, label }) => (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <Button 
                    variant={viewMode === mode ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className={cn(
                      "w-8 h-8 transition-all",
                      viewMode === mode && "shadow-sm"
                    )}
                    onClick={() => onViewModeChange(mode)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        <div className="h-6 w-px bg-border/60" />

        {/* Library Sheet */}
        <Sheet open={isLibraryOpen} onOpenChange={onLibraryOpenChange}>
          <SheetTrigger asChild>
            <Button 
              data-tour="library" 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 text-xs font-medium hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <Library className="w-4 h-4" /> Библиотека
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Library className="w-4 h-4 text-primary" />
                Библиотека эффектов
              </SheetTitle>
            </SheetHeader>

            <div className="flex gap-1.5 p-4 border-b border-border overflow-x-auto">
              {[
                { id: 'all', label: 'Все' }, 
                { id: '3d', label: '3D' }, 
                { id: 'background', label: 'Фон' }, 
                { id: 'text', label: 'Текст' }, 
                { id: 'cards', label: 'Карточки' }, 
                { id: 'scroll', label: 'Скролл' }
              ].map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => onLibraryCategoryChange(cat.id)} 
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all', 
                    libraryCategory === cat.id 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-3">
                {filteredEffects.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Нет эффектов в этой категории
                  </div>
                ) : (
                  filteredEffects.map((effect) => (
                    <LibraryItem 
                      key={effect.id} 
                      effect={effect} 
                      onApply={() => {
                        onApplyEffect(effect);
                        onLibraryOpenChange(false);
                      }} 
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <ProjectCodePanel
          projectId={project?.id}
          projectName={project?.name}
          currentProject={currentProjectStructure}
          versions={versions}
          isVersionsLoading={isVersionsLoading}
          onRestoreVersion={onRestoreVersion}
        />
        <ProjectGithubControl projectId={project?.id} projectName={project?.name} />

        {/* Publish Button */}
        <Button 
          data-tour="publish" 
          size="sm" 
          className="h-9 gap-2 text-xs font-medium shadow-sm hover:shadow transition-all"
          onClick={onPublish}
          disabled={isPublishing || !project}
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Опубликовать
        </Button>

        {/* Published URL */}
        {project?.published_url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 gap-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-500/10 transition-all"
                onClick={() => window.open(project.published_url!, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span className="text-xs">{project.published_url}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(project.published_url!);
                    toast.success('Скопировано');
                  }}
                  className="hover:text-primary transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      </div>
    </header>
  );
}
