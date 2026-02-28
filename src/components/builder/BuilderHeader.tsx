/**
 * 🎯 BuilderHeader v3.0
 * Header with chevron menu (settings, usage, theme) + Sheet panels
 */
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ChevronDown,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Send,
  Loader2,
  Upload,
  ExternalLink,
  Copy,
  Settings,
  Moon,
  Sun,
  CreditCard,
  ArrowLeft,
  Zap,
  Crown,
  Heart,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onOpenSettings?: () => void;
  credits: number;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  futureLength: number;
  onUndo: () => void;
  onRedo: () => void;
  autoHealingEnabled: boolean;
  onAutoHealingToggle: () => void;
  isHealing: boolean;
  healingQueue: number;
  healingStats: { processed: number; success: number; failed: number };
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

export function BuilderHeader({
  projectType,
  viewMode,
  onViewModeChange,
  tmaScale,
  onTmaScaleChange,
  credits,
  project,
  currentProjectStructure,
  versions,
  isVersionsLoading = false,
  onRestoreVersion,
  isPublishing,
  onPublish,
}: BuilderHeaderProps) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => 
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  // Mock usage data (will be replaced with real data later)
  const usageData = {
    credits,
    maxCredits: 50, // Free plan default
    plan: 'Новичок',
    planRubies: 50,
  };
  
  return (
    <>
    <header className="h-16 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-full items-center gap-3 px-4">

      {/* Main menu (chevron down) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            <ChevronDown className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            Мои проекты
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Usage inline preview */}
          <DropdownMenuItem className="gap-3 cursor-pointer p-3" onClick={() => setUsageOpen(true)}>
           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-primary fill-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Рубы</span>
                <span className="text-xs text-muted-foreground">{usageData.credits} / {usageData.maxCredits}</span>
              </div>
              <Progress value={(usageData.credits / usageData.maxCredits) * 100} className="h-1.5 mt-1" />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
            Настройки проекта
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              Тема: {isDark ? 'тёмная' : 'светлая'}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setIsDark(false); document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }}>
                <Sun className="w-4 h-4" />
                Светлая
                {!isDark && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setIsDark(true); document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }}>
                <Moon className="w-4 h-4" />
                Тёмная
                {isDark && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Logo size="sm" />
      
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

      {/* Desktop controls */}
      <div className="hidden md:flex items-center gap-2 rounded-lg border border-border/70 bg-muted/25 px-2 py-1">
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

      {/* Mobile: compact publish button only */}
      <div className="flex md:hidden items-center gap-1.5">
        <Button 
          size="sm" 
          className="h-8 gap-1.5 text-xs font-medium"
          onClick={onPublish}
          disabled={isPublishing || !project}
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span className="sr-only sm:not-sr-only">Опубликовать</span>
        </Button>
      </div>
      </div>
    </header>

    {/* Settings Sheet */}
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки проекта
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Название проекта</label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              {project?.name || 'Новый проект'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ID проекта</label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-mono text-muted-foreground">
              {project?.id || '—'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Тип</label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm flex items-center gap-2">
              {projectType === 'tma' ? <Send className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {projectType === 'tma' ? 'Telegram Mini App' : 'Сайт'}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Usage Sheet */}
    <Sheet open={usageOpen} onOpenChange={setUsageOpen}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Использование
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Plan */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Тариф: {usageData.plan}</p>
                  <p className="text-xs text-muted-foreground">{usageData.planRubies} рубов / мес</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5" />
                Улучшить
              </Button>
            </div>
          </div>

          {/* Rubies balance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-primary fill-primary" />Рубы</span>
              <span className="text-sm text-muted-foreground">{usageData.credits} / {usageData.maxCredits}</span>
            </div>
            <Progress value={(usageData.credits / usageData.maxCredits) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">Каждая генерация тратит рубы. Пополняются ежемесячно по тарифу.</p>
          </div>

          {/* Plan comparison hint */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Рубы по тарифам</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Новичок</span>
                <span>50 рубов</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Строитель</span>
                <span>500 рубов</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Архитектор</span>
                <span>2 000 рубов</span>
              </div>
            </div>
          </div>

          {/* Buy more */}
          <div className="pt-2">
            <Button className="w-full gap-2">
              <Heart className="w-4 h-4" />
              Докупить рубы
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">Дополнительные рубы можно купить в любой момент</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
