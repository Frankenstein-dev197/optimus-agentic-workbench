# OPTIMUS Migration Plan

## Overview

Plan de migration d'OpenHands vers OPTIMUS, en préservant les fonctionnalités existantes tout en ajoutant les capacités du Workbench.

## Phase 0: Analyse Complète (Completed ✅)

### 0.1 Architecture OpenHands Identifiée

```
OpenHands Architecture Summary:
├── Frontend: React + Vite + React Router
├── State: Zustand stores
├── Components: HeroUI + TailwindCSS
├── Editor: Monaco Editor (@monaco-editor/react)
├── Terminal: XTerm.js (@xterm/xterm)
├── API: REST + WebSocket
├── Backend: Python agent-server
└── Streaming: Server-Sent Events
```

### 0.2 Composants à Conserver

| Composant | Fichier | Raison | Status |
|-----------|---------|--------|--------|
| Chat Interface | `chat-interface.tsx` | UX moderne, streaming | KEEP |
| Event Store | `use-event-store.ts` | Gestion événements | KEEP |
| Conversation Store | `conversation-store.ts` | État conversationnel | KEEP |
| Tool Visualizers | `tool-visualizers/*` | Affichage tools | EXTEND |
| WebSocket Provider | `websocket-provider.tsx` | Communication temps réel | KEEP |
| Agent Store | `agent-store.ts` | État agent | KEEP |
| Routes | `routes/*` | Routing existant | ADAPT |

### 0.3 Fichiers à Modifier

| Fichier | Modification |
|---------|-------------|
| `routes/conversation.tsx` | Intégrer layout OPTIMUS |
| `stores/conversation-store.ts` | Ajouter panel state |
| `components/features/chat/*` | Améliorer streaming |
| `components/features/files-tab/*` | Devient Explorer |

### 0.4 Nouveaux Fichiers

```
src/
├── components/
│   ├── optimus/                    # NOUVEAU
│   │   ├── layout/
│   │   │   ├── optimus-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── status-bar.tsx
│   │   │   └── panel-manager.tsx
│   │   ├── workbench/
│   │   │   ├── explorer/
│   │   │   ├── editor/
│   │   │   ├── terminal/
│   │   │   ├── scm/
│   │   │   └── problems/
│   │   └── chat/
│   │       ├── streaming-display.tsx
│   │       └── progress-indicator.tsx
├── stores/
│   ├── layout-store.ts             # NOUVEAU
│   ├── workbench-store.ts          # NOUVEAU
│   └── sandbox-store.ts            # NOUVEAU
├── hooks/
│   ├── use-workbench-events.ts     # NOUVEAU
│   ├── use-tool-orchestration.ts    # NOUVEAU
│   └── use-panel-context.ts        # NOUVEAU
└── services/
    ├── tool-registry.ts            # NOUVEAU
    ├── approval-service.ts         # NOUVEAU
    └── sandbox-service.ts          # NOUVEAU
```

---

## Phase 1: Foundation (Slice Minimal)

### Objectif
Démontrer le principe central : Agent → Tools → Filesystem → Explorer → Editor

### 1.1 Sprint 1: Agent Tool Layer

**Durée**: 1-2 semaines

**Tâches**:
- [ ] Créer `tool-registry.ts`
- [ ] Définir interfaces Tool de base
- [ ] Implémenter File Tools (create, read, edit, delete)
- [ ] Implémenter Editor Tools (open, focus, show diff)
- [ ] Brancher sur système d'événements existant

**Livrables**:
```
src/services/tool-registry.ts     # Registre des outils
src/types/tool.ts                 # Types Tool
src/tools/file-tools.ts           # Outils fichier
src/tools/editor-tools.ts         # Outils éditeur
```

### 1.2 Sprint 2: Explorer Enhancement

**Durée**: 1-2 semaines

**Tâches**:
- [ ] Refactor `files-tab.tsx` → `explorer-panel.tsx`
- [ ] Ajouter FileTree component
- [ ] Implémenter event listeners (file_created, etc.)
- [ ] Ajouter Git status indicators
- [ ] Ajouter context menu

**Livrables**:
```
src/components/workbench/explorer/
├── explorer-panel.tsx
├── file-tree.tsx
├── file-item.tsx
├── open-editors.tsx
└── git-indicators.tsx
```

### 1.3 Sprint 3: Editor Integration

**Durée**: 1-2 semaines

**Tâches**:
- [ ] Créer EditorArea component
- [ ] Implémenter Tabs system
- [ ] Connecter à Monaco Editor existant
- [ ] Ajouter event handlers
- [ ] Implémenter Diff viewer

**Livrables**:
```
src/components/workbench/editor/
├── editor-area.tsx
├── editor-tabs.tsx
├── monaco-instance.tsx
├── diff-viewer.tsx
└── editor-group.tsx
```

### 1.4 Sprint 4: Streaming & Events

**Durée**: 1-2 semaines

**Tâches**:
- [ ] Améliorer streaming display dans Chat
- [ ] Créer ProgressIndicator component
- [ ] Implémenter tool call visualizers
- [ ] Connecter events → UI updates
- [ ] Ajouter real-time sync

**Livrables**:
```
src/components/optimus/chat/
├── streaming-display.tsx
├── progress-indicator.tsx
├── tool-call-bubble.tsx
└── agent-status.tsx
```

### Phase 1 Criteria

- [ ] Agent peut créer un fichier via Chat
- [ ] Explorer se met à jour en temps réel
- [ ] Monaco affiche le fichier
- [ ] Streaming visible dans Chat
- [ ] Permissions respectées

---

## Phase 2: Terminal Integration

### Sprint 5: Terminal Core

**Tâches**:
- [ ] Intégrer XTerm.js plus profondément
- [ ] Multi-sessions support
- [ ] Command streaming
- [ ] Process management

**Livrables**:
```
src/components/workbench/terminal/
├── terminal-panel.tsx
├── terminal-tabs.tsx
├── terminal-instance.tsx
└── process-manager.tsx
```

---

## Phase 3: Git Integration

### Sprint 6: Source Control

**Tâches**:
- [ ] Git status integration
- [ ] Diff view pour changes
- [ ] Staging/unstaging UI
- [ ] Commit interface
- [ ] Branch management

**Livrables**:
```
src/components/workbench/scm/
├── scm-panel.tsx
├── scm-header.tsx
├── changes-list.tsx
├── commit-box.tsx
└── branch-selector.tsx
```

---

## Phase 4: Testing & Debug

### Sprint 7: Testing

**Tâches**:
- [ ] Test explorer
- [ ] Test discovery
- [ ] Test runner integration
- [ ] Results display

### Sprint 8: Debugging

**Tâches**:
- [ ] Breakpoints panel
- [ ] Variables view
- [ ] Call stack view
- [ ] Debug console

---

## Phase 5: Advanced Features

### Sprint 9: Preview

**Tâches**:
- [ ] Live preview panel
- [ ] Port detection
- [ ] Error overlay
- [ ] Responsive preview

### Sprint 10: Extensions & Settings

**Tâches**:
- [ ] Extension marketplace UI
- [ ] Settings panels
- [ ] Keybindings editor
- [ ] Profiles

---

## Implementation Order

```
Phase 1 (4 sprints, 4-8 semaines)
├── Sprint 1: Tool Layer (1-2 sem)
├── Sprint 2: Explorer (1-2 sem)
├── Sprint 3: Editor (1-2 sem)
└── Sprint 4: Streaming (1-2 sem)

Phase 2 (1 sprint, 2-4 semaines)
└── Sprint 5: Terminal

Phase 3 (1 sprint, 2-4 semaines)
└── Sprint 6: Git

Phase 4 (2 sprints, 4-8 semaines)
├── Sprint 7: Testing
└── Sprint 8: Debugging

Phase 5 (2 sprints, 4-8 semaines)
├── Sprint 9: Preview
└── Sprint 10: Extensions

TOTAL: ~20-32 semaines
```

---

## Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Monaco performance avec gros fichiers | HIGH | MEDIUM | Lazy loading, virtualisation |
| Real-time sync complexity | MEDIUM | HIGH | Message queue, debouncing |
| Tool permission edge cases | MEDIUM | HIGH | Extensive testing |
| VS Code component licensing | LOW | MEDIUM | MIT components only |
| Performance avec banyak tabs | MEDIUM | MEDIUM | Tab virtualization |

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @monaco-editor/react | ^4.x | Editor |
| @xterm/xterm | ^5.x | Terminal |
| @xterm/addon-fit | ^0.10.x | Terminal sizing |
| zustand | ^4.x | State management |
| react-router | ^6.x | Routing |

### Internal Dependencies

- Agent Server (Python backend)
- WebSocket connection
- File service
- Git service

---

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/tools/file-tools.test.ts
describe("FileTools", () => {
  it("should create file in sandbox");
  it("should respect permissions");
  it("should emit events on creation");
});
```

### Integration Tests
```typescript
// tests/integration/tool-workbench.test.ts
describe("Tool -> Workbench", () => {
  it("should update explorer when file created");
  it("should open editor when file opened");
});
```

### E2E Tests
```typescript
// tests/e2e/optimus-flow.test.ts
describe("OPTIMUS Flow", () => {
  it("should create app via chat and see it in explorer");
});
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first file visible | < 2s |
| Tool call response time | < 500ms |
| Explorer refresh time | < 200ms |
| Memory usage (idle) | < 200MB |
| Bundle size increase | < 500KB |

---

## Rollback Plan

Si une phase échoue:
1. Feature flag pour désactiver nouvelles fonctionnalités
2. Rollback vers routes OpenHands existantes
3. Database migrations réversibles
4. Gradual rollout (10% → 50% → 100%)
