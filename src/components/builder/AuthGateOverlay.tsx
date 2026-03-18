import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, ArrowRight, Wand2, Layers, Palette, Rocket, Check, X, Save, History, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGateOverlayProps {
  onAuthClick?: () => void;
  redirectPath?: string;
  message?: string;
  hasSavedContent?: boolean;
  onClose?: () => void;
}

export const AuthGateOverlay = ({ 
  onAuthClick, 
  redirectPath,
  message = 'Войдите, чтобы продолжить создание',
  hasSavedContent = false,
  onClose
}: AuthGateOverlayProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = () => {
    if (onAuthClick) {
      onAuthClick();
    } else {
      const from = redirectPath || location.pathname + location.search;
      navigate('/login', { state: { from, message } });
    }
  };

  // Floating preview cards data
  const previewCards = [
    { icon: Wand2, label: 'AI генерация', delay: 0, x: -120, y: -80 },
    { icon: Layers, label: 'Компоненты', delay: 0.1, x: 100, y: -60 },
    { icon: Palette, label: 'Дизайн', delay: 0.2, x: -80, y: 60 },
    { icon: Rocket, label: 'Деплой', delay: 0.3, x: 120, y: 80 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/90 to-primary/10"
        animate={{
          background: [
            'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--background) / 0.9) 50%, hsl(var(--primary) / 0.1) 100%)',
            'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--background) / 0.9) 50%, hsl(var(--primary) / 0.05) 100%)',
            'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--background) / 0.9) 50%, hsl(var(--primary) / 0.1) 100%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blurred backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl" />

      {/* Floating preview elements behind the card */}
      <div className="absolute inset-0 pointer-events-none">
        {previewCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.5, x: card.x * 0.5, y: card.y * 0.5 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.9, 1, 0.9],
              x: [card.x * 0.8, card.x, card.x * 0.8],
              y: [card.y * 0.8, card.y, card.y * 0.8],
            }}
            transition={{
              delay: card.delay,
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ marginLeft: card.x, marginTop: card.y }}
          >
            <div className="px-4 py-2.5 rounded-xl bg-card/60 backdrop-blur-md border border-border/30 shadow-lg flex items-center gap-2">
              <card.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated circles */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border border-primary/10"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ rotate: { duration: 30, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity } }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full border border-primary/20"
        animate={{ rotate: -360, scale: [1, 0.95, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }}
      />

      {/* Content card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
      >
        {/* Close button */}
        {onClose && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
        {/* Glow effect */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/20 to-transparent opacity-50 pointer-events-none" />
        
        {/* Icon */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        >
          <div className="relative">
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
              animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div 
          className="text-center mb-6 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Почти готово!
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Авторизуйтесь, чтобы продолжить создание вашего проекта. 
            {hasSavedContent 
              ? ' Ваш промпт сохранён — после входа всё восстановится.'
              : ' После входа вы сможете создавать проекты.'}
          </p>
        </motion.div>

        {/* Saved content indicator */}
        {hasSavedContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20"
          >
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-primary">
              Ваш промпт сохранён
            </span>
          </motion.div>
        )}

        {/* Features list */}
        <motion.div 
          className="space-y-2.5 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { text: 'Сохранение всех проектов', icon: Save },
            { text: 'История изменений', icon: History },
            { text: 'Публикация на свой домен', icon: Globe },
          ].map((feature, i) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-2.5"
            >
              <feature.icon className="w-4 h-4 text-primary flex-shrink-0" />
              {feature.text}
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button 
            onClick={handleAuth} 
            className="w-full gap-2 h-12 text-base font-medium shadow-lg shadow-primary/20"
            size="lg"
          >
            Войти или зарегистрироваться
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
