# Workbench Integration

## Overview

Ce document décrit comment intégrer les capacités du Workbench (Explorer, Editor, Terminal, etc.) dans l'expérience OPTIMUS tout en conservant l'identité OpenHands.

## Principes d'Intégration

1. **Ne pas créer un clone VS Code** - Conserver l'identité OPTIMUS
2. **AI-First** - Le Chat contrôle le Workbench
3. **Progressive Disclosure** - Les panneaux apparaissent selon le contexte
4. **Unified Experience** - Une seule plateforme, pas plusieurs apps

## Architecture d'Intégration

```
┌─────────────────────────────────────────────────────────────────┐
│                         OPTIMUS APP                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │          │  │                                              │ │
│  │   CHAT   │  │                  WORKBENCH                    │ │
│  │          │  │  ┌────────┐  ┌─────────────────────────────┐ │ │
│  │ [Agent]  │◄─┼──┤Tool    │  │         EDITOR AREA          │ │ │
│  │          │  │  │Layer   │  │  ┌─────┐ ┌─────┐ ┌─────┐    │ │ │
│  │          │  │  └────────┘  │  │Tab 1│ │Tab 2│ │Tab 3│    │ │ │
│  │          │  │       │      │  └─────┘ └─────┘ └─────┘    │ │ │
│  │          │  │       ▼      │  ┌─────────────────────────┐ │ │ │
│  │          │  │  ┌────────┐   │  │                         │ │ │ │
│  │          │  │  │Event   │   │  │       MONACO            │ │ │ │
│  │          │  │  │Bus     │   │  │                         │ │ │ │
│  │          │  │  └────────┘   │  └─────────────────────────┘ │ │ │
│  │          │  │       │       └─────────────────────────────┘ │ │
│  │          │  │       ▼       │  ┌─────────────────────────┐  │ │
│  │          │  │  ┌────────┐   │  │        EXPLORER         │  │ │
│  │          │  │  │React   │   │  │  📁 src/                │  │ │
│  │          │  │  │State   │   │  │   📄 App.tsx            │  │ │
│  │          │  │  └────────┘   │  │   📄 index.tsx         │  │ │
│  └──────────┘  └──────────────────────────────────────────────┘ │
│                         │                                       │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                      RUNTIME LAYER                          ││
│  │  Sandbox │ Filesystem │ Terminal │ Git │ Preview │ Debug     ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Composants OpenHands à Conserver

### 1. Chat Components
```
src/components/features/chat/
├── chat-interface.tsx       ← Interface principale (CONSERVER)
├── chat-message.tsx          ← Messages (CONSERVER)
├── tool-visualizers/         ← Tool display (CONSERVER + ETENDRE)
│   ├── bash/
│   ├── file-editor/
│   ├── search/
│   └── task/
└── components/
    └── streaming-display.tsx ← NOUVEAU: Display temps réel
```

### 2. Stores (CONSERVER)
```
src/stores/
├── conversation-store.ts      ← État conversationnel
├── agent-store.ts            ← État de l'agent
├── use-event-store.ts        ← Événements (CONSERVER)
└── command-store.ts          ← Terminal commands
```

### 3. Routes (CONSERVER)
```
src/routes/
├── conversation.tsx          ← Vue principale (MODIFIER)
├── home.tsx                  ← Page d'accueil
└── files-tab.tsx             ← Explorer existant (ETENDRE)
```

## Nouveaux Composants à Créer

### 1. Optimus Layout

```typescript
// src/components/optimus-layout.tsx
interface OptimusLayoutProps {
  children: React.ReactNode;
}

export function OptimusLayout({ children }: OptimusLayoutProps) {
  const { panels, setPanels } = useLayoutStore();
  const activePanel = useConversationStore((s) => s.selectedTab);
  
  return (
    <div className="optimus-layout">
      {/* Chat toujours visible */}
      <div className="chat-panel">
        {children}
      </div>
      
      {/* Workbench apparaît dynamiquement */}
      {panels.explorer && <ExplorerPanel />}
      {panels.editor && <EditorArea />}
      {panels.terminal && <TerminalPanel />}
      {panels.problems && <ProblemsPanel />}
      
      {/* Status bar */}
      <StatusBar 
        gitStatus={panels.scm}
        problemsCount={panels.problems}
        terminalStatus={panels.terminal}
      />
    </div>
  );
}
```

### 2. Dynamic Panel System

```typescript
// src/stores/layout-store.ts
interface LayoutState {
  panels: {
    explorer: boolean;
    editor: boolean;
    terminal: boolean;
    problems: boolean;
    output: boolean;
    scm: boolean;
    testing: boolean;
    debug: boolean;
    preview: boolean;
  };
  editor: {
    openTabs: TabInfo[];
    activeTab: string;
    splitView: boolean;
  };
}

type PanelAction = 
  | { type: "OPEN_PANEL"; panel: keyof LayoutState["panels"] }
  | { type: "CLOSE_PANEL"; panel: keyof LayoutState["panels"] }
  | { type: "TOGGLE_PANEL"; panel: keyof LayoutState["panels"] }
  | { type: "OPEN_FILE"; path: string }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "SET_ACTIVE_TAB"; tabId: string };
```

### 3. File Explorer Enhancement

```typescript
// src/components/workbench/explorer/explorer-panel.tsx
interface ExplorerPanelProps {
  rootPath?: string;
}

export function ExplorerPanel({ rootPath = "/workspace" }: ExplorerPanelProps) {
  const { files, loading, refresh } = useFileExplorer(rootPath);
  const { selectFile, selectedPath } = useSelection();
  
  // Écouter les événements de l'Agent
  useAgentEvents({
    onFileCreated: (event) => refresh(),
    onFileModified: (event) => updateFile(event.path),
    onFileDeleted: (event) => removeFile(event.path),
  });
  
  return (
    <div className="explorer-panel">
      <ExplorerHeader 
        title="Explorer"
        actions={[
          { icon: "refresh", onClick: refresh },
          { icon: "new-file", onClick: createNewFile },
          { icon: "new-folder", onClick: createNewFolder },
        ]}
      />
      <FileTree 
        files={files}
        selected={selectedPath}
        onSelect={selectFile}
        onExpand={expandFolder}
      />
      <OpenEditorsList tabs={useEditorStore((s) => s.openTabs)} />
    </div>
  );
}
```

### 4. Monaco Integration

```typescript
// src/components/workbench/editor/monaco-editor.tsx
interface MonacoEditorProps {
  path: string;
  content?: string;
  options?: Monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({ path, content, options }: MonacoEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>();
  const { updateFile, markDirty } = useFileManager();
  
  // Gérer les modifications
  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      updateFile(path, value);
      markDirty(path);
    }
  }, [path]);
  
  return (
    <Monaco
      path={path}
      defaultLanguage={getLanguage(path)}
      defaultValue={content}
      onChange={handleChange}
      options={{
        ...options,
        // OPTIMUS theme integration
        theme: "optimus-dark",
        minimap: { enabled: true },
        lineNumbers: "on",
        glyphMargin: true, // For breakpoints
        folding: true,
        links: true,
        // IntelliSense
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: "on",
        quickSuggestions: true,
      }}
    />
  );
}
```

### 5. Editor Tabs

```typescript
// src/components/workbench/editor/editor-tabs.tsx
interface EditorTabsProps {
  tabs: TabInfo[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (fromIndex: number, toIndex: number) => void;
}

export function EditorTabs({ tabs, activeTab, ... }: EditorTabsProps) {
  const dirtyTabs = useFileStore((s) => s.dirtyFiles);
  const gitModified = useGitStore((s) => s.modifiedFiles);
  
  return (
    <div className="editor-tabs">
      <TabsContainer>
        {tabs.map((tab) => (
          <EditorTab
            key={tab.id}
            active={tab.id === activeTab}
            dirty={dirtyTabs.has(tab.path)}
            gitModified={gitModified.has(tab.path)}
            onClick={() => onTabClick(tab.id)}
            onClose={() => onTabClose(tab.id)}
            onDragEnd={(e) => handleDragEnd(e, tab.id)}
          >
            <TabIcon language={tab.language} />
            <TabLabel>{tab.name}</TabLabel>
          </EditorTab>
        ))}
      </TabsContainer>
    </div>
  );
}
```

### 6. Terminal Panel

```typescript
// src/components/workbench/terminal/terminal-panel.tsx
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

interface TerminalPanelProps {
  cwd?: string;
}

export function TerminalPanel({ cwd = "/workspace" }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>();
  const xtermRef = useRef<Terminal>();
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  
  // Créer une nouvelle session
  const createSession = useCallback(() => {
    const sessionId = crypto.randomUUID();
    setSessions((prev) => [...prev, { id: sessionId, cwd }]);
    setActiveSession(sessionId);
  }, []);
  
  // Écouter les événements de commande
  useCommandEvents({
    onOutput: (data) => {
      xtermRef.current?.write(data);
    },
    onCommand: (cmd) => {
      xtermRef.current?.write(`\r\n$ ${cmd}\r\n`);
    },
  });
  
  return (
    <div className="terminal-panel">
      <TerminalTabs
        sessions={sessions}
        active={activeSession}
        onSelect={setActiveSession}
        onNew={createSession}
        onClose={closeSession}
      />
      <div ref={terminalRef} className="terminal-content">
        <TerminalInstance
          ref={xtermRef}
          onData={(data) => sendToShell(data)}
          options={{ cursorBlink: true }}
          addons={[new FitAddon()]}
        />
      </div>
    </div>
  );
}
```

### 7. Git Source Control

```typescript
// src/components/workbench/scm/scm-panel.tsx
interface ScmPanelProps {}

export function ScmPanel({}: ScmPanelProps) {
  const { status, branches, currentBranch } = useGitStore();
  const { stage, unstage, commit, push } = useGitActions();
  
  // Rafraîchir sur événements
  useAgentEvents({
    onFileCreated: refreshStatus,
    onFileModified: refreshStatus,
    onFileDeleted: refreshStatus,
  });
  
  return (
    <div className="scm-panel">
      <ScmHeader 
        branch={currentBranch}
        branches={branches}
        onBranchChange={checkout}
        onRefresh={refreshStatus}
      />
      
      <ScmChanges>
        {status.staged.length > 0 && (
          <ChangeGroup title="Staged">
            {status.staged.map((file) => (
              <ChangeItem
                key={file.path}
                file={file}
                staged
                onStage={() => unstage([file.path])}
                onDiscard={discardChanges}
                onDiff={showDiff}
              />
            ))}
          </ChangeGroup>
        )}
        
        {status.modified.length > 0 && (
          <ChangeGroup title="Modified">
            {status.modified.map((file) => (
              <ChangeItem
                key={file.path}
                file={file}
                onStage={() => stage([file.path])}
                onDiff={showDiff}
              />
            ))}
          </ChangeGroup>
        )}
        
        {status.untracked.length > 0 && (
          <ChangeGroup title="Untracked">
            {status.untracked.map((file) => (
              <ChangeItem
                key={file.path}
                file={file}
                onStage={() => stage([file.path])}
              />
            ))}
          </ChangeGroup>
        )}
      </ScmChanges>
      
      <ScmCommitBox 
        onCommit={commit}
        onPush={push}
        disabled={status.staged.length === 0}
      />
    </div>
  );
}
```

### 8. Problems Panel

```typescript
// src/components/workbench/problems/problems-panel.tsx
interface ProblemsPanelProps {}

export function ProblemsPanel({}: ProblemsPanelProps) {
  const { problems, stats } = useProblemsStore();
  const { gotoProblem } = useNavigation();
  
  return (
    <div className="problems-panel">
      <ProblemsHeader 
        errors={stats.errors}
        warnings={stats.warnings}
        infos={stats.infos}
        onFilter={setFilter}
        onRefresh={refreshProblems}
      />
      
      <ProblemsList>
        {problems.map((problem) => (
          <ProblemItem
            key={problem.id}
            problem={problem}
            onClick={() => gotoProblem(problem)}
            onCopyMessage={copyMessage}
          />
        ))}
      </ProblemsList>
    </div>
  );
}
```

## Event System Integration

```typescript
// src/hooks/use-workbench-events.ts
export function useWorkbenchEvents() {
  const addEvent = useEventStore((s) => s.addEvent);
  const { openFile, closeFile, updateFile } = useEditorActions();
  const { createFile, deleteFile, renameFile } = useFileActions();
  
  // Écouter les événements de l'Agent
  useSubscription("tool_calls", (event) => {
    switch (event.tool) {
      case "open_file":
        openFile(event.params.path);
        break;
      case "create_file":
        createFile(event.params.path, event.params.content);
        break;
      case "edit_file":
        updateFile(event.params.path, event.params.newStr);
        break;
      case "delete_file":
        deleteFile(event.params.path);
        break;
      case "git_status":
        refreshGitStatus();
        break;
    }
  });
  
  // Écouter les changements du filesystem
  useFilesystemWatcher((event) => {
    if (event.kind === "create") {
      addEvent({ type: "file_created", ...event });
    } else if (event.kind === "modify") {
      addEvent({ type: "file_modified", ...event });
    }
  });
}
```

## Theme & Styling

```typescript
// src/styles/optimus-theme.css
:root {
  /* OPTIMUS Color Palette */
  --optimus-bg-primary: #0d1117;
  --optimus-bg-secondary: #161b22;
  --optimus-bg-tertiary: #21262d;
  --optimus-border: #30363d;
  --optimus-text: #c9d1d9;
  --optimus-text-muted: #8b949e;
  --optimus-accent: #58a6ff;
  --optimus-success: #3fb950;
  --optimus-warning: #d29922;
  --optimus-error: #f85149;
  
  /* Panel specific */
  --panel-bg: var(--optimus-bg-secondary);
  --panel-header-bg: var(--optimus-bg-tertiary);
  --tab-active-bg: var(--optimus-bg-primary);
  --tab-inactive-bg: var(--optimus-bg-secondary);
}
```

## Progressive Disclosure

```typescript
// Panneau apparaît selon le contexte
const PANEL_CONTEXT_RULES: Record<string, keyof LayoutState["panels"][]> = {
  // Agent commence à créer des fichiers
  "file_created": ["explorer", "editor"],
  
  // Agent exécute une commande
  "command_output": ["terminal"],
  
  // Agent lance les tests
  "tests_start": ["testing"],
  
  // Erreurs détectées
  "problems_detected": ["problems"],
  
  // Agent modifie Git
  "git_stage": ["scm"],
  
  // Agent lance l'app
  "preview_start": ["preview"],
  
  // Mode debug
  "debug_start": ["debug"],
};
```

## Summary

| Composant | Status | Action |
|-----------|--------|--------|
| Chat (existant) | ✅ Conserver | MODIFIER streaming |
| Explorer | 🔄 Étendre | AJOUTER events, actions |
| Monaco Editor | 🔄 Intégrer | NOUVEAU composant |
| Terminal | 🔄 Intégrer | UTILISER xterm existant |
| Git SCM | 🔄 Créer | NOUVEAU composant |
| Problems | 🔄 Créer | NOUVEAU composant |
| Status Bar | 🔄 Créer | NOUVEAU composant |
| Layout | 🔄 Refactor | NOUVELLE architecture |
