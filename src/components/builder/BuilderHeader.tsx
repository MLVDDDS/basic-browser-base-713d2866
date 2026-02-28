/**
 * 🎯 BuilderHeader v2.0
 * Simplified header without credits display, auto-healing UI, and effects library
 */
import { Link, useParams } from 'react-router-dom';
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
  Upload,
  ExternalLink,
  Copy,
  Settings,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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


export function BuilderHeader({
  projectType,
  viewMode,
  onViewModeChange,
  tmaScale,
  onTmaScaleChange,
  // credits - not displayed
  // canUndo, canRedo, onUndo, onRedo - removed from UI
  project,
  currentProjectStructure,
  versions,
  isVersionsLoading = false,
  onRestoreVersion,
  isPublishing,
  onPublish,
}: BuilderHeaderProps) {
  const { id: urlId } = useParams<{ id: string }>();
  const projectLabel = project?.name || project?.id || urlId || 'Проект';
  const showProjectMenu = !!(project?.name || project?.id || urlId);
  
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

      {showProjectMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden lg:flex items-center gap-1.5 max-w-[240px] rounded-md border border-border/60 bg-muted/35 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer">
              <span className="truncate">{projectLabel}</span>
              <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Настройки проекта
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
