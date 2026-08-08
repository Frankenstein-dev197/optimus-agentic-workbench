/**
 * OPTIMUS Status Bar Component
 * 
 * Bottom status bar showing git status, problems, and other indicators.
 */

import { useOptimusLayoutStore, selectProblemCounts } from "../../../stores/optimus/layout-store";
import { cn } from "../../../utils/utils";

export function OptimusStatusBar() {
  const gitStatus = useOptimusLayoutStore((state) => state.gitStatus);
  const previewUrl = useOptimusLayoutStore((state) => state.previewUrl);
  const problemCounts = useOptimusLayoutStore(selectProblemCounts);
  const activeTab = useOptimusLayoutStore((state) => {
    const activeTabId = state.openTabs.find((t) => t.isActive);
    return activeTabId;
  });
  
  const { togglePanel, showPanel } = useOptimusLayoutStore();
  
  return (
    <div className="optimus-status-bar">
      {/* Left Section */}
      <div className="optimus-status-bar-left">
        {/* Git Branch */}
        {gitStatus && (
          <div
            className="optimus-status-bar-item"
            onClick={() => showPanel("scm")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9v9a6 6 0 0 1-6 6H6" />
            </svg>
            <span>{gitStatus.branch || "main"}</span>
            {gitStatus.ahead > 0 && <span>↑{gitStatus.ahead}</span>}
            {gitStatus.behind > 0 && <span>↓{gitStatus.behind}</span>}
          </div>
        )}
        
        {/* Git Sync Status */}
        {gitStatus && (gitStatus.staged.length > 0 || gitStatus.modified.length > 0) && (
          <div
            className="optimus-status-bar-item optimus-status-git-changes"
            onClick={() => showPanel("scm")}
          >
            <span>Changes: {gitStatus.staged.length + gitStatus.modified.length}</span>
          </div>
        )}
        
        {/* Problems */}
        {problemCounts.total > 0 && (
          <div
            className={cn(
              "optimus-status-bar-item",
              problemCounts.errors > 0 && "optimus-status-error",
              problemCounts.warnings > 0 && !problemCounts.errors && "optimus-status-warning"
            )}
            onClick={() => showPanel("problems")}
          >
            {problemCounts.errors > 0 && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6M9 9l6 6" />
                </svg>
                <span>{problemCounts.errors}</span>
              </>
            )}
            {problemCounts.warnings > 0 && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
                <span>{problemCounts.warnings}</span>
              </>
            )}
            {problemCounts.errors === 0 && problemCounts.warnings === 0 && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>No Problems</span>
              </>
            )}
          </div>
        )}
        
        {/* Preview Status */}
        {previewUrl && (
          <div
            className="optimus-status-bar-item optimus-status-success"
            onClick={() => showPanel("preview")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview Running</span>
          </div>
        )}
      </div>
      
      {/* Right Section */}
      <div className="optimus-status-bar-right">
        {/* Active File Info */}
        {activeTab && (
          <>
            <div className="optimus-status-bar-item" title={activeTab.path}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <span>{activeTab.name}</span>
              {activeTab.isDirty && <span className="optimus-status-dirty">●</span>}
            </div>
            <div className="optimus-status-bar-item">
              <span>{activeTab.language}</span>
            </div>
            <div className="optimus-status-bar-item">
              <span>UTF-8</span>
            </div>
            {activeTab.line && (
              <div className="optimus-status-bar-item">
                <span>Ln {activeTab.line}, Col {activeTab.column || 1}</span>
              </div>
            )}
          </>
        )}
        
        {/* AI Status */}
        <div className="optimus-status-bar-item optimus-status-ai">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
          </svg>
          <span>OPTIMUS</span>
        </div>
      </div>
    </div>
  );
}

