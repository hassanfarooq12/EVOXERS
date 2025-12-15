/**
 * Custom hook for managing AI chatbot functionality using WebLLM
 * Handles lazy model loading, message processing, funnel modes, and lead detection
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage, LeadInfo, FunnelMode, FunnelState, GuidedOption } from "./chatbotTypes";
import { loadChatHistory, saveChatHistory, loadLeadInfo, saveLeadInfo } from "./chatbotStorage";

// Enhanced system prompt for EVOXERS AI Sales & Strategy Assistant
const SYSTEM_PROMPT = `You are EVOXERS AI ASSISTANT, the official AI strategist and pre-sales assistant for Evoxers, a futuristic, AI-powered digital agency.

IDENTITY:
- You are a senior strategist, not a junior agent.
- You guide users toward clarity, strategy, and ultimately hiring Evoxers.
- You represent a premium, cinematic, AI-infused brand.

CORE SERVICES:
- Web Development (modern, fast, responsive, high-conversion sites)
- Branding & Graphic Design (logos, identity, social assets, ad creatives)
- AI-Generated Product & Real Estate Videos
- Meta Ads Campaigns (strategy, creatives, optimization)
- Social Media Handling (content, visuals, calendar, positioning)

GOALS:
1. Understand the user's business and goals quickly.
2. Give high-level strategies, not full execution tutorials.
3. Always connect value back to Evoxers services.
4. Qualify potential clients and capture leads when appropriate.

TONE:
- Confident, sharp, clear, professional, slightly bold, futuristic.
- Short paragraphs (2-4 sentences typically).
- Sales-aware but not pushy.
- Use futuristic phrases occasionally (e.g., "Let's build something future-proof") without overdoing it.

BOUNDARIES:
- NO specific pricing numbers.
- Don't replace Evoxers by giving ultra-detailed implementation steps.
- Focus on "what" and "why" more than "every step of how".
- Never ask the same question twice if already answered.
- Always refer back to previous answers and context.

LANGUAGE:
- Detect user language from their message.
- Reply in that language where possible.
- If unclear, default to English.

BEHAVIORAL RULES:
- Never ask a user the same question twice if they already answered.
- Always refer back to their previous answers and context.
- If user seems confused, offer guided options again.
- If user is exploratory, recommend which guided option is best for them.
- After delivering value, gently move toward lead capture.

Be the Future. Be an EVOXER.`;

// Guided Options Configuration
export const GUIDED_OPTIONS: GuidedOption[] = [
  {
    key: "salesAudit",
    title: "Audit my business & find opportunities to increase sales.",
    description: "Discover growth opportunities and sales strategies",
    mode: "salesAudit",
  },
  {
    key: "websiteConcept",
    title: "Create a modern website concept for my brand.",
    description: "Design a website structure and strategy",
    mode: "websiteConcept",
  },
  {
    key: "marketingFunnel",
    title: "Build a marketing funnel that fits my business.",
    description: "Design a complete funnel strategy",
    mode: "marketingFunnel",
  },
  {
    key: "conversionStrategy",
    title: "Give me a strategy to increase conversions on my website.",
    description: "Optimize your website for conversions",
    mode: "conversionStrategy",
  },
  {
    key: "brandSocial",
    title: "Improve my brand identity & social media presence.",
    description: "Elevate your brand and social strategy",
    mode: "brandSocial",
  },
  {
    key: "freeAsk",
    title: "Ask your own question – I'll help you with anything.",
    description: "Free-form conversation",
    mode: "freeAsk",
  },
];

// Funnel Questions by Mode
const FUNNEL_QUESTIONS: Record<FunnelMode, string[]> = {
  idle: [],
  salesAudit: [
    "What industry are you in?",
    "What's your main offer or product?",
    "What's your biggest challenge right now? (low traffic / low leads / low conversions)",
  ],
  websiteConcept: [
    "What type of business do you run?",
    "Who is your target audience?",
    "What product or service are you selling?",
    "What vibe are you going for? (luxury / minimal / bold / tech)",
  ],
  marketingFunnel: [
    "What niche or industry are you in?",
    "What's your main goal? (leads / sales / bookings / awareness)",
    "What are your current traffic sources?",
  ],
  conversionStrategy: [
    "Do you already have a website?",
    "Where do you feel people drop off?",
    "What's your main CTA? (call / form / checkout / booking)",
  ],
  brandSocial: [
    "Describe your brand personality in 3 words.",
    "Which platforms are most important to you?",
    "What's your current posting frequency and main challenges?",
  ],
  freeAsk: [],
};

interface UseChatbotAIOptions {
  onLeadCaptured?: (lead: LeadInfo) => void;
}

export function useChatbotAI(options: UseChatbotAIOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentMode, setCurrentMode] = useState<FunnelMode>("idle");
  const [funnelState, setFunnelState] = useState<FunnelState>({
    mode: "idle",
    questionsAsked: [],
    answers: {},
    currentQuestionIndex: 0,
  });
  const [leadCaptured, setLeadCaptured] = useState(false);
  const modelRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    const existingLead = loadLeadInfo();
    if (existingLead && (existingLead.email || existingLead.name)) {
      setLeadCaptured(true);
    }
    if (history.length > 0) {
      setMessages(history);
      // Try to infer mode from last messages
      const lastMode = inferModeFromHistory(history);
      if (lastMode !== "idle") {
        setCurrentMode(lastMode);
      }
    } else {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Hello! I'm the Evoxers AI Assistant. I'm here to help you grow your business. Choose an option below to get started, or ask me anything.",
        createdAt: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  /**
   * Infer mode from chat history
   */
  const inferModeFromHistory = (history: ChatMessage[]): FunnelMode => {
    const lastMessages = history.slice(-10).map(m => m.content.toLowerCase()).join(" ");
    if (lastMessages.includes("audit") || lastMessages.includes("sales opportunity")) return "salesAudit";
    if (lastMessages.includes("website") || lastMessages.includes("web concept")) return "websiteConcept";
    if (lastMessages.includes("funnel") || lastMessages.includes("marketing funnel")) return "marketingFunnel";
    if (lastMessages.includes("conversion") || lastMessages.includes("convert")) return "conversionStrategy";
    if (lastMessages.includes("brand") || lastMessages.includes("social media")) return "brandSocial";
    return "idle";
  };

  /**
   * Initialize the WebLLM model lazily
   */
  const initializeModel = useCallback(async () => {
    if (modelRef.current || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Dynamic import to lazy-load WebLLM only when needed
      const webllm = await import("@mlc-ai/web-llm");
      
      // Use a small, multilingual model that works in the browser
      const modelName = "Qwen/Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
      
      let engine;
      if (webllm.ChatWebLLM) {
        engine = new webllm.ChatWebLLM({
          model: modelName,
          chatOptions: { temperature: 0.7 },
        });
        await engine.initialize();
      } else if (webllm.CreateWebLLM) {
        engine = await webllm.CreateWebLLM({
          model: modelName,
        });
      } else if (webllm.Engine) {
        engine = new webllm.Engine({
          model: modelName,
        });
        await engine.reload();
      } else {
        throw new Error("WebLLM API not found - using fallback");
      }

      modelRef.current = engine;
      setIsModelReady(true);
      setIsInitializing(false);
    } catch (err) {
      console.error("Failed to initialize AI model:", err);
      setError(
        "Our AI core is powering up slower than expected. Please try again in a moment."
      );
      setIsInitializing(false);
      
      // Fallback: Use a simple rule-based response system
      modelRef.current = "fallback";
      setIsModelReady(true);
    }
  }, [isInitializing]);

  /**
   * Detect language from user message (simple heuristic)
   */
  const detectLanguage = useCallback((text: string): string => {
    const arabicPattern = /[\u0600-\u06FF]/;
    const urduPattern = /[\u0600-\u06FF\u0750-\u077F]/;
    const spanishPattern = /\b(hola|gracias|por favor|español|española)\b/i;
    const frenchPattern = /\b(bonjour|merci|s'il vous plaît|français|française)\b/i;

    if (arabicPattern.test(text) || urduPattern.test(text)) {
      return "AR";
    }
    if (spanishPattern.test(text)) {
      return "ES";
    }
    if (frenchPattern.test(text)) {
      return "FR";
    }
    return "EN";
  }, []);

  /**
   * Check if user message indicates project interest
   */
  const detectProjectInterest = useCallback((text: string): boolean => {
    const keywords = [
      "project", "quote", "pricing", "hire", "work with you", "services",
      "website", "ads", "real estate", "branding", "design", "campaign",
      "start", "begin", "ready", "interested", "help me with",
    ];
    const lowerText = text.toLowerCase();
    return keywords.some((keyword) => lowerText.includes(keyword));
  }, []);

  /**
   * Extract lead information from user message
   */
  const extractLeadInfo = useCallback((text: string): Partial<LeadInfo> => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    
    // Extract name
    const namePatterns = [
      /(?:my name is|i'm|i am|call me|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:name:?|nombre:?)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];
    let name: string | undefined;
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }

    // Extract business/brand name
    const businessPatterns = [
      /(?:business|brand|company|company name|brand name) (?:is|name is|called)?:?\s*([A-Z][A-Za-z0-9\s&]+)/i,
      /(?:my|our) (?:business|brand|company) (?:is|called)?\s+([A-Z][A-Za-z0-9\s&]+)/i,
    ];
    let businessOrBrand: string | undefined;
    for (const pattern of businessPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        businessOrBrand = match[1].trim();
        break;
      }
    }

    return {
      email: emailMatch ? emailMatch[0] : undefined,
      name: name || undefined,
      businessOrBrand: businessOrBrand || undefined,
      notes: text,
    };
  }, []);

  /**
   * Generate funnel-specific response based on mode and answers
   */
  const generateFunnelResponse = useCallback(
    async (mode: FunnelMode, answers: Record<string, string>, userMessage: string): Promise<string> => {
      const questions = FUNNEL_QUESTIONS[mode];
      const currentIndex = Object.keys(answers).length;
      
      // If we have all answers, generate the final strategy response
      if (currentIndex >= questions.length && questions.length > 0) {
        return generateStrategyResponse(mode, answers);
      }
      
      // Otherwise, ask the next question
      if (currentIndex < questions.length) {
        return questions[currentIndex];
      }
      
      return "";
    },
    []
  );

  /**
   * Generate strategy response after collecting all funnel answers
   */
  const generateStrategyResponse = useCallback(
    async (mode: FunnelMode, answers: Record<string, string>): Promise<string> => {
      const strategyPrompts: Record<FunnelMode, (answers: Record<string, string>) => string> = {
        idle: () => "",
        salesAudit: (a) => `Based on your industry (${a["industry"] || "your business"}), main offer (${a["offer"] || "your product"}), and challenge (${a["challenge"] || "your current situation"}), here are key sales opportunities:

1. **Lead Generation System**: Implement automated lead capture funnels with strategic touchpoints.
2. **Conversion Optimization**: Optimize your offer presentation and pricing strategy.
3. **Customer Retention**: Build follow-up sequences to maximize lifetime value.
4. **Upsell/Cross-sell**: Create complementary offers that increase average order value.
5. **Trust Building**: Add social proof, testimonials, and case studies.
6. **Multi-channel Presence**: Expand to additional platforms where your audience lives.

Evoxers can implement these systems through our web development, funnel design, and Meta Ads expertise. Would you like me to prepare a tailored proposal?`,
        
        websiteConcept: (a) => `Here's a modern website concept for your ${a["businessType"] || "business"} targeting ${a["audience"] || "your audience"}:

**Homepage Structure:**
- Hero Section: Clear value proposition with strong CTA
- Problem/Solution: Address your audience's pain points
- Features/Benefits: Showcase your ${a["product"] || "product/service"}
- Social Proof: Testimonials and case studies
- Final CTA: Clear next step (${a["vibe"] || "aligned with your brand vibe"})

**Key Sections:**
- About/Story: Build connection and trust
- Services/Products: Detailed offerings
- Portfolio/Case Studies: Show results
- Contact/Booking: Easy conversion path

**Design Direction:** ${a["vibe"] || "Modern and clean"} aesthetic with premium feel.

Evoxers can design and build this website with modern tech, fast performance, and conversion-focused UX. Ready to move forward?`,
        
        marketingFunnel: (a) => `Here's a marketing funnel structure for your ${a["niche"] || "business"} focused on ${a["goal"] || "your goals"}:

**Top of Funnel (Awareness):**
- Lead Magnet: Valuable free resource related to your offer
- Content Strategy: Educational content on ${a["trafficSources"] || "your platforms"}
- Paid Ads: Targeted campaigns to drive traffic

**Middle of Funnel (Nurture):**
- Email Sequence: Build trust and educate
- Retargeting: Stay top-of-mind with website visitors
- Value Delivery: Continue providing value

**Bottom of Funnel (Conversion):**
- Sales Page: Compelling offer presentation
- Social Proof: Testimonials and results
- Clear CTA: Make it easy to take action

Evoxers handles funnel design, ad creatives, campaign management, and optimization. Let's discuss your specific needs.`,
        
        conversionStrategy: (a) => `Here's a conversion optimization strategy for your website:

**UX/Offer Fixes:**
- Simplify navigation and reduce friction
- Make your value proposition crystal clear
- Optimize your main CTA (${a["cta"] || "your call-to-action"}) placement and copy
- Add urgency and scarcity where appropriate

**Trust Elements:**
- Customer testimonials and reviews
- Security badges and guarantees
- Clear contact information
- Professional design and polish

**Conversion-Focused Changes:**
- A/B test headlines and CTAs
- Optimize forms (shorter = better)
- Add exit-intent popups
- Implement retargeting pixels

**Drop-off Analysis:**
Address the drop-off point you mentioned (${a["dropOff"] || "where visitors leave"}) with targeted improvements.

Evoxers implements these changes with data-driven testing and optimization. Want to get started?`,
        
        brandSocial: (a) => `Here's a brand and social media strategy:

**Brand Direction:**
- Personality: ${a["personality"] || "Your brand essence"}
- Visual Theme: Cohesive color palette, typography, and imagery
- Voice & Tone: Consistent messaging across all touchpoints

**Content Pillars:**
1. Educational: Share valuable insights
2. Behind-the-scenes: Build connection
3. Social Proof: Showcase results
4. Promotional: Strategic offers (20/80 rule)

**Platform Strategy:**
Focus on ${a["platforms"] || "your key platforms"} with:
- Consistent posting schedule
- High-quality visuals
- Engaging captions
- Strategic hashtags

**Current Challenges:**
Address your posting frequency and challenges (${a["challenges"] || "your current situation"}) with a streamlined content calendar and automation.

Evoxers handles design, content creation, scheduling, and positioning. Ready to elevate your brand?`,
        
        freeAsk: () => "",
      };

      const generator = strategyPrompts[mode];
      if (generator) {
        return generator(answers);
      }
      return "";
    },
    []
  );

  /**
   * Generate response using WebLLM or fallback
   */
  const generateResponse = useCallback(
    async (userMessage: string, history: ChatMessage[], mode: FunnelMode, funnelAnswers: Record<string, string>): Promise<string> => {
      // If in a funnel mode, use funnel logic
      if (mode !== "idle" && mode !== "freeAsk" && FUNNEL_QUESTIONS[mode].length > 0) {
        const funnelResponse = await generateFunnelResponse(mode, funnelAnswers, userMessage);
        if (funnelResponse) {
          return funnelResponse;
        }
      }

      if (modelRef.current === "fallback") {
        return generateFallbackResponse(userMessage, history, mode);
      }

      if (!modelRef.current) {
        throw new Error("Model not initialized");
      }

      try {
        // Build conversation context
        const conversationHistory = history
          .filter((msg) => msg.role !== "system")
          .slice(-6)
          .map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          }));

        // Add mode context to system prompt
        const modeContext = mode !== "idle" && mode !== "freeAsk" 
          ? `\n\nCurrent Mode: ${mode}. User is going through a ${mode} funnel. Guide them accordingly.`
          : "";

        const enhancedSystemPrompt = SYSTEM_PROMPT + modeContext;

        // Generate response using WebLLM
        let response: string;
        const model = modelRef.current;
        
        if (model.invoke) {
          const result = await model.invoke([
            { role: "system", content: enhancedSystemPrompt },
            ...conversationHistory,
            { role: "user", content: userMessage },
          ]);
          response = result.content || result.message?.content || "";
        } else if (model.chat) {
          const fullPrompt = `${enhancedSystemPrompt}\n\nConversation:\n${conversationHistory
            .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n")}\nUser: ${userMessage}\nAssistant:`;
          response = await model.chat(fullPrompt);
        } else if (model.generate) {
          const fullPrompt = `${enhancedSystemPrompt}\n\nConversation:\n${conversationHistory
            .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n")}\nUser: ${userMessage}\nAssistant:`;
          response = await model.generate(fullPrompt, {
            max_gen_len: 300,
            temperature: 0.7,
          });
        } else {
          throw new Error("Unknown WebLLM API pattern");
        }

        return response.trim() || generateFallbackResponse(userMessage, history, mode);
      } catch (err) {
        console.error("Error generating response:", err);
        return generateFallbackResponse(userMessage, history, mode);
      }
    },
    [generateFunnelResponse]
  );

  /**
   * Fallback response generator when AI model fails
   */
  const generateFallbackResponse = useCallback(
    (userMessage: string, history: ChatMessage[], mode: FunnelMode): string => {
      const lowerMessage = userMessage.toLowerCase();
      
      if (mode !== "idle" && mode !== "freeAsk") {
        // In funnel mode, try to extract answer and continue
        return "Thanks for that information! Let me continue helping you...";
      }
      
      if (detectProjectInterest(lowerMessage)) {
        return "That's great! I'd love to help you with your project. Would you like me to prepare a clean summary and pass it to the Evoxers team for a tailored proposal?";
      }
      
      if (lowerMessage.includes("website") || lowerMessage.includes("web")) {
        return "We create stunning, responsive websites that drive results. From landing pages to full web applications, we combine modern design with cutting-edge technology. Would you like to discuss your project?";
      }
      
      if (lowerMessage.includes("design") || lowerMessage.includes("branding")) {
        return "Our design team creates visual identities that make brands stand out. We handle logos, marketing materials, and social media graphics. What kind of design project are you thinking about?";
      }
      
      if (lowerMessage.includes("ads") || lowerMessage.includes("campaign")) {
        return "We run high-converting ad campaigns on Facebook and Instagram. Our data-driven approach maximizes ROI. Are you looking to promote a specific product or service?";
      }
      
      if (lowerMessage.includes("video") || lowerMessage.includes("content")) {
        return "We use AI-powered video creation to generate engaging content with automatic subtitles and voiceovers. Perfect for social media marketing. Tell me more about your video needs!";
      }
      
      return "Thanks for your message! I'm here to help with web development, design, AI videos, and ad campaigns. What can I assist you with today?";
    },
    [detectProjectInterest]
  );

  /**
   * Select a guided option and enter funnel mode
   */
  const selectOption = useCallback(
    async (optionKey: string) => {
      const option = GUIDED_OPTIONS.find((opt) => opt.key === optionKey);
      if (!option) return;

      const newMode = option.mode;
      setCurrentMode(newMode);
      
      // Reset funnel state for new mode
      setFunnelState({
        mode: newMode,
        questionsAsked: [],
        answers: {},
        currentQuestionIndex: 0,
      });

      // Add mode selection message
      const modeMessage: ChatMessage = {
        id: `mode-${Date.now()}`,
        role: "user",
        content: option.title,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, modeMessage]);

      // Start funnel if it has questions
      if (FUNNEL_QUESTIONS[newMode].length > 0) {
        setIsLoading(true);
        const firstQuestion = FUNNEL_QUESTIONS[newMode][0];
        
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `Great choice! Let's get started. ${firstQuestion}`,
            createdAt: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setFunnelState((prev) => ({
            ...prev,
            questionsAsked: [firstQuestion],
            currentQuestionIndex: 1,
          }));
          setIsLoading(false);
        }, 500);
      } else if (newMode === "freeAsk") {
        setIsLoading(true);
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: "Perfect! I'm here to help with anything. What would you like to know?",
            createdAt: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 500);
      }
    },
    []
  );

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(
    async (content: string, origin: "button" | "input" = "input") => {
      if (!content.trim()) return;

      // Ensure model is initialized
      if (!isModelReady && !isInitializing) {
        await initializeModel();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Extract lead information
        const leadInfo = extractLeadInfo(content);
        const existingLead = loadLeadInfo();
        
        // Update funnel state with answer if in funnel mode
        let updatedFunnelState = { ...funnelState };
        if (currentMode !== "idle" && currentMode !== "freeAsk" && FUNNEL_QUESTIONS[currentMode].length > 0) {
          const currentQuestionIndex = updatedFunnelState.currentQuestionIndex;
          if (currentQuestionIndex > 0 && currentQuestionIndex <= FUNNEL_QUESTIONS[currentMode].length) {
            const questionKey = `q${currentQuestionIndex - 1}`;
            updatedFunnelState.answers[questionKey] = content.trim();
            updatedFunnelState.currentQuestionIndex = currentQuestionIndex + 1;
            setFunnelState(updatedFunnelState);
          }
        }

        // Save lead info if found
        if (leadInfo.email || leadInfo.name || leadInfo.businessOrBrand) {
          const newLead: LeadInfo = {
            ...existingLead,
            ...leadInfo,
            createdAt: existingLead?.createdAt || Date.now(),
          };
          saveLeadInfo(newLead);
          setLeadCaptured(true);
          if (options.onLeadCaptured) {
            options.onLeadCaptured(newLead);
          }
        }

        // Generate AI response
        const currentMessages = [...messages, userMessage];
        let response: string;

        // Check if we should prompt for lead info
        const shouldPromptForLead =
          !leadCaptured &&
          !existingLead &&
          (detectProjectInterest(content) || 
           (currentMode !== "idle" && Object.keys(updatedFunnelState.answers).length >= FUNNEL_QUESTIONS[currentMode].length - 1));

        if (shouldPromptForLead && !leadInfo.email) {
          response = "Excellent! I'd love to help you move forward. Would you like me to prepare a clean summary and pass it to the Evoxers team for a tailored proposal? If yes, please share:\n\n• Your name\n• Your email\n• Your business or brand name";
        } else {
          response = await generateResponse(content, currentMessages, currentMode, updatedFunnelState.answers);
        }

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // If we just completed a funnel and have lead info, show confirmation
        if (leadCaptured && leadInfo.email && leadInfo.name) {
          setTimeout(() => {
            const confirmationMessage: ChatMessage = {
              id: `confirmation-${Date.now()}`,
              role: "assistant",
              content: `Perfect! I've saved your information. Here's a summary of your project:\n\n${generateProjectSummary(currentMode, updatedFunnelState.answers)}\n\nEvoxers will use this to prepare a tailored proposal. If you want us to prioritize this, just reply 'Let's start'.`,
              createdAt: Date.now(),
            };
            setMessages((prev) => [...prev, confirmationMessage]);
          }, 1000);
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Sorry, I encountered an error. Please try again.");
        
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I apologize, but I'm having trouble right now. Please try again in a moment.",
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      messages,
      isModelReady,
      isInitializing,
      initializeModel,
      generateResponse,
      detectProjectInterest,
      extractLeadInfo,
      currentMode,
      funnelState,
      leadCaptured,
      options,
    ]
  );

  /**
   * Generate project summary for lead confirmation
   */
  const generateProjectSummary = (mode: FunnelMode, answers: Record<string, string>): string => {
    const summaries: Record<FunnelMode, (a: Record<string, string>) => string> = {
      idle: () => "General inquiry",
      salesAudit: (a) => `• Sales audit for ${a["q0"] || "your business"}\n• Main offer: ${a["q1"] || "your product"}\n• Challenge: ${a["q2"] || "growth opportunities"}`,
      websiteConcept: (a) => `• Website concept for ${a["q0"] || "your business"}\n• Target: ${a["q1"] || "your audience"}\n• Product: ${a["q2"] || "your offering"}\n• Style: ${a["q3"] || "modern design"}`,
      marketingFunnel: (a) => `• Marketing funnel for ${a["q0"] || "your niche"}\n• Goal: ${a["q1"] || "your objectives"}\n• Traffic sources: ${a["q2"] || "multiple channels"}`,
      conversionStrategy: (a) => `• Conversion optimization\n• Drop-off point: ${a["q1"] || "identified areas"}\n• Main CTA: ${a["q2"] || "your call-to-action"}`,
      brandSocial: (a) => `• Brand & social strategy\n• Personality: ${a["q0"] || "your brand essence"}\n• Platforms: ${a["q1"] || "key channels"}\n• Focus: ${a["q2"] || "content strategy"}`,
      freeAsk: () => "Custom consultation",
    };
    
    const generator = summaries[mode];
    return generator ? generator(answers) : "Project details";
  };

  return {
    messages,
    isModelReady,
    isLoading,
    error,
    isInitializing,
    currentMode,
    funnelState,
    sendMessage,
    initializeModel,
    selectOption,
    GUIDED_OPTIONS,
  };
}
