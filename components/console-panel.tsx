"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Terminal, Info, AlertCircle, CheckCircle, Trash2 } from "lucide-react"
import { useEffect, useRef } from "react"

interface ConsoleMessage {
  type: "info" | "error" | "success"
  message: string
  timestamp?: string
}

interface ConsolePanelProps {
  messages: ConsoleMessage[]
  onClear?: () => void
}

export function ConsolePanel({ messages, onClear }: ConsolePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
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
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-[#252526]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Console</span>
          <span className="text-xs text-muted-foreground">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
        {messages.length > 0 && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Console Output */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-1 font-mono text-xs">
          {messages.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Console output will appear here...</span>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="flex items-start gap-2 py-1 hover:bg-muted/5 px-2 -mx-2 rounded">
                <span className="text-[#858585] text-[10px] mt-0.5 w-16 flex-shrink-0">
                  {msg.timestamp || getTimestamp()}
                </span>
                {msg.type === "info" && <Info className="w-3 h-3 text-[#4FC3F7] mt-0.5 flex-shrink-0" />}
                {msg.type === "error" && <AlertCircle className="w-3 h-3 text-[#F44336] mt-0.5 flex-shrink-0" />}
                {msg.type === "success" && <CheckCircle className="w-3 h-3 text-[#4CAF50] mt-0.5 flex-shrink-0" />}
                <span
                  className={
                    msg.type === "error"
                      ? "text-[#F44336]"
                      : msg.type === "success"
                        ? "text-[#4CAF50]"
                        : "text-[#CCCCCC]"
                  }
                >
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
