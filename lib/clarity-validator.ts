// Enhanced Clarity syntax validator with comprehensive error checking
export interface ValidationResult {
  isValid: boolean
  errors: Array<{ line: number; message: string }>
  warnings: Array<{ line: number; message: string }>
}

export function validateClarityCode(code: string): ValidationResult {
  const errors: Array<{ line: number; message: string }> = []
  const warnings: Array<{ line: number; message: string }> = []
  const lines = code.split("\n")

  // Check for balanced parentheses
  let parenCount = 0
  lines.forEach((line, index) => {
    for (const char of line) {
      if (char === "(") parenCount++
      if (char === ")") parenCount--
      if (parenCount < 0) {
        errors.push({ line: index + 1, message: "Unmatched closing parenthesis" })
        parenCount = 0
      }
    }
  })

  if (parenCount > 0) {
    errors.push({ line: lines.length, message: `${parenCount} unclosed parenthesis(es)` })
  }

  // Check for basic Clarity keywords
  const hasDefine = code.includes("define-")
  if (!hasDefine && code.trim().length > 0) {
    errors.push({ line: 1, message: "Contract must contain at least one define- declaration" })
  }

  // Check for common syntax errors
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(";;")) return

    // Check for invalid characters in function names
    if (trimmed.startsWith("(define-")) {
      const match = trimmed.match(/$$define-\w+\s+([^\s$$]+)/)
      if (match && match[1]) {
        const name = match[1]
        if (!/^[a-z0-9\-?!]+$/.test(name)) {
          errors.push({
            line: index + 1,
            message: `Invalid identifier "${name}". Use lowercase letters, numbers, hyphens, ?, and !`,
          })
        }
      }
    }

    // Check for proper function definitions
    if (trimmed.startsWith("(define-public") || trimmed.startsWith("(define-read-only") || trimmed.startsWith("(define-private")) {
      if (!trimmed.includes("(ok ") && !trimmed.includes("(err ") && !trimmed.includes("begin")) {
        warnings.push({
          line: index + 1,
          message: "Public functions should return (ok ...) or (err ...) response types"
        })
      }
    }

    // Check for variable declarations without initial values
    if (trimmed.startsWith("(define-data-var")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 4) {
        errors.push({
          line: index + 1,
          message: "define-data-var requires name, type, and initial value"
        })
      }
    }

    // Check for map declarations
    if (trimmed.startsWith("(define-map")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 4) {
        errors.push({
          line: index + 1,
          message: "define-map requires name, key type, and value type"
        })
      }
    }

    // Check for proper use of tx-sender
    if (trimmed.includes("tx-sender") && !trimmed.includes("is-eq") && !trimmed.includes("asserts!")) {
      warnings.push({
        line: index + 1,
        message: "tx-sender should typically be used with is-eq for authorization checks"
      })
    }

    // Check for asserts! usage
    if (trimmed.includes("asserts!") && !trimmed.includes("(err ")) {
      warnings.push({
        line: index + 1,
        message: "asserts! should be followed by an (err ...) expression"
      })
    }

    // Check for proper error constant naming
    if (trimmed.includes("(err ") && !trimmed.includes("ERR-")) {
      warnings.push({
        line: index + 1,
        message: "Error codes should use ERR- prefix for consistency (e.g., ERR-NOT-AUTHORIZED)"
      })
    }

    // Check for begin usage without multiple expressions
    if (trimmed.includes("(begin") && (trimmed.match(/\(/g) || []).length < 3) {
      warnings.push({
        line: index + 1,
        message: "begin should be used with multiple expressions"
      })
    }
  })

  // Check for proper contract structure
  if (code.includes("(define-public") && !code.includes("(ok ") && !code.includes("(err ")) {
    warnings.push({
      line: 1,
      message: "Public functions found but no (ok ...) or (err ...) responses detected"
    })
  }

  // Check for missing standard functions in NFT contracts
  if (code.includes("define-non-fungible-token")) {
    if (!code.includes("get-owner")) {
      warnings.push({
        line: 1,
        message: "NFT contract should implement get-owner function for SIP-009 compliance"
      })
    }
    if (!code.includes("transfer")) {
      warnings.push({
        line: 1,
        message: "NFT contract should implement transfer function for SIP-009 compliance"
      })
    }
  }

  // Check for missing standard functions in FT contracts
  if (code.includes("define-fungible-token")) {
    if (!code.includes("transfer") || !code.includes("get-balance")) {
      warnings.push({
        line: 1,
        message: "FT contract should implement transfer and get-balance functions for SIP-010 compliance"
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Helper function to generate a fix suggestion for common errors
export function getSuggestedFix(error: { line: number; message: string }, code: string): string | null {
  const lines = code.split("\n")
  const line = lines[error.line - 1] || ""
  
  if (error.message.includes("Unmatched closing parenthesis")) {
    return "Add an opening parenthesis '(' to match the closing parenthesis"
  }
  
  if (error.message.includes("unclosed parenthesis")) {
    return "Add closing parenthesis ')' to match the opening parentheses"
  }
  
  if (error.message.includes("define- declaration")) {
    return "Add a define declaration such as (define-data-var ...), (define-public ...), etc."
  }
  
  if (error.message.includes("Invalid identifier")) {
    return "Use only lowercase letters, numbers, hyphens, ?, and ! in function/variable names"
  }
  
  if (error.message.includes("define-data-var requires")) {
    return "Format should be: (define-data-var name type initial-value)"
  }
  
  if (error.message.includes("define-map requires")) {
    return "Format should be: (define-map name key-type value-type)"
  }
  
  if (error.message.includes("should return")) {
    return "Wrap function body with (ok ...) for success or (err ...) for errors"
  }
  
  if (error.message.includes("tx-sender should typically")) {
    return "Add authorization check: (asserts! (is-eq tx-sender owner) (err u1))"
  }
  
  if (error.message.includes("asserts! should be followed")) {
    return "Add error expression: (asserts! condition (err ERROR_CODE))"
  }
  
  if (error.message.includes("Error codes should use")) {
    return "Define error constants: (define-constant ERR-NOT-AUTHORIZED u1)"
  }
  
  return null
}