// Code Fixer Component - Demonstrates AI's ability to fix Clarity code
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { validateClarityCode, getSuggestedFix } from "@/lib/clarity-validator"

interface FixSuggestion {
  line: number
  message: string
  fix: string | null
}

export function CodeFixer() {
  const [code, setCode] = useState("")
  const [fixedCode, setFixedCode] = useState("")
  const [fixSuggestions, setFixSuggestions] = useState<FixSuggestion[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const handleValidate = () => {
    setIsValidating(true)
    const validationResult = validateClarityCode(code)
    
    const suggestions: FixSuggestion[] = []
    
    // Combine errors and warnings for suggestions
    const allIssues = [...validationResult.errors, ...validationResult.warnings]
    allIssues.forEach(error => {
      const fix = getSuggestedFix(error, code)
      suggestions.push({
        line: error.line,
        message: error.message,
        fix
      })
    })
    
    setFixSuggestions(suggestions)
    
    // Apply automatic fixes for simple issues
    let fixed = code
    validationResult.errors.forEach(error => {
      if (error.message.includes("unclosed parenthesis")) {
        const count = parseInt(error.message)
        if (!isNaN(count)) {
          fixed += ")".repeat(count)
        }
      }
    })
    
    setFixedCode(fixed)
    setIsValidating(false)
  }

  const applyFix = (line: number, fix: string | null) => {
    if (!fix) return
    
    const lines = code.split("\n")
    if (lines[line - 1]) {
      // Simple example of applying a fix
      if (fix.includes("Add an opening parenthesis")) {
        lines[line - 1] = "(" + lines[line - 1]
      } else if (fix.includes("Add closing parenthesis")) {
        lines[line - 1] = lines[line - 1] + ")"
      }
      
      const newCode = lines.join("\n")
      setCode(newCode)
      setFixedCode(newCode)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Original Code</h3>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your Clarity code here..."
            className="min-h-[300px] font-mono text-sm"
          />
          <Button onClick={handleValidate} disabled={isValidating} className="mt-2">
            {isValidating ? "Validating..." : "Validate & Fix"}
          </Button>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Fixed Code</h3>
          <Textarea
            value={fixedCode}
            readOnly
            className="min-h-[300px] font-mono text-sm bg-muted"
          />
        </Card>
      </div>
      
      {fixSuggestions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Fix Suggestions</h3>
          <div className="space-y-2">
            {fixSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                <span className="font-mono text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Line {suggestion.line}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{suggestion.message}</p>
                  {suggestion.fix && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-1"
                      onClick={() => applyFix(suggestion.line, suggestion.fix)}
                    >
                      Apply Fix: {suggestion.fix}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}