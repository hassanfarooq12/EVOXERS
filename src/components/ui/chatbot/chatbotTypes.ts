/**
 * Type definitions for the EVOXERS chatbot
 */

export type ChatRole = "user" | "assistant" | "system";

export type FunnelMode = 
  | "idle" 
  | "salesAudit" 
  | "websiteConcept" 
  | "marketingFunnel" 
  | "conversionStrategy" 
  | "brandSocial" 
  | "freeAsk";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export interface LeadInfo {
  name?: string;
  email?: string;
  businessOrBrand?: string;
  notes?: string;
  createdAt: number;
}

export interface GuidedOption {
  key: string;
  title: string;
  description: string;
  mode: FunnelMode;
  icon?: string;
}

export interface FunnelState {
  mode: FunnelMode;
  questionsAsked: string[];
  answers: Record<string, string>;
  currentQuestionIndex: number;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  isModelReady: boolean;
  error: string | null;
  leadInfo: LeadInfo | null;
  funnelState: FunnelState;
}

