import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// ============================================
// RESIZE PROTECTION SYSTEM
// Provides smooth 60fps dragging experience
// ============================================

// CSS class names (namespaced)
const RESIZING_CLASS = 'layout--resizing';
const OVERLAY_ID = 'resize-protection-overlay';

// Inject protection styles once
let protectionStylesInjected = false;

function injectProtectionStyles() {
  if (protectionStylesInjected || typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.id = 'resize-protection-styles';
  style.textContent = `
    /* Global resize protection */
    body.${RESIZING_CLASS} {
      cursor: col-resize !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
    
    body.${RESIZING_CLASS} * {
      cursor: col-resize !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
    
    /* Invisible overlay to catch all pointer events */
    #${OVERLAY_ID} {
      position: fixed;
      inset: 0;
      z-index: 9999;
      cursor: col-resize;
      background: transparent;
      touch-action: none;
    }
    
    /* Vertical resize variant */
    body.${RESIZING_CLASS}[data-resize-direction="vertical"],
    body.${RESIZING_CLASS}[data-resize-direction="vertical"] *,
    body.${RESIZING_CLASS}[data-resize-direction="vertical"] #${OVERLAY_ID} {
      cursor: row-resize !important;
    }
  `;
  document.head.appendChild(style);
  protectionStylesInjected = true;
}

// Singleton protection state
let activeOverlay: HTMLDivElement | null = null;

function startResizeProtection(direction: 'horizontal' | 'vertical' = 'horizontal') {
  injectProtectionStyles();
  
  document.body.classList.add(RESIZING_CLASS);
  document.body.dataset.resizeDirection = direction;
  
  if (!activeOverlay) {
    activeOverlay = document.createElement('div');
    activeOverlay.id = OVERLAY_ID;
    document.body.appendChild(activeOverlay);
  }
}

function endResizeProtection() {
  document.body.classList.remove(RESIZING_CLASS);
  delete document.body.dataset.resizeDirection;
  
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
}

// ============================================
// RESIZABLE COMPONENTS
// ============================================

// Simple wrapper - no memo to avoid breaking internal state
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

/**
 * Enhanced ResizableHandle with automatic protection
 * - Adds body-level user-select: none during drag
 * - Creates overlay to prevent iframe/input interference
 * - Provides smooth 60fps dragging experience
 */
const ResizableHandle = ({
  withHandle,
  className,
  id,
  onDragging,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => {
  const isDraggingRef = useRef(false);
  
  // Handle drag state changes via the library's onDragging callback
  const handleDragging = useCallback((isDragging: boolean) => {
    if (isDragging && !isDraggingRef.current) {
      isDraggingRef.current = true;
      // Default to horizontal; library handles direction internally
      startResizeProtection('horizontal');
    } else if (!isDragging && isDraggingRef.current) {
      isDraggingRef.current = false;
      endResizeProtection();
    }
    
    // Forward to user's callback if provided
    onDragging?.(isDragging);
  }, [onDragging]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isDraggingRef.current) {
        endResizeProtection();
      }
    };
  }, []);
  
  return (
    <ResizablePrimitive.PanelResizeHandle
      id={id}
      onDragging={handleDragging}
      className={cn(
        // Minimal styling - NO CSS transitions (causes lag)
        "relative flex w-px items-center justify-center bg-border/20",
        "hover:bg-primary/40",
        // Invisible hit area - wider for easier grabbing (16px)
        "after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2",
        // Active state feedback
        "data-[resize-handle-active]:bg-primary/50",
        // Touch optimization
        "touch-none",
        // Vertical direction
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-4",
        "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        "data-[panel-group-direction=vertical]:after:translate-x-0",
        // Focus
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-8 w-4 items-center justify-center rounded bg-border/80 hover:bg-border select-none">
          <GripVertical className="h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
