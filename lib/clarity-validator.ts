// Enhanced Clarity syntax validator with comprehensive error checking
export interface ValidationResult {
  isValid: boolean
  errors: Array<{ line: number; message: string }>
  warnings: Array<{ line: number; message: string }>
}

// Basic Stacks Clarity contract validation based on documentation
export function validateClarityCode(code: string): ValidationResult {
  const errors: Array<{ line: number; message: string }> = []
  const warnings: Array<{ line: number; message: string }> = []
  const lines = code.split("\n")

  // Check for balanced parentheses
  let parenCount = 0
  let lastParenLine = 1
  lines.forEach((line, index) => {
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === "(") {
        parenCount++
        lastParenLine = index + 1
      }
      if (char === ")") {
        parenCount--
        lastParenLine = index + 1
        if (parenCount < 0) {
          errors.push({ line: index + 1, message: "Unmatched closing parenthesis" })
          parenCount = 0
        }
      }
    }
  })

  if (parenCount > 0) {
    errors.push({ line: lastParenLine, message: `${parenCount} unclosed parenthesis(es)` })
  }

  // Check for basic contract structure
  const hasDefine = code.includes("define-")
  if (!hasDefine && code.trim().length > 0) {
    errors.push({ line: 1, message: "Contract must contain at least one define- declaration" })
  }

  // Check for valid contract name (Stacks naming conventions)
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(";;")) return

    // Check for valid function/variable names (Stacks naming conventions)
    if (trimmed.startsWith("(define-")) {
      const match = trimmed.match(/$$define-\w+\s+([^\s$$]+)/)
      if (match && match[1]) {
        const name = match[1]
        // Stacks naming conventions: lowercase letters, numbers, hyphens, underscores, ?, and !
        if (!/^[a-z0-9\-_?!]+$/.test(name)) {
          errors.push({
            line: index + 1,
            message: `Invalid identifier "${name}". Use lowercase letters, numbers, hyphens, underscores, ?, and !`,
          })
        }
        // Check for reserved keywords
        const reservedKeywords = ['contract', 'tx-sender', 'block-height', 'burn-block-height', 'none', 'true', 'false']
        if (reservedKeywords.includes(name)) {
          errors.push({
            line: index + 1,
            message: `Identifier "${name}" is a reserved keyword and cannot be used`,
          })
        }
      }
    }

    // Check for proper response types in public functions
    if (trimmed.startsWith("(define-public") || trimmed.startsWith("(define-read-only")) {
      // Check if the function has a proper return value
      const hasResponse = trimmed.includes("(ok ") || trimmed.includes("(err ") || trimmed.includes("(some") || trimmed.includes("none")
      if (!hasResponse && !trimmed.includes("begin")) {
        // For read-only functions, they don't need to return (ok ...) or (err ...)
        if (trimmed.startsWith("(define-public")) {
          warnings.push({
            line: index + 1,
            message: "Public functions should typically return (ok ...) or (err ...) response types"
          })
        }
      }
    }

    // Check for proper variable declarations
    if (trimmed.startsWith("(define-data-var")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 4) {
        errors.push({
          line: index + 1,
          message: "define-data-var requires name, type, and initial value: (define-data-var name type initial-value)"
        })
      }
      
      // Check for valid Clarity types
      if (parts.length >= 4) {
        const typePart = parts[3]
        // Valid Clarity types: int, uint, bool, principal, buff, string-ascii, string-utf8, optional, response, tuple
        const validTypes = ['int', 'uint', 'bool', 'principal', 'buff', 'string-ascii', 'string-utf8', 'optional', 'response', 'tuple', '(optional', '(response', '(tuple']
        const isValidType = validTypes.some(validType => typePart.includes(validType)) || 
                          typePart.startsWith('(') && typePart.endsWith(')')
        
        if (!isValidType) {
          // Special case: 'int' and 'uint' are valid types
          if (typePart !== 'int' && typePart !== 'uint' && typePart !== 'bool' && typePart !== 'principal') {
            warnings.push({
              line: index + 1,
              message: `Unrecognized type "${typePart}". Valid types include: int, uint, bool, principal, buff, string-ascii, string-utf8, optional, response, tuple`
            })
          }
        }
        
        // Check initial value format for int/uint
        if (parts.length >= 5 && (typePart === 'int' || typePart === 'uint')) {
          const initialValue = parts[4].replace(/[()]/g, '') // Remove parentheses
          if (typePart === 'uint' && !initialValue.startsWith('u') && initialValue !== '0') {
            warnings.push({
              line: index + 1,
              message: `uint values should start with 'u' prefix (e.g., u0, u1, u100)`
            })
          } else if (typePart === 'int' && initialValue.startsWith('u')) {
            warnings.push({
              line: index + 1,
              message: `int values should not start with 'u' prefix (e.g., 0, 1, -1)`
            })
          }
        }
      }
    }

    // Check for proper map declarations
    if (trimmed.startsWith("(define-map")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 4) {
        errors.push({
          line: index + 1,
          message: "define-map requires name, key type, and value type: (define-map name key-type value-type)"
        })
      }
    }

    // Check for proper token declarations
    if (trimmed.startsWith("(define-fungible-token")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 2) {
        errors.push({
          line: index + 1,
          message: "define-fungible-token requires name: (define-fungible-token name [supply])"
        })
      }
    }

    // Check for proper NFT declarations
    if (trimmed.startsWith("(define-non-fungible-token")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 3) {
        errors.push({
          line: index + 1,
          message: "define-non-fungible-token requires name and asset class: (define-non-fungible-token name asset-class)"
        })
      }
    }

    // Check for proper trait declarations
    if (trimmed.startsWith("(define-trait")) {
      const parts = trimmed.split(/\s+/)
      if (parts.length < 3) {
        errors.push({
          line: index + 1,
          message: "define-trait requires name and signature: (define-trait name ((func-name (args) return-type)))"
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
    if (trimmed.includes("(err ") && !trimmed.includes("ERR-") && !/u\d+/.test(trimmed)) {
      warnings.push({
        line: index + 1,
        message: "Error codes should use ERR- prefix for consistency (e.g., ERR-NOT-AUTHORIZED)"
      })
    }
  })

  // Check for contract call patterns
  if (code.includes("(contract-call?")) {
    // Check for proper contract call usage
    const contractCallPattern = /\(contract-call\?\s+'([^\s]+)\s+([^\s]+)/g
    let match
    while ((match = contractCallPattern.exec(code)) !== null) {
      const contractName = match[1]
      const functionName = match[2]
      if (!contractName || !functionName) {
        errors.push({
          line: 1,
          message: "Invalid contract-call? usage. Format: (contract-call? 'contract-name function-name args...)"
        })
      }
    }
  }

  // Check for contract structure
  if (code.includes("(define-public") && !code.includes("(ok ") && !code.includes("(err ")) {
    warnings.push({
      line: 1,
      message: "Public functions found but no (ok ...) or (err ...) responses detected"
    })
  }

  // Check for missing standard functions in NFT contracts (SIP-009)
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

  // Check for missing standard functions in FT contracts (SIP-010)
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
    return "Use only lowercase letters, numbers, hyphens, underscores, ?, and ! in function/variable names"
  }
  
  if (error.message.includes("define-data-var requires")) {
    return "Format should be: (define-data-var name type initial-value)"
  }
  
  if (error.message.includes("define-map requires")) {
    return "Format should be: (define-map name key-type value-type)"
  }
  
  if (error.message.includes("define-fungible-token requires")) {
    return "Format should be: (define-fungible-token name [supply])"
  }
  
  if (error.message.includes("define-non-fungible-token requires")) {
    return "Format should be: (define-non-fungible-token name asset-class)"
  }
  
  if (error.message.includes("define-trait requires")) {
    return "Format should be: (define-trait name ((func-name (args) return-type)))"
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
  
  if (error.message.includes("Invalid contract-call? usage")) {
    return "Format should be: (contract-call? 'contract-name function-name args...)"
  }
  
  if (error.message.includes("NFT contract should implement")) {
    return "Add the required SIP-009 functions: get-owner and transfer"
  }
  
  if (error.message.includes("FT contract should implement")) {
    return "Add the required SIP-010 functions: transfer and get-balance"
  }
  
  if (error.message.includes("Public functions found")) {
    return "Add (ok ...) or (err ...) return values to your public functions"
  }
  
  if (error.message.includes("is a reserved keyword")) {
    return "Choose a different name that doesn't conflict with reserved keywords"
  }
  
  if (error.message.includes("Unrecognized type")) {
    return "Use a valid Clarity type: int, uint, bool, principal, buff, string-ascii, string-utf8, optional, response, tuple"
  }
  
  return null
}