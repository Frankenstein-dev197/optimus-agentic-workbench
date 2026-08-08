/**
 * OPTIMUS Terminal Panel
 * 
 * Integrated terminal with xterm.js and real command execution.
 */

import { useRef, useEffect, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useOptimusLayoutStore } from "../../../../stores/optimus/layout-store";
import { terminalService } from "../../../../services/optimus/terminal";
import { emitCommandStarted, emitCommandFinished } from "../../../../services/optimus/event-bridge";
import "@xterm/xterm/css/xterm.css";

export function OptimusTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef<string>("");
  
  const {
    terminalSessions,
    activeTerminalSessionId,
    setActiveTerminalSession,
    addTerminalSession,
  } = useOptimusLayoutStore();
  
  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;
    
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: "#1e1e1e",
        foreground: "#c9d1d9",
        cursor: "#58a6ff",
        cursorAccent: "#1e1e1e",
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
    terminal.open(containerRef.current);
    fitAddon.fit();
    
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    
    // Welcome message
    terminal.writeln("\x1b[36m⚡ OPTIMUS Terminal\x1b[0m");
    terminal.writeln("Type commands to execute them. Press Enter to run.");
    terminal.writeln("");
    
    // Create initial session
    const session = terminalService.createSession();
    addTerminalSession({
      id: session.id,
      cwd: session.cwd,
      startedAt: session.startedAt,
    });
    
    // Handle resize
    const handleResize = () => {
      if (fitAddon) fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [addTerminalSession]);
  
  // Handle terminal input
  useEffect(() => {
    if (!terminalRef.current) return;
    
    const terminal = terminalRef.current;
    inputBufferRef.current = "";
    
    terminal.onData((data: string) => {
      const code = data.charCodeAt(0);
      
      // Enter
      if (code === 13) {
        const command = inputBufferRef.current.trim();
        inputBufferRef.current = "";
        
        terminal.writeln("");
        
        if (command) {
          executeCommand(terminal, command);
        }
      }
      // Backspace
      else if (code === 127) {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          terminal.write("\b \b");
        }
      }
      // Ctrl+C
      else if (code === 3) {
        terminal.writeln("^C");
        inputBufferRef.current = "";
      }
      // Regular printable characters
      else if (code >= 32) {
        inputBufferRef.current += data;
        terminal.write(data);
      }
    });
  }, [activeTerminalSessionId]);
  
  // Execute command
  const executeCommand = useCallback(async (terminal: Terminal, command: string) => {
    if (!activeTerminalSessionId) return;
    
    // Show command being executed
    terminal.writeln(`\x1b[33mExecuting: ${command}\x1b[0m`);
    
    // Emit events
    emitCommandStarted(activeTerminalSessionId, command);
    
    try {
      const result = await terminalService.executeCommand(activeTerminalSessionId, command);
      
      // Write output
      if (result.stdout) {
        terminal.writeln(result.stdout);
      }
      if (result.stderr) {
        terminal.writeln(`\x1b[31m${result.stderr}\x1b[0m`);
      }
      
      if (result.exitCode === 0) {
        terminal.writeln(`\x1b[32m✓ Done in ${result.duration}ms\x1b[0m`);
      } else {
        terminal.writeln(`\x1b[31m✗ Exit code: ${result.exitCode}\x1b[0m`);
      }
      
      emitCommandFinished(activeTerminalSessionId, command, result.exitCode, result.duration);
    } catch (error) {
      terminal.writeln(`\x1b[31mError: ${error}\x1b[0m`);
    }
    
    terminal.writeln("");
  }, [activeTerminalSessionId]);
  
  // Create new terminal session
  const handleNewTerminal = () => {
    const session = terminalService.createSession();
    addTerminalSession({
      id: session.id,
      cwd: session.cwd,
      startedAt: session.startedAt,
    });
    
    if (terminalRef.current) {
      terminalRef.current.writeln("\r\n\x1b[33m--- New Session ---\x1b[0m\r\n");
    }
  };
  
  // Clear terminal
  const handleClear = () => {
    if (terminalRef.current) {
      terminalRef.current.clear();
      terminalRef.current.writeln("\x1b[36m⚡ OPTIMUS Terminal\x1b[0m");
      terminalRef.current.writeln("Type commands to execute them. Press Enter to run.");
      terminalRef.current.writeln("");
    }
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
          <button onClick={handleClear} title="Clear Terminal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="optimus-terminal-content" ref={containerRef} />
    </div>
  );
}

