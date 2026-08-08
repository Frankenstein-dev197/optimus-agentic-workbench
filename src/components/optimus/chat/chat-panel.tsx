/**
 * OPTIMUS Chat Panel
 * 
 * Conversational interface for agent interaction.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useOptimusLayoutStore } from "../../../stores/optimus/layout-store";
import { chatService, type ChatMessage, type Conversation } from "../../../services/optimus/chat";
import { cn } from "../../../utils/utils";

export function OptimusChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const chatPanelHeight = useOptimusLayoutStore((state) => state.chatPanelHeight);
  const setChatPanelHeight = useOptimusLayoutStore((state) => state.setChatPanelHeight);
  
  // Load conversations on mount
  useEffect(() => {
    setConversations(chatService.getAllConversations());
    setActiveConversation(chatService.getActiveConversation());
    
    // Subscribe to events
    const unsubscribe = chatService.onEvent((event) => {
      setConversations(chatService.getAllConversations());
      if (event.type === 'message_received' || event.type === 'message_sent') {
        setActiveConversation(chatService.getActiveConversation());
        setIsLoading(false);
      }
    });
    
    return () => { unsubscribe(); };
  }, []);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);
  
  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    
    try {
      await chatService.sendMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);
  
  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  // New conversation
  const handleNewConversation = useCallback(() => {
    chatService.createConversation();
    setConversations(chatService.getAllConversations());
    setActiveConversation(chatService.getActiveConversation());
  }, []);
  
  // Switch conversation
  const handleSwitchConversation = useCallback((id: string) => {
    chatService.setActiveConversation(id);
    setActiveConversation(chatService.getActiveConversation());
  }, []);
  
  return (
    <div 
      className="optimus-chat"
      style={{ height: `${chatPanelHeight}%` }}
    >
      {/* Chat Header */}
      <div className="optimus-chat-header">
        <div className="optimus-chat-title">
          <span className="optimus-logo">⚡</span>
          OPTIMUS
        </div>
        <button 
          className="optimus-chat-new-btn"
          onClick={handleNewConversation}
          title="New Conversation"
        >
          +
        </button>
      </div>
      
      {/* Chat Body */}
      <div className="optimus-chat-body">
        {/* Messages */}
        <div className="optimus-chat-messages">
          {activeConversation?.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="optimus-chat-loading">
              <div className="optimus-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Chat Input */}
      <div className="optimus-chat-input-area">
        <textarea
          ref={inputRef}
          className="optimus-chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask OPTIMUS to help you build software..."
          rows={1}
        />
        <button 
          className="optimus-chat-send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isLoading = message.isLoading;
  
  if (isSystem) {
    return (
      <div className="optimus-chat-message optimus-chat-message-system">
        <div className="optimus-message-content optimus-message-markdown">
          {formatMarkdown(message.content)}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "optimus-chat-message",
      isUser ? "optimus-chat-message-user" : "optimus-chat-message-assistant"
    )}>
      {!isUser && (
        <div className="optimus-message-avatar">
          {message.agentName || "OPTIMUS"}
        </div>
      )}
      <div className="optimus-message-content">
        {isLoading ? (
          <div className="optimus-loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <div className="optimus-message-markdown">
            {formatMarkdown(message.content)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="optimus-message-avatar">👤</div>
      )}
    </div>
  );
}

// Simple markdown formatting
function formatMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    // Code block
    if (part.startsWith("```")) {
      const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
      if (match) {
        return (
          <pre key={index} className="optimus-code-block">
            <code>{match[2]}</code>
          </pre>
        );
      }
    }
    
    // Regular text with formatting
    const formatted = part
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Inline code
        line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Headers
        line = line.replace(/^### (.+)$/g, '<h4>$1</h4>');
        line = line.replace(/^## (.+)$/g, '<h3>$1</h3>');
        line = line.replace(/^# (.+)$/g, '<h2>$1</h2>');
        // List items
        line = line.replace(/^- (.+)$/g, '<li>$1</li>');
        
        return line;
      })
      .join('\n');
    
    return (
      <div 
        key={index} 
        dangerouslySetInnerHTML={{ __html: formatted }} 
      />
    );
  });
}
