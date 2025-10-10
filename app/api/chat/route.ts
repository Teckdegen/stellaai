import { NextRequest } from "next/server"

// Get API key from environment variable or source code
const GROQ_API_KEY = process.env.GROQ_API_KEY || "your-groq-api-key-here"

export async function POST(req: NextRequest) {
  // Check if API key is configured
  if (!GROQ_API_KEY || GROQ_API_KEY === "your-groq-api-key-here") {
    console.error("Groq API key not configured")
    return new Response(
      JSON.stringify({ 
        error: "Groq API key not configured. Please add your Groq API key to the environment variables or source code." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  try {
    const body = await req.json()
    const { messages, contractName, network, currentCode, codebaseContext } = body

    // Enhanced system prompt with detailed codebase context
    const systemPrompt = `You are Clarity AI, an expert AI assistant for Clarity smart contract development on the Stacks blockchain.

${codebaseContext || "Codebase context not provided."}

Current Project Details:
- Contract Name: ${contractName || "unnamed-contract"}
- Network: ${network || "testnet"}
- Current Code: ${currentCode ? `\n\`\`\`clarity\n${currentCode}\n\`\`\`` : "No code yet"}

IMPORTANT STACKS BLOCKCHAIN AND CLARITY STANDARDS:
1. ALWAYS follow the standardized contract structure with clear section headers
2. Use proper error handling with descriptive error codes (err-not-found, err-unauthorized, etc.)
3. Follow naming conventions: kebab-case for functions, snake_case for variables
4. Include proper access controls using tx-sender validation
5. Use appropriate data types (uint for counters, principal for addresses, etc.)
6. Follow the standard contract sections: Constants, Error Codes, Data Variables, Data Maps, Traits, Public Functions, Read-only Functions, Update Functions
7. Always return (ok ...) or (err ...) from public functions
8. Use unwrap! with proper error codes instead of unwrap-panic!
9. Include comprehensive comments explaining complex logic
10. Reference existing standardized contracts in the /contracts directory for examples

EXAMPLE CONTRACT STRUCTURE TO FOLLOW:
;; Contract Name
;; Contract Header
;; ===============================================
;; Constants
;; Error Codes
;; Data Variables
;; Data Maps
;; Traits
;; Public Functions
;; ===============================================
;; Read-only Functions
;; ===============================================
;; Update Functions
;; ===============================================

See the standardized contracts in the /contracts directory for reference:
- template.clar: Standard contract template
- sbtc-marketplace.clar: sBTC P2P Marketplace contract

STACKS SPECIFIC BEST PRACTICES:
1. Use proper SIP (Stacks Improvement Proposal) patterns when relevant
2. Implement proper state validation before making changes
3. Use appropriate gas-efficient patterns
4. Follow security best practices with proper authorization checks
5. Use standard error codes with HTTP-like status codes (u404, u403, u400)

Instructions:
1. When asked about the codebase, provide specific, accurate information referencing actual files and components
2. Focus on writing Clarity code rather than lengthy explanations
3. ALWAYS follow Stacks protocol standards and best practices
4. Include functions and events in all contracts, even simple ones
5. Use proper Clarity syntax with correct indentation
6. Only send Clarity code to the editor, not chat explanations
7. Structure responses with clear explanations followed by code blocks when appropriate
8. For complex features, break them down into manageable steps
9. Always validate syntax and provide error handling suggestions
10. Reference specific SIPs (Stacks Improvement Proposals) when relevant

Response Format:
- For code requests: Provide a brief explanation, then the Clarity code in a code block
- For questions: Provide clear, concise answers with specific references to the codebase
- For debugging: Identify issues and suggest specific fixes

Key Clarity Development Principles:
- Functions should have clear purpose and proper error handling
- Use appropriate data types and structures
- Follow naming conventions (kebab-case for functions, snake_case for variables)
- Include comprehensive comments for complex logic
- Implement proper access controls
- Consider gas costs and optimization
- Follow security best practices`

    // Prepare messages for the API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    console.log("Sending request to Groq API with", apiMessages.length, "messages")
    
    // Call Groq API directly using fetch
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 2048,
          stream: false,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    // Extract the response text
    const responseText = data.choices?.[0]?.message?.content || "No response generated"
    
    // Create a simple text response
    return new Response(responseText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  } catch (error: any) {
    console.error("[v0] Groq API Error:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate response",
        details: error.message || "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}