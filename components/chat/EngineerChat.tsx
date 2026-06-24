"use client"

import React, { useState, useRef, useEffect } from "react"
import { useChat } from "@/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { MessageSquare, Send, Sparkles, User, RefreshCw, Trash2 } from "lucide-react"

// A simple client-side parser to render basic markdown structures beautifully without adding dependencies
function parseMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    // 1. Headings (###)
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="text-base font-bold text-white mt-4 mb-2 border-b border-gray-800 pb-1">
          {line.replace("### ", "")}
        </h3>
      )
    }
    if (line.startsWith("#### ")) {
      return (
        <h4 key={i} className="text-sm font-bold text-blue-400 mt-3 mb-1 uppercase tracking-wider">
          {line.replace("#### ", "")}
        </h4>
      )
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="text-sm text-gray-300 font-bold mt-2">
          {line.replace(/\*\*/g, "")}
        </p>
      )
    }

    // 2. Bullet list items (* or -)
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const content = line.trim().replace(/^[\*\-]\s+/, "")
      return (
        <li key={i} className="text-sm text-gray-300 ml-4 list-disc mt-1 leading-relaxed">
          {formatInlineMarkup(content)}
        </li>
      )
    }

    // 3. Numbered list items (e.g. 1.)
    if (/^\d+\.\s+/.test(line.trim())) {
      const content = line.trim().replace(/^\d+\.\s+/, "")
      const match = line.trim().match(/^(\d+)\.\s+/)
      const index = match ? match[1] : "1"
      return (
        <div key={i} className="text-sm text-gray-300 flex items-start gap-2 mt-2 leading-relaxed">
          <span className="font-bold text-blue-400 shrink-0 font-mono">{index}.</span>
          <span>{formatInlineMarkup(content)}</span>
        </div>
      )
    }

    // Empty lines
    if (!line.trim()) {
      return <div key={i} className="h-2" />
    }

    // Standard paragraphs
    return (
      <p key={i} className="text-sm text-gray-300 mt-1.5 leading-relaxed">
        {formatInlineMarkup(line)}
      </p>
    )
  })
}

// Formatter to process bold text (**text**) and code tag blocks (`text`) within sentences
function formatInlineMarkup(text: string): React.ReactNode[] {
  // Regex to match bold tags and code blocks
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$\$.*?\$\$)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="bg-black/40 border border-gray-800 px-1.5 py-0.5 rounded font-mono text-xs text-blue-300">{part.slice(1, -1)}</code>
    }
    if (part.startsWith("$$") && part.endsWith("$$")) {
      return <span key={index} className="font-mono text-xs text-yellow-300 bg-yellow-500/5 px-2 py-1 rounded block my-2 text-center border border-yellow-500/10">{part.slice(2, -2)}</span>
    }
    return part
  })
}

const QUICK_CHIPS = [
  "How to fix burning on rims?",
  "What causes pitting in nickel baths?",
  "Tell me about the Hull Cell test.",
  "Peeling checklist for handlebars.",
  "Explain Faraday's plating equation."
]

interface EngineerChatProps {
  currentContext?: Record<string, any>;
}

export default function EngineerChat({ currentContext }: EngineerChatProps) {
  const { messages, loading, error, sendMessage, clearChat } = useChat()
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input, currentContext)
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChipClick = (chipText: string) => {
    sendMessage(chipText, currentContext)
  }

  return (
    <Card className="bg-[#151c2c] border-gray-800 text-white flex flex-col h-[650px] shadow-2xl relative overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-black/15 pb-3 border-b border-gray-800/60 flex flex-row justify-between items-center shrink-0">
        <div>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            AI Expert Terminal
          </CardTitle>
          <CardDescription className="text-gray-400">
            Consult the Senior Electroplating Engineer for custom bath remedies
          </CardDescription>
        </div>
        <button
          onClick={clearChat}
          title="Clear Conversation"
          className="p-2 rounded-lg bg-black/10 hover:bg-black/30 border border-gray-800 text-gray-400 hover:text-white transition duration-150"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </CardHeader>

      {/* Chat Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user"
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs border font-mono ${
                isUser 
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                  : "bg-gray-800/50 border-gray-700 text-gray-300"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : "ENG"}
              </div>

              {/* Message Content Bubble */}
              <div className={`p-4 rounded-xl shadow-md border ${
                isUser 
                  ? "bg-[#0d121f] border-blue-500/20 text-white" 
                  : "bg-[#0c0f1a] border-gray-800 text-gray-100"
              }`}>
                <div className="space-y-1">
                  {isUser ? msg.content : parseMarkdown(msg.content)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading / Thinking Indicator */}
        {loading && (
          <div className="flex gap-3 mr-auto max-w-[80%] items-center">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-gray-800/50 border border-gray-700 text-gray-300 font-mono text-xs">
              ENG
            </div>
            <div className="bg-[#0c0f1a] border border-gray-800 p-4 rounded-xl text-sm text-gray-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Engineer is calculating diagnostic parameters...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg mx-auto max-w-md text-center">
            {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>

      {/* Suggested Chips (Only show if not currently loading) */}
      {!loading && messages.length <= 2 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 shrink-0 bg-black/5 border-t border-gray-900">
          {QUICK_CHIPS.map((chip, index) => (
            <button
              key={index}
              onClick={() => handleChipClick(chip)}
              className="text-[11px] bg-[#1a2336] hover:bg-[#202c44] border border-gray-800 hover:border-gray-700 text-gray-300 font-medium px-2.5 py-1 rounded-full transition shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Footer input form */}
      <CardFooter className="p-3 border-t border-gray-800 bg-[#0d121f] shrink-0">
        <div className="flex w-full items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type query to senior engineer (e.g. 'Watts bath buffering', or details on adhesion peeling)..."
            rows={1}
            className="flex-1 bg-black/25 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none font-sans"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 h-10 w-10 shrink-0 flex items-center justify-center rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
