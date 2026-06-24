import { useState, useCallback } from "react";
import { Message, chatWithAgent } from "@/services/api";

const INITIAL_GREETING: Message = {
  role: "assistant",
  content: `### Senior Electroplating Engineer Console
Welcome back to the factory floor. I am tracking your bath telemetry and part configurations.

You can ask me about:
*   **Defect Diagnostics:** Root cause, prevention, and troubleshooting for *burning*, *pitting*, *peeling*, or *dull finishes*.
*   **Process Mathematics:** How Faraday's Law calculates plating times for different metals.
*   **Purification Workflows:** How to run *Hull Cell tests*, low current density *dummying*, or *carbon purification*.

*What component or bath parameters are we reviewing today?*`
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, context?: Record<string, any>) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content };
    
    // Add user message to history
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Build request payload with current messages history + user message
      const history = [...messages, userMessage];
      const payload = {
        messages: history,
        context
      };

      const result = await chatWithAgent(payload);

      if (result.success && result.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.response }
        ]);
      } else {
        setError(result.error || "Failed to retrieve response from engineer.");
      }
    } catch (err: any) {
      setError(err.message || "Network error communicating with AI agent.");
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_GREETING]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat
  };
}
