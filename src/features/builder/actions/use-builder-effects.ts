import { useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { EFFECTS_LIBRARY } from '@/data/effects';
import type { EffectDefinition } from '@/types/siteSpec';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { ProjectStructure } from '@/types/project';
import type { PipelineMode } from '@/hooks/useUnifiedOrchestrator';

interface UseBuilderEffectsParams {
  libraryCategory: string;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  projectId?: string;
  addMessage: (
    message: { role: 'assistant' | 'system' | 'user'; content: string; metadata?: Record<string, unknown> },
    pid?: string
  ) => Promise<unknown>;
  reactProject: ProjectStructure | null;
  orchestrator: {
    reset: () => void;
    run: (
      prompt: string,
      initialFiles?: Record<string, string>,
      initialPackages?: string[],
      runOptions?: { mode?: PipelineMode; projectId?: string }
    ) => Promise<void>;
  };
  setCurrentMode: (mode: PipelineMode | null) => void;
  startRunSession: () => string;
}

export function useBuilderEffects({
  libraryCategory,
  messages,
  setMessages,
  projectId,
  addMessage,
  reactProject,
  orchestrator,
  setCurrentMode,
  startRunSession,
}: UseBuilderEffectsParams) {
  const filteredEffects = useMemo(() => {
    if (libraryCategory === 'all') return EFFECTS_LIBRARY;

    const categoryMap: Record<string, string[]> = {
      '3d': ['particle-field-3d', 'wave-3d', 'floating-spheres-3d', 'gradient-blob-3d', 'noise-shader-3d'],
      background: ['gradient-bg', 'noise-bg', 'particles', 'blob-bg', 'grid-pattern', 'dot-pattern'],
      text: ['typewriter', 'gradient-text', 'shimmer-text', 'blur-reveal', 'hover-highlight'],
      cards: ['glow-border', 'tilt-card', 'hover-lift'],
      scroll: ['parallax', 'scroll-reveal'],
    };
    return EFFECTS_LIBRARY.filter((effect) => categoryMap[libraryCategory]?.includes(effect.type));
  }, [libraryCategory]);

  const handleApplyEffect = useCallback((effect: EffectDefinition) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Добавь эффект "${effect.name}"`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    if (projectId) {
      void addMessage({ role: 'user', content: `Добавь эффект "${effect.name}"` }, projectId);
    }

    orchestrator.reset();

    const initialFiles = reactProject
      ? Object.fromEntries(reactProject.files.map((file) => [file.path, file.content]))
      : {};
    const initialPackages = reactProject?.dependencies
      ? Object.keys(reactProject.dependencies)
      : [];

    setCurrentMode('light');
    startRunSession();
    void orchestrator.run(
      `Добавь эффект "${effect.name}" на страницу. Описание эффекта: ${effect.description}`,
      initialFiles,
      initialPackages,
      { mode: 'light', projectId }
    );
  }, [
    addMessage,
    orchestrator,
    projectId,
    reactProject,
    setCurrentMode,
    setMessages,
    startRunSession,
  ]);

  const handleApplyEffectFromLibrary = useCallback((effect: EffectDefinition) => {
    handleApplyEffect(effect);
  }, [handleApplyEffect]);

  return {
    filteredEffects,
    handleApplyEffectFromLibrary,
  };
}
