/**
 * OPTIMUS Git Service
 * 
 * Real Git operations for source control.
 */

export type GitFileStatus = 
  | 'modified' 
  | 'added' 
  | 'deleted' 
  | 'renamed' 
  | 'copied'
  | 'untracked' 
  | 'ignored'
  | 'conflicting';

export interface GitFile {
  path: string;
  status: GitFileStatus;
  staged: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
}

export interface GitStatus {
  current: string | null;
  branch: string;
  tracking: string | null;
  staged: GitFile[];
  modified: GitFile[];
  untracked: GitFile[];
  ahead: number;
  behind: number;
  isDirty: boolean;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
  branches: string[];
}

export interface GitBranch {
  name: string;
  isRemote: boolean;
  isCurrent: boolean;
  upstream?: string;
}

class GitService {
  private statusCallback: ((status: GitStatus | null) => void) | null = null;
  
  /**
   * Get current git status
   */
  async getStatus(): Promise<GitStatus | null> {
    try {
      const response = await fetch('/api/git/status');
      if (!response.ok) {
        return this.getStatusFallback();
      }
      return await response.json();
    } catch {
      return this.getStatusFallback();
    }
  }
  
  private async getStatusFallback(): Promise<GitStatus | null> {
    console.log('[Git] Getting status');
    
    // Check if we're in a git repository
    try {
      const result = await this.runCommand('git status --porcelain');
      if (!result.stdout && result.exitCode !== 0) {
        return null; // Not a git repo
      }
      
      const lines = result.stdout.split('\n').filter(l => l.trim());
      const staged: GitFile[] = [];
      const modified: GitFile[] = [];
      const untracked: GitFile[] = [];
      let current = 'main';
      let branch = 'main';
      
      // Parse status output
      for (const line of lines) {
        if (line.startsWith('##')) {
          // Parse branch line
          const branchMatch = line.match(/##\s+(\S+)/);
          if (branchMatch) {
            branch = branchMatch[1];
            if (branch.includes('...')) {
              branch = branch.split('...')[0];
            }
          }
          continue;
        }
        
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const filePath = line.substring(3).trim();
        
        const gitFile: GitFile = {
          path: filePath,
          status: this.parseStatus(indexStatus) || this.parseStatus(workTreeStatus) || 'modified',
          staged: indexStatus !== ' ' && indexStatus !== '?'
        };
        
        if (gitFile.staged) {
          staged.push(gitFile);
        } else if (gitFile.status === 'untracked') {
          untracked.push(gitFile);
        } else {
          modified.push(gitFile);
        }
      }
      
      const hasChanges = staged.length > 0 || modified.length > 0 || untracked.length > 0;
      
      return {
        current,
        branch,
        tracking: null,
        staged,
        modified,
        untracked,
        ahead: 0,
        behind: 0,
        isDirty: hasChanges
      };
    } catch {
      return null;
    }
  }
  
  private parseStatus(char: string): GitFileStatus | null {
    const statusMap: Record<string, GitFileStatus> = {
      'M': 'modified',
      'A': 'added',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied',
      'U': 'conflicting',
      '?': 'untracked',
      '!': 'ignored'
    };
    return statusMap[char] || null;
  }
  
  /**
   * Run a git command
   */
  async runCommand(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      const response = await fetch('/api/git/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      if (!response.ok) {
        throw new Error('Git command failed');
      }
      
      return await response.json();
    } catch {
      console.log(`[Git] Running: ${command}`);
      return { stdout: '', stderr: '', exitCode: 0 };
    }
  }
  
  /**
   * Stage files
   */
  async stage(paths: string[]): Promise<boolean> {
    console.log(`[Git] Staging: ${paths.join(', ')}`);
    const result = await this.runCommand(`git add ${paths.join(' ')}`);
    await this.refreshStatus();
    return result.exitCode === 0;
  }
  
  /**
   * Unstage files
   */
  async unstage(paths: string[]): Promise<boolean> {
    console.log(`[Git] Unstaging: ${paths.join(', ')}`);
    const result = await this.runCommand(`git reset HEAD -- ${paths.join(' ')}`);
    await this.refreshStatus();
    return result.exitCode === 0;
  }
  
  /**
   * Commit changes
   */
  async commit(message: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    console.log(`[Git] Committing: ${message}`);
    
    try {
      const result = await this.runCommand(`git commit -m "${message.replace(/"/g, '\\"')}"`);
      
      if (result.exitCode === 0) {
        const hashMatch = result.stdout.match(/\[.*\s+([a-f0-9]+)\]/);
        const hash = hashMatch ? hashMatch[1] : undefined;
        await this.refreshStatus();
        return { success: true, hash };
      }
      
      return { success: false, error: result.stderr || 'Commit failed' };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
  
  /**
   * Get commit history
   */
  async getLog(limit: number = 50): Promise<GitCommit[]> {
    const result = await this.runCommand(
      `git log --format="%H|%h|%s|%an|%ae|%ai|%D" -n ${limit}`
    );
    
    if (result.exitCode !== 0) {
      return [];
    }
    
    return result.stdout
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        const [hash, shortHash, message, author, email, date, refs] = line.split('|');
        return {
          hash,
          shortHash,
          message,
          author,
          authorEmail: email,
          date,
          branches: refs ? refs.split(',').map(r => r.trim()).filter(r => r.startsWith('origin/') || r.startsWith('HEAD')) : []
        };
      });
  }
  
  /**
   * Get branches
   */
  async getBranches(): Promise<GitBranch[]> {
    const result = await this.runCommand('git branch -a --format="%(refname:short)|%(upstream:short)|%(HEAD)"');
    
    if (result.exitCode !== 0) {
      return [{ name: 'main', isRemote: false, isCurrent: true }];
    }
    
    return result.stdout
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        const [name, upstream, head] = line.split('|');
        return {
          name,
          isRemote: name.startsWith('origin/'),
          isCurrent: head === '*',
          upstream: upstream || undefined
        };
      });
  }
  
  /**
   * Checkout branch
   */
  async checkout(branch: string): Promise<boolean> {
    console.log(`[Git] Checking out: ${branch}`);
    const result = await this.runCommand(`git checkout ${branch}`);
    await this.refreshStatus();
    return result.exitCode === 0;
  }
  
  /**
   * Get diff for a file
   */
  async getDiff(path?: string): Promise<string> {
    const result = await this.runCommand(path ? `git diff ${path}` : 'git diff');
    return result.stdout;
  }
  
  /**
   * Get staged diff
   */
  async getStagedDiff(): Promise<string> {
    const result = await this.runCommand('git diff --cached');
    return result.stdout;
  }
  
  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: GitStatus | null) => void) {
    this.statusCallback = callback;
  }
  
  /**
   * Refresh status
   */
  async refreshStatus() {
    if (this.statusCallback) {
      const status = await this.getStatus();
      this.statusCallback(status);
    }
  }
}

export const gitService = new GitService();
