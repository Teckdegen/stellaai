"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollablePanel } from "@/components/ui/scrollable-panel"
import { Send, Sparkles, Loader2, BookOpen } from "lucide-react"
import { ChatHistoryManager } from "@/lib/chat-history"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatPanelProps {
  projectId: string
  onCodeUpdate: (code: string, reason?: string) => void
  currentCode: string
  contractName: string
  network: string
}

// Enhanced codebase context with more detailed information
const getCodebaseContext = () => {
  return `Project Structure and Components:
- app/page.tsx: Landing page with project creation functionality
- app/project/[id]/page.tsx: Main IDE interface with resizable panels
- components/chat-panel.tsx: AI chat interface with message handling
- components/code-editor.tsx: Code editor with line numbers and syntax highlighting
- components/console-panel.tsx: Console output panel for logs and errors
- components/ui/: Radix UI components for the interface
- lib/stacks-wallet.ts: Stacks blockchain integration for contract deployment
- lib/clarity-validator.ts: Clarity code syntax validation and error checking
- lib/project-storage.ts: Project persistence using localStorage
- lib/chat-history.ts: Chat history management and code versioning

Key Technologies:
- Next.js 15 with React Server Components
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI for accessible components
- Stacks blockchain for smart contract deployment
- Groq Llama 3.3 70b for AI assistance
- react-resizable-panels for layout management

Core Features:
- AI-powered Clarity code generation
- Real-time syntax validation with detailed error reporting
- Private key-based deployment to Stacks testnet/mainnet
- Project management and persistence
- Chat history with code versioning
- Responsive design with mobile support

Code Analysis Capabilities:
- Can explain any part of the existing codebase in detail
- Can identify patterns, best practices, and potential improvements
- Can analyze security considerations and SIP compliance
- Can explain how different components work together
- Can suggest optimizations and debugging approaches

When asked about the codebase, provide specific references to files and components.`
}

export function ChatPanel({ projectId, onCodeUpdate, currentCode, contractName, network }: ChatPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage
    const history = ChatHistoryManager.getHistory(projectId)
    if (history.messages.length > 0) {
      return history.messages
    }
    
    // Comprehensive welcome message with useful commands
    return [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm Clarity AI, your smart contract assistant.\n\nI specialize in generating Clarity smart contracts for the Stacks blockchain. Just describe what you want to build, and I'll generate the code for you.\n\nExamples:\n- "Create an NFT contract"\n- "Add staking functionality"\n- "Create a token contract"\n\nI'll focus on writing code rather than lengthy explanations. You can view the generated code in the editor panel.`,
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string>("")

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
      if (viewport) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight
        })
      }
    }
  }, [messages, isLoading])

  // Extract only text explanations from AI responses (no code in chat)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === "assistant" && lastMessage.content !== lastProcessedMessage && lastMessage.id !== "welcome") {
      setLastProcessedMessage(lastMessage.content)

      const content = lastMessage.content

      // Enhanced detection for Clarity code patterns
      // Check for common Clarity keywords and patterns
      const clarityPatterns = [
        "define-",
        "(begin",
        "(let",
        "(define-map",
        "(define-data-var",
        "(define-fungible-token",
        "(define-non-fungible-token",
        "(define-constant",
        "(define-trait",
        "(impl-trait",
        "(use-trait",
        "(contract-call?",
        "(contract-of",
        "(principal-of?",
        "(get-block-info?",
        "(get-burn-block-info?",
        "(stx-get-balance",
        "(stx-transfer?",
        "(stx-burn?",
        "(ft-transfer?",
        "(ft-mint?",
        "(nft-transfer?",
        "(nft-mint?",
        "(nft-get-owner?",
        "(map-set",
        "(map-insert",
        "(map-get?",
        "(map-delete",
        "(var-set",
        "(var-get",
        "(data-var",
        "(response",
        "(ok",
        "(err",
        "(some",
        "(none",
        "(is-eq",
        "(asserts!",
        "(try!",
        "(unwrap!",
        "(unwrap-panic!",
        "(match",
        "(if",
        "(and",
        "(or",
        "(not",
        "(+",
        "(-",
        "(*",
        "(/",
        "(>=",
        "(<=",
        "(>",
        "(<",
        "(=",
        "(define-public",
        "(define-private",
        "(define-read-only",
        "(sha256",
        "(keccak256",
        "(hash160",
        "(as-contract",
        "(tx-sender",
        "(burn-block-height",
        "(block-height",
        "ERR_",
        "err-",
        "u100",
        "u1000",
        "(list",
        "(map",
        "(filter",
        "(fold",
        "(len",
        "(element-at",
        "(index-of",
        "(replace-at?",
        "(concat",
        "(append",
        "(as-max-len?",
        "(buff",
        "(string-ascii",
        "(string-utf8",
        "(optional",
        "(tuple",
        "(get",
        "(merge",
        "(bit-and",
        "(bit-or",
        "(bit-xor",
        "(bit-not",
        "(bit-shift-left",
        "(bit-shift-right",
        "(sqrti",
        "(pow",
        "(log2",
        "(mod",
        "(principal",
        "(contract-principal",
        "(standard-principal",
      ]

      // Check if response contains Clarity code patterns
      const isLikelyClarityCode = clarityPatterns.some(pattern => content.includes(pattern))

      // Also check if there are code blocks
      const hasCodeBlock = content.includes("```clarity") || content.includes("```") && (content.includes("(define") || content.includes("(begin"))

      if (isLikelyClarityCode || hasCodeBlock) {
        // Try to extract code from markdown blocks first
        const codeBlockMatch = content.match(/```(?:clarity)?\n([\s\S]*?)```/)
        
        if (codeBlockMatch) {
          // Code is in markdown block
          const code = codeBlockMatch[1].trim()
          // Extract only the explanation (text outside code blocks)
          const explanation = content.replace(/```(?:clarity)?\n[\s\S]*?```/, "").trim()
          
          // Send code to editor (only if it looks like valid Clarity code)
          if (code.includes("(define") || code.includes("(begin") || code.trim().startsWith("(")) {
            onCodeUpdate(code, explanation || "Code generated by Clarity AI")
            
            // Save code version to history
            ChatHistoryManager.saveCodeVersion(projectId, code, explanation || "Code generated by Clarity AI")
            
            // Update chat to show only explanation (without code)
            if (explanation) {
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMsg = newMessages[newMessages.length - 1]
                if (lastMsg.id === lastMessage.id) {
                  lastMsg.content = explanation
                }
                return newMessages
              })
            } else {
              // If no explanation, show a generic message
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMsg = newMessages[newMessages.length - 1]
                if (lastMsg.id === lastMessage.id) {
                  lastMsg.content = "I've generated the code for your request. You can view it in the editor."
                }
                return newMessages
              })
            }
          }
        } else if (!content.includes("```") && (content.includes("(define") || content.includes("(begin"))) {
          // Response is pure code (no markdown)
          onCodeUpdate(content, "Code generated by Clarity AI")
          
          // Save code version to history
          ChatHistoryManager.saveCodeVersion(projectId, content, "Code generated by Clarity AI")
          
          // Update chat to show a generic message instead of code
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMsg = newMessages[newMessages.length - 1]
            if (lastMsg.id === lastMessage.id) {
              lastMsg.content = "I've generated the code for your request. You can view it in the editor."
            }
            return newMessages
          })
        } else if (hasCodeBlock) {
          // Handle cases where code block exists but doesn't match our initial regex
          const codeBlockMatch2 = content.match(/```[\s\S]*?\n([\s\S]*?)```/)
          if (codeBlockMatch2) {
            const code = codeBlockMatch2[1].trim()
            if (code.includes("(define") || code.includes("(begin") || code.trim().startsWith("(")) {
              const explanation = content.replace(/```[\s\S]*?\n[\s\S]*?```/, "").trim()
              onCodeUpdate(code, explanation || "Code generated by Clarity AI")
              
              // Save code version to history
              ChatHistoryManager.saveCodeVersion(projectId, code, explanation || "Code generated by Clarity AI")
              
              // Update chat to show only explanation (without code)
              if (explanation) {
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg.id === lastMessage.id) {
                    lastMsg.content = explanation
                  }
                  return newMessages
                })
              } else {
                // If no explanation, show a generic message
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg.id === lastMessage.id) {
                    lastMsg.content = "I've generated the code for your request. You can view it in the editor."
                  }
                  return newMessages
                })
              }
            }
          }
        }
      }
    }
  }, [messages, lastProcessedMessage, onCodeUpdate, projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    // Save to chat history
    ChatHistoryManager.saveMessage(projectId, userMessage)
    setInput("")
    setIsLoading(true)

    try {
      // Add temporary assistant message
      const assistantMessageId = `assistant-${Date.now()}`
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      }
      setMessages((prev) => [...prev, assistantMessage])
      // Save to chat history
      ChatHistoryManager.saveMessage(projectId, assistantMessage)

      // Get codebase context
      const codebaseContext = getCodebaseContext()

      // Call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          contractName,
          network,
          currentCode,
          codebaseContext,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // Process the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let assistantContent = ""

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk

          // Update the assistant message
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.id === assistantMessageId) {
              lastMessage.content = assistantContent
              // Update chat history
              ChatHistoryManager.saveMessage(projectId, lastMessage)
            }
            return newMessages
          })

          // Scroll to bottom as new content arrives
          if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
            if (viewport) {
              requestAnimationFrame(() => {
                viewport.scrollTop = viewport.scrollHeight
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
      // Final scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight
          }
        }
      }, 100)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black chat-panel-container">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0 bg-black">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <h2 className="font-semibold text-sm text-white">Clarity AI</h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollablePanel className="flex-1 p-4 chat-messages-container" ref={scrollAreaRef}>
        <div className="space-y-4 pr-2">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex chat-message ${message.role === "user" ? "user" : "assistant"}`}
            >
              <div 
                className={`chat-message-content rounded-lg p-3 max-w-[90%] ${
                  message.role === "user" 
                    ? "bg-white text-black ml-auto" 
                    : message.id === "welcome"
                      ? "bg-white/10 text-white border border-white/10"
                      : "bg-white/5 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start chat-message assistant">
              <div className="chat-message-content bg-white/5 text-white rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs text-gray-400">Clarity AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollablePanel>

      {/* Input - Fixed at bottom */}
      <div className="p-4 border-t border-white/10 chat-input-container flex-shrink-0 bg-black">
        <form onSubmit={handleSubmit} className="flex gap-2 chat-input-form">
          <Textarea
            placeholder="Describe what you want to build... (e.g., 'Create an NFT contract')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            className="min-h-[60px] resize-none chat-input-textarea bg-black border-white/20 text-white placeholder:text-gray-500"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="self-end chat-send-button h-[60px] rounded-full bg-white text-black hover:bg-gray-200">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>Ask about codebase</span>
          </div>
        </div>
      </div>
    </div>
  )
}