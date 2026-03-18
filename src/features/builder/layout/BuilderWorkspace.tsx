import { Profiler, Suspense, lazy, useEffect, useState, type ProfilerOnRenderCallback } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import type { BuilderHeaderProps } from '@/components/builder/BuilderHeader';
import type { ChatPanelProps } from '@/components/builder/ChatPanel';
import type { PreviewPanelProps } from '@/components/builder/PreviewPanel';
import type { BuilderHistoryTab, BuilderRunHistoryItem } from '@/features/builder/history/run-history';

const ChatPanel = lazy(() =>
  import('@/components/builder/ChatPanel').then((module) => ({ default: module.ChatPanel }))
);
const RunHistoryPanel = lazy(() =>
  import('@/components/builder/RunHistoryPanel').then((module) => ({ default: module.RunHistoryPanel }))
);
const PreviewPanel = lazy(() =>
  import('@/components/builder/PreviewPanel').then((module) => ({ default: module.PreviewPanel }))
);

export interface BuilderWorkspaceProps {
  headerProps: BuilderWorkspaceHeaderProps;
  chatProps: BuilderWorkspaceChatProps;
  historyProps: BuilderWorkspaceHistoryProps;
  previewProps: BuilderWorkspacePreviewProps;
  leftPanelMode: 'chat' | 'history';
  onRenderCallback: ProfilerOnRenderCallback;
}

export type BuilderWorkspaceHeaderProps = BuilderHeaderProps;
export type BuilderWorkspaceChatProps = ChatPanelProps;
export interface BuilderWorkspaceHistoryProps {
  runs: BuilderRunHistoryItem[];
  activeTab: BuilderHistoryTab;
  isLoading?: boolean;
}
export type BuilderWorkspacePreviewProps = PreviewPanelProps;

function PanelFallback() {
  return <div className="h-full min-h-0 bg-card/60" aria-hidden="true" />;
}

export function BuilderWorkspace({
  headerProps,
  chatProps,
  historyProps,
  previewProps,
  leftPanelMode,
  onRenderCallback,
}: BuilderWorkspaceProps) {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview' | 'history'>('chat');

  useEffect(() => {
    if (leftPanelMode === 'history') {
      setMobileTab((current) => (current === 'preview' ? current : 'history'));
      return;
    }
    setMobileTab((current) => (current === 'history' ? 'chat' : current));
  }, [leftPanelMode]);

  if (isMobile) {
    const mobileTabs =
      leftPanelMode === 'history'
        ? ([
            { id: 'history' as const, label: 'История', icon: MessageSquare },
            { id: 'preview' as const, label: 'Превью', icon: Eye },
          ])
        : ([
            { id: 'chat' as const, label: 'Чат', icon: MessageSquare },
            { id: 'preview' as const, label: 'Превью', icon: Eye },
          ]);

    return (
      <>
        <BuilderHeader {...headerProps} />

        {/* Mobile tab switcher */}
        <div className="flex border-b border-border bg-background shrink-0">
          {mobileTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
                mobileTab === id
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          {mobileTab === 'chat' ? (
            <Profiler id="ChatPanel" onRender={onRenderCallback}>
              <Suspense fallback={<PanelFallback />}>
                <ChatPanel {...chatProps} />
              </Suspense>
            </Profiler>
          ) : mobileTab === 'history' ? (
            <Profiler id="RunHistoryPanel" onRender={onRenderCallback}>
              <Suspense fallback={<PanelFallback />}>
                <RunHistoryPanel {...historyProps} />
              </Suspense>
            </Profiler>
          ) : (
            <Profiler id="PreviewPanel" onRender={onRenderCallback}>
              <Suspense fallback={<PanelFallback />}>
                <PreviewPanel {...previewProps} />
              </Suspense>
            </Profiler>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <BuilderHeader {...headerProps} />

      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0" autoSaveId="builder-layout">
        <ResizablePanel
          defaultSize={30}
          minSize={0}
          maxSize={50}
          collapsible
          collapsedSize={0}
          className="h-full min-h-0"
        >
          {leftPanelMode === 'history' ? (
            <Profiler id="RunHistoryPanel" onRender={onRenderCallback}>
              <Suspense fallback={<PanelFallback />}>
                <RunHistoryPanel {...historyProps} />
              </Suspense>
            </Profiler>
          ) : (
            <Profiler id="ChatPanel" onRender={onRenderCallback}>
              <Suspense fallback={<PanelFallback />}>
                <ChatPanel {...chatProps} />
              </Suspense>
            </Profiler>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50} maxSize={100} className="h-full min-h-0">
          <Profiler id="PreviewPanel" onRender={onRenderCallback}>
            <Suspense fallback={<PanelFallback />}>
              <PreviewPanel {...previewProps} />
            </Suspense>
          </Profiler>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
