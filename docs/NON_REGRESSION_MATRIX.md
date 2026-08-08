# OPTIMUS Non-Regression Matrix

## Overview

Ce document inventorie TOUTES les fonctionnalités existantes d'OpenHands/Agent Canvas qui doivent être conservées et ne jamais disparaître.

## Matrice de Non-Régression

### 1. CHAT & CONVERSATION

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Chat Interface | `chat-interface.tsx` | stores, API | `/conversations/:id` | ✅ | Req |
| Message Input | `custom-chat-input.tsx` | stores | Chat | ✅ | Req |
| Message Display | `chat-message.tsx` | event-store | Chat | ✅ | Req |
| Message Streaming | `model-messages.tsx` | SSE, WebSocket | Chat | ✅ | Req |
| Typing Indicator | `typing-indicator.tsx` | agent-store | Chat | ✅ | Req |
| File Attachments | `chat-add-file-button.tsx` | upload API | Chat | ✅ | Req |
| Image Attachments | `uploaded-image.tsx` | upload API | Chat | ✅ | Req |
| Conversation List | `conversation-panel.tsx` | API | `/conversations` | ✅ | Req |
| Conversation History | `use-event-store.ts` | REST API | Toutes | ✅ | Req |
| Conversation State | `conversation-store.ts` | localStorage | Toutes | ✅ | Req |
| Conversation Tabs | `conversation-tabs/*` | router | Chat | ✅ | Req |

### 2. AGENT & AI

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Agent State | `agent-store.ts` | WebSocket | Toutes | ✅ | Req |
| Agent Settings | `agent-settings.tsx` | API | `/settings/agent` | ✅ | Req |
| Agent Profiles | `agent-profiles-settings.tsx` | API | `/settings/profiles` | ✅ | Req |
| LLM Settings | `llm-settings.tsx` | API | `/settings/llm` | ✅ | Req |
| Model Selection | `model-store.ts` | API | Settings | ✅ | Req |
| Change Agent | `change-agent-button.tsx` | API | Chat | ✅ | Req |
| Goal Status | `goal-status-banner.tsx` | event-store | Chat | ✅ | Req |
| Agent Context | `agent-context-settings.tsx` | API | Settings | ✅ | Req |
| Condenser | `condenser-settings.tsx` | API | Settings | ✅ | Req |

### 3. TOOL CALLS & VISUALIZERS

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Tool Visualizer Dispatcher | `tool-visualizers/dispatcher.tsx` | event-store | Chat | ✅ | Req |
| Bash Tool Visualizer | `tool-visualizers/bash/*` | terminal API | Chat | ✅ | Req |
| File Tool Visualizer | `tool-visualizers/file-editor/*` | file API | Chat | ✅ | Req |
| Search Tool Visualizer | `tool-visualizers/search/*` | search API | Chat | ✅ | Req |
| Task Tool Visualizer | `tool-visualizers/task/*` | task API | Chat | ✅ | Req |
| Generic Event | `generic-event-message.tsx` | event-store | Chat | ✅ | Req |
| Interactive Chat | `interactive-chat-box.tsx` | API | Chat | ✅ | Req |
| Pending Messages | `pending-user-messages.tsx` | optimistic store | Chat | ✅ | Req |
| Stop Agent | `chat-stop-button.tsx` | WebSocket | Chat | ✅ | Req |

### 4. EVENT SYSTEM

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Event Store | `use-event-store.ts` | REST, WebSocket | Toutes | ✅ | Req |
| Event Handler | `wrapper/event-handler.tsx` | event-store | Conversation | ✅ | Req |
| Event Messages | `conversation-events/*` | event-store | Chat | ✅ | Req |
| Filtered Events | `hooks/use-filtered-events.ts` | event-store | Chat | ✅ | Req |
| Load Events | `hooks/use-load-events.ts` | API | Chat | ✅ | Req |
| WebSocket Provider | `websocket-provider.tsx` | event-store | Conversation | ✅ | Req |
| Event Types | `types/agent-server/*` | - | Toutes | ✅ | Req |

### 5. FILES & EXPLORER

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Files Tab | `files-tab.tsx` | runtime-service | Conversation | ✅ | Req |
| File List | `components/files/*` | runtime-service | Files Tab | ✅ | Req |
| File Actions | `files-tab-store.ts` | runtime-service | Files Tab | ✅ | Req |
| File Upload | `chat-add-file-button.tsx` | upload API | Chat | ✅ | Req |
| File Download | `uploaded-file.tsx` | API | Chat | ✅ | Req |
| Open Repository | `open-repository-modal.tsx` | git API | Chat | ✅ | Req |
| Browser Preview | `browser-tab.tsx` | browser API | Conversation | ✅ | Req |

### 6. TERMINAL

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Terminal Component | `components/terminal/*` | bash-service | Conversation | ✅ | Req |
| Command Store | `command-store.ts` | bash-service | Terminal | ✅ | Req |
| Terminal Features | `features/terminal/*` | xterm | Terminal | ✅ | Req |
| XTerm Integration | @xterm/xterm | - | Terminal | ✅ | Req |

### 7. RUNTIME & SANDBOX

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Runtime Service | `api/runtime-service/*` | backend | Toutes | ✅ | Req |
| Sandbox Management | `runtime-service/*` | container API | Conversation | ✅ | Req |
| Environment Vars | `secrets-settings.tsx` | API | Settings | ✅ | Req |
| Runtime State | `conversation-state-store.ts` | runtime API | Conversation | ✅ | Req |

### 8. SKILLS & EXTENSIONS

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Skills Page | `skills-plugins.tsx` | skills-service | `/skills` | ✅ | Req |
| Skills Settings | `skills-settings.tsx` | API | `/settings/skills` | ✅ | Req |
| Skill Install | skill install banner | API | Chat | ✅ | Req |
| Extensions Hub | `extensions-hub.tsx` | extensions API | `/extensions` | ✅ | Req |
| MCP Settings | `mcp-settings.tsx` | API | Settings | ✅ | Req |
| MCP Page | `mcp.tsx` | MCP service | `/mcp` | ✅ | Req |

### 9. SOURCE CONTROL (GIT)

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Git Control Bar | `git-control-bar.tsx` | git API | Chat | ✅ | Req |
| Git Status | git status events | event-store | Chat | ✅ | Req |
| Changes Tab | `changes-tab.tsx` | git API | Conversation | ✅ | Req |
| Commits Tab | `commits-tab.tsx` | git API | Conversation | ✅ | Req |
| Open Repository | `open-repository-modal.tsx` | git API | Chat | ✅ | Req |

### 10. AUTOMATIONS

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Automations List | `automations-list.tsx` | API | `/automations` | ✅ | Req |
| Automation Detail | `automation-detail.tsx` | API | `/automations/:id` | ✅ | Req |
| Automation Setup | `automation-setup-route.tsx` | API | Setup | ✅ | Req |
| Automation Templates | `automation-templates.tsx` | API | Setup | ✅ | Req |
| Automation Schedule | cron/schedule | API | Automations | ✅ | Req |

### 11. SETTINGS

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Settings Index | `settings-index.tsx` | router | `/settings` | ✅ | Req |
| App Settings | `app-settings.tsx` | API | Settings | ✅ | Req |
| Secrets Settings | `secrets-settings.tsx` | API | Settings | ✅ | Req |
| Verification Settings | `verification-settings.tsx` | API | Settings | ✅ | Req |
| Backend Selection | `backends/*` | API | Settings | ✅ | Req |

### 12. HOME & NAVIGATION

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Home Page | `home.tsx` | API | `/` | ✅ | Req |
| Index Redirect | `index-redirect.tsx` | router | `/` | ✅ | Req |
| Launch Page | `launch.tsx` | API | `/launch` | ✅ | Req |
| Planner Tab | `planner-tab.tsx` | API | Conversation | ✅ | Req |
| Task List Tab | `task-list-tab.tsx` | API | Conversation | ✅ | Req |

### 13. AUTHENTIFICATION

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Device Verify | `device-verify.tsx` | API | `/verify` | ✅ | Req |
| Shared Conversation | `shared-conversation.tsx` | API | `/shared/:id` | ✅ | Req |
| Auth Guard | `use-is-authed.ts` | API | Routes | ✅ | Req |
| Backend Auth | `backends/*` | API | Settings | ✅ | Req |

### 14. ANALYTICS & METRICS

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Metrics Modal | `metrics-modal/*` | API | Conversation | ✅ | Req |
| Metrics Store | `metrics-store.ts` | API | Metrics | ✅ | Req |
| Analytics Components | `features/analytics/*` | API | Various | ✅ | Req |
| Tracking | `hooks/use-tracking.ts` | Analytics | Various | ✅ | Req |

### 15. UI COMPONENTS (HEROUI)

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Buttons | `shared/buttons/*` | HeroUI | Global | ✅ | Req |
| Modals | `shared/modals/*` | HeroUI | Global | ✅ | Req |
| Loading | `shared/loading-spinner.tsx` | HeroUI | Global | ✅ | Req |
| Filters | `shared/filters/*` | HeroUI | Lists | ✅ | Req |
| Toast Handlers | `utils/custom-toast-handlers.ts` | HeroUI | Global | ✅ | Req |

### 16. ROUTING

| Fonctionnalité | Fichier | Dépendances | Route | Status | Test |
|---------------|---------|-------------|-------|--------|------|
| Router Config | `react-router.config.ts` | react-router | App | ✅ | Req |
| Navigation Provider | `react-router-navigation-provider.tsx` | router | App | ✅ | Req |
| Route Guards | auth checks | Auth | Routes | ✅ | Req |
| Sidebar Store | `sidebar-store.ts` | router | Layout | ✅ | Req |

---

## API Services à Conserver

| Service | Fichier | Endpoints | Status |
|---------|---------|-----------|--------|
| Conversation | `api/conversation-service/*` | GET/POST/PUT conversations | ✅ |
| Event | `api/event-service/*` | GET/POST events | ✅ |
| Runtime | `api/runtime-service/*` | Filesystem, bash | ✅ |
| ACP | `api/acp-service/*` | Agent Cloud Platform | ✅ |
| Settings | `api/settings-service/*` | User settings | ✅ |
| Profiles | `api/profiles-service/*` | Agent profiles | ✅ |
| MCP | `api/mcp-service/*` | MCP servers | ✅ |
| Bash | `api/bash-service/*` | Terminal commands | ✅ |
| Cloud | `api/cloud/*` | Cloud sandbox | ✅ |
| Suggestions | `api/suggestions-service/*` | AI suggestions | ✅ |

---

## WebSocket Events à Conserver

| Event | Description | Status |
|-------|-------------|--------|
| AgentThinking | Agent en train de penser | ✅ |
| AgentOutput | Sortie de l'agent | ✅ |
| ToolCall | Appel d'outil | ✅ |
| ToolReturn | Retour d'outil | ✅ |
| FileChange | Modification fichier | ✅ |
| BashOutput | Sortie terminal | ✅ |
| TaskUpdate | Mise à jour tâche | ✅ |
| Error | Erreur | ✅ |

---

## Tests de Non-Régression

### Tests Unitaires Existants
```bash
npm run test:unit
```

### Tests d'Intégration Existants
```bash
npm run test:integration
```

### Tests E2E Existants
```bash
npm run test:e2e
```

### Tests Playwright
```bash
npm run test:e2e:headed
```

---

## Checklist Avant Modification

- [ ] Tests existants passent
- [ ] Fonctionnalité documentée ici
- [ ] Dépendances identifiées
- [ ] Route vérifiée
- [ ] API vérifiée
- [ ] Store vérifié
- [ ] Event system vérifié
- [ ] Routing vérifié
- [ ] Auth vérifiée

---

## Stratégie de Migration

### 1. Never Delete, Only Extend
Ne jamais supprimer de fichiers existants. Les renommer en `.backup.ts` si nécessaire.

### 2. Feature Flags
Utiliser des flags pour activer/désactiver les nouvelles fonctionnalités OPTIMUS.

### 3. Route Preservation
Toujours garder les routes existantes accessibles.

### 4. Store Extension
Étendre les stores existants plutôt que de les remplacer.

### 5. Component Wrapping
Wrapper les composants existants plutôt que de les réécrire.

### 6. API Backward Compatibility
Garder les API endpoints existants.

---

## Critical Paths

### Chat Path
```
Routes → Conversation → ChatInterface → EventStore → WebSocket → Agent
```

### File Path
```
FilesTab → RuntimeService → Filesystem → Agent
```

### Terminal Path
```
TerminalComponent → BashService → Sandbox → Agent
```

### Settings Path
```
SettingsRoute → SettingsService → API → Backend
```

Ces chemins critiques NE DOIVENT JAMAIS être cassés.
