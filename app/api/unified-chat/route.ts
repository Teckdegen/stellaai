import { NextRequest } from "next/server"

// Get default API keys from environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY || "your-groq-api-key-here"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      messages, 
      contractName, 
      network, 
      currentCode, 
      codebaseContext,
      customProvider,
      apiKey
    } = body

    // If custom provider is specified, use it
    if (customProvider && apiKey) {
      switch (customProvider) {
        case 'openai':
          return await handleOpenAIRequest(apiKey, messages, contractName, network, currentCode, codebaseContext)
        case 'claude':
          return await handleClaudeRequest(apiKey, messages, contractName, network, currentCode, codebaseContext)
        case 'xai':
          return await handleXAIRequest(apiKey, messages, contractName, network, currentCode, codebaseContext)
        default:
          throw new Error(`Unsupported custom provider: ${customProvider}`)
      }
    }

    // Default to Groq if no custom provider
    return await handleGroqRequest(messages, contractName, network, currentCode, codebaseContext)
  } catch (error: any) {
    console.error("[Unified Chat API] Error:", error)
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

// Handle OpenAI requests
async function handleOpenAIRequest(
  apiKey: string,
  messages: any[],
  contractName: string,
  network: string,
  currentCode: string,
  codebaseContext: string
) {
  const systemPrompt = getSystemPrompt(contractName, network, currentCode, codebaseContext)
  
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
  ]

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2048,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  const responseText = data.choices?.[0]?.message?.content || "No response generated"
  
  return new Response(responseText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

// Handle Claude requests
async function handleClaudeRequest(
  apiKey: string,
  messages: any[],
  contractName: string,
  network: string,
  currentCode: string,
  codebaseContext: string
) {
  const systemPrompt = getSystemPrompt(contractName, network, currentCode, codebaseContext)
  
  // Convert messages to Claude format
  const apiMessages = messages.map((msg: any) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }))

  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system: systemPrompt,
        messages: apiMessages,
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2048,
        temperature: 0.7,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  const responseText = data.content?.[0]?.text || "No response generated"
  
  return new Response(responseText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

// Handle X AI requests
async function handleXAIRequest(
  apiKey: string,
  messages: any[],
  contractName: string,
  network: string,
  currentCode: string,
  codebaseContext: string
) {
  const systemPrompt = getSystemPrompt(contractName, network, currentCode, codebaseContext)
  
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
  ]

  const response = await fetch(
    "https://api.x.ai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: "grok-beta",
        temperature: 0.7,
        max_tokens: 2048,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`X AI API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  const responseText = data.choices?.[0]?.message?.content || "No response generated"
  
  return new Response(responseText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

// Handle Groq requests (default)
async function handleGroqRequest(
  messages: any[],
  contractName: string,
  network: string,
  currentCode: string,
  codebaseContext: string
) {
  // Check if API key is configured
  if (!GROQ_API_KEY || GROQ_API_KEY === "your-groq-api-key-here") {
    throw new Error("Groq API key not configured. Please add your Groq API key to the environment variables.")
  }

  const systemPrompt = getSystemPrompt(contractName, network, currentCode, codebaseContext)
  
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
  ]

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
  const responseText = data.choices?.[0]?.message?.content || "No response generated"
  
  return new Response(responseText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

// Get system prompt for all providers
function getSystemPrompt(
  contractName: string,
  network: string,
  currentCode: string,
  codebaseContext: string
) {
  return `You are Clarity AI, an expert AI assistant for Clarity smart contract development on the Stacks blockchain.

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
}