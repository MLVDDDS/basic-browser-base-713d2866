import { useState, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';
import { PageTitle } from '@/components/ui/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiRequest, isApiConfigured } from '@/lib/api-client';
import { 
  Plus, 
  MoreHorizontal, 
  Globe, 
  Send, 
  Clock,
  ExternalLink,
  Pencil,
  Trash2,
  Copy,
  Search,
  LayoutGrid,
  List,
  Eye,
  TrendingUp,
  Check,
  AlertCircle,
  Loader2,
  Users,
  ArrowRight,
  Play,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectPreviewCard, ProjectPreviewCardSkeleton } from '@/components/dashboard/ProjectPreviewCard';

type ProjectStatus = 'published' | 'draft' | 'building' | 'error';
type TabMode = 'my' | 'community';

interface Project {
  id: string;
  name: string;
  type: 'website' | 'tma';
  status: ProjectStatus;
  slug: string;
  updatedAt: string;
  views: number;
  colors: { bg: string; primary: string; accent: string };
  buildProgress?: number;
  previewHtml?: string | null;
  publishedUrl?: string | null;
}

interface ProjectRow {
  id: string;
  name: string;
  type: 'website' | 'tma' | string;
  status?: string;
  slug: string;
  updated_at: string;
  config?: Record<string, unknown> | null;
  preview_html?: string | null;
  published_url?: string | null;
}

// Community projects (templates for inspiration)
const communityProjects: Project[] = [
  {
    id: 'c1',
    name: 'Лендинг',
    type: 'website',
    status: 'published',
    slug: 'saas-landing',
    updatedAt: '',
    views: 0,
    colors: { bg: '240 10% 4%', primary: '258 89% 66%', accent: '200 100% 50%' },
  },
  {
    id: 'c2',
    name: 'Магазин',
    type: 'website',
    status: 'published',
    slug: 'ecommerce-store',
    updatedAt: '',
    views: 0,
    colors: { bg: '160 30% 4%', primary: '160 80% 50%', accent: '38 92% 50%' },
  },
  {
    id: 'c3',
    name: 'Портфолио',
    type: 'website',
    status: 'published',
    slug: 'minimal-portfolio',
    updatedAt: '',
    views: 0,
    colors: { bg: '0 0% 2%', primary: '0 0% 90%', accent: '0 0% 50%' },
  },
  {
    id: 'c4',
    name: 'Визитка',
    type: 'website',
    status: 'published',
    slug: 'corporate-site',
    updatedAt: '',
    views: 0,
    colors: { bg: '220 15% 5%', primary: '220 70% 55%', accent: '180 60% 45%' },
  },
  {
    id: 'c5',
    name: 'Резюме',
    type: 'website',
    status: 'published',
    slug: 'portfolio-creative',
    updatedAt: '',
    views: 0,
    colors: { bg: '210 20% 6%', primary: '210 80% 55%', accent: '45 90% 55%' },
  },
  {
    id: 'c6',
    name: 'Доставка',
    type: 'tma',
    status: 'published',
    slug: 'food-delivery',
    updatedAt: '',
    views: 0,
    colors: { bg: '25 30% 5%', primary: '25 90% 55%', accent: '0 80% 50%' },
  },
  {
    id: 'c7',
    name: 'Запись',
    type: 'tma',
    status: 'published',
    slug: 'booking-tma',
    updatedAt: '',
    views: 0,
    colors: { bg: '280 30% 6%', primary: '280 80% 60%', accent: '320 80% 50%' },
  },
  {
    id: 'c8',
    name: 'Блог',
    type: 'website',
    status: 'published',
    slug: 'tech-blog',
    updatedAt: '',
    views: 0,
    colors: { bg: '145 25% 5%', primary: '145 75% 50%', accent: '85 70% 55%' },
  },
];

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; class: string }> = {
  published: { label: 'Опубликован', icon: Check, class: 'bg-green-600 text-white' },
  draft: { label: 'Черновик', icon: Pencil, class: 'bg-muted-foreground/80 text-white' },
  building: { label: 'Сборка...', icon: Loader2, class: 'bg-blue-600 text-white' },
  error: { label: 'Ошибка', icon: AlertCircle, class: 'bg-red-600 text-white' },
};

// Helper to format relative time
function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  return past.toLocaleDateString('ru-RU');
}

// Generate colors from config or default
function getProjectColors(config: Record<string, unknown> | null): { bg: string; primary: string; accent: string } {
  if (config && typeof config === 'object') {
    const colors = config.colors as { bg?: string; primary?: string; accent?: string } | undefined;
    if (colors) {
      return {
        bg: colors.bg || '222 47% 6%',
        primary: colors.primary || '186 100% 50%',
        accent: colors.accent || '38 92% 50%',
      };
    }
  }
  // Default colors
  return { bg: '222 47% 6%', primary: '186 100% 50%', accent: '38 92% 50%' };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const apiEnabled = isApiConfigured();
  
  const [tabMode, setTabMode] = useState<TabMode>('my');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Fetch real projects from Supabase
  const { data: dbProjects, isLoading: isLoadingProjects, refetch } = useQuery({
    queryKey: ['projects', user?.id, apiEnabled],
    queryFn: async () => {
      if (!user?.id) return [];
      
      if (!apiEnabled) {
        toast.error('API не настроен');
        return [];
      }

      try {
        const response = await apiRequest<{ projects: ProjectRow[] }>('/projects');
        return response.projects || [];
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Ошибка загрузки проектов');
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Transform DB projects to UI format with preview_html
  const userProjects: Project[] = (dbProjects || []).map((p) => ({
    id: p.id,
    name: p.name,
    type: (p.type === 'tma' ? 'tma' : 'website') as 'website' | 'tma',
    status: (p.status || 'draft') as ProjectStatus,
    slug: p.slug,
    updatedAt: formatRelativeTime(p.updated_at),
    views: 0, // TODO: Add views tracking
    colors: getProjectColors(p.config as Record<string, unknown> | null),
    buildProgress: p.status === 'building' ? 50 : undefined,
    previewHtml: p.preview_html,
    publishedUrl: p.published_url || null,
  }));

  const currentProjects = tabMode === 'my' ? userProjects : communityProjects;
  const totalPages = Math.ceil(currentProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = currentProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopyLink = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (!project.publishedUrl) {
      toast.error('Ссылка ещё не готова');
      return;
    }
    navigator.clipboard.writeText(project.publishedUrl);
    setCopiedId(project.id);
    toast.success('Ссылка скопирована');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Удалить проект? Это действие нельзя отменить.')) return;

    if (!apiEnabled) {
      toast.error('API не настроен');
      return;
    }

    try {
      await apiRequest(`/projects/${projectId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Ошибка удаления проекта');
      return;
    }
    
    toast.success('Проект удалён');
    refetch();
  };

  const stats = {
    total: userProjects.length,
    published: userProjects.filter(p => p.status === 'published').length,
    views: userProjects.reduce((acc, p) => acc + p.views, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-main">
          {/* Guest banner removed */}

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <PageTitle description={isAuthenticated ? "Управляй своими сайтами и Mini Apps" : "Попробуй создать свой первый проект"} size="compact">
              Мои проекты
            </PageTitle>
            <Link to="/create">
              <Button className="gap-2 btn-glow">
                <Plus className="w-4 h-4" />
                Новый проект
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
            <button
              onClick={() => { setTabMode('my'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                tabMode === 'my' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Мои проекты
            </button>
            <button
              onClick={() => { setTabMode('community'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                tabMode === 'community' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              Сообщество
            </button>
          </div>

          {/* Stats - only show for my projects */}
          {tabMode === 'my' && isAuthenticated && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="card-base p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Всего проектов</div>
              </div>
              <div className="card-base p-4">
                <div className="text-2xl font-bold text-green-400">{stats.published}</div>
                <div className="text-sm text-muted-foreground">Опубликовано</div>
              </div>
              <div className="card-base p-4">
                <div className="text-2xl font-bold flex items-center gap-2">
                  {stats.views.toLocaleString()}
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">Просмотров</div>
              </div>
            </div>
          )}

          {/* Community header */}
          {tabMode === 'community' && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Проекты других пользователей. Вдохновляйся и создавай своё уникальное.
              </p>
            </div>
          )}

          {/* No toolbar - clean grid only */}

          {/* Projects */}
          {isLoadingProjects || authLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tabMode === 'my' && (
                <Link to="/create">
                  <div className="h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer min-h-[280px]">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Plus className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground font-medium">Создать проект</span>
                  </div>
                </Link>
              )}
              {[1, 2, 3, 4].map((i) => (
                <ProjectPreviewCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProjects.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* New project card - only for my projects on first page */}
                {tabMode === 'my' && currentPage === 1 && (
                  <Link to="/create">
                    <div className="h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer min-h-[280px]">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground font-medium">Создать проект</span>
                    </div>
                  </Link>
                )}

                {paginatedProjects.map((project, index) => (
                  <div 
                    key={project.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <ProjectPreviewCard 
                      id={project.id}
                      name={project.name}
                      type={project.type}
                      status={project.status}
                      slug={project.slug}
                      updatedAt={project.updatedAt}
                      views={project.views}
                      colors={project.colors}
                      buildProgress={project.buildProgress}
                      previewHtml={project.previewHtml}
                      publishedUrl={project.publishedUrl}
                      isCommunity={tabMode === 'community'}
                      copiedId={copiedId}
                      onCopyLink={(e) => handleCopyLink(e, project)}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : tabMode === 'my' ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <Plus className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Пока нет проектов</h2>
              <p className="text-muted-foreground mb-6">
                Создай свой первый сайт или Telegram Mini App
              </p>
              <Link to="/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Создать проект
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Skeleton components
const ProjectCardSkeleton = () => (
  <div className="card-base overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-10" />
      </div>
    </div>
  </div>
);

const ProjectListSkeleton = () => (
  <div className="card-base p-4 flex items-center gap-4">
    <Skeleton className="w-16 h-12 rounded-md flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-5 w-1/3 mb-2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

interface ProjectCardProps {
  project: Project;
  copiedId: string | null;
  onCopyLink: (e: React.MouseEvent, project: Project) => void;
  onDelete: (id: string) => void;
  isCommunity?: boolean;
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(({ 
  project, 
  copiedId, 
  onCopyLink,
  onDelete,
  isCommunity = false
}, ref) => {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <div ref={ref} className="card-base card-hover overflow-hidden group">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, hsl(${project.colors.bg}) 0%, hsl(${project.colors.bg}) 100%)`
          }}
        />
        
        {/* Fake UI preview */}
        <div className="absolute inset-3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-10 h-1.5 rounded"
              style={{ backgroundColor: `hsl(${project.colors.primary} / 0.4)` }}
            />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div 
              className="w-1/2 h-2.5 rounded mb-2"
              style={{ backgroundColor: `hsl(${project.colors.primary} / 0.5)` }}
            />
            <div 
              className="w-1/3 h-1.5 rounded mb-3"
              style={{ backgroundColor: `hsl(${project.colors.primary} / 0.2)` }}
            />
            <div 
              className="w-12 h-4 rounded"
              style={{ backgroundColor: `hsl(${project.colors.accent})` }}
            />
          </div>
        </div>
        
        {/* Status badge - only for own projects */}
        {!isCommunity && (
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${status.class}`}>
              <StatusIcon className={`w-3 h-3 ${project.status === 'building' ? 'animate-spin' : ''}`} />
              {status.label}
            </span>
          </div>
        )}

        {/* Views badge for community */}
        {isCommunity && (
          <div className="absolute top-2 left-2">
            <span className="text-xs px-2 py-1 rounded-full bg-background/80 text-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {project.views.toLocaleString()}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-1 rounded-full bg-background text-foreground flex items-center gap-1 shadow-sm">
            {project.type === 'website' ? <Globe className="w-3 h-3" /> : <Send className="w-3 h-3" />}
            {project.type === 'website' ? 'Сайт' : 'TMA'}
          </span>
        </div>

        {/* Building progress */}
        {!isCommunity && project.status === 'building' && project.buildProgress && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={project.buildProgress} className="h-1 rounded-none" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{project.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {isCommunity ? (
                  <Users className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {project.updatedAt}
              </span>
              {!isCommunity && project.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {project.views.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          {!isCommunity && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/builder/${project.id}`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Редактировать
                  </Link>
                </DropdownMenuItem>
                {project.status === 'published' && (
                  <DropdownMenuItem onClick={(e) => onCopyLink(e, project)}>
                    {copiedId === project.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                        Скопировано!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Копировать ссылку
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {project.publishedUrl && (
                  <DropdownMenuItem asChild>
                    <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Открыть сайт
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isCommunity ? (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                Посмотреть
              </Button>
              <Button size="sm" className="flex-1">
                Вдохновиться
              </Button>
            </>
          ) : (
            <>
              <Link to={`/builder/${project.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Открыть
                </Button>
              </Link>
              {project.status === 'published' && project.publishedUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

interface ProjectListItemProps {
  project: Project;
  copiedId: string | null;
  onCopyLink: (e: React.MouseEvent, project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectListItem = forwardRef<HTMLDivElement, ProjectListItemProps>(({ 
  project, 
  copiedId, 
  onCopyLink,
  onDelete 
}, ref) => {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <div ref={ref} className="card-base p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
      {/* Mini preview */}
      <div 
        className="w-16 h-12 rounded-md flex-shrink-0 overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, hsl(${project.colors.bg}) 0%, hsl(${project.colors.bg}) 100%)`
        }}
      >
        <div className="absolute inset-1 flex flex-col items-center justify-center">
          <div 
            className="w-6 h-1 rounded mb-1"
            style={{ backgroundColor: `hsl(${project.colors.primary} / 0.5)` }}
          />
          <div 
            className="w-4 h-2 rounded"
            style={{ backgroundColor: `hsl(${project.colors.accent})` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{project.name}</h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${status.class}`}>
            <StatusIcon className={`w-2.5 h-2.5 ${project.status === 'building' ? 'animate-spin' : ''}`} />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {project.type === 'website' ? <Globe className="w-3 h-3" /> : <Send className="w-3 h-3" />}
            {project.type === 'website' ? 'Сайт' : 'TMA'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {project.updatedAt}
          </span>
          {project.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {project.views.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Building progress */}
      {project.status === 'building' && project.buildProgress && (
        <div className="w-24">
          <Progress value={project.buildProgress} className="h-1.5" />
          <span className="text-[10px] text-muted-foreground">{project.buildProgress}%</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/builder/${project.id}`}>
          <Button variant="outline" size="sm">Открыть</Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/builder/${project.id}`}>
                <Pencil className="w-4 h-4 mr-2" />
                Редактировать
              </Link>
            </DropdownMenuItem>
            {project.status === 'published' && (
              <DropdownMenuItem onClick={(e) => onCopyLink(e, project)}>
                {copiedId === project.id ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать ссылку
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

ProjectListItem.displayName = 'ProjectListItem';

export default Dashboard;
