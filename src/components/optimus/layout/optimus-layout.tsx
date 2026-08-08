/**
 * OPTIMUS Layout Component
 * 
 * Main layout wrapper that provides the OPTIMUS workbench experience
 * while preserving all existing OpenHands functionality.
 */

import React, { useMemo } from "react";
import {
  useOptimusLayoutStore,
  PanelType,
} from "../../../stores/optimus/layout-store";
import { useWorkbenchEvents, usePanelContext } from "../../../hooks/optimus/use-workbench-events";
import { cn } from "../../../utils/utils";

// Workbench panels
import { OptimusExplorer } from "../workbench/explorer/explorer-panel";
import { OptimusEditor } from "../workbench/editor/editor-area";
import { OptimusTerminal } from "../workbench/terminal/terminal-panel";
import { OptimusProblems } from "../workbench/problems/problems-panel";
import { OptimusSCM } from "../workbench/scm/scm-panel";
import { OptimusTesting } from "../workbench/testing/testing-panel";
import { OptimusPreview } from "../workbench/preview/preview-panel";
import { OptimusSidebar } from "./optimus-sidebar";
import { OptimusStatusBar } from "./optimus-status-bar";

interface OptimusLayoutProps {
  /** Main chat content (OpenHands ChatInterface) */
  children: React.ReactNode;
  /** Optional className for the chat container */
  className?: string;
}

// Panel component mapping
const PANEL_COMPONENTS: Record<PanelType, React.ComponentType> = {
  explorer: OptimusExplorer,
  editor: OptimusEditor,
  terminal: OptimusTerminal,
  problems: OptimusProblems,
  output: OptimusProblems, // Reuse problems for now
  scm: OptimusSCM,
  testing: OptimusTesting,
  debug: OptimusProblems, // Placeholder
  preview: OptimusPreview,
  search: OptimusProblems, // Placeholder
};

export function OptimusLayout({ children, className }: OptimusLayoutProps) {
  // Initialize workbench event handling
  useWorkbenchEvents();
  
  const {
    viewMode,
    chatPanelHeight,
    chatPanelCollapsed,
    panels,
  } = useOptimusLayoutStore();
  
  // Calculate layout
  const layoutClass = useMemo(() => {
    switch (viewMode) {
      case "chat":
        return "optimus-layout-chat";
      case "split":
        return "optimus-layout-split";
      case "focus":
        return "optimus-layout-focus";
      default:
        return "optimus-layout-chat";
    }
  }, [viewMode]);
  
  // Check which panels should be visible
  const leftPanels = useMemo(() => {
    return Object.entries(panels)
      .filter(([_, config]) => config.visible && config.region === "left")
      .map(([type]) => type as PanelType);
  }, [panels]);
  
  const rightPanels = useMemo(() => {
    return Object.entries(panels)
      .filter(([_, config]) => config.visible && config.region === "right")
      .map(([type]) => type as PanelType);
  }, [panels]);
  
  const bottomPanels = useMemo(() => {
    return Object.entries(panels)
      .filter(([_, config]) => config.visible && config.region === "bottom")
      .map(([type]) => type as PanelType);
  }, [panels]);
  
  const hasLeftSidebar = leftPanels.length > 0;
  const hasRightSidebar = rightPanels.length > 0;
  const hasBottomPanel = bottomPanels.length > 0;
  const hasEditor = panels.editor.visible;
  
  return (
    <div className={cn("optimus-layout", layoutClass, className)}>
      {/* Left Sidebar (Explorer, SCM, etc.) */}
      {hasLeftSidebar && (
        <aside className="optimus-sidebar optimus-sidebar-left">
          <OptimusSidebar panels={leftPanels} />
        </aside>
      )}
      
      {/* Main Content Area */}
      <main className="optimus-main">
        {/* Top: Editor or Empty State */}
        {viewMode !== "chat" && hasEditor && (
          <div className="optimus-editor-area">
            {leftPanels.map((panelType) => {
              const PanelComponent = PANEL_COMPONENTS[panelType];
              if (!PanelComponent) return null;
              return (
                <div
                  key={panelType}
                  className={cn("optimus-panel", `optimus-panel-${panelType}`)}
                  style={{ flex: 1 }}
                >
                  <PanelComponent />
                </div>
              );
            })}
            <div className="optimus-panel optimus-panel-editor" style={{ flex: 2 }}>
              <OptimusEditor />
            </div>
          </div>
        )}
        
        {/* Bottom Panel (Terminal, Problems, etc.) */}
        {hasBottomPanel && (
          <div className="optimus-bottom-panel">
            {bottomPanels.map((panelType) => {
              const PanelComponent = PANEL_COMPONENTS[panelType];
              if (!PanelComponent) return null;
              return (
                <div
                  key={panelType}
                  className={cn("optimus-panel optimus-panel-bottom", `optimus-panel-${panelType}`)}
                  style={{ flex: 1 }}
                >
                  <PanelComponent />
                </div>
              );
            })}
          </div>
        )}
        
        {/* Chat Panel */}
        <div
          className={cn(
            "optimus-chat-panel",
            chatPanelCollapsed && "optimus-chat-panel-collapsed"
          )}
          style={{
            height: chatPanelCollapsed
              ? "48px"
              : viewMode === "chat"
                ? "100%"
                : `${chatPanelHeight}%`,
          }}
        >
          {children}
        </div>
        
        {/* Resize Handle for Chat */}
        {viewMode === "split" && (
          <div className="optimus-resize-handle optimus-resize-handle-chat" />
        )}
      </main>
      
      {/* Right Sidebar (Preview, etc.) */}
      {hasRightSidebar && (
        <aside className="optimus-sidebar optimus-sidebar-right">
          {rightPanels.map((panelType) => {
            const PanelComponent = PANEL_COMPONENTS[panelType];
            if (!PanelComponent) return null;
            return (
              <div
                key={panelType}
                className={cn("optimus-panel", `optimus-panel-${panelType}`)}
              >
                <PanelComponent />
              </div>
            );
          })}
        </aside>
      )}
      
      {/* Status Bar */}
      <OptimusStatusBar />
    </div>
  );
}

// =============================================================================
// OPTIMUS CONTEXT PROVIDER
// =============================================================================

interface OptimusContextValue {
  layout: ReturnType<typeof useOptimusLayoutStore>;
  context: ReturnType<typeof usePanelContext>;
}

const OptimusContext = React.createContext<OptimusContextValue | null>(null);

export function OptimusProvider({ children }: { children: React.ReactNode }) {
  const layout = useOptimusLayoutStore();
  const context = usePanelContext();
  
  const value = useMemo(() => ({ layout, context }), [layout, context]);
  
  return (
    <OptimusContext.Provider value={value}>
      {children}
    </OptimusContext.Provider>
  );
}

export function useOptimus() {
  const context = React.useContext(OptimusContext);
  if (!context) {
    throw new Error("useOptimus must be used within OptimusProvider");
  }
  return context;
}

// =============================================================================
// OPTIMUS THEME STYLES
// =============================================================================

export const OPTIMUS_STYLES = `
.optimus-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-primary, #0d1117);
  color: var(--text-primary, #c9d1d9);
  font-family: var(--font-sans, "Inter", sans-serif);
}

.optimus-layout.optimus-layout-chat {
  flex-direction: column;
}

.optimus-layout.optimus-layout-split {
  flex-direction: row;
}

.optimus-layout.optimus-layout-focus {
  flex-direction: row;
}

/* Sidebars */
.optimus-sidebar {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary, #161b22);
  border-color: var(--border-default, #30363d);
}

.optimus-sidebar-left {
  width: 280px;
  border-right: 1px solid var(--border-default, #30363d);
}

.optimus-sidebar-right {
  width: 400px;
  border-left: 1px solid var(--border-default, #30363d);
}

/* Main Area */
.optimus-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* Editor Area */
.optimus-editor-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--bg-primary, #0d1117);
}

/* Bottom Panel */
.optimus-bottom-panel {
  height: 200px;
  display: flex;
  flex-direction: row;
  border-top: 1px solid var(--border-default, #30363d);
  background: var(--bg-secondary, #161b22);
}

/* Chat Panel */
.optimus-chat-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-secondary, #161b22);
  border-top: 1px solid var(--border-default, #30363d);
  transition: height 0.2s ease;
}

.optimus-chat-panel.collapsed {
  height: 48px !important;
  overflow: hidden;
}

/* Panels */
.optimus-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.optimus-panel-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-tertiary, #21262d);
  border-bottom: 1px solid var(--border-default, #30363d);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #8b949e);
  gap: 8px;
}

.optimus-panel-content {
  flex: 1;
  overflow: auto;
}

/* Resize Handles */
.optimus-resize-handle {
  background: var(--border-default, #30363d);
  transition: background 0.15s ease;
}

.optimus-resize-handle:hover {
  background: var(--accent-primary, #58a6ff);
}

.optimus-resize-handle-chat {
  height: 4px;
  cursor: ns-resize;
}

/* Status Bar */
.optimus-status-bar {
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  background: var(--accent-primary, #58a6ff);
  color: white;
  font-size: 12px;
}

.optimus-status-bar-item {
  padding: 0 8px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.optimus-status-bar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
`;

// Export styles for injection
export const OPTIMUS_LAYOUT_STYLES = OPTIMUS_STYLES;
