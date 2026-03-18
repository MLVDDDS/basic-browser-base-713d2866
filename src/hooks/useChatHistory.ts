import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { AgentStepData } from '@/components/chat/AgentStepHistory';
import { isApiConfigured } from '@/lib/api-client';
import {
  createProjectMessage,
  createProjectMessagesBulk,
  deleteProjectMessages,
  fetchProjectMessages,
  type ChatMessageRowDto,
} from '@/features/builder/api/chat-history-api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  saved?: boolean; // true after DB save, false if pending
  metadata?: {
    agentSteps?: AgentStepData[];
    filesCreated?: string[];
    packagesInstalled?: string[];
    model?: string;
    duration?: number;
    [key: string]: unknown;
  };
}

interface UseChatHistoryOptions {
  projectId?: string;
  autoLoad?: boolean;
}

interface PendingRetry {
  message: ChatMessage;
  targetProjectId: string;
  attempts: number;
}

type ChatMessageRow = ChatMessageRowDto;

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

function sortMessagesByTimestamp(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const tsDiff = a.timestamp.getTime() - b.timestamp.getTime();
    if (tsDiff !== 0) return tsDiff;
    return String(a.id || "").localeCompare(String(b.id || ""));
  });
}

export function useChatHistory({ projectId, autoLoad = true }: UseChatHistoryOptions = {}) {
  const { user } = useAuth();
  const apiEnabled = isApiConfigured();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Retry queue for failed saves
  const retryQueueRef = useRef<Map<string, PendingRetry>>(new Map());
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Process retry queue
  const processRetryQueue = useCallback(async () => {
    if (!user) return;
    if (!apiEnabled) return;
    
    const queue = retryQueueRef.current;
    if (queue.size === 0) return;
    
    console.log('[ChatHistory] Processing retry queue:', queue.size, 'items');
    
    for (const [tempId, pending] of queue.entries()) {
      if (pending.attempts >= MAX_RETRY_ATTEMPTS) {
        console.warn('[ChatHistory] Max retries reached for message:', tempId);
        queue.delete(tempId);
        continue;
      }
      
      try {
        const response = await createProjectMessage(pending.targetProjectId, {
          role: pending.message.role,
          content: pending.message.content,
          metadata: pending.message.metadata || {},
        });
        const data = response.message;
        
        // Success - update message with DB ID and mark as saved
        setMessages(prev => prev.map(m => 
          m.id === tempId 
            ? { ...m, id: data!.id, saved: true }
            : m
        ));
        
        queue.delete(tempId);
        console.log('[ChatHistory] Retry succeeded for:', tempId);
      } catch (err) {
        pending.attempts++;
        console.error('[ChatHistory] Retry failed for:', tempId, 'attempt:', pending.attempts);
      }
    }
    
    // Schedule next retry if queue not empty
    if (queue.size > 0) {
      retryTimerRef.current = setTimeout(processRetryQueue, RETRY_DELAY_MS);
    }
  }, [user, apiEnabled]);

  // Load messages from database with race condition protection
  const loadMessages = useCallback(async (pid?: string, mergeWithExisting = false) => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId || !user) {
      console.log('[ChatHistory] loadMessages skipped - no projectId or user');
      return;
    }
    if (!apiEnabled) {
      setMessages([]);
      return;
    }
    
    // Protect against race condition during initialization
    if (isInitializing) {
      console.log('[ChatHistory] loadMessages skipped - initialization in progress');
      return;
    }

    console.log('[ChatHistory] Loading messages for project:', targetProjectId, { mergeWithExisting });
    setIsLoading(true);
    try {
      const response = await fetchProjectMessages(targetProjectId, 1000);
      const data: ChatMessageRow[] = response.messages || [];

      const loaded: ChatMessage[] = (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        saved: true, // DB messages are saved
        metadata: msg.metadata as Record<string, unknown> | undefined,
      }));
      const loadedSorted = sortMessagesByTimestamp(loaded);

      console.log('[ChatHistory] Loaded from DB:', loadedSorted.length, 'messages');

      // Merge with existing messages to avoid losing unsaved ones
      setMessages(prev => {
        console.log('[ChatHistory] Previous messages:', prev.length);
        
        if (!mergeWithExisting || prev.length === 0) {
          console.log('[ChatHistory] Replacing all messages with DB data');
          return loadedSorted;
        }
        
        // Create a set of loaded IDs for quick lookup
        const loadedIds = new Set(loadedSorted.map(m => m.id));
        
        // Keep messages that aren't in DB yet (unsaved or temp IDs)
        const pendingMessages = prev.filter(m => {
          const isInDb = loadedIds.has(m.id);
          const isUnsaved = m.saved === false;
          return isUnsaved || !isInDb;
        });
        
        console.log('[ChatHistory] Pending messages to keep:', pendingMessages.length);
        
        // Merge: DB messages first, then any pending that aren't duplicates
        const merged = [...loadedSorted];
        for (const pending of pendingMessages) {
          // Check if there's already a message with same content (saved version)
          const alreadyExists = loadedSorted.some(l => 
            l.content === pending.content && l.role === pending.role
          );
          if (!alreadyExists) {
            merged.push(pending);
          } else {
            console.log('[ChatHistory] Skipping duplicate pending message:', pending.id.slice(0, 8));
          }
        }
        
        // Sort by timestamp
        const sorted = sortMessagesByTimestamp(merged);
        console.log('[ChatHistory] After merge:', sorted.length, 'messages');
        return sorted;
      });
    } catch (err) {
      console.error('[ChatHistory] Failed to load:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, user, isInitializing, apiEnabled]);

  // Add a single message with auto-retry on failure
  const addMessage = useCallback(async (
    message: Omit<ChatMessage, 'id' | 'timestamp'>,
    pid?: string
  ): Promise<ChatMessage | null> => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId || !user) {
      console.warn('[ChatHistory] addMessage called without projectId or user:', { targetProjectId, hasUser: !!user });
      return null;
    }
    if (!apiEnabled) return null;

    const tempId = `pending_${crypto.randomUUID()}`;
    const newMessage: ChatMessage = {
      ...message,
      id: tempId,
      timestamp: new Date(),
      saved: false, // Mark as unsaved initially
    };

    console.log('[ChatHistory] Adding message:', { role: message.role, projectId: targetProjectId, tempId });

    // Optimistic update
    setMessages(prev => {
      console.log('[ChatHistory] Before optimistic add:', prev.length, 'messages');
      return [...prev, newMessage];
    });

    setIsSaving(true);
    try {
      const response = await createProjectMessage(targetProjectId, {
        role: message.role,
        content: message.content,
        metadata: message.metadata || {},
      });
      const data = response.message;

      // Update with server-generated ID and mark as saved
      const savedMessage: ChatMessage = {
        id: data.id,
        role: data.role as 'user' | 'assistant' | 'system',
        content: data.content,
        timestamp: new Date(data.created_at),
        saved: true,
        metadata: data.metadata as Record<string, unknown> | undefined,
      };
      
      console.log('[ChatHistory] Message saved to DB:', { dbId: data.id, tempId });
      
      setMessages(prev => {
        const updated = prev.map(m => m.id === tempId ? savedMessage : m);
        console.log('[ChatHistory] After DB save, messages:', updated.length);
        return updated;
      });
      return savedMessage;
    } catch (err) {
      console.error('[ChatHistory] Failed to save message:', err);
      
      // Add to retry queue for automatic retry
      retryQueueRef.current.set(tempId, {
        message: newMessage,
        targetProjectId,
        attempts: 1,
      });
      
      // Schedule retry
      if (!retryTimerRef.current) {
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          processRetryQueue();
        }, RETRY_DELAY_MS);
      }
      
      // DON'T rollback - keep the message for user visibility
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [projectId, user, processRetryQueue, apiEnabled]);

  // Add multiple messages at once (for agent responses)
  const addMessages = useCallback(async (
    newMessages: Omit<ChatMessage, 'id' | 'timestamp'>[],
    pid?: string
  ): Promise<void> => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId || !user || newMessages.length === 0) {
      console.warn('[ChatHistory] addMessages skipped:', { targetProjectId, hasUser: !!user, count: newMessages.length });
      return;
    }
    if (!apiEnabled) return;

    console.log('[ChatHistory] Adding', newMessages.length, 'messages to project:', targetProjectId);

    const messagesWithIds: ChatMessage[] = newMessages.map(m => ({
      ...m,
      id: `pending_${crypto.randomUUID()}`,
      timestamp: new Date(),
      saved: false,
    }));

    // Optimistic update
    setMessages(prev => [...prev, ...messagesWithIds]);

    setIsSaving(true);
    try {
      const response = await createProjectMessagesBulk(
        targetProjectId,
        messagesWithIds.map((m) => ({
          role: m.role,
          content: m.content,
          metadata: m.metadata || {},
        }))
      );
      const data: ChatMessageRow[] = response.messages || [];
      
      // Update with DB IDs and mark as saved
      if (data) {
        setMessages(prev => {
          const pendingIds = new Set(messagesWithIds.map(m => m.id));
          const updated = [...prev];
          
          data.forEach((dbRow, index) => {
            const pendingId = messagesWithIds[index]?.id;
            if (pendingId) {
              const msgIndex = updated.findIndex(m => m.id === pendingId);
              if (msgIndex !== -1) {
                updated[msgIndex] = {
                  ...updated[msgIndex],
                  id: dbRow.id,
                  saved: true,
                };
              }
            }
          });
          
          return updated;
        });
      }
      
      console.log('[ChatHistory] Successfully saved', newMessages.length, 'messages');
    } catch (err) {
      console.error('[ChatHistory] Failed to save messages:', err);
      // Add all to retry queue
      messagesWithIds.forEach(msg => {
        retryQueueRef.current.set(msg.id, {
          message: msg,
          targetProjectId,
          attempts: 1,
        });
      });
      
      if (!retryTimerRef.current) {
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          processRetryQueue();
        }, RETRY_DELAY_MS);
      }
    } finally {
      setIsSaving(false);
    }
  }, [projectId, user, processRetryQueue, apiEnabled]);

  // Save agent response with all steps in metadata
  const saveAgentResponse = useCallback(async (
    content: string,
    agentSteps: AgentStepData[],
    additionalMetadata?: Record<string, unknown>,
    pid?: string
  ): Promise<ChatMessage | null> => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId || !user) {
      console.warn('[ChatHistory] saveAgentResponse skipped - no projectId or user');
      return null;
    }

    console.log('[ChatHistory] Saving agent response with', agentSteps.length, 'steps');

    // Extract file and package info from steps
    const filesCreated = agentSteps
      .filter(s => s.name?.includes('create_file') || s.name?.includes('edit_file'))
      .map(s => (s.args?.path as string) || '')
      .filter(Boolean);

    const packagesInstalled = agentSteps
      .filter(s => s.name?.includes('install_package'))
      .map(s => (s.args?.package as string) || '')
      .filter(Boolean);

    const metadata: ChatMessage['metadata'] = {
      agentSteps,
      filesCreated,
      packagesInstalled,
      ...additionalMetadata,
    };

    return addMessage({
      role: 'assistant',
      content,
      metadata,
    }, targetProjectId);
  }, [projectId, user, addMessage]);

  // Clear all messages for a project
  const clearMessages = useCallback(async (pid?: string) => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId || !user) return;
    if (!apiEnabled) return;

    setMessages([]);
    retryQueueRef.current.clear();

    try {
      await deleteProjectMessages(targetProjectId);
    } catch (err) {
      console.error('Failed to clear messages:', err);
    }
  }, [projectId, user, apiEnabled]);

  // Set messages directly (for local-only updates)
  const setLocalMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
  }, []);

  // Set initializing state (for external control during project creation)
  const setInitializing = useCallback((value: boolean) => {
    setIsInitializing(value);
  }, []);

  // Auto-load on mount if projectId is provided (with debounce)
  useEffect(() => {
    if (!autoLoad || !projectId || !user || isInitializing) {
      return;
    }
    
    // Debounce to prevent race conditions
    const timer = setTimeout(() => {
      loadMessages(projectId, true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [autoLoad, projectId, user, isInitializing, loadMessages]);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    isSaving,
    isInitializing,
    loadMessages,
    addMessage,
    addMessages,
    saveAgentResponse,
    clearMessages,
    setMessages: setLocalMessages,
    setInitializing,
  };
}
