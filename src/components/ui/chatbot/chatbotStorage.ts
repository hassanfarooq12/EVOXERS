/**
 * LocalStorage utilities for chatbot persistence
 * Handles chat history and lead information storage
 */

import { ChatMessage, LeadInfo } from "./chatbotTypes";

const CHAT_HISTORY_KEY = "evoxers_chat_history";
const LEAD_INFO_KEY = "evoxers_lead_info";

/**
 * Load chat history from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }
    const stored = window.localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ChatMessage[];
    // Validate structure
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (msg) =>
          msg &&
          typeof msg.id === "string" &&
          typeof msg.role === "string" &&
          typeof msg.content === "string" &&
          typeof msg.createdAt === "number"
      );
    }
    return [];
  } catch (error) {
    console.warn("Failed to load chat history:", error);
    return [];
  }
}

/**
 * Save chat history to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    // Keep only last 50 messages to avoid storage bloat
    const toSave = messages.slice(-50);
    window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.warn("Failed to save chat history:", error);
  }
}

/**
 * Load lead information from localStorage
 */
export function loadLeadInfo(): LeadInfo | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    const stored = window.localStorage.getItem(LEAD_INFO_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as LeadInfo;
    // Validate structure
    if (parsed && typeof parsed.createdAt === "number") {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Failed to load lead info:", error);
    return null;
  }
}

/**
 * Save lead information to localStorage
 */
export function saveLeadInfo(lead: LeadInfo): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(LEAD_INFO_KEY, JSON.stringify(lead));
  } catch (error) {
    console.warn("Failed to save lead info:", error);
  }
}

/**
 * Clear all chatbot data from localStorage
 */
export function clearChatbotData(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(CHAT_HISTORY_KEY);
    window.localStorage.removeItem(LEAD_INFO_KEY);
  } catch (error) {
    console.warn("Failed to clear chatbot data:", error);
  }
}




