/**
 * OPTIMUS Sidebar Component
 * 
 * Activity bar and sidebar for navigating between workbench panels.
 */

import React, { useState } from "react";
import { PanelType, useOptimusLayoutStore } from "../../../stores/optimus/layout-store";
import { cn } from "../../../utils/utils";

// Icons (using Lucide icons)
const Icons = {
  files: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  sourceControl: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v9a6 6 0 0 1-6 6H6" />
    </svg>
  ),
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  terminal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  debug: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m8 6 4-4 4 4" />
      <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22" />
      <path d="m20 22-5-5" />
    </svg>
  ),
  testing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  preview: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  extensions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 12v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

const PANEL_ICONS: Record<PanelType, React.ReactNode> = {
  explorer: Icons.files,
  editor: Icons.files,
  terminal: Icons.terminal,
  problems: Icons.search,
  output: Icons.search,
  scm: Icons.sourceControl,
  testing: Icons.testing,
  debug: Icons.debug,
  preview: Icons.preview,
  search: Icons.search,
};

const PANEL_LABELS: Record<PanelType, string> = {
  explorer: "Explorer",
  editor: "Files",
  terminal: "Terminal",
  problems: "Problems",
  output: "Output",
  scm: "Source Control",
  testing: "Testing",
  debug: "Debug",
  preview: "Preview",
  search: "Search",
};

interface OptimusSidebarProps {
  panels: PanelType[];
}

export function OptimusSidebar({ panels }: OptimusSidebarProps) {
  const [activePanel, setActivePanel] = useState<PanelType>(
    panels.includes("explorer") ? "explorer" : panels[0] || "explorer"
  );
  const { hidePanel } = useOptimusLayoutStore();
  
  return (
    <div className="optimus-sidebar-container">
      {/* Activity Bar */}
      <div className="optimus-activity-bar">
        {panels.map((panel) => (
          <button
            key={panel}
            className={cn(
              "optimus-activity-item",
              activePanel === panel && "active"
            )}
            onClick={() => setActivePanel(panel)}
            title={PANEL_LABELS[panel]}
          >
            {PANEL_ICONS[panel]}
          </button>
        ))}
        
        <div className="optimus-activity-spacer" />
        
        {/* Bottom icons */}
        <button
          className="optimus-activity-item"
          title="Extensions"
        >
          {Icons.extensions}
        </button>
        <button
          className="optimus-activity-item"
          title="Settings"
        >
          {Icons.settings}
        </button>
      </div>
      
      {/* Side Panel Content */}
      <div className="optimus-side-panel">
        <div className="optimus-side-panel-header">
          <span className="optimus-side-panel-title">
            {PANEL_LABELS[activePanel]}
          </span>
          <button
            className="optimus-side-panel-close"
            onClick={() => hidePanel(activePanel)}
            title="Close Panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="optimus-side-panel-content">
          {/* Content will be rendered by the panel component */}
        </div>
      </div>
    </div>
  );
}
