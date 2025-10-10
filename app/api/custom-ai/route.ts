import { NextRequest } from "next/server"

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

    // Validate API key is provided for custom providers
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "API key is required for custom AI providers" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

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

    let responseText = ""

    // Handle different AI providers
    switch (customProvider) {
      case 'openai':
        // Call OpenAI API
        const openaiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((msg: any) => ({
                  role: msg.role,
                  content: msg.content,
                })),
              ],
              model: "gpt-4o",
              temperature: 0.7,
              max_tokens: 2048,
            }),
          }
        )

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text()
          throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText} - ${errorText}`)
        }

        const openaiData = await openaiResponse.json()
        responseText = openaiData.choices?.[0]?.message?.content || "No response generated"
        break

      case 'claude':
        // Call Claude API
        const claudeResponse = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20240620",
              max_tokens: 2048,
              temperature: 0.7,
              system: systemPrompt,
              messages: messages.map((msg: any) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
              })),
            }),
          }
        )

        if (!claudeResponse.ok) {
          const errorText = await claudeResponse.text()
          throw new Error(`Claude API error: ${claudeResponse.status} ${claudeResponse.statusText} - ${errorText}`)
        }

        const claudeData = await claudeResponse.json()
        responseText = claudeData.content?.[0]?.text || "No response generated"
        break

      case 'xai':
        // Call X AI API
        const xaiResponse = await fetch(
          "https://api.x.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((msg: any) => ({
                  role: msg.role,
                  content: msg.content,
                })),
              ],
              model: "grok-beta",
              temperature: 0.7,
              max_tokens: 2048,
            }),
          }
        )

        if (!xaiResponse.ok) {
          const errorText = await xaiResponse.text()
          throw new Error(`X AI API error: ${xaiResponse.status} ${xaiResponse.statusText} - ${errorText}`)
        }

        const xaiData = await xaiResponse.json()
        responseText = xaiData.choices?.[0]?.message?.content || "No response generated"
        break

      default:
        throw new Error("Unsupported AI provider")
    }

    // Create a simple text response
    return new Response(responseText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  } catch (error: any) {
    console.error("[Custom AI] API Error:", error)
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