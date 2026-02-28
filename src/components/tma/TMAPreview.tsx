/**
 * 📱 TMA Preview Mode Component
 * 
 * Phone mockup frame with Telegram WebApp API emulation.
 * Allows testing TMA apps with simulated Telegram environment.
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  MoreVertical, 
  Sun, 
  Moon,
  Vibrate,
  X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TelegramThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color: string;
}

interface EmulatedWebApp {
  initData: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: MainButtonState;
  BackButton: BackButtonState;
  HapticFeedback: HapticFeedbackEmulator;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

interface MainButtonState {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  setText: (text: string) => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  setParams: (params: Partial<MainButtonState>) => void;
}

interface BackButtonState {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

interface HapticFeedbackEmulator {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TMAPreviewContextValue {
  colorScheme: 'light' | 'dark';
  setColorScheme: (scheme: 'light' | 'dark') => void;
  mainButton: MainButtonState;
  setMainButton: React.Dispatch<React.SetStateAction<MainButtonState>>;
  backButton: BackButtonState;
  setBackButton: React.Dispatch<React.SetStateAction<BackButtonState>>;
  hapticLog: HapticEvent[];
  addHapticEvent: (event: HapticEvent) => void;
}

interface HapticEvent {
  id: string;
  type: 'impact' | 'notification' | 'selection';
  value: string;
  timestamp: number;
}

type WindowWithTelegram = Window & {
  Telegram?: {
    WebApp: EmulatedWebApp;
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const LIGHT_THEME: TelegramThemeParams = {
  bg_color: '#ffffff',
  text_color: '#000000',
  hint_color: '#999999',
  link_color: '#2481cc',
  button_color: '#2481cc',
  button_text_color: '#ffffff',
  secondary_bg_color: '#f1f1f1',
  header_bg_color: '#ffffff',
};

const DARK_THEME: TelegramThemeParams = {
  bg_color: '#18222d',
  text_color: '#ffffff',
  hint_color: '#708499',
  link_color: '#6ab3f3',
  button_color: '#6ab3f3',
  button_text_color: '#ffffff',
  secondary_bg_color: '#232e3c',
  header_bg_color: '#18222d',
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const TMAPreviewContext = createContext<TMAPreviewContextValue | null>(null);

export function useTMAPreview() {
  const context = useContext(TMAPreviewContext);
  if (!context) {
    throw new Error('useTMAPreview must be used within TMAPreviewProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TMAPreviewProps {
  children: React.ReactNode;
  /** Initial color scheme */
  initialScheme?: 'light' | 'dark';
  /** Show control panel */
  showControls?: boolean;
  /** Phone model style */
  phoneModel?: 'iphone' | 'android';
  /** Scale factor */
  scale?: number;
}

export function TMAPreview({
  children,
  initialScheme = 'light',
  showControls = true,
  phoneModel = 'iphone',
  scale = 1,
}: TMAPreviewProps) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(initialScheme);
  const [hapticLog, setHapticLog] = useState<HapticEvent[]>([]);
  const [showHapticLog, setShowHapticLog] = useState(false);

  // MainButton state
  const [mainButton, setMainButton] = useState<MainButtonState>({
    text: 'Continue',
    color: colorScheme === 'light' ? LIGHT_THEME.button_color : DARK_THEME.button_color,
    textColor: '#ffffff',
    isVisible: false,
    isActive: true,
    isProgressVisible: false,
    onClick: () => {},
    offClick: () => {},
    show: () => setMainButton(prev => ({ ...prev, isVisible: true })),
    hide: () => setMainButton(prev => ({ ...prev, isVisible: false })),
    setText: (text) => setMainButton(prev => ({ ...prev, text })),
    showProgress: () => setMainButton(prev => ({ ...prev, isProgressVisible: true })),
    hideProgress: () => setMainButton(prev => ({ ...prev, isProgressVisible: false })),
    setParams: (params) => setMainButton(prev => ({ ...prev, ...params })),
  });

  // BackButton state
  const [backButton, setBackButton] = useState<BackButtonState>({
    isVisible: false,
    onClick: () => {},
    offClick: () => {},
    show: () => setBackButton(prev => ({ ...prev, isVisible: true })),
    hide: () => setBackButton(prev => ({ ...prev, isVisible: false })),
  });

  const addHapticEvent = useCallback((event: HapticEvent) => {
    setHapticLog(prev => [...prev.slice(-9), event]);
  }, []);

  // Inject emulated WebApp into window
  useEffect(() => {
    const theme = colorScheme === 'light' ? LIGHT_THEME : DARK_THEME;
    
    const emulatedWebApp: EmulatedWebApp = {
      initData: '',
      colorScheme,
      themeParams: theme,
      isExpanded: true,
      viewportHeight: 600,
      viewportStableHeight: 600,
      MainButton: mainButton,
      BackButton: backButton,
      HapticFeedback: {
        impactOccurred: (style) => {
          console.log(`[TMA Emulator] Haptic impact: ${style}`);
          addHapticEvent({
            id: Math.random().toString(36).slice(2),
            type: 'impact',
            value: style,
            timestamp: Date.now(),
          });
        },
        notificationOccurred: (type) => {
          console.log(`[TMA Emulator] Haptic notification: ${type}`);
          addHapticEvent({
            id: Math.random().toString(36).slice(2),
            type: 'notification',
            value: type,
            timestamp: Date.now(),
          });
        },
        selectionChanged: () => {
          console.log('[TMA Emulator] Haptic selection');
          addHapticEvent({
            id: Math.random().toString(36).slice(2),
            type: 'selection',
            value: 'changed',
            timestamp: Date.now(),
          });
        },
      },
      ready: () => console.log('[TMA Emulator] App ready'),
      expand: () => console.log('[TMA Emulator] Expand requested'),
      close: () => console.log('[TMA Emulator] Close requested'),
    };

    const tgWindow = window as WindowWithTelegram;
    tgWindow.Telegram = { WebApp: emulatedWebApp as any };

    return () => {
      delete tgWindow.Telegram;
    };
  }, [colorScheme, mainButton, backButton, addHapticEvent]);

  const theme = colorScheme === 'light' ? LIGHT_THEME : DARK_THEME;

  return (
    <TMAPreviewContext.Provider
      value={{
        colorScheme,
        setColorScheme,
        mainButton,
        setMainButton,
        backButton,
        setBackButton,
        hapticLog,
        addHapticEvent,
      }}
    >
      <div className="flex items-start gap-6">
        {/* Phone Mockup */}
        <div
          className="relative"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {/* Phone frame */}
          <div
            className={cn(
              'relative rounded-[3rem] overflow-hidden',
              'shadow-2xl',
              phoneModel === 'iphone' 
                ? 'w-[375px] h-[812px] bg-black p-3' 
                : 'w-[360px] h-[760px] bg-gray-900 p-2'
            )}
          >
            {/* Dynamic Island / Notch */}
            {phoneModel === 'iphone' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="w-28 h-7 bg-black rounded-full" />
              </div>
            )}

            {/* Screen */}
            <div 
              className={cn(
                'relative w-full h-full overflow-hidden',
                phoneModel === 'iphone' ? 'rounded-[2.5rem]' : 'rounded-xl'
              )}
              style={{ backgroundColor: theme.bg_color }}
            >
              {/* Telegram Header Bar */}
              <div 
                className="flex items-center justify-between px-4 h-12"
                style={{ 
                  backgroundColor: theme.header_bg_color,
                  paddingTop: phoneModel === 'iphone' ? '28px' : '8px',
                  height: phoneModel === 'iphone' ? '76px' : '56px',
                }}
              >
                {/* Back button */}
                <button 
                  className={cn(
                    'p-2 rounded-full transition-opacity',
                    backButton.isVisible ? 'opacity-100' : 'opacity-30'
                  )}
                  style={{ color: theme.link_color }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Title */}
                <span 
                  className="font-semibold"
                  style={{ color: theme.text_color }}
                >
                  Mini App
                </span>

                {/* Menu */}
                <button 
                  className="p-2 rounded-full"
                  style={{ color: theme.hint_color }}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Content area */}
              <div 
                className="overflow-y-auto"
                style={{ 
                  height: mainButton.isVisible ? 'calc(100% - 128px)' : 'calc(100% - 76px)',
                }}
              >
                {children}
              </div>

              {/* MainButton */}
              <AnimatePresence>
                {mainButton.isVisible && (
                  <motion.div
                    initial={{ y: 60 }}
                    animate={{ y: 0 }}
                    exit={{ y: 60 }}
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{ backgroundColor: theme.bg_color }}
                  >
                    <button
                      className={cn(
                        'w-full py-3.5 rounded-xl font-semibold',
                        'flex items-center justify-center gap-2',
                        !mainButton.isActive && 'opacity-50'
                      )}
                      style={{
                        backgroundColor: mainButton.color,
                        color: mainButton.textColor,
                      }}
                    >
                      {mainButton.isProgressVisible && (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {mainButton.text}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        {showControls && (
          <div className="bg-tma-card rounded-xl p-4 w-64 space-y-4">
            <h3 className="font-semibold text-tma-text">TMA Controls</h3>

            {/* Theme toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-tma-hint">Theme</span>
              <div className="flex gap-1 bg-tma-bg rounded-lg p-1">
                <button
                  onClick={() => setColorScheme('light')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    colorScheme === 'light' ? 'bg-tma-button text-white' : 'text-tma-hint'
                  )}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setColorScheme('dark')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    colorScheme === 'dark' ? 'bg-tma-button text-white' : 'text-tma-hint'
                  )}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MainButton controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-tma-hint">MainButton</span>
                <button
                  onClick={() => setMainButton(prev => ({ ...prev, isVisible: !prev.isVisible }))}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    mainButton.isVisible 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-tma-hint/20 text-tma-hint'
                  )}
                >
                  {mainButton.isVisible ? 'Visible' : 'Hidden'}
                </button>
              </div>
              <input
                type="text"
                value={mainButton.text}
                onChange={(e) => setMainButton(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-tma-bg text-tma-text text-sm"
                placeholder="Button text"
              />
            </div>

            {/* BackButton controls */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-tma-hint">BackButton</span>
              <button
                onClick={() => setBackButton(prev => ({ ...prev, isVisible: !prev.isVisible }))}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  backButton.isVisible 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-tma-hint/20 text-tma-hint'
                )}
              >
                {backButton.isVisible ? 'Visible' : 'Hidden'}
              </button>
            </div>

            {/* Haptic log */}
            <div>
              <button
                onClick={() => setShowHapticLog(!showHapticLog)}
                className="flex items-center gap-2 text-sm text-tma-hint"
              >
                <Vibrate className="w-4 h-4" />
                Haptic Events ({hapticLog.length})
              </button>
              
              <AnimatePresence>
                {showHapticLog && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {hapticLog.slice().reverse().map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-2 py-1 bg-tma-bg rounded flex justify-between"
                      >
                        <span className="text-tma-text">{event.type}</span>
                        <span className="text-tma-hint">{event.value}</span>
                      </div>
                    ))}
                    {hapticLog.length === 0 && (
                      <p className="text-xs text-tma-hint">No haptic events yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </TMAPreviewContext.Provider>
  );
}

export default TMAPreview;
