"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, Loader2, Code, FileText, BookOpen } from "lucide-react"
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

// Mock codebase context - in a real implementation, this would be dynamically generated
const getCodebaseContext = () => {
  return `Project Structure:
- app/page.tsx: Landing page with project creation
- app/project/[id]/page.tsx: Main IDE interface
- components/chat-panel.tsx: AI chat interface
- components/code-editor.tsx: Code editor component
- components/console-panel.tsx: Console/output panel
- lib/stacks-wallet.ts: Stacks blockchain integration
- lib/clarity-validator.ts: Clarity code validation
- lib/project-storage.ts: Project persistence
- lib/chat-history.ts: Chat history management

Key Technologies:
- Next.js 15 with React Server Components
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI for accessible components
- Stacks blockchain for smart contract deployment
- Groq Llama 3.3 70b for AI assistance

Core Features:
- AI-powered Clarity code generation
- Real-time syntax validation
- Private key-based deployment
- Project management and persistence
- Chat history with code versioning`
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
        content: `👋 Welcome to Stella AI - Your Clarity Smart Contract Assistant!

I'm here to help you build secure and efficient smart contracts for the Stacks blockchain. Whether you're a beginner or an experienced developer, I can assist you with creating, validating, and deploying Clarity contracts.

✨ **Getting Started Examples:**
• "Create a comprehensive NFT contract with metadata support"
• "Build a staking contract with reward distribution"
• "Generate a DAO contract with proposal voting mechanisms"
• "Design a token contract with vesting schedules"
• "Implement access control with role-based permissions"

🔧 **Development Features:**
• Real-time code validation and error detection
• Automatic SIP compliance checking
• Best practices and security recommendations
• Code optimization suggestions
• Deployment-ready contract generation

📚 **Codebase Assistance:**
• "Explain how the deployment system works"
• "Show me the validation rules"
• "How does the project storage work?"
• "What components are in the IDE?"

📈 **Advanced Capabilities:**
• Multi-contract systems and cross-contract calls
• Complex data structures and storage patterns
• Event logging and notification systems
• Upgradeable contract architectures
• Integration with DeFi protocols

Just describe what you want to build or ask about the codebase, and I'll help you!

💡 **Pro Tip:** Be as specific as possible about your requirements for the best results.`,
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string>("")

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
      if (viewport) {
        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
        }, 0)
      }
    }
  }

  // Extract only text explanations from AI responses (no code in chat)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === "assistant" && lastMessage.content !== lastProcessedMessage && lastMessage.id !== "welcome") {
      setLastProcessedMessage(lastMessage.content)

      const content = lastMessage.content

      // Check if response contains Clarity code
      const hasDefine = content.includes("define-")
      const hasBegin = content.includes("(begin")
      const hasLet = content.includes("(let")

      if (hasDefine || hasBegin || hasLet) {
        // Try to extract code from markdown blocks first
        const codeBlockMatch = content.match(/```(?:clarity)?\n([\s\S]*?)```/)

        if (codeBlockMatch) {
          // Code is in markdown block
          const code = codeBlockMatch[1].trim()
          // Extract only the explanation (text outside code blocks)
          const explanation = content.replace(/```(?:clarity)?\n[\s\S]*?```/, "").trim()
          
          // Send code to editor
          onCodeUpdate(code, explanation || "Code generated by Stella AI")
          
          // Save code version to history
          ChatHistoryManager.saveCodeVersion(projectId, code, explanation || "Code generated by Stella AI")
          
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
          }
        } else if (!content.includes("```") && (hasDefine || hasBegin)) {
          // Response is pure code (no markdown)
          onCodeUpdate(content, "Code generated by Stella AI")
          
          // Save code version to history
          ChatHistoryManager.saveCodeVersion(projectId, content, "Code generated by Stella AI")
          
          // Update chat to show a generic message instead of code
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
  }, [messages, lastProcessedMessage, onCodeUpdate])

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
          scrollToBottom()
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
      setTimeout(scrollToBottom, 100)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card chat-panel-container">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0 bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Stella AI</h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 chat-messages-container" ref={scrollAreaRef}>
        <div className="space-y-4 pr-2">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex chat-message ${message.role === "user" ? "user" : "assistant"}`}
            >
              <div 
                className={`chat-message-content rounded-lg p-3 max-w-[90%] ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : message.id === "welcome"
                      ? "bg-white text-foreground border border-border"
                      : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start chat-message assistant">
              <div className="chat-message-content bg-muted text-foreground rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">Stella is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input - Fixed at bottom */}
      <div className="p-4 border-t border-border chat-input-container flex-shrink-0 bg-card sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="flex gap-2 chat-input-form">
          <Textarea
            placeholder="Describe what you want to build or ask about the codebase... (e.g., 'Explain how deployment works')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            className="min-h-[60px] resize-none chat-input-textarea"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="self-end chat-send-button h-[60px] rounded-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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