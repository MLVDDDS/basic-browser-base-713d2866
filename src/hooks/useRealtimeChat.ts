import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from './useChatHistory';
import { apiRequest, isApiConfigured, isUnauthorizedApiError } from '@/lib/api-client';

interface UseRealtimeChatOptions {
  projectId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onMessageUpdate?: (message: ChatMessage) => void;
  enabled?: boolean;
}

interface ChatMessageRow {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useRealtimeChat({
  projectId,
  onNewMessage,
  onMessageUpdate,
  enabled = true,
}: UseRealtimeChatOptions) {
  const apiEnabled = isApiConfigured();
  const knownMessagesRef = useRef<Map<string, string>>(new Map());
  const [authBlocked, setAuthBlocked] = useState(false);

  useEffect(() => {
    if (!projectId || !enabled) {
      return;
    }
    if (!apiEnabled) {
      return;
    }
    knownMessagesRef.current = new Map();
    setAuthBlocked(false);
  }, [projectId, enabled, apiEnabled]);

  useEffect(() => {
    if (!projectId || !enabled || authBlocked) {
      return;
    }
    if (!apiEnabled) {
      return;
    }
    let disposed = false;
    let pollInFlight = false;

    const pollMessages = async () => {
      if (disposed || pollInFlight) return;
      pollInFlight = true;
      try {
        const response = await apiRequest<{ messages?: ChatMessageRow[] }>(
          `/projects/${projectId}/messages?limit=1000`
        );
        const incoming = Array.isArray(response.messages) ? response.messages : [];

        for (const row of incoming) {
          const signature = `${row.role}|${row.content}|${JSON.stringify(row.metadata || {})}`;
          const previous = knownMessagesRef.current.get(row.id);
          const message: ChatMessage = {
            id: row.id,
            role: row.role as 'user' | 'assistant' | 'system',
            content: row.content,
            timestamp: new Date(row.created_at),
            metadata: row.metadata || undefined,
          };

          if (!previous) {
            knownMessagesRef.current.set(row.id, signature);
            onNewMessage?.(message);
            continue;
          }

          if (previous !== signature) {
            knownMessagesRef.current.set(row.id, signature);
            onMessageUpdate?.(message);
          }
        }
      } catch (error) {
        if (isUnauthorizedApiError(error)) {
          setAuthBlocked(true);
          return;
        }
        console.warn('[useRealtimeChat] API polling failed:', error);
      } finally {
        pollInFlight = false;
      }
    };

    void pollMessages();
    const intervalId = window.setInterval(pollMessages, 3000);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
  }, [projectId, enabled, apiEnabled, authBlocked, onNewMessage, onMessageUpdate]);

  return {
    isSubscribed: apiEnabled && enabled && Boolean(projectId) && !authBlocked,
  };
}
