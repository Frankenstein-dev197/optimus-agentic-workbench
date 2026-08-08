/**
 * OPTIMUS Types
 * 
 * Core types for the OPTIMUS agentic workbench.
 */

// Agent State
export type AgentState = 
  | 'idle'
  | 'loading'
  | 'running'
  | 'paused'
  | 'error'
  | 'stopped';

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface OptimusMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  agentName?: string;
  toolCallId?: string;
  toolName?: string;
  isLoading?: boolean;
  error?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'file' | 'image';
  name: string;
  path?: string;
  content?: string;
}

// Tool Call Types
export type ToolKind = 'execute' | 'edit' | 'read' | 'fetch';

export interface ToolCall {
  id: string;
  toolName: string;
  toolKind: ToolKind;
  parameters: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

// Terminal Types
export interface TerminalSession {
  id: string;
  cwd: string;
  startedAt: number;
  isActive: boolean;
}

export interface CommandOutput {
  sessionId: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

// File Types
export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  isExpanded?: boolean;
  children?: FileNode[];
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked';
}

// Git Types
export interface GitStatus {
  branch: string;
  staged: FileNode[];
  modified: FileNode[];
  untracked: FileNode[];
  isDirty: boolean;
}

// Workspace Types
export interface WorkspaceTab {
  id: string;
  path: string;
  name: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
  content?: string;
}

export interface WorkspaceState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  sidebarTab: 'explorer' | 'search' | 'git' | 'debug' | 'extensions';
  sidebarWidth: number;
  terminalHeight: number;
}

// Optimus Configuration
export interface OptimusConfig {
  agentEnabled: boolean;
  agentName: string;
  model?: string;
  apiKey?: string;
  backendUrl?: string;
  workspacePath: string;
}
