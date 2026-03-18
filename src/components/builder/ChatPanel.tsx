/**
 * 💬 ChatPanel v2.0
 * Modular chat interface with improved UX and proper spacing
 * MEMOIZED to prevent re-renders during panel resize
 */
import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { Wand2, Loader2, Brain, Wrench, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';

// New modular components
import { MessagesList } from '@/components/chat/MessagesList';
import { InputArea } from '@/components/chat/InputArea';
import { SuggestionsPanel, AISuggestion } from '@/components/chat/SuggestionsPanel';
import { EmptyState } from '@/components/chat/EmptyState';
import { LoadingState } from '@/components/chat/LoadingState';
import { StatusBar } from '@/components/chat/StatusBar';
import { IntentIndicator } from '@/components/chat/IntentIndicator';
import { ClarificationWizard, ClarificationResult } from '@/components/chat/ClarificationWizard';
import type { ClarificationQuestion } from '@/types/clarification';

import type { ChatMessage } from '@/hooks/useChatHistory';
import type { AgentStep, PipelineMode, PipelinePhase, PendingMigration } from '@/hooks/useUnifiedOrchestrator';
import type { UploadedFile } from '@/hooks/useFileUpload';

interface CachedProject {
  id: string;
  name: string;
  updatedAt: number;
  structure: { files: Array<{ path: string; content: string }> };
}

interface ChatPanelProps {
  messages: ChatMessage[];
  suggestions: AISuggestion[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  onSuggestionClick: (suggestion: AISuggestion) => void;
  isGenerating: boolean;
  isPreprocessing: boolean;
  orchestratorSteps: AgentStep[];
  orchestratorTextOutput: string;
  orchestratorIteration: number;
  orchestratorMaxIterations: number;
  orchestratorPendingMigration?: PendingMigration;
  onMigrationApprove?: () => void;
  onMigrationReject?: () => void;
  onStop: () => void;
  currentMode: PipelineMode | null;
  currentPhase: PipelinePhase | null;
  isRecording: boolean;
  isSpeechSupported: boolean;
  onToggleRecording: () => void;
  intentIndicator: { actionType: string; target: string; complexity: 'low' | 'medium' | 'high' } | null;
  showClarification: boolean;
  clarificationQuestions: ClarificationQuestion[] | string[];
  onClarificationComplete: (result: ClarificationResult) => void;
  onClarificationSkip: () => void;
  isGuestMode: boolean;
  guestFakeProgress: number;
  showCacheRestore: boolean;
  cachedProjects: CachedProject[];
  hasCachedProjects: boolean;
  onRestoreFromCache: (cached: CachedProject) => void;
  onDismissCacheRestore: () => void;
  onClearCache: () => void;
  className?: string;
  // File upload props
  attachedFiles?: UploadedFile[];
  onFilesAdd?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  isUploading?: boolean;
}

// Memoized to prevent re-renders during resize drag
export const ChatPanel = memo<ChatPanelProps>(function ChatPanel(props) {
  const {
    messages, suggestions, showSuggestions, onShowSuggestionsChange,
    prompt, onPromptChange, onSubmit, onSuggestionClick,
    isGenerating, isPreprocessing,
    orchestratorSteps, orchestratorTextOutput, orchestratorIteration, orchestratorMaxIterations,
    orchestratorPendingMigration, onMigrationApprove, onMigrationReject, onStop,
    currentMode, currentPhase,
    isRecording, isSpeechSupported, onToggleRecording,
    intentIndicator, showClarification, clarificationQuestions, onClarificationComplete, onClarificationSkip,
    isGuestMode, guestFakeProgress,
    showCacheRestore, cachedProjects, hasCachedProjects, onRestoreFromCache, onDismissCacheRestore, onClearCache,
    className,
    attachedFiles, onFilesAdd, onFileRemove, isUploading,
  } = props;

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isExpandedView, setIsExpandedView] = useState(false);

  // Check if we've had at least one completed build
  const hasCompletedBuild = messages.some(m => 
    m.role === 'assistant' && 
    (m.metadata?.agentSteps || m.content.includes('✅'))
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, orchestratorSteps, orchestratorTextOutput]);

  return (
    <aside 
      data-tour="ai-chat" 
      className={cn(
        "h-full border-r border-border bg-card/95 flex flex-col overflow-hidden",
        // Minimum width for responsive mode
        "min-w-[300px]",
        className
      )}
    >

      <div className="flex-1 flex flex-col min-h-0">

        {/* Messages ScrollArea */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-4">
            {messages.length === 0 ? (
              <EmptyState
                showCacheRestore={showCacheRestore}
                cachedProjects={cachedProjects}
                hasCachedProjects={hasCachedProjects}
                onRestoreFromCache={onRestoreFromCache}
                onDismissCacheRestore={onDismissCacheRestore}
                onClearCache={onClearCache}
              />
            ) : (
              <>
                <MessagesList
                  messages={messages}
                  isGenerating={isGenerating}
                  orchestratorSteps={orchestratorSteps}
                  orchestratorTextOutput={orchestratorTextOutput}
                  pendingMigration={orchestratorPendingMigration}
                  onMigrationApprove={onMigrationApprove}
                  onMigrationReject={onMigrationReject}
                />
                
                {/* Loading state when generating but no steps yet */}
                {isGenerating && orchestratorSteps.length === 0 && (
                  <div className="mt-4">
                    <LoadingState 
                      iteration={orchestratorIteration} 
                      maxIterations={orchestratorMaxIterations} 
                      mode={currentMode} 
                      phase={currentPhase} 
                    />
                  </div>
                )}
                
                {/* Status bar during generation */}
                {isGenerating && orchestratorSteps.length > 0 && (
                  <div className="mt-4">
                    <StatusBar 
                      mode={currentMode} 
                      phase={currentPhase} 
                      iteration={orchestratorIteration}
                      maxIterations={orchestratorMaxIterations}
                      stepsCount={orchestratorSteps.length}
                      onStop={onStop} 
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Guest mode fake progress */}
            {isGuestMode && !isGenerating && guestFakeProgress > 0 && (
              <div className="mt-4">
                <GuestProgressUI progress={guestFakeProgress} />
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Suggestions - only shown after first build */}
        {!isGenerating && (
          <SuggestionsPanel 
            suggestions={suggestions} 
            isOpen={showSuggestions} 
            onOpenChange={onShowSuggestionsChange} 
            onSuggestionClick={onSuggestionClick}
            hasCompletedBuild={hasCompletedBuild}
          />
        )}
        
        {/* Intent indicator during preprocessing/generation */}
        {(isGenerating || isPreprocessing) && intentIndicator && (
          <div className="px-4 pt-2">
            <IntentIndicator 
              actionType={intentIndicator.actionType} 
              target={intentIndicator.target} 
              complexity={intentIndicator.complexity} 
              isVisible={true}
              isProcessing={isPreprocessing} 
            />
          </div>
        )}
        
        {/* Clarification wizard */}
        {showClarification && clarificationQuestions.length > 0 && (
          <div className="px-4 pt-3">
            <ClarificationWizard
              questions={typeof clarificationQuestions[0] === 'string' ? undefined : clarificationQuestions as ClarificationQuestion[]}
              legacyQuestions={typeof clarificationQuestions[0] === 'string' ? clarificationQuestions as string[] : undefined}
              isVisible={showClarification} 
              onComplete={onClarificationComplete} 
              onSkip={onClarificationSkip} 
            />
          </div>
        )}
        
        {/* Input area */}
        <InputArea 
          value={prompt} 
          onChange={onPromptChange} 
          onSubmit={onSubmit} 
          onStop={onStop} 
          disabled={showClarification} 
          isGenerating={isGenerating} 
          isRecording={isRecording} 
          isSpeechSupported={isSpeechSupported} 
          onToggleRecording={onToggleRecording}
          attachedFiles={attachedFiles}
          onFilesAdd={onFilesAdd}
          onFileRemove={onFileRemove}
          isUploading={isUploading}
        />
      </div>
    </aside>
  );
});
ChatPanel.displayName = 'ChatPanel';

/**
 * Guest mode progress simulation
 */
function GuestProgressUI({ progress }: { progress: number }) {
  return (
    <div className="flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
        <Brain className="w-4 h-4 text-primary-foreground animate-pulse" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Итерация 1/5</span>
          <Loader2 className="w-3 h-3 animate-spin" />
        </div>
        <AnimatePresence mode="popLayout">
          {progress > 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs p-3 rounded-xl border bg-amber-500/10 border-amber-500/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium">Thinking</span>
              </div>
              <p className="text-muted-foreground">Анализирую требования...</p>
            </motion.div>
          )}
          {progress > 12 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs p-3 rounded-xl border bg-blue-500/10 border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium">create_file</span>
              </div>
              <p className="text-muted-foreground font-mono text-[11px]">/src/components/Hero.tsx</p>
            </motion.div>
          )}
          {progress > 20 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs p-3 rounded-xl border bg-green-500/10 border-green-500/20"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="font-medium">Файл создан</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export type { AISuggestion };
