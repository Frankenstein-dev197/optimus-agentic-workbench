/**
 * OPTIMUS Editor Area
 * 
 * Monaco editor with tabs, diff view, and multi-editor support.
 */

import { useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { cn } from "../../../../utils/utils";

export function OptimusEditor() {
  const { openTabs, activeTabId, setActiveTab, closeTab, openDiffs, activeDiffId, splitEditor } = useOptimusLayoutStore();
  
  // If no tabs are open, show empty state
  if (openTabs.length === 0 && openDiffs.length === 0) {
    return (
      <div className="optimus-editor-empty">
        <div className="optimus-editor-empty-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <h3>No file open</h3>
          <p>Open a file from the Explorer or create a new one</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("optimus-editor-area", splitEditor && "split")}>
      {/* Editor Tabs */}
      {openTabs.length > 0 && (
        <div className="optimus-editor-tabs">
          {openTabs.map((tab) => (
            <div
              key={tab.id}
              className={cn("optimus-editor-tab", tab.isActive && "active", tab.isDirty && "dirty")}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="optimus-editor-tab-name">{tab.name}</span>
              {tab.isDirty && <span className="optimus-editor-tab-dirty">●</span>}
              <button
                className="optimus-editor-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Editor Content */}
      <div className="optimus-editor-content">
        {/* Active Tab Editor */}
        {openTabs.length > 0 && (
          <div className="optimus-editor-instance">
            <EditorTabContent tabId={activeTabId} />
          </div>
        )}
        
        {/* Split Editor */}
        {splitEditor && openTabs.length > 1 && (
          <div className="optimus-editor-instance optimus-editor-split">
            <EditorTabContent tabId={openTabs.find((t) => !t.isActive)?.id} />
          </div>
        )}
        
        {/* Diff Views */}
        {openDiffs.map((diff) => (
          <DiffViewContent key={diff.id} diff={diff} isActive={diff.id === activeDiffId} />
        ))}
      </div>
    </div>
  );
}

// Editor tab content component
interface EditorTabContentProps {
  tabId: string | null | undefined;
}

function EditorTabContent({ tabId }: EditorTabContentProps) {
  const tab = useOptimusLayoutStore((state) =>
    state.openTabs.find((t) => t.id === tabId)
  );
  
  const { updateTab } = useOptimusLayoutStore();
  
  if (!tab) return null;
  
  // Placeholder content - will be connected to actual file service
  const placeholderContent = `// ${tab.path}\n// File content will be loaded from the sandbox\n\nfunction example() {\n  console.log("Hello OPTIMUS!");\n}`;
  
  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      updateTab(tab.id, { isDirty: true });
    }
  }, [tab.id, updateTab]);
  
  return (
    <Editor
      height="100%"
      language={tab.language}
      value={placeholderContent}
      theme="vs-dark"
      onChange={handleChange}
      options={{
        minimap: { enabled: true },
        lineNumbers: "on",
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        scrollBeyondLastLine: false,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        cursorBlinking: "smooth",
        smoothScrolling: true,
        padding: { top: 10 },
      }}
    />
  );
}

// Diff view content component
interface DiffViewContentProps {
  diff: {
    id: string;
    originalPath: string;
    originalContent?: string;
    modifiedPath: string;
    modifiedContent?: string;
    title?: string;
  };
  isActive: boolean;
}

function DiffViewContent({ diff, isActive }: DiffViewContentProps) {
  if (!isActive) return null;
  
  return (
    <div className="optimus-diff-view">
      <div className="optimus-diff-header">
        <span>{diff.title || `Diff: ${diff.originalPath} → ${diff.modifiedPath}`}</span>
        <button
          className="optimus-diff-close"
          onClick={() => useOptimusLayoutStore.getState().closeDiff(diff.id)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="optimus-diff-content">
        <Editor
          height="100%"
          language="diff"
          value={generateDiffContent(diff)}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: "on",
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        />
      </div>
    </div>
  );
}

// Helper to generate diff content
function generateDiffContent(diff: DiffViewContentProps["diff"]): string {
  const original = diff.originalContent || `// Original: ${diff.originalPath}\n// No changes`;
  const modified = diff.modifiedContent || `// Modified: ${diff.modifiedPath}\n// No changes`;
  return `--- ${diff.originalPath}\n+++ ${diff.modifiedPath}\n${original}\n\n${modified}`;
}

