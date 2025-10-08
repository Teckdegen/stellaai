"use client"

import * as React from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"

interface ScrollablePanelProps {
  children: React.ReactNode
  className?: string
  autoScroll?: boolean
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export const ScrollablePanel = React.forwardRef<
  HTMLDivElement,
  ScrollablePanelProps
>(({ children, className, autoScroll = true, onScroll, ...props }, ref) => {
  const scrollAreaRef = ref as React.RefObject<HTMLDivElement> || useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
      if (viewport) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight
        })
      }
    }
  }, [children, autoScroll])

  return (
    <ScrollArea 
      className={className}
      ref={scrollAreaRef}
      onScroll={onScroll}
      {...props}
    >
      {children}
      <ScrollBar />
    </ScrollArea>
  )
})

ScrollablePanel.displayName = "ScrollablePanel"