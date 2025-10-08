import { NextRequest } from "next/server";

export const maxDuration = 60; // Increased from 30 to 60 seconds

// TODO: Add your Groq API Key (should start with "gsk_")
const GROQ_API_KEY = "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";

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
or similar patterns that incorporate the contract name.

You can generate up to 2000 lines of code if needed. Focus on creating complete, well-structured, and secure smart contracts.

When analyzing existing code:
- Provide detailed explanations of functions, variables, and design patterns
- Identify potential improvements or security issues
- Explain the purpose of different sections
- Point out best practices and SIP compliance`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Using the most capable model
        messages: [
          {
            role: "system",
            content: `You are Stella, an expert smart contract developer for the Stacks blockchain. Your primary role is to generate Clarity code, not to explain extensively.

Key instructions:
1. When asked to create something, immediately generate the Clarity code in a code block
2. Keep explanations brief and focused
3. Put ALL code in \`\`\`clarity\n...\`\`\` blocks
4. Generate complete, deployable contracts
5. Focus on functionality over documentation
6. You can generate up to 2000 lines of code if needed
7. Always use the provided contract name
8. Include appropriate error handling and comments
9. Follow SIP standards and best practices
10. Balance between brevity and completeness

When explaining existing code:
- Be concise but thorough
- Focus on key functionality
- Point out important patterns
- Highlight security considerations
- Reference specific lines when needed

When analyzing the codebase:
- Explain how components work together
- Identify patterns and best practices
- Suggest improvements when relevant

Format your responses with minimal text and maximum code. Let the code speak for itself.`,
          },
          {
            role: "user",
            content: contextMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000, // Increased from 3000 to 8000 for larger code generation
        top_p: 0.9,
        frequency_penalty: 0.2,
        presence_penalty: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Groq API Error:", data.error);
      return null;
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Groq:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, contractName, network, currentCode, codebaseContext } = await req.json();

    const userMessage = messages[messages.length - 1].content;

    // Get the AI response
    const aiResponse = await callGroq(userMessage, contractName, network, currentCode, codebaseContext);

    if (!aiResponse) {
      throw new Error("Failed to get response from Groq");
    }

    // Return the response directly as text
    return new Response(aiResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[v0] Chat API Error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}