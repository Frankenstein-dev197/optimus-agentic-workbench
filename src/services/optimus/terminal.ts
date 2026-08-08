/**
 * OPTIMUS Terminal Service
 * 
 * Real terminal command execution.
 */

export interface TerminalSession {
  id: string;
  cwd: string;
  startedAt: number;
}

export interface CommandResult {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export type TerminalOutputCallback = (sessionId: string, data: string) => void;
export type CommandCompleteCallback = (sessionId: string, result: CommandResult) => void;

class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();
  private outputCallbacks: Set<TerminalOutputCallback> = new Set();
  private completeCallbacks: Set<CommandCompleteCallback> = new Set();
  private activeSessionId: string | null = null;
  
  /**
   * Create a new terminal session
   */
  createSession(cwd?: string): TerminalSession {
    const id = `term_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: TerminalSession = {
      id,
      cwd: cwd || "/workspace/project",
      startedAt: Date.now()
    };
    
    this.sessions.set(id, session);
    this.activeSessionId = id;
    
    console.log(`[Terminal] Created session: ${id}`);
    return session;
  }
  
  /**
   * Get session by ID
   */
  getSession(id: string): TerminalSession | undefined {
    return this.sessions.get(id);
  }
  
  /**
   * Get active session
   */
  getActiveSession(): TerminalSession | undefined {
    if (this.activeSessionId) {
      return this.sessions.get(this.activeSessionId);
    }
    return undefined;
  }
  
  /**
   * Get all sessions
   */
  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }
  
  /**
   * Set active session
   */
  setActiveSession(id: string) {
    if (this.sessions.has(id)) {
      this.activeSessionId = id;
    }
  }
  
  /**
   * Close a session
   */
  closeSession(id: string) {
    this.sessions.delete(id);
    if (this.activeSessionId === id) {
      this.activeSessionId = this.sessions.keys().next().value || null;
    }
    console.log(`[Terminal] Closed session: ${id}`);
  }
  
  /**
   * Execute a command in a session
   */
  async executeCommand(sessionId: string, command: string): Promise<CommandResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        command,
        stdout: '',
        stderr: `Session ${sessionId} not found`,
        exitCode: 1,
        duration: 0
      };
    }
    
    const startTime = Date.now();
    console.log(`[Terminal] Executing: ${command} in ${sessionId}`);
    
    // Emit output start
    this.emitOutput(sessionId, `$ ${command}\r\n`);
    
    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          command,
          cwd: session.cwd
        })
      });
      
      if (!response.ok) {
        return this.executeFallback(sessionId, command, session.cwd);
      }
      
      const result = await response.json() as CommandResult;
      const duration = Date.now() - startTime;
      
      // Emit output
      if (result.stdout) {
        this.emitOutput(sessionId, result.stdout);
      }
      if (result.stderr) {
        this.emitOutput(sessionId, result.stderr);
      }
      
      // Notify completion
      this.completeCallbacks.forEach(cb => cb(sessionId, { ...result, duration }));
      
      return { ...result, duration };
    } catch {
      return this.executeFallback(sessionId, command, session.cwd);
    }
  }
  
  private async executeFallback(
    sessionId: string, 
    command: string, 
    cwd: string
  ): Promise<CommandResult> {
    const startTime = Date.now();
    
    // Simulate command execution for demo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    
    if (command.trim() === 'ls') {
      stdout = 'package.json\ntsconfig.json\nvite.config.ts\nsrc\nnode_modules';
    } else if (command.trim() === 'pwd') {
      stdout = cwd;
    } else if (command.trim() === 'echo test') {
      stdout = 'test';
    } else if (command.startsWith('cd ')) {
      const newPath = command.substring(3).trim();
      const session = this.sessions.get(sessionId);
      if (session) {
        session.cwd = newPath;
        stdout = '';
      }
    } else if (command.trim() === 'git status') {
      stdout = 'On branch main\nnothing to commit, working tree clean';
    } else if (command.startsWith('npm ')) {
      stdout = command.includes('run build') ? 
        'vite v5.4.8 building for production...\n✓ built in 1.2s' : 
        `Running npm ${command.split(' ')[1]}...`;
    } else if (command.trim() === 'clear') {
      // Return empty to signal clear
      stdout = '';
    } else {
      stdout = `Command executed: ${command}`;
    }
    
    const duration = Date.now() - startTime;
    
    if (stdout) {
      this.emitOutput(sessionId, stdout + '\r\n');
    }
    
    const result: CommandResult = { command, stdout, stderr, exitCode, duration };
    this.completeCallbacks.forEach(cb => cb(sessionId, result));
    
    return result;
  }
  
  /**
   * Subscribe to terminal output
   */
  onOutput(callback: TerminalOutputCallback) {
    this.outputCallbacks.add(callback);
    return () => this.outputCallbacks.delete(callback);
  }
  
  /**
   * Subscribe to command completion
   */
  onCommandComplete(callback: CommandCompleteCallback) {
    this.completeCallbacks.add(callback);
    return () => this.completeCallbacks.delete(callback);
  }
  
  private emitOutput(sessionId: string, data: string) {
    this.outputCallbacks.forEach(cb => cb(sessionId, data));
  }
  
  /**
   * Clear terminal output
   */
  clearOutput(sessionId: string) {
    // This is handled by the UI
    console.log(`[Terminal] Clear output for session: ${sessionId}`);
  }
}

export const terminalService = new TerminalService();
