import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Send,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  MessageSquare
} from 'lucide-react';
import { PulseDot } from '@/components/ui/PulseDot';

type ViewType = 'website' | 'tma';
type DeviceSize = 'desktop' | 'tablet' | 'mobile';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const websiteMessages: ChatMessage[] = [
  { role: 'user', text: 'Сделай сайт для кофейни' },
  { role: 'ai', text: 'Готово! Добавил меню, фото и контакты ☕' },
  { role: 'user', text: 'Добавь форму заказа' },
  { role: 'ai', text: 'Сделано! Клиенты могут заказать онлайн 🛒' },
];

const tmaMessages: ChatMessage[] = [
  { role: 'user', text: 'Создай бота для доставки еды' },
  { role: 'ai', text: 'Готово! Добавил каталог и корзину 🍕' },
  { role: 'user', text: 'Подключи оплату Stars' },
  { role: 'ai', text: 'Сделано! Оплата через Telegram ⭐' },
];

const deviceSizes: Record<DeviceSize, { scale: number; icon: React.ElementType; label: string }> = {
  desktop: { scale: 1, icon: Monitor, label: 'Desktop' },
  tablet: { scale: 0.75, icon: Tablet, label: 'Tablet' },
  mobile: { scale: 0.5, icon: Smartphone, label: 'Mobile' },
};

// Typing animation component
const TypingText = ({ text, onComplete, messageKey }: { text: string; onComplete?: () => void; messageKey: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when messageKey changes
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [text, messageKey]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export const BuilderDemo = () => {
  const [viewType, setViewType] = useState<ViewType>('website');
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [inputValue, setInputValue] = useState('');
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [typingComplete, setTypingComplete] = useState<number[]>([]);

  // Get current messages based on view type
  const currentMessages = viewType === 'website' ? websiteMessages : tmaMessages;

  // Reset chat animation when view type changes
  useEffect(() => {
    setVisibleMessages(0);
    setTypingComplete([]);
  }, [viewType]);

  // Animate messages appearing
  useEffect(() => {
    if (visibleMessages === 0) {
      const timer = setTimeout(() => {
        setVisibleMessages(1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [viewType, visibleMessages]);

  const handleTypingComplete = (index: number) => {
    if (typingComplete.includes(index)) return; // Prevent duplicate calls
    
    setTypingComplete(prev => [...prev, index]);
    // Show next message after current one finishes typing
    if (index < currentMessages.length - 1) {
      setTimeout(() => {
        setVisibleMessages(prev => Math.min(prev + 1, currentMessages.length));
      }, 600);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5 w-full max-w-[600px]">
      {/* Window header */}
      <div className="border-b border-border px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 bg-muted/30">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400/80" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400/80" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 text-center min-w-0">
          <span className="text-[10px] sm:text-sm text-muted-foreground font-medium truncate">lyubakod.app/builder</span>
        </div>
        
        {/* View type toggle */}
        <div className="relative flex items-center bg-muted/50 rounded-lg p-0.5 sm:p-1 flex-shrink-0">
          <PulseDot position="top-right" delay={2000} size={6} />
          <button
            onClick={() => setViewType('website')}
            className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md transition-all flex items-center gap-1 ${
              viewType === 'website' 
                ? 'bg-background text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-[8px] sm:text-[10px] font-medium">Сайт</span>
          </button>
          <button
            onClick={() => setViewType('tma')}
            className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md transition-all flex items-center gap-1 whitespace-nowrap ${
              viewType === 'tma' 
                ? 'bg-background text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-[8px] sm:text-[10px] font-medium whitespace-nowrap">Telegram Mini App</span>
          </button>
        </div>
      </div>
      
      {/* Builder interface */}
      <div className="flex h-[280px] sm:h-[340px] md:h-[380px]">
        {/* Left sidebar - AI Chat */}
        <div className="w-[140px] sm:w-[180px] md:w-[200px] border-r border-border flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-2 sm:p-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-primary font-medium">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">AI Ассистент</span>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto">
            <AnimatePresence mode="sync">
              {currentMessages.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={`${viewType}-${i}`}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`text-[9px] sm:text-[11px] p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${
                    msg.role === 'user' 
                      ? 'bg-primary/20 text-foreground ml-2 sm:ml-3' 
                      : 'bg-muted text-muted-foreground mr-2 sm:mr-3'
                  }`}
                >
                  {typingComplete.includes(i) ? (
                    msg.text
                  ) : (
                    <TypingText 
                      text={msg.text} 
                      messageKey={`${viewType}-${i}`}
                      onComplete={() => handleTypingComplete(i)} 
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing indicator when waiting for next message */}
            {visibleMessages > 0 && visibleMessages < currentMessages.length && typingComplete.includes(visibleMessages - 1) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 px-3 py-2"
              >
                <motion.div 
                  className="w-1.5 h-1.5 bg-primary/50 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-primary/50 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-primary/50 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="p-2 sm:p-3 border-t border-border">
            <div className="relative flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
              <PulseDot position="top-left" delay={4000} size={6} />
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Опиши..."
                className="flex-1 bg-transparent text-[10px] sm:text-xs outline-none placeholder:text-muted-foreground/50 min-w-0"
              />
              <button className="text-primary hover:text-primary/80 flex-shrink-0">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right - Preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Device size toolbar - only for website, but reserve space for TMA */}
          <div className={`px-2 sm:px-4 py-2 border-b border-border flex items-center justify-center gap-1 sm:gap-2 ${viewType === 'website' ? 'bg-muted/10' : 'bg-transparent'}`}>
            {viewType === 'website' ? (
              <>
                {(Object.keys(deviceSizes) as DeviceSize[]).map((size) => {
                  const { icon: Icon, label } = deviceSizes[size];
                  return (
                    <button
                      key={size}
                      onClick={() => setDeviceSize(size)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                        deviceSize === size 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      title={label}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  );
                })}
              </>
            ) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground">Telegram Mini App</span>
            )}
          </div>

          {/* Preview container - FIXED size for both views */}
          <div className="flex-1 bg-gradient-to-br from-muted/20 to-muted/40 p-3 sm:p-6 flex items-center justify-center overflow-hidden">
            {/* Fixed outer container - same size for both views */}
            <div className="w-[200px] sm:w-[260px] h-[160px] sm:h-[200px] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {viewType === 'website' ? (
                  <motion.div 
                    key={deviceSize}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-background rounded-lg sm:rounded-xl border border-border shadow-xl origin-center"
                    style={{
                      width: deviceSize === 'mobile' ? '100px' : deviceSize === 'tablet' ? '150px' : '100%',
                      transform: deviceSize === 'mobile' ? 'scale(0.85)' : 'none',
                      background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)'
                    }}
                  >
                    {/* Website mockup content */}
                    <div className="p-2 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="h-1 sm:h-1.5 w-8 sm:w-16 bg-foreground/20 rounded mb-0.5" />
                          <div className="h-0.5 sm:h-1 w-5 sm:w-10 bg-muted-foreground/20 rounded" />
                        </div>
                      </div>
                      <div className="h-1 sm:h-2.5 w-3/4 bg-foreground/20 rounded mb-1 sm:mb-2" />
                      <div className="h-0.5 sm:h-1.5 w-full bg-muted-foreground/20 rounded mb-0.5" />
                      <div className="h-0.5 sm:h-1.5 w-2/3 bg-muted-foreground/20 rounded mb-1.5 sm:mb-3" />
                      <div className="h-4 sm:h-7 w-14 sm:w-24 bg-primary rounded-md sm:rounded-lg shadow-lg shadow-primary/30 flex items-center justify-center">
                        <span className="text-[6px] sm:text-[9px] text-primary-foreground font-medium">Кнопка</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="tma"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex items-center justify-center"
                  >
                    {/* Phone frame for TMA */}
                    <div className="bg-foreground/90 rounded-[20px] sm:rounded-[28px] p-1.5 sm:p-2 shadow-2xl">
                      <div className="bg-background rounded-[16px] sm:rounded-[22px] overflow-hidden w-[90px] sm:w-[120px]">
                        {/* Telegram header */}
                        <div className="bg-[#2AABEE] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-1.5 sm:h-2 w-10 sm:w-14 bg-white/80 rounded" />
                            <div className="h-1 w-8 sm:w-10 bg-white/40 rounded mt-0.5 sm:mt-1" />
                          </div>
                        </div>
                        
                        {/* Mini App content */}
                        <div className="p-2 sm:p-3 bg-gradient-to-b from-background to-muted/50 h-[100px] sm:h-[130px]">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 mb-2 flex items-center justify-center mx-auto">
                            <Send className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="h-1.5 sm:h-2 w-12 sm:w-16 bg-foreground/20 rounded mx-auto mb-1" />
                          <div className="h-1 w-14 sm:w-18 bg-muted-foreground/20 rounded mx-auto mb-2 sm:mb-3" />
                          
                          {/* Mini app buttons */}
                          <div className="space-y-1 sm:space-y-1.5">
                            <div className="h-4 sm:h-5 w-full bg-primary rounded-md shadow-md" />
                            <div className="h-4 sm:h-5 w-full bg-muted rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
