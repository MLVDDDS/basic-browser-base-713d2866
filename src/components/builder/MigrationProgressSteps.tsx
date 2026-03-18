/**
 * 🎯 User-Friendly Migration Progress Steps
 * Shows database operations in plain language with animations
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Shield, 
  Users, 
  Trophy, 
  Star,
  Check,
  Loader2,
  Clock,
  Zap,
  Lock,
  Table2,
  Key,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MigrationStep {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

interface MigrationProgressStepsProps {
  sql: string;
  tables?: string[];
  features?: string[];
  isExecuting: boolean;
  result?: {
    success: boolean;
    results?: Array<{ statement: string; success: boolean; error?: string }>;
  };
}

// Parse SQL to user-friendly steps
function parseSqlToSteps(
  sql: string, 
  tables: string[] = [],
  features: string[] = []
): MigrationStep[] {
  const steps: MigrationStep[] = [];
  const sqlLower = sql.toLowerCase();
  
  // Detect table creation
  tables.forEach((table, idx) => {
    const friendlyName = getTableFriendlyName(table);
    steps.push({
      id: `table-${idx}`,
      icon: Table2,
      label: `Создаю ${friendlyName.toLowerCase()}`,
      description: `Таблица для хранения ${getTablePurpose(table)}`,
      status: 'pending',
    });
  });
  
  // If no tables detected from props, try to parse from SQL
  if (steps.length === 0 && sqlLower.includes('create table')) {
    const tableMatches = sql.match(/CREATE TABLE[^(]+\(([^)]+)\)/gi);
    if (tableMatches) {
      steps.push({
        id: 'tables',
        icon: Database,
        label: `Создаю ${tableMatches.length} ${getTableWord(tableMatches.length)}`,
        description: 'Структура для хранения данных',
        status: 'pending',
      });
    }
  }
  
  // Detect RLS (Row Level Security)
  if (sqlLower.includes('enable row level security') || sqlLower.includes('alter table') && sqlLower.includes('rls')) {
    steps.push({
      id: 'rls',
      icon: Shield,
      label: 'Включаю защиту данных',
      description: 'Каждый видит только свои данные',
      status: 'pending',
    });
  }
  
  // Detect policies
  const policyCount = (sql.match(/CREATE POLICY/gi) || []).length;
  if (policyCount > 0) {
    steps.push({
      id: 'policies',
      icon: Lock,
      label: 'Настраиваю права доступа',
      description: `${policyCount} ${getPolicyWord(policyCount)} безопасности`,
      status: 'pending',
    });
  }
  
  // Detect indexes
  if (sqlLower.includes('create index')) {
    steps.push({
      id: 'indexes',
      icon: Zap,
      label: 'Ускоряю поиск данных',
      description: 'Индексы для быстрой работы',
      status: 'pending',
    });
  }
  
  // Detect triggers
  if (sqlLower.includes('create trigger')) {
    steps.push({
      id: 'triggers',
      icon: Clock,
      label: 'Настраиваю автоматизацию',
      description: 'Автообновление временных меток',
      status: 'pending',
    });
  }
  
  // Feature-specific steps
  if (features.includes('leaderboard')) {
    steps.push({
      id: 'leaderboard',
      icon: Trophy,
      label: 'Подготавливаю лидерборд',
      description: 'Таблица рейтинга игроков',
      status: 'pending',
    });
  }
  
  if (features.includes('achievements')) {
    steps.push({
      id: 'achievements',
      icon: Star,
      label: 'Создаю систему достижений',
      description: 'Награды и бейджи',
      status: 'pending',
    });
  }
  
  // Final verification step
  steps.push({
    id: 'verify',
    icon: Check,
    label: 'Проверяю всё работает',
    description: 'Финальная проверка',
    status: 'pending',
  });
  
  return steps;
}

function getTableFriendlyName(tableName: string): string {
  const names: Record<string, string> = {
    'game_scores': 'Таблицу результатов',
    'scores': 'Таблицу очков',
    'achievements': 'Систему достижений',
    'profiles': 'Профили пользователей',
    'user_progress': 'Прогресс игроков',
    'leaderboard': 'Таблицу лидеров',
    'messages': 'Сообщения',
    'workouts': 'Тренировки',
    'products': 'Каталог товаров',
    'orders': 'Заказы',
    'users': 'Пользователей',
  };
  return names[tableName] || `Таблицу "${tableName}"`;
}

function getTablePurpose(tableName: string): string {
  const purposes: Record<string, string> = {
    'game_scores': 'результатов и рейтинга',
    'scores': 'игровых очков',
    'achievements': 'наград и достижений',
    'profiles': 'данных пользователей',
    'user_progress': 'прогресса и сохранений',
    'leaderboard': 'топ-игроков',
    'messages': 'переписки',
    'workouts': 'фитнес-данных',
    'products': 'товаров',
    'orders': 'покупок',
  };
  return purposes[tableName] || 'данных';
}

function getTableWord(count: number): string {
  if (count === 1) return 'таблицу';
  if (count >= 2 && count <= 4) return 'таблицы';
  return 'таблиц';
}

function getPolicyWord(count: number): string {
  if (count === 1) return 'правило';
  if (count >= 2 && count <= 4) return 'правила';
  return 'правил';
}

export function MigrationProgressSteps({
  sql,
  tables = [],
  features = [],
  isExecuting,
  result,
}: MigrationProgressStepsProps) {
  const [steps, setSteps] = useState<MigrationStep[]>(() => 
    parseSqlToSteps(sql, tables, features)
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const currentStepIndexRef = useRef(currentStepIndex);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);
  
  // Animate through steps when executing
  useEffect(() => {
    if (!isExecuting) {
      if (result?.success) {
        // Mark all as completed
        setSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const })));
        setCurrentStepIndex(steps.length);
      } else if (result && !result.success) {
        // Mark current as failed
        const failedStepIndex = currentStepIndexRef.current;
        setSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i === failedStepIndex ? 'failed' as const : 
                  i < failedStepIndex ? 'completed' as const : 'pending' as const
        })));
      }
      return;
    }
    
    // Start animation
    setCurrentStepIndex(0);
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i === 0 ? 'active' as const : 'pending' as const
    })));
    
    // Progress through steps
    const stepDuration = Math.max(800, 3000 / steps.length);
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(interval);
          return prev;
        }
        
        setSteps(prevSteps => prevSteps.map((s, i) => ({
          ...s,
          status: i === next ? 'active' as const :
                  i < next ? 'completed' as const : 'pending' as const
        })));
        
        return next;
      });
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [isExecuting, result, steps.length]);
  
  if (steps.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 py-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-xs text-muted-foreground font-medium">
          {isExecuting ? 'Выполняется...' : result?.success ? 'Готово!' : 'Что будет сделано'}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-300",
                step.status === 'active' && "bg-primary/10",
                step.status === 'completed' && "bg-accent/5",
                step.status === 'failed' && "bg-destructive/10",
                step.status === 'pending' && "opacity-50"
              )}
            >
              {/* Icon with status indicator */}
              <div className="relative">
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                    step.status === 'pending' && "bg-muted",
                    step.status === 'active' && "bg-primary/20",
                    step.status === 'completed' && "bg-accent/20",
                    step.status === 'failed' && "bg-destructive/20"
                  )}
                >
                  {step.status === 'active' ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : step.status === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </motion.div>
                  ) : (
                    <step.icon className={cn(
                      "w-4 h-4",
                      step.status === 'failed' ? "text-destructive" : "text-muted-foreground"
                    )} />
                  )}
                </motion.div>
                
                {/* Pulse animation for active step */}
                {step.status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              
              {/* Label and description */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate transition-colors duration-300",
                  step.status === 'active' && "text-primary",
                  step.status === 'completed' && "text-foreground",
                  step.status === 'failed' && "text-destructive",
                  step.status === 'pending' && "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {step.description}
                </p>
              </div>
              
              {/* Status indicator */}
              {step.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0"
                >
                  <Check className="w-4 h-4 text-accent-foreground" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Progress bar */}
      {isExecuting && (
        <motion.div 
          className="h-1 bg-muted rounded-full overflow-hidden mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${Math.min(100, ((currentStepIndex + 1) / steps.length) * 100)}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default MigrationProgressSteps;
