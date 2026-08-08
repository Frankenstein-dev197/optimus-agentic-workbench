/**
 * OPTIMUS Workbench Events Hook
 * 
 * Connects the Agent's tool calls and events to the Workbench UI.
 */

import { useEffect, useRef } from "react";
import { useEventStore } from "#/stores/use-event-store";
import { useOptimusLayoutStore } from "#/stores/optimus/layout-store";

/**
 * Hook for connecting workbench events to UI
 */
export function useWorkbenchEvents() {
  const events = useEventStore((state) => state.events);
  const {
    showPanel,
    openTab,
    openDiff,
    setViewMode,
  } = useOptimusLayoutStore();
  
  const processedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const recentEvents = events.slice(-30);
    
    for (const event of recentEvents) {
      const eventStr = JSON.stringify(event).slice(0, 100);
      if (processedRef.current.has(eventStr)) continue;
      
      const kind = (event as unknown as Record<string, unknown>).kind as string | undefined;
      if (!kind) continue;
      
      processedRef.current.add(eventStr);
      if (processedRef.current.size > 200) {
        const arr = Array.from(processedRef.current);
        processedRef.current = new Set(arr.slice(-150));
      }
      
      // File events
      if (kind.includes("File") || kind.includes("file_created") || kind.includes("file_modified")) {
        showPanel("explorer");
        showPanel("editor");
        
        const path = (event as unknown as Record<string, unknown>).path as string | undefined;
        if (path) {
          const fileName = path.split("/").pop() || path;
          const ext = fileName.split(".").pop()?.toLowerCase() || "";
          const langMap: Record<string, string> = {
            tsx: "typescript", ts: "typescript",
            jsx: "javascript", js: "javascript",
            py: "python", md: "markdown", json: "json",
            css: "css", html: "html", txt: "plaintext",
          };
          openTab({
            id: `tab-${path.replace(/[^a-zA-Z0-9]/g, "-")}`,
            path,
            name: fileName,
            language: langMap[ext] || "plaintext",
            isDirty: false,
          });
        }
        
        setViewMode("split");
      }
      
      // Terminal events
      if (kind.includes("Terminal") || kind.includes("Command") || kind.includes("bash")) {
        showPanel("terminal");
        setViewMode("split");
      }
      
      // Git events
      if (kind.includes("Git") || kind.includes("git_")) {
        showPanel("scm");
        setViewMode("split");
      }
    }
  }, [events, showPanel, openTab, openDiff, setViewMode]);
}

export function usePanelContext() {
  const { viewMode, chatPanelHeight, setChatPanelHeight } = useOptimusLayoutStore();
  
  const visiblePanels = useOptimusLayoutStore((state) => 
    Object.entries(state.panels)
      .filter(([, c]) => c.visible)
      .map(([t]) => t)
  );
  
  return { viewMode, chatPanelHeight, visiblePanels };
}

export function useFileOperations() {
  const events = useEventStore((state) => state.events);
  const last = events.filter((e) => {
    const k = (e as unknown as Record<string, unknown>).kind as string | undefined;
    return k?.includes("File");
  }).pop();
  
  if (!last) return null;
  const extLast = last as unknown as Record<string, unknown>;
  return {
    kind: extLast.kind,
    path: extLast.path as string,
  };
}

export function useTerminalOutput() {
  const events = useEventStore((state) => state.events);
  const last = events.filter((e) => {
    const k = (e as unknown as Record<string, unknown>).kind as string | undefined;
    return k?.includes("Terminal") || k?.includes("Command");
  }).pop();
  
  return { lastEvent: last };
}

export interface AgentProgressStep {
  id: string;
  name: string;
  status: "pending" | "active" | "complete" | "error";
}

export function useAgentProgress() {
  const events = useEventStore((state) => state.events);
  const stepsRef = useRef<AgentProgressStep[]>([]);
  
  useEffect(() => {
    const recent = events.slice(-20);
    for (const event of recent) {
      const tool = (event as unknown as Record<string, unknown>).tool as string | undefined;
      if (tool && !stepsRef.current.find((s) => s.name === tool)) {
        stepsRef.current.push({
          id: `step-${Date.now()}`,
          name: tool.replace(/_/g, " "),
          status: "complete",
        });
      }
      if (stepsRef.current.length > 10) {
        stepsRef.current = stepsRef.current.slice(-10);
      }
    }
  }, [events]);
  
  return stepsRef.current;
}
