/**
 * OPTIMUS Explorer Panel
 * 
 * File explorer with real filesystem integration.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { filesystemService, type FileEntry } from "../../../../services/optimus/filesystem";
import { cn } from "../../../../utils/utils";

interface FileTreeItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeItem[];
  gitStatus?: "added" | "modified" | "deleted" | "untracked" | "renamed";
  extension?: string;
}

// Initial placeholder tree - real files will be loaded
const INITIAL_FILE_TREE: FileTreeItem[] = [
  {
    name: "src",
    path: "/workspace/src",
    isDirectory: true,
    children: [
      { name: "App.tsx", path: "/workspace/src/App.tsx", isDirectory: false, extension: "tsx" },
      { name: "main.tsx", path: "/workspace/src/main.tsx", isDirectory: false, extension: "tsx" },
      { name: "components", path: "/workspace/src/components", isDirectory: true },
      { name: "stores", path: "/workspace/src/stores", isDirectory: true },
      { name: "services", path: "/workspace/src/services", isDirectory: true },
      { name: "hooks", path: "/workspace/src/hooks", isDirectory: true },
    ],
  },
  {
    name: "package.json",
    path: "/workspace/package.json",
    isDirectory: false,
    extension: "json",
  },
  {
    name: "tsconfig.json",
    path: "/workspace/tsconfig.json",
    isDirectory: false,
    extension: "json",
  },
  {
    name: "README.md",
    path: "/workspace/README.md",
    isDirectory: false,
    extension: "md",
  },
];

export function OptimusExplorer() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["/workspace", "/workspace/src"]));
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeItem[]>(INITIAL_FILE_TREE);
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null);
  
  const openTab = useOptimusLayoutStore((state) => state.openTab);
  
  // Listen for file change events
  useEffect(() => {
    const handleFileWritten = (e: CustomEvent) => {
      setRecentlyChanged(e.detail.path);
      setTimeout(() => setRecentlyChanged(null), 2000);
    };
    
    const handleFileDeleted = () => {
      // Refresh file tree
    };
    
    window.addEventListener('optimus:file-written', handleFileWritten as EventListener);
    window.addEventListener('optimus:file-deleted', handleFileDeleted as EventListener);
    
    return () => {
      window.removeEventListener('optimus:file-written', handleFileWritten as EventListener);
      window.removeEventListener('optimus:file-deleted', handleFileDeleted as EventListener);
    };
  }, []);
  
  // Load directory contents when expanded
  const loadDirectoryContents = useCallback(async (path: string): Promise<FileTreeItem[]> => {
    try {
      const entries = await filesystemService.readDirectory(path);
      return entries.map((entry: FileEntry) => ({
        name: entry.name,
        path: entry.path,
        isDirectory: entry.isDirectory,
        extension: entry.extension,
      }));
    } catch {
      return [];
    }
  }, []);
  
  // Toggle folder expansion
  const toggleExpand = useCallback(async (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
        // Load contents when expanding
        loadDirectoryContents(path).then((contents) => {
          setFileTree((current) => updateTreeContents(current, path, contents));
        });
      }
      return next;
    });
  }, [loadDirectoryContents]);
  
  // Update tree contents helper
  const updateTreeContents = (
    tree: FileTreeItem[],
    targetPath: string,
    newContents: FileTreeItem[]
  ): FileTreeItem[] => {
    return tree.map((item) => {
      if (item.path === targetPath) {
        return { ...item, children: newContents };
      }
      if (item.children) {
        return { ...item, children: updateTreeContents(item.children, targetPath, newContents) };
      }
      return item;
    });
  };
  
  // Handle file selection
  const handleFileClick = useCallback(async (item: FileTreeItem) => {
    if (!item.isDirectory) {
      setSelectedPath(item.path);
      openTab({
        id: `tab-${item.path.replace(/[^a-zA-Z0-9]/g, "-")}`,
        path: item.path,
        name: item.name,
        language: getLanguage(item.name),
        isDirty: false,
      });
    } else {
      toggleExpand(item.path);
    }
  }, [openTab, toggleExpand]);
  
  // Render file tree recursively
  const renderFileTree = (items: FileTreeItem[], depth = 0) => {
    return items.map((item) => {
      const isExpanded = expandedPaths.has(item.path);
      const paddingLeft = 12 + depth * 16;
      
      return (
        <React.Fragment key={item.path}>
          <div
            className={cn(
              "optimus-file-item",
              selectedPath === item.path && "selected",
              recentlyChanged === item.path && "recently-changed"
            )}
            style={{ paddingLeft }}
            onClick={() => handleFileClick(item)}
          >
            {/* Icon */}
            <span className="optimus-file-icon">
              {item.isDirectory ? (
                isExpanded ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <path d="M8 13h8M8 17h8" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                )
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              )}
            </span>
            
            {/* Name */}
            <span className="optimus-file-name">{item.name}</span>
            
            {/* Git Status Indicator */}
            {item.gitStatus && (
              <span className={cn("optimus-git-indicator", `git-${item.gitStatus}`)}>
                {item.gitStatus === "added" && "+"}
                {item.gitStatus === "modified" && "M"}
                {item.gitStatus === "deleted" && "-"}
                {item.gitStatus === "untracked" && "U"}
              </span>
            )}
          </div>
          
          {/* Children */}
          {item.isDirectory && isExpanded && item.children && (
            renderFileTree(item.children, depth + 1)
          )}
        </React.Fragment>
      );
    });
  };
  
  return (
    <div className="optimus-explorer">
      {/* Header */}
      <div className="optimus-explorer-header">
        <span className="optimus-explorer-title">Explorer</span>
        <div className="optimus-explorer-actions">
          <button className="optimus-explorer-action" title="New File" onClick={() => {}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M12 18v-6M9 15h6" />
            </svg>
          </button>
          <button className="optimus-explorer-action" title="New Folder" onClick={() => {}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>
          <button className="optimus-explorer-action" title="Refresh" onClick={() => setFileTree(INITIAL_FILE_TREE)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Workspace */}
      <div className="optimus-explorer-workspace">
        <div className="optimus-workspace-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>WORKSPACE</span>
        </div>
        
        {/* File Tree */}
        <div className="optimus-file-tree">
          {renderFileTree(fileTree)}
        </div>
      </div>
      
      {/* Open Editors */}
      <div className="optimus-open-editors">
        <div className="optimus-open-editors-header">
          <span>Open Editors</span>
        </div>
        <OpenEditorsList />
      </div>
    </div>
  );
}

// Open Editors sub-component
function OpenEditorsList() {
  const openTabs = useOptimusLayoutStore((state) => state.openTabs);
  const setActiveTab = useOptimusLayoutStore((state) => state.setActiveTab);
  const closeTab = useOptimusLayoutStore((state) => state.closeTab);
  
  if (openTabs.length === 0) {
    return (
      <div className="optimus-open-editors-empty">
        No open editors
      </div>
    );
  }
  
  return (
    <div className="optimus-open-editors-list">
      {openTabs.map((tab) => (
        <div
          key={tab.id}
          className={cn("optimus-open-editor-item", tab.isActive && "active")}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="optimus-open-editor-name">
            {tab.isDirty && <span className="optimus-dirty-indicator">●</span>}
            {tab.name}
          </span>
          <button
            className="optimus-open-editor-close"
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
  );
}

// Helper function
function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    tsx: "typescript",
    ts: "typescript",
    jsx: "javascript",
    js: "javascript",
    py: "python",
    md: "markdown",
    json: "json",
    css: "css",
    html: "html",
  };
  return map[ext] || "plaintext";
}

