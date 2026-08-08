/**
 * OPTIMUS Source Control Panel
 * 
 * Git integration with staging, commits, and branch management.
 */

import { useState } from "react";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { cn } from "../../../../utils/utils";

export function OptimusSCM() {
  const gitStatus = useOptimusLayoutStore((state) => state.gitStatus);
  const [commitMessage, setCommitMessage] = useState("");
  
  // Placeholder git status
  const placeholderStatus = gitStatus || {
    current: "main",
    branch: "main",
    staged: [],
    modified: [],
    untracked: [],
    ahead: 0,
    behind: 0,
  };
  
  return (
    <div className="optimus-scm">
      {/* Header */}
      <div className="optimus-scm-header">
        <div className="optimus-scm-branch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <path d="M18 9v9a6 6 0 0 1-6 6H6" />
          </svg>
          <span>{placeholderStatus.branch || "main"}</span>
          {(placeholderStatus.ahead > 0 || placeholderStatus.behind > 0) && (
            <span className="optimus-scm-sync">
              {placeholderStatus.ahead > 0 && `↑${placeholderStatus.ahead}`}
              {placeholderStatus.behind > 0 && `↓${placeholderStatus.behind}`}
            </span>
          )}
        </div>
        <div className="optimus-scm-actions">
          <button title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
          <button title="More Actions">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Changes */}
      <div className="optimus-scm-changes">
        {/* Staged Changes */}
        {placeholderStatus.staged.length > 0 && (
          <div className="optimus-scm-change-group">
            <div className="optimus-scm-change-group-header">
              <span>Staged Changes</span>
              <span className="count">{placeholderStatus.staged.length}</span>
            </div>
            <div className="optimus-scm-change-list">
              {placeholderStatus.staged.map((file) => (
                <SCMChangeItem key={file.path} file={file} staged />
              ))}
            </div>
          </div>
        )}
        
        {/* Modified Changes */}
        {placeholderStatus.modified.length > 0 && (
          <div className="optimus-scm-change-group">
            <div className="optimus-scm-change-group-header">
              <span>Changes</span>
              <span className="count">{placeholderStatus.modified.length}</span>
            </div>
            <div className="optimus-scm-change-list">
              {placeholderStatus.modified.map((file) => (
                <SCMChangeItem key={file.path} file={file} />
              ))}
            </div>
          </div>
        )}
        
        {/* Untracked Files */}
        {placeholderStatus.untracked.length > 0 && (
          <div className="optimus-scm-change-group">
            <div className="optimus-scm-change-group-header">
              <span>Untracked</span>
              <span className="count">{placeholderStatus.untracked.length}</span>
            </div>
            <div className="optimus-scm-change-list">
              {placeholderStatus.untracked.map((file) => (
                <SCMChangeItem key={file.path} file={file} untracked />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {placeholderStatus.staged.length === 0 &&
         placeholderStatus.modified.length === 0 &&
         placeholderStatus.untracked.length === 0 && (
          <div className="optimus-scm-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <circle cx="12" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9v9a6 6 0 0 1-6 6H6" />
            </svg>
            <span>No changes detected</span>
          </div>
        )}
      </div>
      
      {/* Commit Box */}
      <div className="optimus-scm-commit">
        <textarea
          className="optimus-scm-commit-input"
          placeholder="Commit message..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={3}
        />
        <div className="optimus-scm-commit-actions">
          <button
            className="optimus-scm-commit-button"
            disabled={commitMessage.trim() === ""}
          >
            Commit
          </button>
          <button title="Amend">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// SCM Change Item Component
interface SCMChangeItemProps {
  file: {
    path: string;
    status: string;
    staged: boolean;
  };
  staged?: boolean;
  untracked?: boolean;
}

function SCMChangeItem({ file, staged, untracked }: SCMChangeItemProps) {
  const name = file.path.split("/").pop() || file.path;
  const folder = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : "";
  
  return (
    <div className={cn("optimus-scm-change-item", untracked && "untracked")}>
      <span className={cn("optimus-scm-change-status", `status-${file.status}`)}>
        {untracked ? "U" : file.status === "modified" ? "M" : file.status === "deleted" ? "D" : "A"}
      </span>
      <div className="optimus-scm-change-info">
        <span className="optimus-scm-change-name">{name}</span>
        {folder && <span className="optimus-scm-change-folder">{folder}</span>}
      </div>
      {!untracked && !staged && (
        <button className="optimus-scm-change-stage" title="Stage">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
      {staged && (
        <button className="optimus-scm-change-unstage" title="Unstage">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

