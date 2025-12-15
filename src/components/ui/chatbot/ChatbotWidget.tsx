/**
 * EVOXERS Chatbot Widget Component
 * Premium, futuristic chatbot with floating button and chat panel
 * Features guided options and funnel-based sales flow
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Loader2, TrendingUp, Globe, Target, Zap, Palette, MessageCircle } from "lucide-react";
import { useChatbotAI, GUIDED_OPTIONS } from "./useChatbotAI";
import { ChatMessage, GuidedOption } from "./chatbotTypes";
import "./chatbot.css";

// Icon mapping for guided options
const OPTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  salesAudit: TrendingUp,
  websiteConcept: Globe,
  marketingFunnel: Target,
  conversionStrategy: Zap,
  brandSocial: Palette,
  freeAsk: MessageCircle,
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isModelReady,
    isInitializing,
    error,
    currentMode,
    sendMessage,
    initializeModel,
    selectOption,
    GUIDED_OPTIONS,
  } = useChatbotAI({
    onLeadCaptured: (lead) => {
      console.log("Lead captured:", lead);
    },
  });

  // Show tooltip after 10-15 seconds
  useEffect(() => {
    if (!hasInteracted && !isOpen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleToggle = async () => {
    if (!isOpen && !isModelReady && !isInitializing) {
      // Initialize model when opening for the first time
      await initializeModel();
    }
    setIsOpen(!isOpen);
    setHasInteracted(true);
    setShowTooltip(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message, "input");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionClick = async (option: GuidedOption) => {
    await selectOption(option.key);
  };

  // Show guided options as cards on first load (when only welcome message exists)
  const showOptionCards = isOpen && messages.length <= 1 && !isLoading;
  
  // Show guided options as chips after each assistant message (except when in active funnel)
  const showOptionChips = isOpen && 
    messages.length > 1 && 
    !isLoading && 
    currentMode === "idle" &&
    messages[messages.length - 1]?.role === "assistant";

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-button ${isOpen ? "chatbot-button-open" : ""}`}
        onClick={handleToggle}
        aria-label="Open Evoxers AI Assistant"
      >
        {isInitializing ? (
          <Loader2 className="chatbot-button-icon chatbot-button-icon-spin" />
        ) : (
          <Bot className="chatbot-button-icon" />
        )}
        {showTooltip && !isOpen && (
          <span className="chatbot-tooltip">Need help? Ask our AI assistant.</span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-header-icon">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="chatbot-header-title">Evoxers AI Assistant</h3>
                <p className="chatbot-header-subtitle">
                  Be the Future. Be an EVOXER.
                </p>
              </div>
            </div>
            <button
              className="chatbot-close-button"
              onClick={handleToggle}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((message: ChatMessage) => (
              <div
                key={message.id}
                className={`chatbot-message ${
                  message.role === "user" ? "chatbot-message-user" : "chatbot-message-bot"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="chatbot-message-avatar">
                    <Bot size={16} />
                  </div>
                )}
                <div className="chatbot-message-content">
                  <p>{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="chatbot-message chatbot-message-bot">
                <div className="chatbot-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="chatbot-message-content">
                  <div className="chatbot-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="chatbot-error">
                <p>{error}</p>
              </div>
            )}

            {/* Guided Options as Cards (Initial State) */}
            {showOptionCards && (
              <div className="chatbot-options-cards">
                <p className="chatbot-options-title">How can I help you today?</p>
                <div className="chatbot-options-grid">
                  {GUIDED_OPTIONS.map((option) => {
                    const IconComponent = OPTION_ICONS[option.key] || MessageCircle;
                    return (
                      <button
                        key={option.key}
                        className="chatbot-option-card"
                        onClick={() => handleOptionClick(option)}
                        disabled={isLoading || !isModelReady}
                      >
                        <div className="chatbot-option-card-icon">
                          <IconComponent size={24} />
                        </div>
                        <div className="chatbot-option-card-content">
                          <h4 className="chatbot-option-card-title">{option.title}</h4>
                          <p className="chatbot-option-card-description">{option.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guided Options as Chips (During Conversation) */}
            {showOptionChips && (
              <div className="chatbot-options-chips">
                <p className="chatbot-options-chips-title">Or choose a direction:</p>
                <div className="chatbot-options-chips-container">
                  {GUIDED_OPTIONS.map((option) => {
                    const IconComponent = OPTION_ICONS[option.key] || MessageCircle;
                    return (
                      <button
                        key={option.key}
                        className="chatbot-option-chip"
                        onClick={() => handleOptionClick(option)}
                        disabled={isLoading || !isModelReady}
                      >
                        <IconComponent size={14} />
                        <span>{option.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={isLoading || !isModelReady}
            />
            <button
              className="chatbot-send-button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || !isModelReady}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 size={18} className="chatbot-send-icon-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
