/**
 * OPTIMUS Problems Panel
 * 
 * Displays errors, warnings, and diagnostics from the codebase.
 */

import { useOptimusLayoutStore, selectFilteredProblems, selectProblemCounts } from "../../../../stores/optimus/layout-store";
import { cn } from "../../../../utils/utils";

export function OptimusProblems() {
  const problems = useOptimusLayoutStore(selectFilteredProblems);
  const counts = useOptimusLayoutStore(selectProblemCounts);
  const filter = useOptimusLayoutStore((state) => state.problemFilter);
  const { setProblemFilter } = useOptimusLayoutStore();
  
  return (
    <div className="optimus-problems">
      {/* Header */}
      <div className="optimus-problems-header">
        <span className="optimus-problems-title">Problems</span>
        <div className="optimus-problems-filters">
          <button
            className={cn("optimus-problems-filter", filter === "all" && "active")}
            onClick={() => setProblemFilter("all")}
          >
            All ({counts.total})
          </button>
          <button
            className={cn("optimus-problems-filter", filter === "errors" && "active", "errors")}
            onClick={() => setProblemFilter("errors")}
          >
            Errors ({counts.errors})
          </button>
          <button
            className={cn("optimus-problems-filter", filter === "warnings" && "active", "warnings")}
            onClick={() => setProblemFilter("warnings")}
          >
            Warnings ({counts.warnings})
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="optimus-problems-content">
        {problems.length === 0 ? (
          <div className="optimus-problems-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>No problems detected</span>
          </div>
        ) : (
          <div className="optimus-problems-list">
            {problems.map((problem) => (
              <div
                key={problem.id}
                className={cn("optimus-problem-item", `severity-${problem.severity}`)}
              >
                <div className="optimus-problem-icon">
                  {problem.severity === "error" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6M9 9l6 6" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                  )}
                </div>
                <div className="optimus-problem-content">
                  <div className="optimus-problem-message">{problem.message}</div>
                  <div className="optimus-problem-location">
                    {problem.file}:{problem.line}:{problem.column}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

