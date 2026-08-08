/**
 * OPTIMUS Tool System Types
 * 
 * Core types for the Agent Tool Layer that controls the Workbench.
 * These types define how the Agent can interact with the development environment.
 */

// =============================================================================
// PERMISSION SYSTEM
// =============================================================================

export type ToolScope = "user" | "workspace" | "sandbox";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ToolPermission {
  scope: ToolScope;
  requiresApproval: boolean;
  dangerous: boolean;
  auditLog: boolean;
  rateLimit?: {
    maxPerMinute: number;
    maxPerHour: number;
  };
}

export const DEFAULT_TOOL_PERMISSION: ToolPermission = {
  scope: "sandbox",
  requiresApproval: false,
  dangerous: false,
  auditLog: true,
};

// =============================================================================
// TOOL DEFINITION
// =============================================================================

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ToolReturn {
  type: "void" | "string" | "object" | "array";
  description: string;
}

export interface ToolEvent {
  event: string;
  description: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  returns: ToolReturn;
  permission: ToolPermission;
  events: ToolEvent[];
  category: ToolCategory;
}

export type ToolCategory =
  | "file"
  | "editor"
  | "explorer"
  | "terminal"
  | "git"
  | "search"
  | "testing"
  | "debug"
  | "preview"
  | "system";

export type ToolHandler<T = Record<string, unknown>> = (
  params: T,
  context: ToolContext
) => Promise<ToolResult>;

export interface ToolContext {
  conversationId: string;
  userId: string;
  workspacePath: string;
  timestamp: number;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// =============================================================================
// FILE TOOLS
// =============================================================================

export interface FileToolParams {
  path: string;
  content?: string;
  startLine?: number;
  endLine?: number;
  recursive?: boolean;
  parents?: boolean;
}

export interface FileCreatedResult {
  path: string;
  created: boolean;
  content?: string;
}

export interface FileReadResult {
  path: string;
  content: string;
  lines: number;
}

export interface FileEditedResult {
  path: string;
  modified: boolean;
  oldContent: string;
  newContent: string;
}

export interface FileDeletedResult {
  path: string;
  deleted: boolean;
}

export interface FileRenamedResult {
  oldPath: string;
  newPath: string;
  renamed: boolean;
}

export interface FileListResult {
  files: FileInfo[];
  directories: DirectoryInfo[];
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  modified: number;
  isDirectory: boolean;
}

export interface DirectoryInfo {
  name: string;
  path: string;
  children: number;
}

// =============================================================================
// EDITOR TOOLS
// =============================================================================

export interface EditorToolParams {
  path?: string;
  line?: number;
  column?: number;
  focus?: boolean;
  tabIndex?: number;
}

export interface OpenFileResult {
  path: string;
  opened: boolean;
  position: Position;
}

export interface Position {
  line: number;
  column: number;
}

export interface DiffParams {
  original: { path: string; content?: string };
  modified: { path: string; content?: string };
  title?: string;
}

export interface DiffResult {
  diffId: string;
  created: boolean;
}

export interface SearchParams {
  pattern: string;
  path?: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
}

export interface SearchMatch {
  path: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

// =============================================================================
// TERMINAL TOOLS
// =============================================================================

export interface TerminalToolParams {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface TerminalResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface TerminalSession {
  id: string;
  cwd: string;
  startedAt: number;
  processId?: number;
}

// =============================================================================
// GIT TOOLS
// =============================================================================

export interface GitStatusResult {
  current: string;
  branch: string;
  staged: GitFile[];
  modified: GitFile[];
  untracked: GitFile[];
  ahead: number;
  behind: number;
}

export interface GitFile {
  path: string;
  status: GitStatus;
  staged: boolean;
}

export type GitStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "copied"
  | "untracked"
  | "ignored";

export interface GitDiffResult {
  diff: string;
  files: DiffFile[];
}

export interface DiffFile {
  path: string;
  status: GitStatus;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  oldLine?: number;
  newLine?: number;
}

export interface GitCommitResult {
  commitHash: string;
  message: string;
  author: string;
  timestamp: number;
}

export interface Branch {
  name: string;
  current: boolean;
  remote?: string;
}

// =============================================================================
// TESTING TOOLS
// =============================================================================

export interface TestInfo {
  id: string;
  name: string;
  path: string;
  type: "unit" | "integration" | "e2e";
  status?: TestStatus;
}

export type TestStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface TestResult {
  id: string;
  status: TestStatus;
  duration: number;
  error?: string;
  output?: string;
}

// =============================================================================
// PROBLEMS
// =============================================================================

export interface Problem {
  id: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: ProblemSeverity;
  message: string;
  source: string;
  code?: string;
}

export type ProblemSeverity = "error" | "warning" | "info";

// =============================================================================
// PREVIEW TOOLS
// =============================================================================

export interface PreviewResult {
  url: string;
  port: number;
  pid: number;
  startedAt: number;
}

// =============================================================================
// WORKBENCH EVENTS
// =============================================================================

export type WorkbenchEvent =
  | FileCreatedEvent
  | FileModifiedEvent
  | FileDeletedEvent
  | FileOpenedEvent
  | FileClosedEvent
  | EditorFocusedEvent
  | DiffShownEvent
  | DiffClosedEvent
  | TerminalOpenedEvent
  | CommandStartedEvent
  | CommandFinishedEvent
  | GitStatusChangedEvent
  | TestsDiscoveredEvent
  | TestsFinishedEvent
  | ProblemDetectedEvent
  | PreviewStartedEvent
  | PreviewStoppedEvent;

export interface FileCreatedEvent {
  kind: "FileCreatedEvent";
  path: string;
  content?: string;
}

export interface FileModifiedEvent {
  kind: "FileModifiedEvent";
  path: string;
  oldContent?: string;
  newContent?: string;
}

export interface FileDeletedEvent {
  kind: "FileDeletedEvent";
  path: string;
}

export interface FileOpenedEvent {
  kind: "FileOpenedEvent";
  path: string;
  line?: number;
  column?: number;
}

export interface FileClosedEvent {
  kind: "FileClosedEvent";
  path: string;
}

export interface EditorFocusedEvent {
  kind: "EditorFocusedEvent";
  path: string;
}

export interface DiffShownEvent {
  kind: "DiffShownEvent";
  original: { path: string; content?: string };
  modified: { path: string; content?: string };
}

export interface DiffClosedEvent {
  kind: "DiffClosedEvent";
  diffId: string;
}

export interface TerminalOpenedEvent {
  kind: "TerminalOpenedEvent";
  sessionId: string;
  cwd?: string;
}

export interface CommandStartedEvent {
  kind: "CommandStartedEvent";
  command: string;
  sessionId?: string;
}

export interface CommandFinishedEvent {
  kind: "CommandFinishedEvent";
  command: string;
  exitCode: number;
  duration: number;
}

export interface GitStatusChangedEvent {
  kind: "GitStatusChangedEvent";
  status: GitStatusResult;
}

export interface TestsDiscoveredEvent {
  kind: "TestsDiscoveredEvent";
  tests: TestInfo[];
}

export interface TestsFinishedEvent {
  kind: "TestsFinishedEvent";
  results: TestResult[];
  passed: number;
  failed: number;
}

export interface ProblemDetectedEvent {
  kind: "ProblemDetectedEvent";
  problem: Problem;
}

export interface PreviewStartedEvent {
  kind: "PreviewStartedEvent";
  url: string;
  port: number;
}

export interface PreviewStoppedEvent {
  kind: "PreviewStoppedEvent";
  port: number;
}

// =============================================================================
// APPROVAL SYSTEM
// =============================================================================

export interface ApprovalRequest {
  id: string;
  tool: string;
  params: Record<string, unknown>;
  risk: RiskLevel;
  reason: string;
  createdAt: number;
  status: "pending" | "approved" | "rejected" | "expired";
  requestedBy: "agent" | "user";
}

export interface ApprovalResult {
  approved: boolean;
  reason?: string;
  approvedBy?: string;
}

// =============================================================================
// ROLLBACK
// =============================================================================

export interface RollbackPoint {
  id: string;
  timestamp: number;
  description: string;
  gitCommit?: string;
  filesSnapshot?: Record<string, string>; // path -> content hash
}
