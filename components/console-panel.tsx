"use client"

import { ScrollablePanel } from "@/components/ui/scrollable-panel"
import { Button } from "@/components/ui/button"
import { Terminal, Info, AlertCircle, CheckCircle, Trash2, AlertTriangle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ConsoleMessage {
  type: "info" | "error" | "success" | "warning"
  message: string
  timestamp?: string
}

interface ConsolePanelProps {
  messages: ConsoleMessage[]
  onClear?: () => void
}

export function ConsolePanel({ messages, onClear }: ConsolePanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)

  // Handle scroll events to determine if user has scrolled up
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const viewport = target.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
    if (viewport) {
      const { scrollTop, scrollHeight, clientHeight } = viewport
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5 // 5px tolerance
      
      if (isAtBottom) {
        setAutoScroll(true)
        setUserScrolled(false)
      } else {
        setAutoScroll(false)
        setUserScrolled(true)
      }
    }
  }

  // Auto-scroll to bottom when new messages arrive and autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messages.length > 0 && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
      if (viewport) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight
        })
      }
    }
  }, [messages, autoScroll])

  const getTimestamp = () => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="console-panel-container h-full flex flex-col bg-black">
      {/* Header */}
      <div className="console-header px-4 py-2 border-b border-white/10 flex items-center justify-between bg-black">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Console</span>
          <span className="text-xs text-gray-400">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {userScrolled && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (scrollAreaRef.current) {
                  const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
                  if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight
                    setAutoScroll(true)
                    setUserScrolled(false)
                  }
                }
              }}
              className="rounded-full h-8 px-2 text-xs text-white hover:bg-white/10"
            >
              Scroll to bottom
            </Button>
          )}
          {messages.length > 0 && onClear && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear} 
              className="rounded-full h-8 px-2 text-white hover:bg-white/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Console Output with improved scrolling */}
      <ScrollablePanel 
        className="console-messages-container flex-1 p-4" 
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div className="space-y-2 font-mono text-xs">
          {messages.length === 0 ? (
            <div className="console-empty-state h-full flex flex-col items-center justify-center text-gray-500">
              <Terminal className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm">Console output will appear here...</span>
              <span className="text-xs mt-1">Start building your smart contract to see logs</span>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="console-message flex items-start gap-2 p-2 rounded hover:bg-white/5 transition-colors">
                <div className="console-message-icon mt-0.5 flex-shrink-0">
                  {msg.type === "info" && <Info className="w-3 h-3 text-blue-400" />}
                  {msg.type === "error" && <AlertCircle className="w-3 h-3 text-red-400" />}
                  {msg.type === "success" && <CheckCircle className="w-3 h-3 text-green-400" />}
                  {msg.type === "warning" && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="console-message-timestamp text-gray-400 text-[10px] font-medium">
                      {msg.timestamp || getTimestamp()}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      msg.type === "info" ? "bg-blue-400/10 text-blue-400" :
                      msg.type === "error" ? "bg-red-400/10 text-red-400" :
                      msg.type === "success" ? "bg-green-400/10 text-green-400" :
                      "bg-yellow-400/10 text-yellow-400"
                    }`}>
                      {msg.type.toUpperCase()}
                    </span>
                  </div>
                  <span className={`console-message-content ${msg.type} block whitespace-pre-wrap break-words text-white`}>
                    {msg.message}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollablePanel>
    </div>
  )
}