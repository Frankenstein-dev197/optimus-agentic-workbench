/**
 * OPTIMUS Conversation Store
 * 
 * Manages conversations, messages, and agent state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OptimusMessage, MessageRole, ToolCall, AgentState } from '#/types/optimus';

export interface Conversation {
  id: string;
  title: string;
  messages: OptimusMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ConversationState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  
  // Messages
  messages: OptimusMessage[];
  
  // Agent
  agentState: AgentState;
  agentName: string;
  
  // Tool calls
  toolCalls: ToolCall[];
  
  // UI State
  isStreaming: boolean;
  isAgentThinking: boolean;
  
  // Actions - Conversations
  createConversation: (title?: string) => Conversation;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  getActiveConversation: () => Conversation | null;
  
  // Actions - Messages
  addMessage: (message: Omit<OptimusMessage, 'id' | 'timestamp'>) => OptimusMessage;
  updateMessage: (id: string, updates: Partial<OptimusMessage>) => void;
  clearMessages: () => void;
  
  // Actions - Agent
  setAgentState: (state: AgentState) => void;
  setAgentName: (name: string) => void;
  
  // Actions - Tool Calls
  startToolCall: (toolCall: Omit<ToolCall, 'startedAt'>) => void;
  completeToolCall: (id: string, result?: unknown) => void;
  failToolCall: (id: string, error: string) => void;
  clearToolCalls: () => void;
  
  // Actions - UI
  setIsStreaming: (streaming: boolean) => void;
  setIsAgentThinking: (thinking: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  agentState: 'idle' as AgentState,
  agentName: 'OPTIMUS',
  toolCalls: [],
  isStreaming: false,
  isAgentThinking: false,
};

export const useOptimusConversationStore = create<ConversationState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Conversations
      createConversation: (title) => {
        const id = `conv_${Date.now()}`;
        const conversation: Conversation = {
          id,
          title: title || `Conversation ${new Date().toLocaleString()}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          conversations: [...state.conversations, conversation],
          activeConversationId: id,
          messages: [],
        }));
        
        return conversation;
      },
      
      deleteConversation: (id) => {
        set((state) => {
          const conversations = state.conversations.filter((c) => c.id !== id);
          let activeConversationId = state.activeConversationId;
          
          if (activeConversationId === id) {
            activeConversationId = conversations[0]?.id || null;
          }
          
          return { conversations, activeConversationId };
        });
      },
      
      setActiveConversation: (id) => {
        set({ activeConversationId: id, messages: [] });
      },
      
      getActiveConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.activeConversationId) || null;
      },
      
      // Messages
      addMessage: (message) => {
        const fullMessage: OptimusMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          messages: [...state.messages, fullMessage],
        }));
        
        return fullMessage;
      },
      
      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },
      
      clearMessages: () => {
        set({ messages: [] });
      },
      
      // Agent
      setAgentState: (state) => {
        set({ agentState: state });
      },
      
      setAgentName: (name) => {
        set({ agentName: name });
      },
      
      // Tool Calls
      startToolCall: (toolCall) => {
        const fullToolCall: ToolCall = {
          ...toolCall,
          startedAt: Date.now(),
        };
        
        set((state) => ({
          toolCalls: [...state.toolCalls, fullToolCall],
        }));
      },
      
      completeToolCall: (id, result) => {
        set((state) => ({
          toolCalls: state.toolCalls.map((tc) =>
            tc.id === id
              ? { ...tc, status: 'completed', result, finishedAt: Date.now() }
              : tc
          ),
        }));
      },
      
      failToolCall: (id, error) => {
        set((state) => ({
          toolCalls: state.toolCalls.map((tc) =>
            tc.id === id
              ? { ...tc, status: 'failed', error, finishedAt: Date.now() }
              : tc
          ),
        }));
      },
      
      clearToolCalls: () => {
        set({ toolCalls: [] });
      },
      
      // UI
      setIsStreaming: (streaming) => {
        set({ isStreaming: streaming });
      },
      
      setIsAgentThinking: (thinking) => {
        set({ isAgentThinking: thinking });
      },
      
      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    { name: 'optimus-conversation-store' }
  )
);

// Selector helpers
export const selectActiveConversation = (state: ConversationState) =>
  state.conversations.find((c) => c.id === state.activeConversationId);

export const selectIsAgentRunning = (state: ConversationState) =>
  state.agentState === 'running' || state.agentState === 'loading';

export const selectPendingToolCalls = (state: ConversationState) =>
  state.toolCalls.filter((tc) => tc.status === 'pending' || tc.status === 'running');
