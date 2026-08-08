/**
 * OPTIMUS Chat Interface
 * 
 * Modern chat interface for agent interaction, inspired by OpenHands.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useOptimusConversationStore, selectIsAgentRunning, selectPendingToolCalls } from "#/stores/optimus/conversation-store";
import { eventBridge } from "#/services/optimus/event-bridge";
import type { OptimusMessage } from "#/types/optimus";
import { cn } from "#/utils/utils";

export function OptimusChatInterface() {
  const messages = useOptimusConversationStore((state) => state.messages);
  const addMessage = useOptimusConversationStore((state) => state.addMessage);
  const isAgentRunning = useOptimusConversationStore(selectIsAgentRunning);
  const pendingToolCalls = useOptimusConversationStore(selectPendingToolCalls);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    
    // Add user message
    addMessage({
      role: "user",
      content: userMessage,
    });
    
    // Emit agent thinking event
    eventBridge.emit("agent:thinking", { thought: userMessage });
    
    // Simulate agent response
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: getSimulatedResponse(userMessage),
        agentName: "OPTIMUS",
      });
      
      eventBridge.emit("agent:done", {});
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  }, [inputValue, isLoading, addMessage]);
  
  // Handle keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  return (
    <div className="optimus-chat-interface" ref={containerRef}>
      {/* Messages */}
      <div className="optimus-chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* Tool Calls */}
        {pendingToolCalls.map((toolCall) => (
          <ToolCallCard key={toolCall.id} toolCall={toolCall} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="optimus-chat-input-container">
        <textarea
          ref={inputRef}
          className="optimus-chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message to OPTIMUS..."
          rows={1}
          disabled={isAgentRunning}
        />
        <button
          className="optimus-chat-send"
          onClick={handleSend}
          disabled={!inputValue.trim() || isAgentRunning}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: OptimusMessage }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isTool = message.role === "tool";
  
  return (
    <div className={cn(
      "optimus-message",
      isUser && "optimus-message-user",
      isAssistant && "optimus-message-assistant",
      isTool && "optimus-message-tool"
    )}>
      {/* Avatar */}
      <div className="optimus-message-avatar">
        {isUser ? "👤" : isTool ? "🔧" : message.agentName || "🤖"}
      </div>
      
      {/* Content */}
      <div className="optimus-message-content">
        {message.isLoading ? (
          <LoadingDots />
        ) : (
          <div className="optimus-message-text">
            {formatMarkdown(message.content)}
          </div>
        )}
        
        {/* Timestamp */}
        <div className="optimus-message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// Tool Call Card
function ToolCallCard({ toolCall }: { toolCall: any }) {
  const isRunning = toolCall.status === "pending" || toolCall.status === "running";
  
  return (
    <div className="optimus-tool-card">
      <div className="optimus-tool-card-header">
        <span className="optimus-tool-icon">🔧</span>
        <span className="optimus-tool-name">{toolCall.toolName}</span>
        {isRunning && <LoadingDots size="small" />}
        {toolCall.status === "completed" && <span className="optimus-tool-status success">✓</span>}
        {toolCall.status === "failed" && <span className="optimus-tool-status error">✗</span>}
      </div>
      {toolCall.error && (
        <div className="optimus-tool-error">{toolCall.error}</div>
      )}
    </div>
  );
}

// Loading Indicator
function LoadingIndicator() {
  return (
    <div className="optimus-message optimus-message-assistant">
      <div className="optimus-message-avatar">🤖</div>
      <div className="optimus-message-content">
        <LoadingDots />
      </div>
    </div>
  );
}

// Loading Dots
function LoadingDots({ size = "normal" }: { size?: "small" | "normal" }) {
  return (
    <div className={cn("optimus-loading-dots", size === "small" && "small")}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

// Markdown formatter
function formatMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, i) => {
    // Code block
    if (part.startsWith("```")) {
      const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
      if (match) {
        return (
          <pre key={i} className="optimus-code-block">
            <code>{match[2]}</code>
          </pre>
        );
      }
    }
    
    // Process inline formatting
    const lines = part.split("\n").map((line, j) => {
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Italic
      line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
      // Inline code
      line = line.replace(/`([^`]+)`/g, "<code>$1</code>");
      // Headers
      line = line.replace(/^### (.+)$/gm, "<h4>$1</h4>");
      line = line.replace(/^## (.+)$/gm, "<h3>$1</h3>");
      line = line.replace(/^# (.+)$/gm, "<h2>$1</h2>");
      // Lists
      line = line.replace(/^- (.+)$/gm, "<li>$1</li>");
      // Links
      line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
      
      return line;
    });
    
    return (
      <div 
        key={i} 
        className="optimus-text-content"
        dangerouslySetInnerHTML={{ __html: lines.join("\n") }} 
      />
    );
  });
}

// Simulated responses
function getSimulatedResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! I'm **OPTIMUS**, your AI coding assistant. I can help you:\n\n- Write and edit code\n- Run terminal commands\n- Manage git operations\n- Debug issues\n- And more!\n\nWhat would you like to work on?";
  }
  
  if (lower.includes("help") || lower.includes("what can you do")) {
    return `I can help you with many tasks:

**File Operations**
- Read, create, and edit files
- Search for code patterns
- Navigate your project

**Terminal Commands**
- Run bash commands
- Install dependencies
- Build and test projects

**Git Operations**
- Check status and history
- Stage and commit changes
- Create branches

**Code Analysis**
- Understand your codebase
- Find and fix bugs
- Suggest improvements

Just tell me what you'd like to do!`;
  }
  
  if (lower.includes("build") || lower.includes("compile")) {
    return "I'll run the build command for you.\n\n```bash\nnpm run build\n```\n\nLet me execute this in the terminal.";
  }
  
  if (lower.includes("status") || lower.includes("git")) {
    return "Let me check the git status of your repository.\n\n```bash\ngit status\n```";
  }
  
  // Default response
  return `I understand you want to: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"\n\nI'm ready to help! Here's what I can do:\n\n- **Edit files**: Just tell me the path and content\n- **Run commands**: Describe what you want to accomplish\n- **Git operations**: Ask me to stage, commit, or check status\n- **Debug**: Share any error messages you're seeing\n\nWhat would you like to start with?`;
}
