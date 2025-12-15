# EVOXERS AI Chatbot Documentation

## Overview

The EVOXERS AI Chatbot is a premium, futuristic, multilingual chatbot widget that runs entirely in the browser. It uses WebLLM for AI inference, requires no backend, and provides a seamless user experience for lead generation and customer support.

## Features

- ✅ **100% Front-end**: No backend or API keys required
- ✅ **Browser-based AI**: Uses WebLLM for local inference
- ✅ **Multilingual**: Auto-detects and responds in user's language
- ✅ **Lead Capture**: Automatically collects name, email, and project details
- ✅ **Persistent Storage**: Chat history saved in localStorage
- ✅ **Lazy Loading**: AI model loads only when user opens the chatbot
- ✅ **Brand-matched Design**: Matches EVOXERS futuristic aesthetic

## Architecture

### File Structure

```
src/components/ui/chatbot/
├── ChatbotWidget.tsx      # Main UI component
├── useChatbotAI.ts        # AI hook with WebLLM integration
├── chatbotTypes.ts        # TypeScript type definitions
├── chatbotStorage.ts      # localStorage utilities
└── chatbot.css           # Styling (EVOXERS brand colors)
```

### Key Components

1. **ChatbotWidget.tsx**: The main component that renders the floating button and chat panel
2. **useChatbotAI.ts**: Custom hook managing AI model initialization and message handling
3. **chatbotStorage.ts**: Utilities for persisting chat history and lead information
4. **chatbotTypes.ts**: TypeScript interfaces for type safety

## Configuration

### System Prompt

The AI personality is defined in `useChatbotAI.ts`. To modify the chatbot's tone or behavior, edit the `SYSTEM_PROMPT` constant:

```typescript
const SYSTEM_PROMPT = `You are Evoxers AI Assistant...`;
```

**Location**: `src/components/ui/chatbot/useChatbotAI.ts` (line ~15)

### Brand Colors

Chatbot colors are defined in `chatbot.css` using CSS variables:

```css
:root {
  --evoxers-blue: #00B8F5;
  --evoxers-red: #FF3C3C;
  --evoxers-black: #0E0E0E;
  --evoxers-violet: #7B61FF;
}
```

**Location**: `src/components/ui/chatbot/chatbot.css` (lines 6-11)

### Lead Capture Logic

Lead capture is triggered when:
1. User mentions project-related keywords (project, quote, pricing, hire, etc.)
2. After 5+ user messages in the same session

To modify this behavior, edit the `detectProjectInterest` function in `useChatbotAI.ts`:

```typescript
const detectProjectInterest = useCallback((text: string): boolean => {
  const keywords = [
    "project",
    "quote",
    // Add or remove keywords here
  ];
  // ...
}, []);
```

**Location**: `src/components/ui/chatbot/useChatbotAI.ts` (line ~120)

### Disable Lead Capture

To disable lead capture entirely, comment out or remove the lead detection logic in `useChatbotAI.ts`:

```typescript
// Comment out this section in sendMessage function:
// const shouldPromptForLead = ...
```

## AI Model Configuration

### WebLLM Setup

The chatbot uses `@mlc-ai/web-llm` for browser-based inference. The model is configured in `useChatbotAI.ts`:

```typescript
const engine = await CreateWebLLM({
  model: "Qwen/Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
});
```

**Available Models**:
- `Qwen/Qwen2.5-0.5B-Instruct-q4f16_1-MLC` (default, small, fast)
- `Qwen/Qwen2.5-1.5B-Instruct-q4f16_1-MLC` (larger, better quality)
- `TinyLlama/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC` (alternative)

**Location**: `src/components/ui/chatbot/useChatbotAI.ts` (line ~60)

### Fallback Mode

If WebLLM fails to load, the chatbot automatically falls back to a rule-based response system. This ensures the chatbot always works, even if the AI model can't be loaded.

## Styling Customization

### Avatar/Icon

To change the bot avatar, modify the icon in `ChatbotWidget.tsx`:

```typescript
<Bot size={16} />  // Change to any lucide-react icon
```

**Location**: `src/components/ui/chatbot/ChatbotWidget.tsx` (multiple locations)

### Panel Size

Adjust panel dimensions in `chatbot.css`:

```css
.chatbot-panel {
  width: 420px;      /* Desktop width */
  height: 600px;     /* Desktop height */
}
```

**Location**: `src/components/ui/chatbot/chatbot.css` (line ~120)

### Button Position

Change floating button position:

```css
.chatbot-button {
  bottom: 24px;      /* Distance from bottom */
  right: 24px;       /* Distance from right */
}
```

**Location**: `src/components/ui/chatbot/chatbot.css` (line ~18)

## Language Detection

The chatbot auto-detects language from user messages using simple heuristics:

- **Arabic/Urdu**: Detects Arabic script characters
- **Spanish**: Detects keywords like "hola", "gracias"
- **French**: Detects keywords like "bonjour", "merci"
- **English**: Default fallback

To improve detection, modify the `detectLanguage` function in `useChatbotAI.ts`.

## Storage

### Chat History

- **Storage Key**: `evoxers_chat_history`
- **Max Messages**: Last 50 messages (to prevent storage bloat)
- **Location**: Browser localStorage

### Lead Information

- **Storage Key**: `evoxers_lead_info`
- **Data**: Name, email, project details, timestamp
- **Location**: Browser localStorage

### Clear Data

To clear all chatbot data:

```typescript
import { clearChatbotData } from "./components/ui/chatbot/chatbotStorage";
clearChatbotData();
```

## Performance

### Lazy Loading

The AI model is loaded only when:
1. User clicks the floating button for the first time
2. User opens the chat panel

This ensures the main site load is not affected.

### Model Size

The default model (`Qwen2.5-0.5B`) is approximately:
- **Size**: ~300MB (downloaded on first use)
- **Load Time**: 10-30 seconds (depending on connection)
- **Memory**: ~500MB RAM during inference

### Optimization Tips

1. **Use smaller models** for faster loading
2. **Enable WebGPU** for better performance (automatic if available)
3. **Limit chat history** to reduce memory usage (already limited to 50 messages)

## Troubleshooting

### Model Fails to Load

**Symptom**: Error message "Our AI core is powering up slower than expected"

**Solutions**:
1. Check browser console for detailed errors
2. Ensure WebGPU or WebAssembly is supported
3. Check network connection (model downloads from CDN)
4. Try a different model (smaller = faster)

### Chat History Not Persisting

**Symptom**: Messages disappear on refresh

**Solutions**:
1. Check if localStorage is enabled in browser
2. Check browser console for storage errors
3. Verify `chatbotStorage.ts` is handling errors correctly

### Styling Issues

**Symptom**: Chatbot doesn't match brand colors

**Solutions**:
1. Verify CSS variables in `chatbot.css`
2. Check for CSS conflicts with main site styles
3. Ensure `chatbot.css` is imported in `ChatbotWidget.tsx`

## Integration

The chatbot is integrated into `App.tsx` at the root level:

```typescript
import { ChatbotWidget } from "./components/ui/chatbot/ChatbotWidget";

// In JSX:
<ChatbotWidget />
```

This ensures it appears on all pages with fixed positioning.

## Browser Compatibility

### Required Features

- **WebAssembly** (WASM) - Required for model execution
- **WebGPU** (optional) - Faster inference if available
- **localStorage** - Required for chat persistence
- **ES2020+** - Modern JavaScript features

### Supported Browsers

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 15+ (may have WebGPU limitations)
- ⚠️ Mobile browsers (may be slower due to model size)

## Development

### Running Locally

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

The chatbot will be included in the production build automatically.

### Testing

1. Open the site in a browser
2. Click the floating button (bottom-right)
3. Wait for model to load (first time only)
4. Send a test message
5. Verify response and lead capture

## Future Enhancements

Potential improvements:

1. **Streaming Responses**: Show tokens as they're generated
2. **Voice Input**: Speech-to-text integration
3. **CRM Integration**: Send leads to external systems
4. **Analytics**: Track conversation metrics
5. **Custom Models**: Train on EVOXERS-specific data

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Check WebLLM documentation: https://mlc.ai/web-llm/

---

**Be the Future. Be an EVOXER.** 🚀




