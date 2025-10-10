import { NextRequest } from "next/server";

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here";

async function callGemini(prompt: string, contractName: string, network: string, currentCode: string, codebaseContext: string) {
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

    const systemPrompt = `You are Stella, an expert Clarity smart contract developer for the Stacks blockchain. Your primary role is to generate Clarity code that follows Stacks protocol standards.

Key instructions for generating Clarity contracts:
1. ALWAYS generate complete, valid Clarity contracts with proper structure
2. EVERY contract MUST include functions - even simple "hello world" contracts need at least one function
3. Follow Stacks protocol standards and SIPs (Stacks Improvement Proposals)
4. Use proper Clarity syntax with correct parentheses and data types
5. Include appropriate error handling with (err ...) responses
6. Add meaningful comments to explain complex logic
7. Use descriptive function and variable names
8. Follow common Clarity patterns like:
   - Constants for error codes (e.g., ERR_INVALID_PARAMETER)
   - Data variables for contract state (define-data-var)
   - Maps for complex data structures (define-map)
   - Public functions that return (ok ...) or (err ...)
   - Private helper functions with define-private
   - Read-only functions with define-read-only
   - Traits for contract interfaces (use-trait, define-trait)
   - Contract calls to other contracts when appropriate (contract-call?)

Examples of proper Clarity contract structure:
- Start with constants and error definitions
- Define data structures (data-vars, maps, tokens)
- Implement public functions for external interaction
- Include private helper functions for internal logic
- Add read-only functions for querying state
- End with any necessary utility functions

When asked to create something, immediately generate the Clarity code in a code block
Put ALL code in \`\`\`clarity\n...\`\`\` blocks
Generate complete, deployable contracts
Focus on functionality over documentation
You can generate up to 2000 lines of code if needed
Always use the provided contract name
Include appropriate error handling and comments
Follow SIP standards and best practices
Balance between brevity and completeness

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

Format your responses with minimal text and maximum code. Let the code speak for itself.`;

    // Prepare the request body for Gemini API
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\n${contextMessage}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        topP: 0.9,
      }
    };

    // Call Gemini API using fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return null;
    }

    // Extract the generated text from the response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return generatedText;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, contractName, network, currentCode, codebaseContext } = await req.json();

    const userMessage = messages[messages.length - 1].content;

    // Get the AI response
    const aiResponse = await callGemini(userMessage, contractName, network, currentCode, codebaseContext);

    if (!aiResponse) {
      throw new Error("Failed to get response from Gemini");
    }

    // Return the response directly as text
    return new Response(aiResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[v0] Gemini API Error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}