import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Globe,
  Send,
  Clock,
  Eye,
  ExternalLink,
  Pencil,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Play,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProjectStatus = 'published' | 'draft' | 'building' | 'error';

interface ProjectColors {
  bg: string;
  primary: string;
  accent: string;
}

interface ProjectPreviewCardProps {
  id: string;
  name: string;
  type: 'website' | 'tma';
  status: ProjectStatus;
  slug: string;
  updatedAt: string;
  views: number;
  colors: ProjectColors;
  buildProgress?: number;
  previewHtml?: string | null;
  publishedUrl?: string | null;
  isCommunity?: boolean;
  copiedId?: string | null;
  onCopyLink?: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  onContinue?: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; class: string }> = {
  published: { label: 'Опубликован', icon: Check, class: 'bg-green-600 text-white' },
  draft: { label: 'Черновик', icon: Pencil, class: 'bg-muted-foreground/80 text-white' },
  building: { label: 'Сборка...', icon: Loader2, class: 'bg-blue-600 text-white' },
  error: { label: 'Ошибка', icon: AlertCircle, class: 'bg-red-600 text-white' },
};

export function ProjectPreviewCard({
  id,
  name,
  type,
  status,
  slug,
  updatedAt,
  views,
  colors,
  buildProgress,
  previewHtml,
  publishedUrl,
  isCommunity = false,
  copiedId,
  onCopyLink,
  onDelete,
  onContinue,
}: ProjectPreviewCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <div className="card-base card-hover overflow-hidden group">
        {/* Thumbnail with live preview option */}
        <div 
          className="aspect-video relative overflow-hidden cursor-pointer"
          onClick={() => previewHtml && setShowPreview(true)}
        >
          {/* Background gradient */}
          <div 
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, hsl(${colors.bg}) 0%, hsl(${colors.bg}) 100%)`
            }}
          />
          
          {/* Mini preview or placeholder */}
          {previewHtml ? (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
                sandbox="allow-scripts"
                title={`Preview of ${name}`}
              />
              {/* Preview overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                <span className="text-xs text-white/80 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3" />
                  Превью
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-1.5 rounded"
                  style={{ backgroundColor: `hsl(${colors.primary} / 0.4)` }}
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div 
                  className="w-1/2 h-2.5 rounded mb-2"
                  style={{ backgroundColor: `hsl(${colors.primary} / 0.5)` }}
                />
                <div 
                  className="w-1/3 h-1.5 rounded mb-3"
                  style={{ backgroundColor: `hsl(${colors.primary} / 0.2)` }}
                />
                <div 
                  className="w-12 h-4 rounded"
                  style={{ backgroundColor: `hsl(${colors.accent})` }}
                />
              </div>
            </div>
          )}
          
          {/* Status badge */}
          {!isCommunity && (
            <div className="absolute top-2 left-2">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.class}`}>
                <StatusIcon className={cn('w-3 h-3', status === 'building' && 'animate-spin')} />
                {statusInfo.label}
              </span>
            </div>
          )}


          {/* Type badge */}
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-1 rounded-full bg-background text-foreground flex items-center gap-1 shadow-sm">
              {type === 'website' ? <Globe className="w-3 h-3" /> : <Send className="w-3 h-3" />}
              {type === 'website' ? 'Сайт' : 'TMA'}
            </span>
          </div>

          {/* Building progress */}
          {!isCommunity && status === 'building' && buildProgress && (
            <div className="absolute bottom-0 left-0 right-0">
              <Progress value={buildProgress} className="h-1 rounded-none" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{name}</h3>
              {!isCommunity && (
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {updatedAt}
                  </span>
                </div>
              )}
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
                    <Link to={`/builder/${id}`}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Редактировать
                    </Link>
                  </DropdownMenuItem>
                  {status === 'published' && onCopyLink && (
                    <DropdownMenuItem onClick={onCopyLink}>
                      {copiedId === id ? (
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
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Открыть сайт
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={onDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {isCommunity ? (
              <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
                <Link to={`/builder?template=${slug}`}>
                  <Copy className="w-3 h-3" />
                  Использовать
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={onContinue}
                  asChild
                >
                  <Link to={`/builder/${id}`}>
                    <Play className="w-3 h-3" />
                    Продолжить
                  </Link>
                </Button>
                {status === 'published' && publishedUrl && (
                  <Button variant="outline" size="sm" className="px-2" asChild>
                    <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full preview modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {name}
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.class}`}>
                {statusInfo.label}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 rounded-lg overflow-hidden bg-white">
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title={`Full preview of ${name}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProjectPreviewCardSkeleton() {
  return (
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
}
