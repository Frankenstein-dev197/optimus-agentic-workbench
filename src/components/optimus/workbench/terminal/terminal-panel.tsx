/**
 * OPTIMUS Terminal Panel
 * 
 * Integrated terminal with multi-session support.
 */

import { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { useTerminalOutput } from "../../../../hooks/optimus/use-workbench-events";
import "@xterm/xterm/css/xterm.css";

export function OptimusTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  
  const {
    terminalSessions,
    activeTerminalSessionId,
    setActiveTerminalSession,
    addTerminalSession,
    appendTerminalOutput,
  } = useOptimusLayoutStore();
  
  const { lastEvent } = useTerminalOutput();
  
  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;
    
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: "#0d1117",
        foreground: "#c9d1d9",
        cursor: "#58a6ff",
        cursorAccent: "#0d1117",
        selectionBackground: "#388bfd66",
        black: "#484f58",
        red: "#f85149",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#a371f7",
        cyan: "#39c5cf",
        white: "#b1bac4",
        brightBlack: "#6e7681",
        brightRed: "#ffa198",
        brightGreen: "#56d364",
        brightYellow: "#e3b341",
        brightBlue: "#79c0ff",
        brightMagenta: "#d2a8ff",
        brightCyan: "#56d4dd",
        brightWhite: "#f0f6fc",
      },
    });
    
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();
    
    xtermRef.current = terminal;
    
    // Welcome message
    terminal.writeln("\x1b[36mOPTIMUS Terminal\x1b[0m");
    terminal.writeln("Type commands to execute them in the sandbox environment.");
    terminal.writeln("");
    
    return () => {
      terminal.dispose();
      xtermRef.current = null;
    };
  }, []);
  
  // Handle terminal input
  useEffect(() => {
    if (!xtermRef.current) return;
    
    const terminal = xtermRef.current;
    
    terminal.onData((data) => {
      // Send data to shell
      terminal.writeln("");
      // TODO: Connect to actual bash service
      terminal.writeln(`\x1b[33m$ ${data}\x1b[0m`);
      terminal.writeln("\x1b[32mCommand would be sent to sandbox here\x1b[0m");
    });
  }, []);
  
  // Display terminal output from events
  useEffect(() => {
    if (!xtermRef.current || !lastEvent) return;
    
    const terminal = xtermRef.current;
    
    if ("command" in lastEvent && lastEvent.command) {
      terminal.writeln(`\x1b[33m$ ${lastEvent.command}\x1b[0m`);
    }
  }, [lastEvent]);
  
  // Create new terminal session
  const handleNewTerminal = () => {
    const sessionId = `terminal-${Date.now()}`;
    addTerminalSession({
      id: sessionId,
      cwd: "/workspace",
      startedAt: Date.now(),
    });
  };
  
  return (
    <div className="optimus-terminal">
      {/* Terminal Header */}
      <div className="optimus-terminal-header">
        <div className="optimus-terminal-tabs">
          {terminalSessions.map((session) => (
            <div
              key={session.id}
              className={`optimus-terminal-tab ${session.id === activeTerminalSessionId ? "active" : ""}`}
              onClick={() => setActiveTerminalSession(session.id)}
            >
              <span>Terminal {terminalSessions.indexOf(session) + 1}</span>
            </div>
          ))}
          <button className="optimus-terminal-new" onClick={handleNewTerminal}>
            +
          </button>
        </div>
        <div className="optimus-terminal-actions">
          <button title="Clear Terminal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="optimus-terminal-content" ref={terminalRef} />
    </div>
  );
}

