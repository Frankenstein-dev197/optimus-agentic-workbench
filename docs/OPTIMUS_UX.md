# OPTIMUS UX Design

## Design Principles

1. **AI-First**: Le Chat est toujours visible et prioritaire
2. **Progressive Disclosure**: Les outils apparaissent selon le contexte
3. **Live Experience**: L'utilisateur voit le travail de l'Agent en temps réel
4. **Modern & Premium**: Design cohérent avec l'identité OPTIMUS

## Layout System

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPTIMUS                              [User] [Settings] [Help]             │
├────────┬────────────────────────────────────────────────────────────────────┤
│        │                                                                     │
│  🔍    │  ┌─────────────────────────────────────────────────────────────┐    │
│  📁    │  │                                                             │    │
│  📂    │  │                      EDITOR AREA                           │    │
│  🔧    │  │                                                             │    │
│  ⌨️    │  │   [Tab1] [Tab2] [Tab3]                                      │    │
│  🐛    │  │   ┌─────────────────────────────────────────────────────┐   │    │
│  🧪    │  │   │                                                     │   │    │
│  📤    │  │   │              MONACO EDITOR                          │   │    │
│  ⚙️    │  │   │                                                     │   │    │
│        │  │   │                                                     │   │    │
│        │  │   └─────────────────────────────────────────────────────┘   │    │
│        │  │                                                             │    │
│        │  └─────────────────────────────────────────────────────────────┘    │
│        │                                                                     │
├────────┴────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     CHAT AREA (AI Control Center)                      │ │
│  │                                                                        │ │
│  │  [User] Crée une application React                                     │ │
│  │                                                                        │ │
│  │  [Assistant] Je vais créer votre application...                        │ │
│  │  [Progress] ✓ Création fichiers  ● Installation  ○ Tests                │ │
│  │                                                                        │ │
│  │  [User Input] ________________________________ [Send]                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  main  ✓  │  problems:0  │  src/App.tsx  │  UTF-8  │  Ln 15, Col 8         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────────────────────────────┐
│  OPTIMUS                   [☰]              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │         CHAT (Full Screen)             │  │
│  │                                        │  │
│  │  [User] Crée une app React             │  │
│  │                                        │  │
│  │  [Assistant] Je crée...                │  │
│  │  [file] src/App.tsx créé               │  │
│  │                                        │  │
│  │  ┌───────────────────────────────────┐ │  │
│  │  │ Type your message...              │ │  │
│  │  └───────────────────────────────────┘ │  │
│  │                              [Send]    │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  [Chat]  [Files]  [Terminal]  [Preview]     │
└─────────────────────────────────────────────┘
```

## Color Palette

```css
/* OPTIMUS Dark Theme */
:root {
  /* Backgrounds */
  --bg-primary: #0d1117;      /* Main background */
  --bg-secondary: #161b22;   /* Panels */
  --bg-tertiary: #21262d;     /* Headers, active items */
  --bg-elevated: #2d333b;     /* Hover, dropdowns */
  
  /* Borders */
  --border-default: #30363d;
  --border-muted: #21262d;
  --border-accent: #58a6ff;
  
  /* Text */
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  --text-link: #58a6ff;
  
  /* Accents */
  --accent-primary: #58a6ff;   /* Primary actions */
  --accent-success: #3fb950;  /* Success, git added */
  --accent-warning: #d29922;   /* Warnings, git modified */
  --accent-error: #f85149;     /* Errors, git deleted */
  --accent-purple: #a371f7;    /* AI/Agent accent */
  --accent-cyan: #39c5cf;      /* Terminal accent */
  
  /* Gradients */
  --gradient-ai: linear-gradient(135deg, #a371f7 0%, #58a6ff 100%);
  --gradient-surface: linear-gradient(180deg, #161b22 0%, #0d1117 100%);
}
```

## Typography

```css
/* OPTIMUS Typography */
:root {
  /* Font Families */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  --font-ai: "Inter", var(--font-sans); /* For AI responses */
  
  /* Font Sizes */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-md: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## Component Specifications

### 1. Chat Input

```tsx
// Chat Input Component
interface ChatInputProps {
  placeholder?: string;
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ placeholder, onSend }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>();
  
  const handleSend = () => {
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };
  
  return (
    <div className="chat-input-container">
      <textarea
        ref={inputRef}
        className="chat-input"
        placeholder={placeholder || "Ask OPTIMUS to build something..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
      />
      <div className="chat-input-actions">
        <AttachButton />
        <SendButton onClick={handleSend} disabled={!value.trim()} />
      </div>
    </div>
  );
};
```

### 2. Message Bubble

```tsx
// Message Bubble Styles
.message {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  animation: messageSlideIn 0.2s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .bubble {
  background: var(--accent-primary);
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message.assistant .bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 16px 16px 16px 4px;
}

.message .bubble {
  max-width: 70%;
  padding: 10px 14px;
}
```

### 3. Progress Indicator

```tsx
// Agent Progress Display
interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
}

const AgentProgress: React.FC<{ steps: ProgressStep[] }> = ({ steps }) => {
  return (
    <div className="agent-progress">
      {steps.map((step, index) => (
        <div key={step.id} className={`progress-step ${step.status}`}>
          <div className="progress-icon">
            {step.status === "complete" && <CheckIcon />}
            {step.status === "active" && <Spinner />}
            {step.status === "error" && <XIcon />}
            {step.status === "pending" && <CircleIcon />}
          </div>
          <span className="progress-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
};
```

### 4. Tool Call Display

```tsx
// Tool Call in Chat
interface ToolCallMessageProps {
  tool: string;
  status: "running" | "success" | "error";
  params: Record<string, unknown>;
  result?: string;
}

const ToolCallMessage: React.FC<ToolCallMessageProps> = ({ tool, status, params, result }) => {
  return (
    <div className={`tool-call tool-call-${status}`}>
      <div className="tool-header">
        <ToolIcon name={tool} />
        <span className="tool-name">{tool}</span>
        <StatusBadge status={status} />
      </div>
      <div className="tool-params">
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </div>
      {result && (
        <div className="tool-result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};
```

### 5. Panel Component

```tsx
// Collapsible Panel
interface PanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Panel: React.FC<PanelProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`panel ${isOpen ? "open" : "closed"}`}>
      <button className="panel-header" onClick={() => setIsOpen(!isOpen)}>
        {icon}
        <span className="panel-title">{title}</span>
        <ChevronIcon direction={isOpen ? "up" : "down"} />
      </button>
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
};
```

## Animations

```css
/* Animations */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Streaming cursor */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.typing-cursor::after {
  content: "▋";
  animation: blink 1s infinite;
}
```

## Responsive Breakpoints

```css
/* Responsive */
@media (max-width: 768px) {
  /* Mobile */
  :root {
    --sidebar-width: 0px;
    --chat-height: 100vh;
  }
  
  .editor-area {
    display: none;
  }
  
  .chat-area {
    height: var(--chat-height);
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  /* Tablet */
  :root {
    --sidebar-width: 48px;
  }
}

@media (min-width: 1201px) {
  /* Desktop */
  :root {
    --sidebar-width: 64px;
  }
}
```

## Iconography

```tsx
// OPTIMUS Icons (Lucide-based)
const Icons = {
  // Navigation
  chat: MessageCircleIcon,
  files: FolderIcon,
  search: SearchIcon,
  
  // Actions
  send: SendIcon,
  attach: PaperclipIcon,
  settings: SettingsIcon,
  help: HelpCircleIcon,
  
  // Status
  check: CheckIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
  
  // Git
  git: GitBranchIcon,
  commit: GitCommitIcon,
  push: UploadIcon,
  pull: DownloadIcon,
  
  // Terminal
  terminal: TerminalIcon,
  command: CommandIcon,
  
  // AI/Agent
  sparkles: SparklesIcon,  // For AI actions
  bot: BotIcon,
  
  // Editor
  file: FileIcon,
  save: SaveIcon,
  close: XIcon,
};
```

## Accessibility

```tsx
// Accessibility Requirements
const AccessibilityGuidelines = {
  colorContrast: "WCAG AA compliant (4.5:1 for text)",
  keyboardNav: "Full keyboard navigation support",
  focusIndicators: "Visible focus rings on all interactive elements",
  screenReader: "ARIA labels and live regions for dynamic content",
  reducedMotion: "Respect prefers-reduced-motion",
};
```

## Summary

| Element | Specification |
|---------|---------------|
| Primary Color | #58a6ff |
| AI Accent | #a371f7 |
| Font | Inter (sans), JetBrains Mono (code) |
| Chat Height | 40% desktop, 100% mobile |
| Animations | 200ms ease-out |
| Breakpoints | 768px, 1200px |
