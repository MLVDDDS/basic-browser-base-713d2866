/**
 * 📋 MessagesList Component v3.0
 * Пошаговые сообщения агента как отдельные блоки
 */
import { useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { StepsMessage } from './StepsMessage';
import { SystemMessage, SystemMessageType } from './SystemMessage';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { AgentStep, PendingMigration } from '@/hooks/useUnifiedOrchestrator';
import type { RunSummary } from './RunSummaryCard';
import { normalizeAgentStepsToTimeline, type ChatTimelineEvent, type ChatVersionDiff } from '@/lib/chat-ui-event-contract';

interface MessagesListProps {
  messages: ChatMessage[];
  isGenerating?: boolean;
  orchestratorSteps?: AgentStep[];
  orchestratorTextOutput?: string;
  pendingMigration?: PendingMigration;
  onMigrationApprove?: () => void;
  onMigrationReject?: () => void;
  className?: string;
}

function shouldRenderStreamingText(value: string): boolean {
  const text = String(value || "").trim();
  if (!text) return false;

  // Protect UX: do not show raw JSON/code dumps in live chat.
  if (text.startsWith("{") || text.startsWith("[") || text.startsWith("```")) return false;
  if (/"operations"\s*:|"summary"\s*:|"content"\s*:|import\s+.*from\s+['"]/.test(text)) {
    return false;
  }
  if (/\.tsx\b|\.ts\b|\.jsx\b|\.js\b/i.test(text)) return false;
  if (/^(принято|окей|понял|начинаю|сейчас|основные компоненты)\b/i.test(text)) {
    return false;
  }
  if (/\b(app|hero|pricing|header|section)\.tsx\b/i.test(text)) return false;
  if (text.includes("\\n") && text.length > 120) return false;
  if (!/[.!?…]$/.test(text) && text.length < 140) return false;
  return true;
}

export function MessagesList({
  messages,
  isGenerating = false,
  orchestratorSteps = [],
  orchestratorTextOutput = '',
  pendingMigration,
  onMigrationApprove,
  onMigrationReject,
  className
}: MessagesListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const stableMessages = useMemo(() => {
    const result: ChatMessage[] = [];
    const seenLegacyPlan = new Set<string>();
    const seenPlanFingerprint = new Set<string>();
    const seenRunMessages = new Set<string>();
    const runsWithSummary = new Set<string>();
    const latestStepMessageByRun = new Map<string, string>();
    let lastAssistantMessage: ChatMessage | null = null;

    const isLegacyPlanMessage = (msg: ChatMessage): boolean =>
      msg.role === 'assistant' &&
      typeof msg.content === 'string' &&
      /^📋\s*\*?\*?План работы:?/i.test(msg.content.trim());

    const normalizeText = (value: string) =>
      value.replace(/\s+/g, ' ').trim();

    const extractPlanFingerprint = (value: string): string => {
      const lines = String(value || "")
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const taskLines = lines
        .filter((line) => /^[-*]?\s*\d+[.)]?\s+/i.test(line) || /^[-*]\s+/i.test(line))
        .map((line) =>
          line
            .replace(/^[-*]?\s*\d+[.)]?\s+/i, '')
            .replace(/^[-*]\s+/i, '')
            .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
            .toLowerCase()
            .trim()
        )
        .filter(Boolean);

      if (taskLines.length === 0) return '';
      return taskLines.join('|');
    };

    for (const msg of messages) {
      const runId = String(msg.metadata?.runId || '').trim();
      if (msg.role !== 'assistant' || !runId) continue;
      if (msg.metadata?.runSummary) {
        runsWithSummary.add(runId);
      }
      const hasAgentSteps =
        Array.isArray(msg.metadata?.agentSteps) && msg.metadata.agentSteps.length > 0;
      if (hasAgentSteps) {
        latestStepMessageByRun.set(runId, msg.id);
      }
    }

    for (const msg of messages) {
      const runId = String(msg.metadata?.runId || '').trim();
      if (msg.role === 'assistant' && runId) {
        const hasRunSummary = Boolean(msg.metadata?.runSummary);
        const hasAgentSteps =
          Array.isArray(msg.metadata?.agentSteps) && msg.metadata.agentSteps.length > 0;
        const shouldKeepOnlyFinalCard = runsWithSummary.has(runId);
        if (shouldKeepOnlyFinalCard) {
          if (!hasRunSummary && !hasAgentSteps) {
            continue;
          }
          if (
            hasAgentSteps &&
            !hasRunSummary &&
            latestStepMessageByRun.get(runId) !== msg.id
          ) {
            continue;
          }
        }

        const runKey = `${runId}:${normalizeText(msg.content || '')}`;
        if (seenRunMessages.has(runKey)) {
          continue;
        }
        seenRunMessages.add(runKey);
      }

      if (isLegacyPlanMessage(msg)) {
        const key = `${msg.role}:${normalizeText(msg.content || '')}`;
        if (seenLegacyPlan.has(key)) {
          continue;
        }
        seenLegacyPlan.add(key);

        const planFingerprint = extractPlanFingerprint(msg.content || '');
        if (planFingerprint) {
          if (seenPlanFingerprint.has(planFingerprint)) {
            continue;
          }
          seenPlanFingerprint.add(planFingerprint);
        }
      }

      // Extra guard for historical duplicate assistant cards generated in a single run.
      if (msg.role === 'assistant' && lastAssistantMessage) {
        const sameContent =
          normalizeText(lastAssistantMessage.content || '') === normalizeText(msg.content || '');
        const timeDiffMs =
          Math.abs(new Date(msg.timestamp).getTime() - new Date(lastAssistantMessage.timestamp).getTime());
        if (sameContent && timeDiffMs <= 10_000) {
          continue;
        }
      }

      result.push(msg);
      if (msg.role === 'assistant') {
        lastAssistantMessage = msg;
      }
    }
    return result;
  }, [messages]);

  const streamingFallbackContent = useMemo(() => {
    if (!isGenerating) return '';
    return shouldRenderStreamingText(orchestratorTextOutput) ? orchestratorTextOutput : '';
  }, [isGenerating, orchestratorTextOutput]);
  const liveTimeline = useMemo(
    () => normalizeAgentStepsToTimeline(orchestratorSteps || []).slice(-8),
    [orchestratorSteps]
  );
  
  // Auto-scroll on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    return () => clearTimeout(timer);
  }, [stableMessages.length, orchestratorTextOutput]);

  return (
    <div className={className}>
      {/* Messages container with consistent spacing */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {stableMessages.map((msg) => {
            const hasSteps = msg.metadata?.agentSteps && 
              Array.isArray(msg.metadata.agentSteps) && 
              msg.metadata.agentSteps.length > 0;
            const chatTimeline = msg.metadata?.chatTimeline as ChatTimelineEvent[] | undefined;
            const versionDiff = msg.metadata?.versionDiff as ChatVersionDiff | undefined;
            const runSummary = msg.metadata?.runSummary as RunSummary | undefined;
            const agentSteps = msg.metadata?.agentSteps as AgentStep[] | undefined;
            const hasRichAssistantState = Boolean(
              hasSteps ||
              (Array.isArray(chatTimeline) && chatTimeline.length > 0) ||
              versionDiff ||
              runSummary
            );
            
            const isSystemMessage = msg.metadata?.type === 'system';
            
            // System messages
            if (isSystemMessage) {
              const systemType = (msg.metadata?.systemType as SystemMessageType) || 'info';
              if (systemType === 'info') {
                return null;
              }
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SystemMessage
                    type={systemType}
                    title={msg.metadata?.title as string || 'Уведомление'}
                    message={msg.content}
                    timestamp={new Date(msg.timestamp).getTime()}
                    animationDelay={0}
                  />
                </motion.div>
              );
            }
            
            // User messages
            if (msg.role === 'user') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserMessage
                    content={msg.content}
                    timestamp={new Date(msg.timestamp).getTime()}
                    animationDelay={0}
                  />
                </motion.div>
              );
            }
            
            // Assistant messages with structured run context
            if (hasRichAssistantState) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepsMessage
                    content={msg.content}
                    steps={agentSteps || []}
                    runSummary={runSummary}
                    timelineEvents={chatTimeline}
                    versionDiff={versionDiff || null}
                    timestamp={new Date(msg.timestamp).getTime()}
                    animationDelay={0}
                  />
                </motion.div>
              );
            }
            
            // Simple assistant messages
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AssistantMessage
                  content={msg.content}
                  runSummary={runSummary}
                  timestamp={new Date(msg.timestamp).getTime()}
                  animationDelay={0}
                />
              </motion.div>
            );
          })}
          
          {/* Live stream block (always visible while run is active) */}
          {isGenerating && (
            <motion.div
              key="streaming-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {streamingFallbackContent || orchestratorSteps.length > 0 ? (
                <StepsMessage
                  content={streamingFallbackContent}
                  steps={orchestratorSteps}
                  timelineEvents={liveTimeline}
                  isStreaming={true}
                  enableTextStreaming={false}
                  pendingMigration={pendingMigration}
                  onMigrationApprove={onMigrationApprove}
                  onMigrationReject={onMigrationReject}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Scroll anchor with padding */}
      <div ref={endRef} className="h-4" />
    </div>
  );
}
