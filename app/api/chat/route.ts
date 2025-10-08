

export const maxDuration = 30

// TODO: Add your Groq API Key (should start with "gsk_")
const GROQ_API_KEY = "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"

async function callGroq(prompt: string, contractName: string, network: string, currentCode: string) {
  try {
    const contextMessage = `Current context:
- Contract Name: ${contractName}
- Network: ${network}
- Current Code: ${currentCode ? "Yes (" + currentCode.length + " chars)" : "None yet"}

User's request: ${prompt}`

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
            content: "You are an expert smart contract developer that writes valid Clarity code for the Stacks blockchain. Your responses should ONLY contain Clarity code that can be directly deployed to the Stacks blockchain. Include appropriate comments, error handling, and follow SIP standards. Make sure all parentheses are balanced and functions return (ok ...) or (err ...) responses where appropriate.",
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
    const { messages, contractName, network, currentCode } = await req.json()

    const userMessage = messages[messages.length - 1].content

    // Get the AI response
    const aiResponse = await callGroq(userMessage, contractName, network, currentCode)

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