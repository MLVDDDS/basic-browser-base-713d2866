/**
 * 🚀 AgentPhaseMessage Component
 * Отображает отдельное сообщение-этап работы агента
 * Каждый этап — отдельное сообщение в чате с индикатором статуса и списком файлов
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileEdit, 
  CheckCircle2, 
  Loader2,
  ChevronDown,
  Palette,
  Code,
  Database,
  Settings,
  Layout,
  Package
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Фазы генерации с иконками и описаниями
const PHASE_CONFIG = {
  analyze: {
    icon: Sparkles,
    label: 'Анализирую запрос',
    labelComplete: 'Анализ завершён',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  structure: {
    icon: Layout,
    label: 'Создаю структуру',
    labelComplete: 'Структура создана',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  components: {
    icon: Code,
    label: 'Создаю компоненты',
    labelComplete: 'Компоненты созданы',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  styles: {
    icon: Palette,
    label: 'Настраиваю стили',
    labelComplete: 'Стили настроены',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  backend: {
    icon: Database,
    label: 'Настраиваю бэкенд',
    labelComplete: 'Бэкенд готов',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  config: {
    icon: Settings,
    label: 'Финальная настройка',
    labelComplete: 'Настройка завершена',
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
  },
  packages: {
    icon: Package,
    label: 'Устанавливаю пакеты',
    labelComplete: 'Пакеты установлены',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
} as const;

type PhaseType = keyof typeof PHASE_CONFIG;

interface FileChange {
  path: string;
  action: 'created' | 'modified' | 'deleted';
}

interface AgentPhaseMessageProps {
  phase: PhaseType;
  files?: FileChange[];
  packages?: string[];
  isActive?: boolean;
  isComplete?: boolean;
  timestamp?: number;
  className?: string;
}

export function AgentPhaseMessage({
  phase,
  files = [],
  packages = [],
  isActive = false,
  isComplete = false,
  timestamp,
  className,
}: AgentPhaseMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.components;
  const Icon = config.icon;
  
  const hasItems = files.length > 0 || packages.length > 0;
  const totalItems = files.length + packages.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", className)}
    >
      {/* Аватар */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      
      {/* Контент */}
      <div className="flex-1 space-y-2">
        {/* Заголовок фазы */}
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-md", config.bg)}>
            {isActive && !isComplete ? (
              <Loader2 className={cn("w-4 h-4 animate-spin", config.color)} />
            ) : isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Icon className={cn("w-4 h-4", config.color)} />
            )}
          </div>
          <span className="text-sm font-medium">
            {isActive && !isComplete ? config.label : config.labelComplete}
          </span>
          {isActive && !isComplete && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-muted-foreground"
            >
              Думаю...
            </motion.span>
          )}
        </div>
        
        {/* Список файлов (collapsible) */}
        {hasItems && isComplete && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 py-1 group w-full text-left">
                <FileEdit className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {files.length > 0 && `${files.length} файл${files.length > 1 ? 'ов' : ''}`}
                  {files.length > 0 && packages.length > 0 && ', '}
                  {packages.length > 0 && `${packages.length} пакет${packages.length > 1 ? 'ов' : ''}`}
                </span>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-0.5 hover:bg-muted transition-colors">
                  {isExpanded ? 'Скрыть' : 'Показать'}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-6 py-2 space-y-1"
                >
                  {/* Файлы */}
                  {files.map((file, idx) => (
                    <motion.div
                      key={file.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      {file.action === 'created' ? (
                        <span className="text-green-500 font-bold">+</span>
                      ) : file.action === 'deleted' ? (
                        <span className="text-red-500 font-bold">−</span>
                      ) : (
                        <span className="text-yellow-500 font-bold">~</span>
                      )}
                      <span className={cn(
                        'font-medium',
                        file.action === 'created' && 'text-green-600 dark:text-green-400',
                        file.action === 'deleted' && 'text-red-600 dark:text-red-400',
                        file.action === 'modified' && 'text-yellow-600 dark:text-yellow-400'
                      )}>
                        {file.action === 'created' ? 'Создан' : 
                         file.action === 'deleted' ? 'Удалён' : 'Изменён'}
                      </span>
                      <code className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                        {file.path.split('/').pop()}
                      </code>
                    </motion.div>
                  ))}
                  
                  {/* Пакеты */}
                  {packages.map((pkg, idx) => (
                    <motion.div
                      key={pkg}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (files.length + idx) * 0.05 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Package className="w-3 h-3 text-cyan-500" />
                      <span className="font-medium text-cyan-600 dark:text-cyan-400">
                        Установлен
                      </span>
                      <code className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                        {pkg}
                      </code>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Индикатор загрузки для активной фазы без файлов */}
        {isActive && !isComplete && !hasItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Timestamp */}
        {timestamp && isComplete && (
          <div className="text-[10px] text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Хелпер для группировки файлов по фазам
 */
export function groupFilesByPhase(files: FileChange[]): Record<PhaseType, FileChange[]> {
  const groups: Record<PhaseType, FileChange[]> = {
    analyze: [],
    structure: [],
    components: [],
    styles: [],
    backend: [],
    config: [],
    packages: [],
  };
  
  files.forEach(file => {
    const path = file.path.toLowerCase();
    
    if (path.includes('.css') || path.includes('theme') || path.includes('style')) {
      groups.styles.push(file);
    } else if (path.includes('supabase') || path.includes('api') || path.includes('backend') || path.includes('edge')) {
      groups.backend.push(file);
    } else if (path.includes('config') || path.includes('package.json') || path.includes('tsconfig')) {
      groups.config.push(file);
    } else if (path.includes('app.tsx') || path.includes('main.tsx') || path.includes('index.')) {
      groups.structure.push(file);
    } else if (path.includes('/components/') || path.includes('/pages/') || path.includes('/hooks/')) {
      groups.components.push(file);
    } else {
      groups.components.push(file);
    }
  });
  
  return groups;
}

export default AgentPhaseMessage;
