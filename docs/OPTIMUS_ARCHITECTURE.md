# OPTIMUS Architecture

## Overview

OPTIMUS est une plateforme de développement AI-native de nouvelle génération, transformant l'expérience OpenHands en un environnement de développement piloté par l'IA complet.

## Principe Fondamental

```
CHAT IA → AGENT → OUTILS → WORKSPACE → APPLICATION
```

Le Chat IA devient le **centre de contrôle** de toute la plateforme.

## Architecture Cible

```
OPTIMUS
│
├── AI EXPERIENCE
│   ├── Chat (Streaming, Tool Calls, Artifacts)
│   ├── Agent (Orchestration, Tasks, Planning)
│   ├── Conversation History
│   └── Agent Skills
│
├── WORKBENCH
│   ├── Explorer (File Tree, Git Status)
│   ├── Editor (Monaco, Tabs, Diff)
│   ├── Search (Global, Symbol, Replace)
│   ├── Source Control (Git UI)
│   ├── Terminal
│   ├── Debug (Breakpoints, Variables, Stack)
│   ├── Testing (Explorer, Results)
│   ├── Problems (Diagnostics)
│   ├── Output (Logs)
│   ├── Preview (Live)
│   ├── Extensions
│   ├── Settings
│   ├── Command Palette
│   └── Workspace Management
│
├── AGENT TOOL LAYER
│   ├── File Tools (create, read, update, delete)
│   ├── Terminal Tools (execute, stream output)
│   ├── Search Tools (code search, replace)
│   ├── Git Tools (status, diff, commit, branch)
│   ├── Preview Tools (start, stop, inspect)
│   ├── Testing Tools (discover, run, results)
│   ├── Debugging Tools (breakpoints, inspect)
│   ├── Database Tools
│   └── Deployment Tools
│
├── RUNTIME
│   ├── Sandbox (Isolated execution)
│   ├── Processes (Manage, kill, restart)
│   ├── Filesystem (Virtual, synchronized)
│   ├── Ports (Allocation, forwarding)
│   ├── Environment Variables
│   └── Package Management
│
├── CLOUD SERVICES
│   ├── Database (Managed DB)
│   ├── Storage (Assets, files)
│   ├── Authentication
│   ├── Domains
│   ├── Deployment
│   └── Monitoring
│
└── PLATFORM
    ├── Users
    ├── Projects
    ├── Workspaces
    ├── Permissions
    ├── Billing
    └── Administration
```

## Phase 1: SLICE Minimal (Foundation)

### Objectif
Démontrer le principe central : Agent contrôle le Workbench via le Chat.

### Composants à Implémenter

```
┌─────────────────────────────────────────────────────────────┐
│                         CHAT                                 │
│  [User Input] → [Streaming AI] → [Tool Calls] → [Events]   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATOR                         │
│  [Understand] → [Plan] → [Select Tools] → [Execute]        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    TOOL LAYER                                │
│  • open_file    • create_file    • edit_file                │
│  • delete_file  • rename_file    • search_code               │
│  • open_diff    • focus_editor  • git_status                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    WORKBENCH UI                              │
│  [Explorer] ← → [Editor (Monaco)] ← → [File Events]       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FILESYSTEM                                │
│  [Real filesystem with sandbox]                              │
└─────────────────────────────────────────────────────────────┘
```

### Contrats de Base

#### 1. Agent → Explorer
```typescript
interface FileCreatedEvent {
  type: "file_created";
  path: string;
  content?: string;
}

interface FileModifiedEvent {
  type: "file_modified";
  path: string;
  changes: DiffChange[];
}

interface FileDeletedEvent {
  type: "file_deleted";
  path: string;
}
```

#### 2. Agent → Editor
```typescript
interface OpenFileEvent {
  type: "open_file";
  path: string;
  line?: number;
  selection?: { start: Position; end: Position };
}

interface DiffEvent {
  type: "show_diff";
  original: { path: string; content: string };
  modified: { path: string; content: string };
}
```

#### 3. Agent → Terminal
```typescript
interface CommandEvent {
  type: "execute_command";
  command: string;
  cwd?: string;
  env?: Record<string, string>;
}
```

### Sécurité & Permissions

```typescript
interface ToolPermission {
  tool: string;
  scope: "user" | "workspace" | "sandbox";
  requiresApproval: boolean;
  dangerous: boolean;
}

// Configuration
const TOOL_PERMISSIONS: Record<string, ToolPermission> = {
  create_file: { scope: "sandbox", requiresApproval: false, dangerous: false },
  delete_file: { scope: "sandbox", requiresApproval: true, dangerous: true },
  run_command: { scope: "sandbox", requiresApproval: true, dangerous: true },
  git_push: { scope: "workspace", requiresApproval: true, dangerous: true },
};
```

## Intégration OpenHands Existante

### Composants à Conserver

| Composant | Fichier | Raison |
|-----------|---------|--------|
| Chat streaming | `chat-interface.tsx` | UX moderne |
| Event store | `use-event-store.ts` | Gestion des événements |
| Conversation store | `conversation-store.ts` | État conversationnel |
| Tool visualizers | `tool-visualizers/` | Affichage tools |
| Zustand stores | `stores/` | State management |
| React Router | `routes/` | Routing existant |

### Architecture OpenHands Actuelle

```
src/
├── routes/                 # Pages React Router
│   ├── conversation.tsx    # Vue conversation principale
│   ├── home.tsx           # Page d'accueil
│   └── settings/          # Paramètres
├── components/
│   ├── features/
│   │   ├── chat/          # Composants Chat
│   │   │   ├── chat-interface.tsx
│   │   │   ├── chat-message.tsx
│   │   │   └── tool-visualizers/
│   │   ├── conversation/   # Conversation panels
│   │   └── files-tab/     # Explorateur (existant)
│   └── shared/            # Composants réutilisables
├── stores/                # Zustand stores
│   ├── conversation-store.ts
│   ├── agent-store.ts
│   └── use-event-store.ts
├── api/                   # Services API
│   ├── conversation-service/
│   └── event-service/
└── contexts/             # React contexts
```

## Prochaines Phases

### Phase 2: Terminal Intégré
- Intégrer XTerm.js plus profondément
- Commandes en streaming
- Multi-sessions
- Process management

### Phase 3: Source Control
- Git status
- Diff viewer
- Staging/Commit UI
- Branch management

### Phase 4: Testing
- Test explorer
- Run tests
- Results display
- Diagnostics integration

### Phase 5: Debugging
- Breakpoints
- Variables panel
- Call stack
- Debug console

### Phase 6: Preview
- Live reload
- Port detection
- Responsive preview
- Error overlay

### Phase 7: Extensions & Settings
- Extension marketplace
- Settings UI
- Keybindings
- Profiles

## Licences & Compliance

VS Code/Code-OSS est sous licence MIT. Les composants réutilisables doivent:
1. Identifier la licence d'origine
2. Respecter les obligations de copyright
3. Ne pas utiliser les marques Microsoft
4. Conserver les notices nécessaires

## Métriques de Succès

1. **SLICE Minimal**
   - [ ] Agent peut créer un fichier via Chat
   - [ ] Explorer se met à jour en temps réel
   - [ ] Monaco affiche le fichier
   - [ ] Streaming visible dans Chat
   - [ ] Permissions respectées

2. **Expérience Utilisateur**
   - [ ] Chat = centre de contrôle
   - [ ] Workbench apparaît dynamiquement
   - [ ] Toutes actions via Chat possibles
   - [ ] Sécurité intégrée
