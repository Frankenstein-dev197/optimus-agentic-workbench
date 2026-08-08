# OPTIMUS - Agentic Development Workbench

OPTIMUS is an AI-powered development environment where AI agents and developers collaborate in real-time with synchronized workbench panels.

## Architecture

```
OPTIMUS
├── Explorer      - File tree navigation
├── Editor        - Monaco-powered code editor
├── Terminal      - Integrated terminal
├── Problems      - Error/warning tracking
├── Source Control - Git integration
├── Testing       - Test runner integration
├── Preview       - Live application preview
├── Chat          - Agent interaction
├── Agent Runtime - AI agent connection
└── Event Bridge  - Real-time synchronization
```

## Features

- **Modular Architecture**: Each component is self-contained and extensible
- **Event-Driven**: Real-time synchronization between agent actions and UI
- **Tool Registry**: Centralized registry for agent tools
- **Layout System**: Flexible panel arrangement with Zustand state management
- **Monaco Integration**: Full-featured code editing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/
│   └── optimus/
│       ├── layout/           # Main layout components
│       │   ├── optimus-layout.tsx
│       │   ├── optimus-sidebar.tsx
│       │   └── optimus-status-bar.tsx
│       └── workbench/        # Workbench panels
│           ├── explorer/
│           ├── editor/
│           ├── terminal/
│           ├── problems/
│           ├── scm/
│           ├── testing/
│           └── preview/
├── hooks/optimus/            # Custom React hooks
├── services/optimus/          # Tool registry & services
├── stores/optimus/            # Zustand state management
└── types/optimus/             # TypeScript definitions
```

## Event System

The Event Bridge synchronizes agent actions with the workbench UI:

```
Agent Action → Event Bridge → Workbench Update
─────────────────────────────────────────────
File Read    → FileOpened  → Explorer highlight
File Write   → FileSaved   → Editor refresh
Command Run  → Terminal    → Output display
Code Change  → Problems    → Error markers
Git Action   → SCM Panel   → Status update
```

## Tool Registry

Agents interact with the workbench through a standardized tool interface:

```typescript
Tool {
  name: string;
  description: string;
  parameters: Schema;
  handler: (params, context) => Promise<Result>;
}
```

## Development

### Adding a New Panel

1. Create component in `src/components/optimus/workbench/<panel-name>/`
2. Add panel type to `PanelType` in `stores/optimus/layout-store.ts`
3. Register panel in `OptimusLayout` component
4. Add event handlers in `hooks/optimus/use-workbench-events.ts`

### Adding a New Tool

1. Define tool schema in `types/optimus/tool.ts`
2. Register tool in `services/optimus/tool-registry.ts`
3. Add event handlers for UI updates

## License

MIT
