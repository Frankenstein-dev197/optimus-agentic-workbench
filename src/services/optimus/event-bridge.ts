/**
 * OPTIMUS Event Bridge
 * 
 * Central event system that connects:
 * - Agent actions
 * - Tool execution
 * - Workbench updates
 * 
 * Flow: Agent → Tool → Runtime → Filesystem/Terminal/Git → Event → Workbench
 */

export type EventType =
  // File events
  | 'file:created'
  | 'file:modified'
  | 'file:deleted'
  | 'file:renamed'
  | 'file:opened'
  | 'file:saved'
  // Editor events
  | 'editor:focused'
  | 'editor:changed'
  | 'editor:selection'
  // Terminal events
  | 'terminal:command:started'
  | 'terminal:command:finished'
  | 'terminal:output'
  | 'terminal:opened'
  | 'terminal:closed'
  // Git events
  | 'git:status:changed'
  | 'git:staged'
  | 'git:unstaged'
  | 'git:committed'
  | 'git:branch:changed'
  // Problem events
  | 'problem:added'
  | 'problem:resolved'
  | 'problem:cleared'
  // Test events
  | 'test:discovered'
  | 'test:started'
  | 'test:finished'
  // Preview events
  | 'preview:started'
  | 'preview:stopped'
  // Agent events
  | 'agent:thinking'
  | 'agent:tool:call'
  | 'agent:tool:result'
  | 'agent:done'
  | 'agent:error';

export interface OptimusEvent<T = unknown> {
  type: EventType;
  payload: T;
  timestamp: number;
  source: string;
  id: string;
}

export interface FileEventPayload {
  path: string;
  content?: string;
  oldPath?: string;
}

export interface TerminalEventPayload {
  sessionId: string;
  command: string;
  exitCode?: number;
  output?: string;
  duration?: number;
}

export interface GitEventPayload {
  branch?: string;
  files?: string[];
  commitHash?: string;
  message?: string;
}

export interface ProblemEventPayload {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AgentEventPayload {
  toolName?: string;
  parameters?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  thought?: string;
}

type EventListener<T = unknown> = (event: OptimusEvent<T>) => void;

class EventBridge {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: OptimusEvent[] = [];
  private maxHistorySize = 100;
  
  /**
   * Subscribe to events
   */
  on<T = unknown>(eventType: EventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener as EventListener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener as EventListener);
    };
  }
  
  /**
   * Subscribe to all events
   */
  onAny(listener: EventListener): () => void {
    const wildcard = '*';
    if (!this.listeners.has(wildcard)) {
      this.listeners.set(wildcard, new Set());
    }
    this.listeners.get(wildcard)!.add(listener);
    
    return () => {
      this.listeners.get(wildcard)?.delete(listener);
    };
  }
  
  /**
   * Emit an event
   */
  emit<T = unknown>(type: EventType, payload: T, source: string = 'system'): OptimusEvent<T> {
    const event: OptimusEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    // Notify specific listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (e) {
          console.error(`[EventBridge] Error in listener for ${type}:`, e);
        }
      });
    }
    
    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        try {
          listener(event);
        } catch (e) {
          console.error('[EventBridge] Error in wildcard listener:', e);
        }
      });
    }
    
    // Log event
    console.log(`[EventBridge] ${type}`, payload);
    
    return event;
  }
  
  /**
   * Get event history
   */
  getHistory(type?: EventType): OptimusEvent[] {
    if (type) {
      return this.eventHistory.filter(e => e.type === type);
    }
    return [...this.eventHistory];
  }
  
  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }
  
  /**
   * Wait for an event
   */
  waitFor<T = unknown>(
    type: EventType,
    timeout: number = 30000
  ): Promise<OptimusEvent<T>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(type, handler);
        reject(new Error(`Timeout waiting for event: ${type}`));
      }, timeout);
      
      const handler = (event: OptimusEvent<T>) => {
        clearTimeout(timer);
        this.off(type, handler);
        resolve(event);
      };
      
      this.on(type, handler);
    });
  }
  
  /**
   * Unsubscribe from events
   */
  off<T = unknown>(type: EventType, listener: EventListener<T>): void {
    this.listeners.get(type)?.delete(listener as EventListener);
  }
  
  /**
   * Remove all listeners for a type
   */
  removeAllListeners(type?: EventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

export const eventBridge = new EventBridge();

// File events
export function emitFileCreated(path: string, content?: string) {
  return eventBridge.emit<FileEventPayload>('file:created', { path, content });
}

export function emitFileModified(path: string, content?: string) {
  return eventBridge.emit<FileEventPayload>('file:modified', { path, content });
}

export function emitFileDeleted(path: string) {
  return eventBridge.emit<FileEventPayload>('file:deleted', { path });
}

export function emitFileOpened(path: string) {
  return eventBridge.emit<FileEventPayload>('file:opened', { path });
}

export function emitFileSaved(path: string) {
  return eventBridge.emit<FileEventPayload>('file:saved', { path });
}

// Terminal events
export function emitCommandStarted(sessionId: string, command: string) {
  return eventBridge.emit<TerminalEventPayload>('terminal:command:started', { sessionId, command });
}

export function emitCommandFinished(sessionId: string, command: string, exitCode: number, duration: number) {
  return eventBridge.emit<TerminalEventPayload>('terminal:command:finished', { 
    sessionId, 
    command, 
    exitCode, 
    duration 
  });
}

export function emitTerminalOutput(sessionId: string, output: string) {
  return eventBridge.emit<TerminalEventPayload>('terminal:output', { sessionId, output, command: '' });
}

// Git events
export function emitGitStatusChanged(branch: string, files?: string[]) {
  return eventBridge.emit<GitEventPayload>('git:status:changed', { branch, files });
}

export function emitGitCommitted(commitHash: string, message: string) {
  return eventBridge.emit<GitEventPayload>('git:committed', { commitHash, message });
}

// Problem events
export function emitProblemAdded(problem: ProblemEventPayload) {
  return eventBridge.emit<ProblemEventPayload>('problem:added', problem);
}

export function emitProblemsCleared() {
  return eventBridge.emit('problem:cleared', {});
}

// Agent events
export function emitAgentThinking(thought: string) {
  return eventBridge.emit<AgentEventPayload>('agent:thinking', { thought });
}

export function emitAgentToolCall(toolName: string, parameters: Record<string, unknown>) {
  return eventBridge.emit<AgentEventPayload>('agent:tool:call', { toolName, parameters });
}

export function emitAgentToolResult(toolName: string, result: unknown) {
  return eventBridge.emit<AgentEventPayload>('agent:tool:result', { toolName, result });
}

export function emitAgentDone() {
  return eventBridge.emit('agent:done', {});
}

export function emitAgentError(error: string) {
  return eventBridge.emit<AgentEventPayload>('agent:error', { error });
}
