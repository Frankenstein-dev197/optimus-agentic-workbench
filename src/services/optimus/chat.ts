/**
 * OPTIMUS Chat Service
 * 
 * Conversation management for agent interaction.
 */

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  agentName?: string;
  toolCallId?: string;
  toolName?: string;
  toolResult?: unknown;
  isLoading?: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  type: 'file' | 'image' | 'code';
  name: string;
  path?: string;
  content?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AgentResponse {
  message: ChatMessage;
  actions?: AgentAction[];
}

export interface AgentAction {
  type: 'tool_call' | 'file_edit' | 'bash_command' | 'think' | 'observe';
  name?: string;
  parameters?: Record<string, unknown>;
  result?: unknown;
  content?: string;
}

export type ChatEventType = 
  | 'message_sent'
  | 'message_received'
  | 'tool_called'
  | 'tool_result'
  | 'error'
  | 'agent_thinking'
  | 'agent_done';

export interface ChatEvent {
  type: ChatEventType;
  data: unknown;
  timestamp: number;
}

type ChatEventCallback = (event: ChatEvent) => void;

class ChatService {
  private conversations: Map<string, Conversation> = new Map();
  private activeConversationId: string | null = null;
  private eventCallbacks: Set<ChatEventCallback> = new Set();
  private agentCallbacks: Set<(response: AgentResponse) => void> = new Set();
  
  constructor() {
    // Create initial conversation
    this.createConversation();
  }
  
  /**
   * Create a new conversation
   */
  createConversation(title?: string): Conversation {
    const id = `conv_${Date.now()}`;
    const conversation: Conversation = {
      id,
      title: title || `Conversation ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.conversations.set(id, conversation);
    this.activeConversationId = id;
    
    // Add system message
    this.addMessage({
      role: 'system',
      content: 'You are OPTIMUS, an AI coding assistant. You help users build software by understanding their goals and executing tasks using tools.'
    });
    
    return conversation;
  }
  
  /**
   * Get active conversation
   */
  getActiveConversation(): Conversation | null {
    if (this.activeConversationId) {
      return this.conversations.get(this.activeConversationId) || null;
    }
    return null;
  }
  
  /**
   * Get conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }
  
  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  /**
   * Set active conversation
   */
  setActiveConversation(id: string) {
    if (this.conversations.has(id)) {
      this.activeConversationId = id;
      this.emitEvent('message_received', { conversationId: id });
    }
  }
  
  /**
   * Delete conversation
   */
  deleteConversation(id: string) {
    this.conversations.delete(id);
    if (this.activeConversationId === id) {
      const remaining = this.conversations.values().next().value;
      this.activeConversationId = remaining?.id || null;
    }
  }
  
  /**
   * Add a message to the active conversation
   */
  addMessage(
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): ChatMessage {
    const conversation = this.getActiveConversation();
    if (!conversation) {
      throw new Error('No active conversation');
    }
    
    const fullMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now()
    };
    
    conversation.messages.push(fullMessage);
    conversation.updatedAt = Date.now();
    
    this.emitEvent('message_received', fullMessage);
    
    return fullMessage;
  }
  
  /**
   * Send a user message and get agent response
   */
  async sendMessage(
    content: string,
    attachments?: ChatAttachment[]
  ): Promise<ChatMessage> {
    // Add user message
    const userMessage = this.addMessage({
      role: 'user',
      content,
      attachments
    });
    
    this.emitEvent('message_sent', userMessage);
    
    // Create loading message
    const loadingMessage = this.addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
      agentName: 'OPTIMUS'
    });
    
    // Get agent response
    try {
      const response = await this.getAgentResponse(content, userMessage.id);
      
      // Update loading message with response
      this.updateMessage(loadingMessage.id, {
        content: response.message.content,
        isLoading: false
      });
      
      // Emit actions if any
      if (response.actions) {
        for (const action of response.actions) {
          this.emitEvent('tool_called', action);
        }
      }
      
      return response.message;
    } catch (error) {
      // Update loading message with error
      this.updateMessage(loadingMessage.id, {
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        isLoading: false
      });
      
      this.emitEvent('error', { error });
      
      return loadingMessage;
    }
  }
  
  /**
   * Get response from agent
   */
  private async getAgentResponse(
    message: string,
    messageId: string
  ): Promise<AgentResponse> {
    // Try API first
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: this.activeConversationId,
          history: this.getActiveConversation()?.messages.slice(0, -2) || []
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fall through to fallback
    }
    
    // Fallback: simulated response
    return this.getSimulatedResponse(message, messageId);
  }
  
  /**
   * Simulated agent response for demo
   */
  private getSimulatedResponse(message: string, messageId: string): AgentResponse {
    const lowerMessage = message.toLowerCase();
    let content = '';
    const actions: AgentAction[] = [];
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      content = 'Hello! I\'m OPTIMUS, your AI coding assistant. How can I help you today?';
    } else if (lowerMessage.includes('help')) {
      content = `I can help you with:

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

**Code Analysis**
- Understand your codebase
- Find and fix bugs
- Refactor code

What would you like to do?`;
    } else if (lowerMessage.includes('build') || lowerMessage.includes('compile')) {
      actions.push({
        type: 'bash_command',
        name: 'build',
        parameters: { command: 'npm run build' }
      });
      content = 'I\'ll run the build command for you. Let me execute it in the terminal.';
    } else if (lowerMessage.includes('status') || lowerMessage.includes('git')) {
      actions.push({
        type: 'bash_command',
        name: 'git_status',
        parameters: { command: 'git status' }
      });
      content = 'Let me check the git status of your repository.';
    } else if (lowerMessage.includes('file') || lowerMessage.includes('read')) {
      content = 'I can help you with file operations. What file would you like to work with?';
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('what')) {
      content = 'I\'m here to help you understand and work with your code. Could you be more specific about what you\'d like to explore?';
    } else {
      content = `I understand you're asking about "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"

I'm here to help you build software. I can:
- Read and write files in your workspace
- Run terminal commands
- Help with git operations
- Analyze and modify code

What specific task would you like me to help with?`;
    }
    
    return {
      message: {
        id: `msg_${Date.now()}_agent`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
        agentName: 'OPTIMUS'
      },
      actions
    };
  }
  
  /**
   * Update a message
   */
  updateMessage(messageId: string, updates: Partial<ChatMessage>) {
    const conversation = this.getActiveConversation();
    if (!conversation) return;
    
    const index = conversation.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      conversation.messages[index] = {
        ...conversation.messages[index],
        ...updates
      };
      conversation.updatedAt = Date.now();
    }
  }
  
  /**
   * Subscribe to events
   */
  onEvent(callback: ChatEventCallback) {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }
  
  /**
   * Subscribe to agent responses
   */
  onAgentResponse(callback: (response: AgentResponse) => void) {
    this.agentCallbacks.add(callback);
    return () => this.agentCallbacks.delete(callback);
  }
  
  private emitEvent(type: ChatEventType, data: unknown) {
    const event: ChatEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    this.eventCallbacks.forEach(cb => cb(event));
  }
}

export const chatService = new ChatService();
