"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { FileCode, Copy, Download, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CodeEditorProps {
  code: string
  onChange?: (code: string) => void
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [localCode, setLocalCode] = useState(code)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalCode(code)
  }, [code])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([localCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "main.clar"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setLocalCode(newCode)
    onChange?.(newCode)
  }

  const lines = localCode.split("\n")
  const lineCount = lines.length

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-[#252526]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">contracts/main.clar</span>
          <span className="text-xs text-primary">Editable</span>
        </div>
        {localCode && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <ScrollArea className="flex-1 overflow-hidden">
        {localCode ? (
          <div className="flex h-full">
            {/* Line Numbers */}
            <div className="select-none bg-[#1e1e1e] text-[#858585] text-right pr-4 pl-4 py-4 font-mono text-sm leading-6 border-r border-[#2d2d2d] overflow-hidden">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Code Area */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={localCode}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full p-4 bg-transparent text-foreground font-mono text-sm leading-6 resize-none outline-none"
                style={{
                  caretColor: "#10b981",
                  tabSize: 2,
                }}
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <FileCode className="w-12 h-12 mx-auto opacity-50" />
              <p className="text-sm">No code yet</p>
              <p className="text-xs">Use Stella AI to generate your contract</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
