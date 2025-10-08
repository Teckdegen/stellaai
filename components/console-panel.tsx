"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Terminal, Info, AlertCircle, CheckCircle, Trash2, AlertTriangle } from "lucide-react"
import { useEffect, useRef } from "react"

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (viewportRef.current) {
      // Smooth scroll to bottom
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

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
    <div className="console-panel-container h-full flex flex-col">
      {/* Header */}
      <div className="console-header px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Console</span>
          <span className="text-xs text-muted-foreground">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
        {messages.length > 0 && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="rounded-full">
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Console Output with improved scrolling */}
      <ScrollArea className="console-messages-container flex-1" ref={scrollRef}>
        <div 
          ref={viewportRef}
          className="space-y-1 font-mono text-xs"
        >
          {messages.length === 0 ? (
            <div className="console-empty-state">
              <Terminal className="w-4 h-4" />
              <span>Console output will appear here...</span>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="console-message">
                <span className="console-message-timestamp">
                  {msg.timestamp || getTimestamp()}
                </span>
                <div className="console-message-icon">
                  {msg.type === "info" && <Info className="w-3 h-3 text-blue-500" />}
                  {msg.type === "error" && <AlertCircle className="w-3 h-3 text-red-500" />}
                  {msg.type === "success" && <CheckCircle className="w-3 h-3 text-green-500" />}
                  {msg.type === "warning" && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                </div>
                <span className={`console-message-content ${msg.type}`}>
                  {msg.message}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}