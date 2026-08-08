/**
 * OPTIMUS API Server
 * 
 * Backend server for filesystem, git, and terminal operations.
 */

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = process.env.WORKSPACE || '/workspace';

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// FILESYSTEM API
// ============================================================================

// Read directory
app.get('/api/filesystem/readdir', async (req, res) => {
  try {
    const dirPath = req.query.path || WORKSPACE;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const result = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      let stats;
      try {
        stats = await fs.stat(fullPath);
      } catch {
        stats = { size: 0, mtimeMs: 0 };
      }
      
      return {
        name: entry.name,
        path: fullPath,
        isDirectory: entry.isDirectory(),
        size: stats.size || 0,
        modified: stats.mtimeMs || 0,
        extension: entry.isDirectory() ? undefined : path.extname(entry.name).slice(1)
      };
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read file
app.get('/api/filesystem/read', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ path: filePath, content, encoding: 'utf-8' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Write file
app.post('/api/filesystem/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if path exists
app.get('/api/filesystem/exists', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    await fs.access(filePath);
    res.json(true);
  } catch {
    res.json(false);
  }
});

// Get file stats
app.get('/api/filesystem/stat', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const stats = await fs.stat(filePath);
    res.json({
      name: path.basename(filePath),
      path: filePath,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtimeMs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GIT API
// ============================================================================

// Get git status
app.get('/api/git/status', async (req, res) => {
  try {
    const cwd = req.query.cwd || WORKSPACE;
    
    // Check if git repo
    try {
      await execAsync('git rev-parse --git-dir', { cwd });
    } catch {
      return res.json(null);
    }
    
    // Get status
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd });
    const { stdout: branchOutput } = await execAsync('git branch --show-current', { cwd });
    
    const staged = [];
    const modified = [];
    const untracked = [];
    
    const lines = statusOutput.split('\n').filter(l => l.trim());
    
    for (const line of lines) {
      if (line.startsWith('##')) continue;
      
      const indexStatus = line[0];
      const workTreeStatus = line[1];
      const filePath = line.substring(3).trim();
      
      const file = {
        path: filePath,
        status: parseStatus(indexStatus) || parseStatus(workTreeStatus) || 'modified',
        staged: indexStatus !== ' ' && indexStatus !== '?'
      };
      
      if (file.staged) {
        staged.push(file);
      } else if (file.status === 'untracked') {
        untracked.push(file);
      } else {
        modified.push(file);
      }
    }
    
    res.json({
      current: branchOutput.trim() || 'main',
      branch: branchOutput.trim() || 'main',
      tracking: null,
      staged,
      modified,
      untracked,
      ahead: 0,
      behind: 0,
      isDirty: staged.length > 0 || modified.length > 0 || untracked.length > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run git command
app.post('/api/git/run', async (req, res) => {
  try {
    const { command } = req.body;
    const cwd = req.body.cwd || WORKSPACE;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const { stdout, stderr } = await execAsync(command, { cwd });
    res.json({ stdout, stderr, exitCode: 0 });
  } catch (error) {
    res.json({
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || 1
    });
  }
});

// ============================================================================
// TERMINAL API
// ============================================================================

// Execute command
app.post('/api/terminal/execute', async (req, res) => {
  try {
    const { command, sessionId } = req.body;
    const cwd = req.body.cwd || WORKSPACE;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd,
      timeout: 30000,
      maxBuffer: 1024 * 1024
    });
    
    res.json({
      command,
      stdout,
      stderr,
      exitCode: 0,
      duration: 0
    });
  } catch (error) {
    res.json({
      command: req.body.command,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.code || 1,
      duration: 0
    });
  }
});

// ============================================================================
// AGENT API
// ============================================================================

app.post('/api/agent/chat', async (req, res) => {
  const { message, history } = req.body;
  
  // Simple agent response
  const response = getAgentResponse(message);
  
  res.json({
    message: {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      agentName: 'OPTIMUS'
    },
    actions: response.actions
  });
});

function getAgentResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return {
      content: "Hello! I'm OPTIMUS, your AI coding assistant. How can I help you today?"
    };
  }
  
  if (lower.includes('help')) {
    return {
      content: `I can help you with:

**File Operations**
- Read, create, edit, and delete files
- Navigate your project structure
- Search for code patterns

**Terminal Commands**
- Run bash commands
- Install dependencies
- Run builds and tests

**Git Operations**
- Check git status
- Stage and commit changes
- Create and switch branches

What would you like to do?`
    };
  }
  
  if (lower.includes('build')) {
    return {
      content: "I'll run the build command for you.",
      actions: [{ type: 'bash_command', name: 'build', parameters: { command: 'npm run build' } }]
    };
  }
  
  if (lower.includes('status') || lower.includes('git')) {
    return {
      content: "Let me check the git status.",
      actions: [{ type: 'bash_command', name: 'git_status', parameters: { command: 'git status' } }]
    };
  }
  
  return {
    content: `I understand you're working on "${message.substring(0, 50)}..."

I'm here to help you build software. I can:
- Read and write files in your workspace
- Run terminal commands
- Help with git operations
- Analyze and modify code

What specific task would you like me to help with?`
  };
}

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OPTIMUS API Server running on port ${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
});
