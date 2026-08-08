/**
 * OPTIMUS Tool Registry
 * 
 * Central registry for all tools available to the Agent.
 * Tools are organized by category and provide a unified interface
 * for controlling the Workbench from the Chat.
 */

import {
  ToolDefinition,
  ToolCategory,
  ToolPermission,
  ToolHandler,
  ToolResult,
  ToolContext,
} from "#/types/optimus/tool";
import { useEventStore } from "#/stores/use-event-store";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const FILE_TOOLS: ToolDefinition[] = [
  {
    name: "read_file",
    description: "Read the contents of a file",
    category: "file",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to the file to read",
        required: true,
      },
      {
        name: "startLine",
        type: "number",
        description: "Start reading from this line (1-indexed)",
        required: false,
      },
      {
        name: "endLine",
        type: "number",
        description: "End reading at this line (1-indexed)",
        required: false,
      },
    ],
    returns: {
      type: "object",
      description: "File content and metadata",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "file_read", description: "File was read" },
    ],
  },
  {
    name: "create_file",
    description: "Create a new file with optional content",
    category: "file",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path where to create the file",
        required: true,
      },
      {
        name: "content",
        type: "string",
        description: "Initial content of the file",
        required: false,
        default: "",
      },
      {
        name: "parents",
        type: "boolean",
        description: "Create parent directories if they don't exist",
        required: false,
        default: true,
      },
    ],
    returns: {
      type: "object",
      description: "Created file info",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "file_created", description: "File was created" },
      { event: "explorer_refresh", description: "Explorer should refresh" },
    ],
  },
  {
    name: "edit_file",
    description: "Edit an existing file by replacing text",
    category: "file",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to the file to edit",
        required: true,
      },
      {
        name: "oldStr",
        type: "string",
        description: "Text to replace (must match exactly)",
        required: true,
      },
      {
        name: "newStr",
        type: "string",
        description: "Replacement text",
        required: true,
      },
      {
        name: "replaceAll",
        type: "boolean",
        description: "Replace all occurrences of oldStr",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "Edit result with diff info",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "file_modified", description: "File was modified" },
    ],
  },
  {
    name: "delete_file",
    description: "Delete a file or directory",
    category: "file",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to the file/directory to delete",
        required: true,
      },
      {
        name: "recursive",
        type: "boolean",
        description: "Delete directories recursively",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "Deletion result",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: true,
      dangerous: true,
      auditLog: true,
    },
    events: [
      { event: "file_deleted", description: "File was deleted" },
      { event: "explorer_refresh", description: "Explorer should refresh" },
    ],
  },
  {
    name: "rename_file",
    description: "Rename or move a file",
    category: "file",
    parameters: [
      {
        name: "oldPath",
        type: "string",
        description: "Current path of the file",
        required: true,
      },
      {
        name: "newPath",
        type: "string",
        description: "New path for the file",
        required: true,
      },
    ],
    returns: {
      type: "object",
      description: "Rename result",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "file_renamed", description: "File was renamed" },
      { event: "explorer_refresh", description: "Explorer should refresh" },
    ],
  },
  {
    name: "list_files",
    description: "List files and directories in a path",
    category: "file",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to list (defaults to workspace root)",
        required: false,
        default: ".",
      },
      {
        name: "recursive",
        type: "boolean",
        description: "List recursively",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "List of files and directories",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [],
  },
];

const EDITOR_TOOLS: ToolDefinition[] = [
  {
    name: "open_file",
    description: "Open a file in the editor",
    category: "editor",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to the file to open",
        required: true,
      },
      {
        name: "line",
        type: "number",
        description: "Line number to focus (1-indexed)",
        required: false,
      },
      {
        name: "column",
        type: "number",
        description: "Column number to focus (1-indexed)",
        required: false,
      },
      {
        name: "focus",
        type: "boolean",
        description: "Focus the editor panel",
        required: false,
        default: true,
      },
    ],
    returns: {
      type: "object",
      description: "Open result with position",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "file_opened", description: "File was opened in editor" },
      { event: "editor_focused", description: "Editor was focused" },
    ],
  },
  {
    name: "open_diff",
    description: "Open a diff view comparing two files or contents",
    category: "editor",
    parameters: [
      {
        name: "original",
        type: "object",
        description: "Original file info",
        required: true,
      },
      {
        name: "modified",
        type: "object",
        description: "Modified file info",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Title for the diff view",
        required: false,
      },
    ],
    returns: {
      type: "object",
      description: "Diff view created info",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "diff_shown", description: "Diff view was shown" },
    ],
  },
  {
    name: "close_file",
    description: "Close a file in the editor",
    category: "editor",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to the file to close",
        required: true,
      },
    ],
    returns: {
      type: "void",
      description: "Nothing on success",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "file_closed", description: "File was closed" },
    ],
  },
  {
    name: "focus_editor",
    description: "Focus the editor panel",
    category: "editor",
    parameters: [
      {
        name: "tabIndex",
        type: "number",
        description: "Index of the tab to focus",
        required: false,
      },
    ],
    returns: {
      type: "void",
      description: "Nothing on success",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "editor_focused", description: "Editor was focused" },
    ],
  },
];

const TERMINAL_TOOLS: ToolDefinition[] = [
  {
    name: "run_command",
    description: "Execute a shell command",
    category: "terminal",
    parameters: [
      {
        name: "command",
        type: "string",
        description: "Command to execute",
        required: true,
      },
      {
        name: "cwd",
        type: "string",
        description: "Working directory",
        required: false,
      },
      {
        name: "timeout",
        type: "number",
        description: "Timeout in seconds",
        required: false,
        default: 30,
      },
    ],
    returns: {
      type: "object",
      description: "Command output and exit code",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: true,
      dangerous: true,
      auditLog: true,
      rateLimit: {
        maxPerMinute: 10,
        maxPerHour: 100,
      },
    },
    events: [
      { event: "command_started", description: "Command execution started" },
      { event: "command_finished", description: "Command execution finished" },
    ],
  },
  {
    name: "open_terminal",
    description: "Open a new terminal session",
    category: "terminal",
    parameters: [
      {
        name: "cwd",
        type: "string",
        description: "Initial working directory",
        required: false,
        default: "/workspace",
      },
    ],
    returns: {
      type: "object",
      description: "Terminal session info",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "terminal_opened", description: "Terminal was opened" },
    ],
  },
  {
    name: "kill_process",
    description: "Kill a running process",
    category: "terminal",
    parameters: [
      {
        name: "pid",
        type: "number",
        description: "Process ID to kill",
        required: true,
      },
    ],
    returns: {
      type: "object",
      description: "Kill result",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: true,
      dangerous: true,
      auditLog: true,
    },
    events: [
      { event: "process_killed", description: "Process was killed" },
    ],
  },
];

const GIT_TOOLS: ToolDefinition[] = [
  {
    name: "git_status",
    description: "Get the current Git status",
    category: "git",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to get status for (defaults to repo root)",
        required: false,
      },
    ],
    returns: {
      type: "object",
      description: "Git status with staged, modified, untracked files",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "git_status_changed", description: "Git status was updated" },
    ],
  },
  {
    name: "git_diff",
    description: "Get the Git diff for files",
    category: "git",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to get diff for (defaults to all files)",
        required: false,
      },
      {
        name: "staged",
        type: "boolean",
        description: "Show staged changes only",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "Diff with hunks and lines",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [],
  },
  {
    name: "git_stage",
    description: "Stage files for commit",
    category: "git",
    parameters: [
      {
        name: "paths",
        type: "array",
        description: "Files to stage (use '*' for all)",
        required: true,
      },
    ],
    returns: {
      type: "object",
      description: "Staged files",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "git_status_changed", description: "Git status was updated" },
    ],
  },
  {
    name: "git_commit",
    description: "Commit staged changes",
    category: "git",
    parameters: [
      {
        name: "message",
        type: "string",
        description: "Commit message",
        required: true,
      },
      {
        name: "amend",
        type: "boolean",
        description: "Amend the previous commit",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "Commit info with hash",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "git_commit_created", description: "Commit was created" },
    ],
  },
  {
    name: "git_branch",
    description: "Manage Git branches",
    category: "git",
    parameters: [
      {
        name: "action",
        type: "string",
        description: "Action: list, create, delete, checkout",
        required: true,
      },
      {
        name: "name",
        type: "string",
        description: "Branch name (for create/delete/checkout)",
        required: false,
      },
    ],
    returns: {
      type: "object",
      description: "Branch list or operation result",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: true,
      dangerous: true,
      auditLog: true,
    },
    events: [
      { event: "git_branch_changed", description: "Branch was changed" },
    ],
  },
  {
    name: "git_push",
    description: "Push commits to remote",
    category: "git",
    parameters: [
      {
        name: "remote",
        type: "string",
        description: "Remote name (defaults to 'origin')",
        required: false,
        default: "origin",
      },
      {
        name: "branch",
        type: "string",
        description: "Branch to push",
        required: false,
      },
      {
        name: "force",
        type: "boolean",
        description: "Force push",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "Push result",
    },
    permission: {
      scope: "workspace",
      requiresApproval: true,
      dangerous: true,
      auditLog: true,
    },
    events: [
      { event: "git_push_completed", description: "Push was completed" },
    ],
  },
];

const TESTING_TOOLS: ToolDefinition[] = [
  {
    name: "discover_tests",
    description: "Discover available tests",
    category: "testing",
    parameters: [
      {
        name: "pattern",
        type: "string",
        description: "Pattern to match test files",
        required: false,
      },
    ],
    returns: {
      type: "object",
      description: "List of discovered tests",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "tests_discovered", description: "Tests were discovered" },
    ],
  },
  {
    name: "run_tests",
    description: "Run tests",
    category: "testing",
    parameters: [
      {
        name: "pattern",
        type: "string",
        description: "Pattern to match tests",
        required: false,
      },
      {
        name: "watch",
        type: "boolean",
        description: "Run in watch mode",
        required: false,
        default: false,
      },
    ],
    returns: {
      type: "object",
      description: "Test results with pass/fail counts",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: true,
    },
    events: [
      { event: "tests_started", description: "Tests started" },
      { event: "tests_finished", description: "Tests completed" },
    ],
  },
];

const PREVIEW_TOOLS: ToolDefinition[] = [
  {
    name: "start_preview",
    description: "Start a preview server",
    category: "preview",
    parameters: [
      {
        name: "port",
        type: "number",
        description: "Port to use (auto-detect if not specified)",
        required: false,
      },
      {
        name: "path",
        type: "string",
        description: "Path to serve (defaults to workspace root)",
        required: false,
        default: ".",
      },
    ],
    returns: {
      type: "object",
      description: "Preview server info",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "preview_started", description: "Preview server started" },
    ],
  },
  {
    name: "stop_preview",
    description: "Stop the preview server",
    category: "preview",
    parameters: [
      {
        name: "port",
        type: "number",
        description: "Port of the preview server to stop",
        required: false,
      },
    ],
    returns: {
      type: "void",
      description: "Nothing on success",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [
      { event: "preview_stopped", description: "Preview server stopped" },
    ],
  },
  {
    name: "inspect_logs",
    description: "Get recent logs from the application",
    category: "preview",
    parameters: [
      {
        name: "lines",
        type: "number",
        description: "Number of lines to retrieve",
        required: false,
        default: 100,
      },
    ],
    returns: {
      type: "object",
      description: "Recent log entries",
    },
    permission: {
      scope: "sandbox",
      requiresApproval: false,
      dangerous: false,
      auditLog: false,
    },
    events: [],
  },
];

// =============================================================================
// TOOL REGISTRY
// =============================================================================

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();

  constructor() {
    this.registerTools(FILE_TOOLS);
    this.registerTools(EDITOR_TOOLS);
    this.registerTools(TERMINAL_TOOLS);
    this.registerTools(GIT_TOOLS);
    this.registerTools(TESTING_TOOLS);
    this.registerTools(PREVIEW_TOOLS);
  }

  private registerTools(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  registerHandler(name: string, handler: ToolHandler): void {
    if (!this.tools.has(name)) {
      console.warn(`Tool ${name} not registered, registering with default permissions`);
    }
    this.handlers.set(name, handler);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAllTools().filter((tool) => tool.category === category);
  }

  getToolsByPermission(permission: Partial<ToolPermission>): ToolDefinition[] {
    return this.getAllTools().filter((tool) => {
      for (const [key, value] of Object.entries(permission)) {
        if (tool.permission[key as keyof ToolPermission] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async executeTool(
    name: string,
    params: Record<string, unknown>,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool ${name} not found`,
      };
    }

    const handler = this.handlers.get(name);
    if (!handler) {
      return {
        success: false,
        error: `No handler registered for tool ${name}`,
      };
    }

    // Emit tool call event
    const addEvent = useEventStore.getState().addEvent;
    addEvent({
      tool,
      params,
      timestamp: new Date().toISOString(),
    } as unknown as Parameters<typeof addEvent>[0]);

    try {
      const result = await handler(params, context);

      // Emit tool return event
      addEvent({
        tool: name,
        result,
        timestamp: new Date().toISOString(),
      } as unknown as Parameters<typeof addEvent>[0]);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Emit error event
      addEvent({
        tool: name,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as unknown as Parameters<typeof addEvent>[0]);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  needsApproval(name: string): boolean {
    const tool = this.tools.get(name);
    return tool?.permission.requiresApproval ?? false;
  }

  isDangerous(name: string): boolean {
    const tool = this.tools.get(name);
    return tool?.permission.dangerous ?? false;
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();

// =============================================================================
// WORKBENCH EVENT HELPERS
// =============================================================================

export function emitWorkbenchEvent(
  eventType: string,
  data: Record<string, unknown>
): void {
  const addEvent = useEventStore.getState().addEvent;
  addEvent({
    eventType,
    ...data,
    timestamp: new Date().toISOString(),
  } as unknown as Parameters<typeof addEvent>[0]);
}

// =============================================================================
// DEFAULT TOOL VISUALIZER MAPPING
// =============================================================================

export const TOOL_VISUALIZER_MAP: Record<string, string> = {
  // File tools
  read_file: "file-editor",
  create_file: "file-editor",
  edit_file: "file-editor",
  delete_file: "file-editor",
  rename_file: "file-editor",
  list_files: "file-editor",

  // Editor tools
  open_file: "editor",
  open_diff: "diff",
  close_file: "editor",
  focus_editor: "editor",

  // Terminal tools
  run_command: "bash",
  open_terminal: "terminal",
  kill_process: "terminal",

  // Git tools
  git_status: "git",
  git_diff: "git",
  git_stage: "git",
  git_commit: "git",
  git_branch: "git",
  git_push: "git",

  // Testing tools
  discover_tests: "testing",
  run_tests: "testing",

  // Preview tools
  start_preview: "preview",
  stop_preview: "preview",
  inspect_logs: "logs",
};

export function getVisualizerForTool(toolName: string): string {
  return TOOL_VISUALIZER_MAP[toolName] ?? "generic";
}
