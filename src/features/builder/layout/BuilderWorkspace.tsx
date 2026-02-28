import { Profiler, type ComponentProps, type ProfilerOnRenderCallback } from 'react';
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
