
export const maxDuration = 30

// TODO: Add your Groq API Key (should start with "gsk_")
const GROQ_API_KEY = "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"

async function callGroq(prompt: string, contractName: string, network: string, currentCode: string, codebaseContext: string) {
  try {
    const contextMessage = `Current project context:
- Contract Name: ${contractName}
- Network: ${network}
- Current Code: ${currentCode ? "Yes (" + currentCode.length + " chars)" : "None yet"}
- Codebase Context: ${codebaseContext || "No additional context provided"}

User's request: ${prompt}

Important: When generating Clarity code, use the contract name "${contractName}" in the contract definition.
For example, if creating an NFT contract, use:
(define-non-fungible-token ${contractName}-nft uint)
or similar patterns that incorporate the contract name.`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are Stella, an expert smart contract developer and educator for the Stacks blockchain. You can:

1. Generate valid Clarity code that can be directly deployed to the Stacks blockchain
2. Explain existing code from the codebase in detail
3. Help users understand how different components work together
4. Provide best practices and security recommendations
5. Help with debugging and optimization

When generating code:
- Include appropriate comments, error handling, and follow SIP standards
- Make sure all parentheses are balanced
- Functions should return (ok ...) or (err ...) responses where appropriate
- ALWAYS use the provided contract name in the generated code
- Create meaningful function and variable names based on the contract purpose

When explaining code:
- Be thorough and educational
- Point out key patterns and design decisions
- Explain the purpose of different functions and variables
- Highlight any security considerations or best practices

Format your responses clearly with appropriate sections when needed.`,
          },
          {
            role: "user",
            content: contextMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      console.error("Groq API Error:", data.error)
      return null
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error("Error calling Groq:", error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { messages, contractName, network, currentCode, codebaseContext } = await req.json()

    const userMessage = messages[messages.length - 1].content

    // Get the AI response
    const aiResponse = await callGroq(userMessage, contractName, network, currentCode, codebaseContext)

    if (!aiResponse) {
      throw new Error("Failed to get response from Groq")
    }

    // Return the response directly as text
    return new Response(aiResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[v0] Chat API Error:", error)
    return Response.json({ error: "Failed to process request" }, { status: 500 })
  }
}