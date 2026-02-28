import { cn } from '@/lib/utils';
import { Send, ChevronLeft, MoreVertical } from 'lucide-react';

interface TelegramFrameProps {
  children: React.ReactNode;
  scale?: number;
  /** If true, hides header/footer for full-screen content */
  fullScreen?: boolean;
  /** Theme variant for the frame chrome */
  theme?: 'light' | 'dark';
  /** App name to display in header */
  appName?: string;
}

export const TelegramFrame = ({ 
  children, 
  scale = 1, 
  fullScreen = false,
  theme = 'light',
  appName = 'Mini App'
}: TelegramFrameProps) => {
  const isDark = theme === 'dark';
  
  return (
    <div 
      className="relative transition-transform duration-300 ease-out origin-center"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Phone frame - iPhone 14 Pro style */}
      <div 
        className={cn(
          "w-[375px] h-[720px] rounded-[50px] p-[3px] shadow-2xl",
          "bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900",
          "border border-zinc-600/50"
        )}
      >
        {/* Inner bezel */}
        <div 
          className={cn(
            "w-full h-full rounded-[47px] overflow-hidden relative",
            isDark ? "bg-[#18222d]" : "bg-white"
          )}
        >
          {/* Dynamic Island */}
          <div 
            className={cn(
              "absolute top-[12px] left-1/2 -translate-x-1/2 z-30",
              "w-[126px] h-[37px] bg-black rounded-[20px]",
              "flex items-center justify-center gap-3"
            )}
          >
            {/* Camera dot */}
            <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700 relative">
              <div className="absolute inset-1 rounded-full bg-zinc-900" />
              <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-blue-500/30" />
            </div>
          </div>
          
          {/* Screen content wrapper - overflow hidden to prevent scrollbar here */}
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Status bar - hidden in fullScreen to avoid overlapping content */}
            {!fullScreen && (
              <div 
                className={cn(
                  "flex items-end justify-between px-8 pb-1 z-20",
                  "h-[54px] shrink-0",
                  isDark ? "text-white" : "text-black"
                )}
              >
                <span className="text-sm font-medium">9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 rounded-full",
                          isDark ? "bg-white" : "bg-black",
                          i === 1 && "h-1",
                          i === 2 && "h-1.5",
                          i === 3 && "h-2",
                          i === 4 && "h-2.5"
                        )} 
                      />
                    ))}
                  </div>
                  <div className={cn(
                    "w-6 h-3 rounded-sm border",
                    isDark ? "border-white" : "border-black"
                  )}>
                    <div className={cn(
                      "w-4 h-full rounded-sm",
                      isDark ? "bg-white" : "bg-black"
                    )} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Telegram header - only show when not fullScreen */}
            {!fullScreen && (
              <div 
                className={cn(
                  "shrink-0 flex items-center justify-between px-4 py-2.5",
                  isDark 
                    ? "bg-[#18222d] border-b border-white/10" 
                    : "bg-white border-b border-black/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <button 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDark 
                        ? "text-[#6ab3f3] hover:bg-white/10" 
                        : "text-[#2481cc] hover:bg-black/5"
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div 
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center",
                        isDark ? "bg-[#6ab3f3]/20" : "bg-[#2481cc]/10"
                      )}
                    >
                      <Send 
                        className={cn(
                          "w-4 h-4",
                          isDark ? "text-[#6ab3f3]" : "text-[#2481cc]"
                        )} 
                      />
                    </div>
                    <span 
                      className={cn(
                        "text-[15px] font-medium",
                        isDark ? "text-white" : "text-black"
                      )}
                    >
                      {appName}
                    </span>
                  </div>
                </div>
                <button 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isDark 
                      ? "text-[#6ab3f3] hover:bg-white/10" 
                      : "text-[#2481cc] hover:bg-black/5"
                  )}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Content area - overflow hidden, scroll handled by iframe */}
            <div 
              className={cn(
                "flex-1 overflow-hidden relative",
                isDark ? "bg-[#18222d]" : "bg-[#f5f5f5]"
              )}
            >
              {children}
            </div>
            
            {/* Main Button - only show when not fullScreen */}
            {!fullScreen && (
              <div 
                className={cn(
                  "shrink-0 p-3",
                  isDark 
                    ? "bg-[#18222d] border-t border-white/10" 
                    : "bg-white border-t border-black/5"
                )}
              >
                <div 
                  className={cn(
                    "w-full py-3.5 rounded-xl flex items-center justify-center",
                    isDark ? "bg-[#6ab3f3]" : "bg-[#2481cc]"
                  )}
                >
                  <span className="text-[15px] font-semibold text-white">
                    Продолжить
                  </span>
                </div>
              </div>
            )}
            
            {/* Home indicator */}
            <div 
              className={cn(
                "shrink-0 py-2 flex justify-center",
                isDark ? "bg-[#18222d]" : "bg-white"
              )}
            >
              <div 
                className={cn(
                  "w-[134px] h-[5px] rounded-full",
                  isDark ? "bg-white/30" : "bg-black/20"
                )} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-8 bg-primary/5 rounded-[70px] -z-10 blur-3xl" />
    </div>
  );
};
