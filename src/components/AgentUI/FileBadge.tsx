import { FileCode, FileJson, FileType, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileBadgeProps {
  filename: string;
  action?: 'created' | 'modified' | 'deleted';
  onClick?: () => void;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  tsx: FileCode,
  ts: FileCode,
  jsx: FileCode,
  js: FileCode,
  css: Palette,
  json: FileJson,
  default: FileType
};

const FILE_COLORS: Record<string, string> = {
  tsx: 'text-blue-500 bg-blue-500/10',
  ts: 'text-blue-400 bg-blue-400/10',
  jsx: 'text-yellow-500 bg-yellow-500/10',
  js: 'text-yellow-400 bg-yellow-400/10',
  css: 'text-pink-500 bg-pink-500/10',
  json: 'text-green-500 bg-green-500/10',
  default: 'text-muted-foreground bg-muted'
};

const ACTION_COLORS: Record<string, string> = {
  created: 'border-green-500/50',
  modified: 'border-blue-500/50',
  deleted: 'border-red-500/50'
};

export function FileBadge({ filename, action, onClick }: FileBadgeProps) {
  const extension = filename.split('.').pop() || 'default';
  const Icon = FILE_ICONS[extension] || FILE_ICONS.default;
  const colorClass = FILE_COLORS[extension] || FILE_COLORS.default;
  const actionClass = action ? ACTION_COLORS[action] : '';

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        "border transition-colors",
        colorClass,
        actionClass,
        onClick && "hover:opacity-80 cursor-pointer"
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="max-w-[150px] truncate">{filename}</span>
    </button>
  );
}
