# Agent Tool System

## Overview

Ce document définit l'architecture des outils contrôlés par l'Agent pour piloter le Workbench OPTIMUS.

## Principe

L'Agent ne se contente pas d'exécuter des commandes - il **pilote** l'interface en temps réel, permettant à l'utilisateur de **voir** le travail de l'Agent.

```
USER REQUEST
     ↓
  AGENT (comprend, planifie)
     ↓
  SELECT TOOLS (via Tool Layer)
     ↓
  EXECUTE (Runtime Sandbox)
     ↓
  BROADCAST EVENTS (Real-time UI updates)
     ↓
  USER SEES (Live workbench updates)
```

## Tool Layer Architecture

### 1. Core Tool Interface

```typescript
// Type de base pour tous les outils
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  returns: ToolReturn;
  permission: ToolPermission;
  handler: ToolHandler;
}

interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: unknown;
}

interface ToolReturn {
  type: "void" | "string" | "object" | "array";
  description: string;
}

interface ToolPermission {
  scope: "user" | "workspace" | "sandbox";
  requiresApproval: boolean;
  dangerous: boolean;
  auditLog: boolean;
}

type ToolHandler = (
  params: Record<string, unknown>,
  context: ToolContext
) => Promise<ToolResult>;
```

### 2. Tool Categories

#### File Tools
```typescript
interface FileTools {
  // Lecture
  read_file: {
    params: { path: string; startLine?: number; endLine?: number };
    returns: { content: string; lines: number };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Création
  create_file: {
    params: { path: string; content: string; parents?: boolean };
    returns: { path: string; created: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Modification
  edit_file: {
    params: { 
      path: string; 
      oldStr: string; 
      newStr: string;
      replaceAll?: boolean;
    };
    returns: { path: string; modified: boolean; changes: DiffChange[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Suppression
  delete_file: {
    params: { path: string; recursive?: boolean };
    returns: { path: string; deleted: boolean };
    permission: { scope: "sandbox", requiresApproval: true, dangerous: true };
  };
  
  // Renommage
  rename_file: {
    params: { oldPath: string; newPath: string };
    returns: { oldPath: string; newPath: string; renamed: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Liste
  list_files: {
    params: { path: string; recursive?: boolean; pattern?: string };
    returns: { files: FileInfo[]; directories: string[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Statut Git d'un fichier
  file_git_status: {
    params: { path: string };
    returns: { path: string; status: GitStatus; staged: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
}
```

#### Editor Tools
```typescript
interface EditorTools {
  // Ouvrir un fichier dans l'éditeur
  open_file: {
    params: { 
      path: string; 
      line?: number; 
      column?: number;
      focus?: boolean;
    };
    returns: { path: string; opened: boolean; position: Position };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["open_file", "focus_editor"];
  };
  
  // Ouvrir un diff
  open_diff: {
    params: { 
      original: { path: string; content?: string };
      modified: { path: string; content?: string };
      title?: string;
    };
    returns: { diffId: string; created: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["open_diff"];
  };
  
  // Focus sur l'éditeur
  focus_editor: {
    params: { path?: string; tabIndex?: number };
    returns: { focused: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["focus_editor"];
  };
  
  // Obtenir le contenu actuel
  get_editor_content: {
    params: { path?: string };
    returns: { content: string; path: string };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Recherche dans l'éditeur
  search_in_editor: {
    params: { 
      pattern: string;
      path?: string;
      caseSensitive?: boolean;
      wholeWord?: boolean;
      regex?: boolean;
    };
    returns: { matches: SearchMatch[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
  
  // Remplacer dans l'éditeur
  replace_in_editor: {
    params: {
      pattern: string;
      replacement: string;
      path?: string;
      replaceAll?: boolean;
    };
    returns: { replaced: number; matches: SearchMatch[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["file_modified"];
  };
}
```

#### Explorer Tools
```typescript
interface ExplorerTools {
  // Rafraîchir l'explorer
  refresh_explorer: {
    params: { path?: string };
    returns: { refreshed: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["explorer_refresh"];
  };
  
  // Sélectionner dans l'explorer
  select_in_explorer: {
    params: { path: string; reveal?: boolean };
    returns: { selected: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["explorer_select"];
  };
  
  // Créer un dossier
  create_directory: {
    params: { path: string; parents?: boolean };
    returns: { path: string; created: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["file_created", "explorer_update"];
  };
  
  // Voir les fichiers modifiés
  get_modified_files: {
    params: {};
    returns: { files: ModifiedFile[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
}
```

#### Terminal Tools
```typescript
interface TerminalTools {
  // Exécuter une commande
  run_command: {
    params: {
      command: string;
      cwd?: string;
      env?: Record<string, string>;
      timeout?: number;
    };
    returns: { 
      stdout: string; 
      stderr: string; 
      exitCode: number;
      duration: number;
    };
    permission: { scope: "sandbox", requiresApproval: true, dangerous: true };
    events: ["command_output", "terminal_write"];
  };
  
  // Commande en streaming
  run_command_streaming: {
    params: {
      command: string;
      cwd?: string;
      env?: Record<string, string>;
    };
    returns: { streamId: string; started: boolean };
    permission: { scope: "sandbox", requiresApproval: true, dangerous: true };
    events: ["terminal_stream_start", "terminal_stream_data", "terminal_stream_end"];
  };
  
  // Ouvrir le terminal
  open_terminal: {
    params: { cwd?: string; shell?: string };
    returns: { terminalId: string };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["terminal_open"];
  };
  
  // Écrire dans le terminal
  write_terminal: {
    params: { terminalId?: string; text: string };
    returns: { written: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["terminal_write"];
  };
  
  // Kill un processus
  kill_process: {
    params: { pid: number; signal?: string };
    returns: { killed: boolean };
    permission: { scope: "sandbox", requiresApproval: true, dangerous: true };
    events: ["process_killed"];
  };
  
  // Lister les processus
  list_processes: {
    params: {};
    returns: { processes: ProcessInfo[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
}
```

#### Git Tools
```typescript
interface GitTools {
  // Status Git
  git_status: {
    params: { path?: string };
    returns: { 
      current: string;
      branch: string;
      staged: FileInfo[];
      modified: FileInfo[];
      untracked: FileInfo[];
      ahead: number;
      behind: number;
    };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["git_status"];
  };
  
  // Diff
  git_diff: {
    params: { path?: string; staged?: boolean; cached?: boolean };
    returns: { diff: string; files: DiffFile[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["git_diff"];
  };
  
  // Stage
  git_stage: {
    params: { paths: string[] | "*"; mode?: "add" | "reset" };
    returns: { staged: string[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["git_stage", "git_status"];
  };
  
  // Commit
  git_commit: {
    params: { message: string; amend?: boolean };
    returns: { commitHash: string; message: string };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["git_commit"];
  };
  
  // Push
  git_push: {
    params: { remote?: string; branch?: string; force?: boolean };
    returns: { pushed: boolean; remote: string };
    permission: { scope: "workspace", requiresApproval: true, dangerous: true };
    events: ["git_push"];
  };
  
  // Pull
  git_pull: {
    params: { remote?: string; branch?: string };
    returns: { pulled: boolean; changes: number };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["git_pull"];
  };
  
  // Branches
  git_branch: {
    params: { 
      action: "list" | "create" | "delete" | "checkout";
      name?: string;
      force?: boolean;
    };
    returns: { branches: Branch[]; current?: string };
    permission: { scope: "sandbox", requiresApproval: true, dangerous: true };
    events: ["git_branch"];
  };
  
  // Log
  git_log: {
    params: { path?: string; limit?: number; format?: string };
    returns: { commits: Commit[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
}
```

#### Testing Tools
```typescript
interface TestingTools {
  // Découvrir les tests
  discover_tests: {
    params: { pattern?: string };
    returns: { tests: TestInfo[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["tests_discovered"];
  };
  
  // Lancer les tests
  run_tests: {
    params: { 
      pattern?: string;
      testIds?: string[];
      coverage?: boolean;
      watch?: boolean;
    };
    returns: { 
      results: TestResult[];
      passed: number;
      failed: number;
      duration: number;
    };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["tests_start", "tests_result", "tests_complete"];
  };
  
  // Inspecter les problèmes
  inspect_problems: {
    params: { file?: string };
    returns: { problems: Problem[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["problems_updated"];
  };
}
```

#### Preview Tools
```typescript
interface PreviewTools {
  // Démarrer le preview
  start_preview: {
    params: { port?: number; path?: string };
    returns: { url: string; port: number; pid: number };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["preview_start"];
  };
  
  // Arrêter le preview
  stop_preview: {
    params: { port?: number };
    returns: { stopped: boolean };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
    events: ["preview_stop"];
  };
  
  // Inspecter les logs
  inspect_logs: {
    params: { lines?: number; filter?: string };
    returns: { logs: LogEntry[] };
    permission: { scope: "sandbox", requiresApproval: false, dangerous: false };
  };
}
```

### 3. Event Broadcasting

```typescript
// Les outils émettent des événements pour mettre à jour l'UI
interface ToolEvent {
  tool: string;
  action: "start" | "complete" | "error" | "progress";
  data: unknown;
  timestamp: number;
  auditId: string;
}

// Broadcast via WebSocket
const broadcastToolEvent = (event: ToolEvent) => {
  // Utiliser le système d'événements existant d'OpenHands
  useEventStore.getState().addEvent({
    kind: "ToolEvent",
    ...event,
  });
};
```

### 4. Approval Flow

```typescript
// Pour les opérations dangereuses
interface ApprovalRequest {
  id: string;
  tool: string;
  params: Record<string, unknown>;
  risk: "low" | "medium" | "high";
  reason: string;
  createdAt: number;
}

// Stockage des demandes en attente
const pendingApprovals = new Map<string, ApprovalRequest>();

// API pour approuver/refuser
interface ApprovalAPI {
  requestApproval(tool: string, params: unknown): Promise<string>;
  approve(requestId: string): Promise<void>;
  reject(requestId: string): Promise<void>;
  getPending(): ApprovalRequest[];
}
```

### 5. Rollback System

```typescript
// Pour les opérations risquées, garder un historique
interface RollbackPoint {
  id: string;
  tool: string;
  params: unknown;
  snapshot: unknown;
  timestamp: number;
}

interface RollbackAPI {
  createSnapshot(description: string): RollbackPoint;
  rollback(pointId: string): Promise<void>;
  getHistory(): RollbackPoint[];
}
```

### 6. Integration avec OpenHands Existant

```typescript
// Pattern: Wrapping des outils existants
import { tools } from "@anthropic/tool-use";

// Outil OpenHands existant -> OPTIMUS tool
const openhandsTerminalTool = {
  name: "terminal",
  async handler(params: { command: string }) {
    // Logique existante d'OpenHands
    const result = await terminal.execute(command);
    
    // Broadcast pour l'UI
    broadcastToolEvent({
      tool: "terminal",
      action: "complete",
      data: { output: result.stdout },
      timestamp: Date.now(),
    });
    
    return result;
  },
};
```

## Tool Discovery

```typescript
// Enregistrement dynamique des outils
const toolRegistry = new Map<string, Tool>();

const registerTool = (tool: Tool) => {
  toolRegistry.set(tool.name, tool);
  
  // Exposer à l'Agent
  agent.exposeTool(tool.name, tool.handler);
  
  // Exposer au frontend pour l'affichage
  frontend.registerToolUI(tool);
};
```

## Audit & Security

```typescript
interface AuditLog {
  id: string;
  tool: string;
  params: unknown;
  result?: unknown;
  userId: string;
  conversationId: string;
  timestamp: number;
  approved?: boolean;
  approvedBy?: string;
}

// Logging automatique
const withAudit = (tool: Tool): Tool => ({
  ...tool,
  handler: async (params, context) => {
    const auditId = crypto.randomUUID();
    
    // Log avant
    await auditLog.create({
      id: auditId,
      tool: tool.name,
      params: params,
      userId: context.userId,
      conversationId: context.conversationId,
      timestamp: Date.now(),
    });
    
    try {
      const result = await tool.handler(params, context);
      
      // Log succès
      await auditLog.update(auditId, { result, status: "success" });
      
      return result;
    } catch (error) {
      // Log erreur
      await auditLog.update(auditId, { error: String(error), status: "error" });
      throw error;
    }
  },
});
```

## Summary

| Category | Tools | Priority |
|----------|-------|----------|
| File | 7 | HIGH |
| Editor | 6 | HIGH |
| Explorer | 4 | HIGH |
| Terminal | 5 | MEDIUM |
| Git | 8 | MEDIUM |
| Testing | 3 | MEDIUM |
| Preview | 3 | LOW |
| **Total** | **36** | |
