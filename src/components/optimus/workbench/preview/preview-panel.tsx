/**
 * OPTIMUS Preview Panel
 * 
 * Live application preview with port detection and error display.
 */

import { useState } from "react";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { cn } from "../../../../utils/utils";

export function OptimusPreview() {
  const previewUrl = useOptimusLayoutStore((state) => state.previewUrl);
  const previewPort = useOptimusLayoutStore((state) => state.previewPort);
  const { stopPreview } = useOptimusLayoutStore();
  
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Placeholder URL
  const displayUrl = previewUrl || "http://localhost:3000";
  const displayPort = previewPort || 3000;
  
  const handleReload = () => {
    setLoading(true);
    setIframeKey((k) => k + 1);
    setTimeout(() => setLoading(false), 1000);
  };
  
  return (
    <div className="optimus-preview">
      {/* Header */}
      <div className="optimus-preview-header">
        <div className="optimus-preview-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Preview</span>
          <span className="optimus-preview-port">:{displayPort}</span>
        </div>
        <div className="optimus-preview-actions">
          <button
            onClick={handleReload}
            title="Reload"
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
          <button
            onClick={() => stopPreview()}
            title="Stop Preview"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="14" x="5" y="5" rx="2" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* URL Bar */}
      <div className="optimus-preview-url-bar">
        <input
          type="text"
          className="optimus-preview-url-input"
          value={displayUrl}
          readOnly
        />
      </div>
      
      {/* Preview Content */}
      <div className="optimus-preview-content">
        {loading && (
          <div className="optimus-preview-loading">
            <div className="optimus-preview-spinner" />
            <span>Loading...</span>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          src={displayUrl}
          className={cn("optimus-preview-iframe", loading && "hidden")}
          title="Application Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
        
        {/* Empty State */}
        {!previewUrl && (
          <div className="optimus-preview-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h3>No preview running</h3>
            <p>Start a development server to see your application</p>
          </div>
        )}
      </div>
      
      {/* Device Emulation */}
      <div className="optimus-preview-devices">
        <button className="optimus-preview-device" title="Desktop">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
        <button className="optimus-preview-device" title="Tablet">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </button>
        <button className="optimus-preview-device" title="Mobile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

