import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Iridescence from '@/components/effects/Iridescence';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTitle } from '@/components/ui/PageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingProject } from '@/hooks/usePendingProject';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FilePreview } from '@/components/chat/FilePreview';
import { DropZoneOverlay } from '@/components/chat/DropZoneOverlay';
import { GenerationOverlay } from '@/components/create/GenerationOverlay';
import { AuthGateOverlay } from '@/components/builder/AuthGateOverlay';
import { 
  Globe, 
  Send, 
  Sparkles,
  Wand2,
  Loader2,
  Paperclip,
} from 'lucide-react';

type ProjectType = 'website' | 'tma';

interface ProjectCreationData {
  projectType: ProjectType;
  prompt: string;
}

const WEBSITE_PROMPTS = [
  'Лендинг для SaaS продукта с тарифами и формой регистрации',
  'Портфолио дизайнера с галереей работ',
  'Интернет-магазин с каталогом и корзиной',
  'Блог о технологиях с подпиской',
  'Корпоративный сайт с командой и услугами',
];

const TMA_PROMPTS = [
  'Магазин с каталогом, корзиной и оплатой через Stars',
  'Бот доставки еды с меню и отслеживанием заказа',
  'Игра-кликер с рейтингом и достижениями',
  'Сервис бронирования с календарём и уведомлениями',
  'Крипто-кошелёк с балансом и историей транзакций',
];


const TYPING_PLACEHOLDERS = {
  website: [
    'Лендинг для SaaS продукта...',
    'Портфолио фотографа...',
    'Интернет-магазин одежды...',
    'Блог о путешествиях...',
  ],
  tma: [
    'Магазин с оплатой через Stars...',
    'Бот доставки еды...',
    'Игра-кликер с рейтингом...',
    'Сервис бронирования...',
  ],
};

const PROMPT_STORAGE_KEY = 'pendingCreatePrompt';

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const { savePendingProject } = usePendingProject();

  // Parse URL params for type
  const searchParams = new URLSearchParams(location.search);
  const typeFromUrl = searchParams.get('type') as ProjectType | null;

  const savedProjectData = (location.state as { projectData?: ProjectCreationData })?.projectData;

  // Restore prompt from localStorage if returning after auth
  const getInitialPrompt = () => {
    if (savedProjectData?.prompt) return savedProjectData.prompt;
    const saved = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (saved) {
      // Clear after reading
      localStorage.removeItem(PROMPT_STORAGE_KEY);
      return saved;
    }
    return '';
  };

  const [projectType, setProjectType] = useState<ProjectType>(
    savedProjectData?.projectType || typeFromUrl || 'website'
  );
  const [prompt, setPrompt] = useState(getInitialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [typingPlaceholder, setTypingPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // File upload hook
  const fileUpload = useFileUpload();

  // Save prompt to localStorage when user is not authenticated (for recovery after auth)
  useEffect(() => {
    if (!isAuthenticated && prompt.trim()) {
      localStorage.setItem(PROMPT_STORAGE_KEY, prompt);
    }
  }, [prompt, isAuthenticated]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing animation effect
  useEffect(() => {
    const placeholders = TYPING_PLACEHOLDERS[projectType];
    const currentText = placeholders[placeholderIndex];
    
    const typeSpeed = isDeleting ? 30 : 80;
    const pauseTime = isDeleting ? 500 : 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setTypingPlaceholder(currentText.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && charIndex > 0) {
        setTypingPlaceholder(currentText.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((placeholderIndex + 1) % placeholders.length);
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex, projectType]);

  // Reset typing animation when project type changes
  useEffect(() => {
    setTypingPlaceholder('');
    setPlaceholderIndex(0);
    setCharIndex(0);
    setIsDeleting(false);
  }, [projectType]);

  // Update project type if URL param changes
  useEffect(() => {
    if (typeFromUrl && (typeFromUrl === 'website' || typeFromUrl === 'tma')) {
      setProjectType(typeFromUrl);
    }
  }, [typeFromUrl]);

  useEffect(() => {
    if (savedProjectData && isAuthenticated) {
      handleGenerate();
    }
  }, []);


  const handleGenerate = async () => {
    // Allow generation with prompt OR files
    if (!prompt.trim() && !fileUpload.hasFiles) return;
    
    // Show auth gate for unauthenticated users
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    
    setIsGenerating(true);
    setShowOverlay(true);

    // Build prompt with file context
    const fileContext = fileUpload.buildFileContext();
    const fullPrompt = prompt + fileContext;
    
    // Clear files after using them
    fileUpload.clearFiles();
  };

  const handleOverlayComplete = useCallback(() => {
    // Build final prompt with any remaining file context
    const fileContext = fileUpload.buildFileContext();
    const fullPrompt = prompt + fileContext;
    
    // Navigate to builder after animation completes
    navigate('/builder/new', { 
      state: { 
        projectType, 
        prompt: fullPrompt, 
        isGuest: !isAuthenticated 
      } 
    });
  }, [navigate, projectType, prompt, isAuthenticated, fileUpload]);
  
  // File drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      fileUpload.addFiles(files);
    }
  }, [fileUpload]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    
    if (files.length > 0) {
      e.preventDefault();
      fileUpload.addFiles(files);
    }
  }, [fileUpload]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Iridescence Background Effect */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <Iridescence
          speed={0.8}
          amplitude={0.15}
          mouseReact={true}
        />
      </div>
      
      <Header />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <PageTitle 
            description="Опиши идею — AI сгенерирует всё остальное" 
            centered 
            className="mb-8"
          >
            Создать проект
          </PageTitle>

          {/* Project Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center glass rounded-full p-1 relative">
              <button
                onClick={() => setProjectType('website')}
                className={cn(
                  'relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  projectType === 'website' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {projectType === 'website' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 glass-strong rounded-full shadow-md"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Globe className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Сайт</span>
              </button>
              <button
                onClick={() => setProjectType('tma')}
                className={cn(
                  'relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  projectType === 'tma' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {projectType === 'tma' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 glass-strong rounded-full shadow-md"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Send className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Telegram Mini App</span>
              </button>
            </div>
          </div>

          {/* Main Prompt Input */}
          <div 
            className="relative mb-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drop zone overlay */}
            <DropZoneOverlay isVisible={isDragging} className="rounded-3xl" />
            
            <div className="absolute left-4 top-4 z-10">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            
            {/* Attachment button */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*,.txt,.md,.json,.js,.ts,.tsx,.jsx,.css,.html,.xml,.yaml,.yml,.csv,.pdf';
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  if (files.length > 0) fileUpload.addFiles(files);
                };
                input.click();
              }}
              disabled={isGenerating || fileUpload.isUploading}
              className={cn(
                "absolute right-4 top-4 z-10 p-2 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "transition-colors",
                fileUpload.isUploading && "animate-pulse"
              )}
              title="Прикрепить файлы (Ctrl+V для вставки)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              onPaste={handlePaste}
              placeholder={`${typingPlaceholder || 'Опиши свой проект...'}${showCursor ? '|' : ''}`}
              className={cn(
                "min-h-[120px] pl-12 pr-14 pt-4 text-lg resize-none rounded-3xl border",
                "border-border/30 glass",
                "focus:border-primary/40 focus:bg-background/70",
                "transition-all duration-300 shadow-lg shadow-black/5 dark:shadow-black/20",
                fileUpload.hasFiles ? "pb-24" : "pb-16"
              )}
            />
            
            {/* Attached files preview */}
            {fileUpload.hasFiles && (
              <div className="absolute bottom-14 left-4 right-4">
                <FilePreview 
                  files={fileUpload.files} 
                  onRemove={fileUpload.removeFile} 
                />
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {prompt.length > 0 && `${prompt.length} символов`}
                {fileUpload.hasFiles && ` • ${fileUpload.files.length} файл(ов)`}
              </span>
              <Button 
                onClick={handleGenerate}
                disabled={(!prompt.trim() && !fileUpload.hasFiles) || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Генерируем...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Создать
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={projectType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-2"
              >
                {(projectType === 'website' ? WEBSITE_PROMPTS : TMA_PROMPTS).map((example, index) => (
                  <motion.button
                    key={example}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => setPrompt(example)}
                    className="text-sm px-4 py-2.5 rounded-xl glass hover:bg-background/70 text-muted-foreground hover:text-foreground transition-all text-left sm:text-center sm:rounded-full sm:py-1.5 sm:px-3"
                  >
                    {example}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Generation Overlay */}
      <GenerationOverlay 
        isVisible={showOverlay} 
        onComplete={handleOverlayComplete}
      />

      {/* Auth Gate Overlay - shown only when guest tries to create */}
      <AnimatePresence>
        {showAuthGate && !isAuthenticated && (
          <AuthGateOverlay 
            hasSavedContent={!!prompt.trim()} 
            onClose={() => setShowAuthGate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateProject;