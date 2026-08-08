/**
 * OPTIMUS Workbench Events Hook
 * 
 * Connects the Event Bridge to the layout store for real-time UI updates.
 */

import { useEffect, useRef } from "react";
import { eventBridge, type OptimusEvent, type FileEventPayload, type TerminalEventPayload } from "#/services/optimus/event-bridge";
import { useOptimusLayoutStore } from "#/stores/optimus/layout-store";

/**
 * Hook for connecting workbench events to UI
 */
export function useWorkbenchEvents() {
  const {
    showPanel,
    openTab,
    setViewMode,
  } = useOptimusLayoutStore();
  
  const processedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Listen to all events
    const unsubscribeAll = eventBridge.onAny((event: OptimusEvent) => {
      const eventKey = `${event.type}-${event.timestamp}`;
      if (processedRef.current.has(eventKey)) return;
      processedRef.current.add(eventKey);
      
      if (processedRef.current.size > 200) {
        const arr = Array.from(processedRef.current);
        processedRef.current = new Set(arr.slice(-150));
      }
      
      // File events
      if (event.type.startsWith('file:')) {
        showPanel('explorer');
        showPanel('editor');
        
        const payload = event.payload as FileEventPayload;
        if (payload?.path) {
          const path = payload.path;
          const fileName = path.split('/').pop() || path;
          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          const langMap: Record<string, string> = {
            tsx: 'typescript', ts: 'typescript',
            jsx: 'javascript', js: 'javascript',
            py: 'python', md: 'markdown', json: 'json',
            css: 'css', html: 'html', txt: 'plaintext',
          };
          openTab({
            id: `tab-${path.replace(/[^a-zA-Z0-9]/g, '-')}`,
            path,
            name: fileName,
            language: langMap[ext] || 'plaintext',
            isDirty: false,
          });
        }
        
        setViewMode('split');
      }
      
      // Terminal events
      if (event.type.startsWith('terminal:')) {
        showPanel('terminal');
        setViewMode('split');
      }
      
      // Git events
      if (event.type.startsWith('git:')) {
        showPanel('scm');
        setViewMode('split');
      }
    });
    
    return unsubscribeAll;
  }, [showPanel, openTab, setViewMode]);
  
  return eventBridge;
}

export function usePanelContext() {
  const viewMode = useOptimusLayoutStore((state) => state.viewMode);
  const chatPanelHeight = useOptimusLayoutStore((state) => state.chatPanelHeight);
  
  const visiblePanels = useOptimusLayoutStore((state) => 
    Object.entries(state.panels)
      .filter(([, c]) => c.visible)
      .map(([t]) => t)
  );
  
  return { viewMode, chatPanelHeight, visiblePanels };
}

export function useFileOperations() {
  const history = eventBridge.getHistory().filter(e => 
    e.type.startsWith('file:')
  );
  const last = history[history.length - 1] as OptimusEvent<FileEventPayload> | undefined;
  
  if (!last) return null;
  return {
    kind: last.type,
    path: last.payload.path,
  };
}

export function useTerminalOutput() {
  const history = eventBridge.getHistory().filter(e => 
    e.type.startsWith('terminal:')
  );
  const last = history[history.length - 1] as OptimusEvent<TerminalEventPayload> | undefined;
  
  return { lastEvent: last };
}

export interface AgentProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export function useAgentProgress() {
  const agentEvents = eventBridge.getHistory().filter(e => 
    e.type.startsWith('agent:')
  );
  
  const stepsRef = useRef<AgentProgressStep[]>([]);
  
  useEffect(() => {
    for (const event of agentEvents.slice(-20)) {
      const payload = event.payload as { toolName?: string; thought?: string };
      const name = payload.toolName || payload.thought?.substring(0, 30) || event.type;
      
      if (!stepsRef.current.find((s) => s.name === name)) {
        stepsRef.current.push({
          id: `step-${event.id}`,
          name,
          status: event.type === 'agent:error' ? 'error' : 'complete',
        });
      }
    }
    
    if (stepsRef.current.length > 10) {
      stepsRef.current = stepsRef.current.slice(-10);
    }
  }, [agentEvents]);
  
  return stepsRef.current;
}
