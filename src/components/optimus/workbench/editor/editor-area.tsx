/**
 * OPTIMUS Editor Area
 * Monaco editor with real file loading.
 */

import { useCallback, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { filesystemService } from "../../../../services/optimus/filesystem";
import { emitFileOpened } from "../../../../services/optimus/event-bridge";
import { cn } from "../../../../utils/utils";

export function OptimusEditor() {
  const { openTabs, activeTabId, setActiveTab, closeTab, openDiffs, activeDiffId } = useOptimusLayoutStore();

  if (openTabs.length === 0 && openDiffs.length === 0) {
    return (
      <div className="optimus-editor-empty">
        <div className="optimus-editor-empty-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <h3>No file open</h3>
          <p>Open a file from the Explorer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="optimus-editor-area">
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
              <button className="optimus-editor-tab-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="optimus-editor-content">
        {openTabs.length > 0 && <EditorTabContent tabId={activeTabId} />}
        {openDiffs.map((diff) => (
          <DiffViewContent key={diff.id} diff={diff} />
        ))}
      </div>
    </div>
  );
}

function EditorTabContent({ tabId }: { tabId: string | null | undefined }) {
  const tab = useOptimusLayoutStore((state) => state.openTabs.find((t) => t.id === tabId));
  const { markTabDirty } = useOptimusLayoutStore();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tab?.path) return;
    setLoading(true);
    filesystemService.readFile(tab.path)
      .then((result) => {
        setContent(result.content);
        emitFileOpened(tab.path);
      })
      .catch(() => setContent("// Error loading file"))
      .finally(() => setLoading(false));
  }, [tab?.path]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined && tab) {
      setContent(value);
      markTabDirty(tab.id, true);
    }
  }, [tab?.id, markTabDirty]);

  const handleMount: OnMount = useCallback((ed) => {
    ed.addCommand(2048 | 49, async () => {
      if (!tab) return;
      await filesystemService.writeFile(tab.path, content);
      markTabDirty(tab.id, false);
    });
  }, [tab?.path, tab?.id, content, markTabDirty]);

  if (!tab) return null;
  if (loading) return <div className="optimus-editor-loading">Loading...</div>;

  return (
    <Editor
      height="100%"
      language={tab.language}
      value={content}
      onChange={handleChange}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        lineNumbers: "on",
        fontSize: 13,
        fontFamily: "'Fira Code', monospace",
        automaticLayout: true,
      }}
    />
  );
}

function DiffViewContent({ diff }: { diff: { id: string; originalPath: string; modifiedPath?: string; originalContent?: string } }) {
  return (
    <div className="optimus-diff-view">
      <div className="optimus-diff-header">{diff.originalPath}</div>
      <Editor
        height="100%"
        language="diff"
        value={diff.originalContent || "// No diff"}
        theme="vs-dark"
        options={{ readOnly: true, minimap: { enabled: false } }}
      />
    </div>
  );
}
