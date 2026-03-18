import { Profiler, useState, type ComponentProps, type ProfilerOnRenderCallback } from 'react';
import {
  BuilderHeader,
  ChatPanel,
  PreviewPanel,
} from '@/components/builder';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type BuilderHeaderProps = ComponentProps<typeof BuilderHeader>;
type ChatPanelProps = ComponentProps<typeof ChatPanel>;
type PreviewPanelProps = ComponentProps<typeof PreviewPanel>;

export interface BuilderWorkspaceProps {
  headerProps: BuilderWorkspaceHeaderProps;
  chatProps: BuilderWorkspaceChatProps;
  previewProps: BuilderWorkspacePreviewProps;
  onRenderCallback: ProfilerOnRenderCallback;
}

export type BuilderWorkspaceHeaderProps = BuilderHeaderProps;
export type BuilderWorkspaceChatProps = ChatPanelProps;
export type BuilderWorkspacePreviewProps = PreviewPanelProps;

export function BuilderWorkspace({
  headerProps,
  chatProps,
  previewProps,
  onRenderCallback,
}: BuilderWorkspaceProps) {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');

  if (isMobile) {
    return (
      <>
        <BuilderHeader {...headerProps} />

        {/* Mobile tab switcher */}
        <div className="flex border-b border-border bg-background shrink-0">
          <button
            onClick={() => setMobileTab('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
              mobileTab === 'chat'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Чат
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
              mobileTab === 'preview'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground'
            )}
          >
            <Eye className="w-4 h-4" />
            Превью
          </button>
        </div>

        <div className="flex-1 min-h-0">
          {mobileTab === 'chat' ? (
            <Profiler id="ChatPanel" onRender={onRenderCallback}>
              <ChatPanel {...chatProps} />
            </Profiler>
          ) : (
            <Profiler id="PreviewPanel" onRender={onRenderCallback}>
              <PreviewPanel {...previewProps} />
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
          <Profiler id="ChatPanel" onRender={onRenderCallback}>
            <ChatPanel {...chatProps} />
          </Profiler>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50} maxSize={100} className="h-full min-h-0">
          <Profiler id="PreviewPanel" onRender={onRenderCallback}>
            <PreviewPanel {...previewProps} />
          </Profiler>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
