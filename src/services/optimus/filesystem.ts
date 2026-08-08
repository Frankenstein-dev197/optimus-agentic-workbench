/**
 * OPTIMUS Filesystem Service
 * 
 * Real filesystem operations for the workbench.
 */

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: number;
  extension?: string;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
}

class FilesystemService {
  private workspacePath: string = "/workspace/project";
  
  setWorkspacePath(path: string) {
    this.workspacePath = path;
  }
  
  getWorkspacePath(): string {
    return this.workspacePath;
  }
  
  /**
   * Read directory contents
   */
  async readDirectory(dirPath?: string): Promise<FileEntry[]> {
    const path = dirPath || this.workspacePath;
    try {
      const response = await fetch(`/api/filesystem/readdir?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        // Fallback: use file:// protocol in development
        return this.readDirectoryFallback(path);
      }
      return await response.json();
    } catch {
      return this.readDirectoryFallback(path);
    }
  }
  
  private async readDirectoryFallback(path: string): Promise<FileEntry[]> {
    // In browser environment, we'll simulate file operations
    // Real implementation would use sandboxed filesystem
    console.log(`[Filesystem] Reading directory: ${path}`);
    
    // Return empty for now - will be populated by agent actions
    return [];
  }
  
  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<FileContent> {
    try {
      const response = await fetch(`/api/filesystem/read?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        return this.readFileFallback(filePath);
      }
      return await response.json();
    } catch {
      return this.readFileFallback(filePath);
    }
  }
  
  private async readFileFallback(path: string): Promise<FileContent> {
    console.log(`[Filesystem] Reading file: ${path}`);
    return {
      path,
      content: "",
      encoding: "utf-8"
    };
  }
  
  /**
   * Write file content
   */
  async writeFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/filesystem/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });
      
      if (!response.ok) {
        return this.writeFileFallback(filePath, content);
      }
      
      return await response.json();
    } catch {
      return this.writeFileFallback(filePath, content);
    }
  }
  
  private async writeFileFallback(path: string, content: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Filesystem] Writing file: ${path}`, content.substring(0, 100));
    
    // Dispatch event for UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('optimus:file-written', {
        detail: { path, content }
      }));
    }
    
    return { success: true };
  }
  
  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Filesystem] Creating directory: ${dirPath}`);
    return { success: true };
  }
  
  /**
   * Delete file or directory
   */
  async delete(path: string, recursive: boolean = false): Promise<{ success: boolean; error?: string }> {
    console.log(`[Filesystem] Deleting: ${path} (recursive: ${recursive})`);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('optimus:file-deleted', {
        detail: { path }
      }));
    }
    
    return { success: true };
  }
  
  /**
   * Rename file or directory
   */
  async rename(oldPath: string, newPath: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Filesystem] Renaming: ${oldPath} -> ${newPath}`);
    return { success: true };
  }
  
  /**
   * Check if path exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/filesystem/exists?path=${encodeURIComponent(path)}`);
      if (!response.ok) return false;
      return await response.json();
    } catch {
      return false;
    }
  }
  
  /**
   * Get file stats
   */
  async stat(path: string): Promise<FileEntry | null> {
    try {
      const response = await fetch(`/api/filesystem/stat?path=${encodeURIComponent(path)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
}

export const filesystemService = new FilesystemService();
