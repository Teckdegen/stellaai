// Groq API Client for testing
import Groq from "groq-sdk"

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
})

/**
 * Test function to verify Groq API connectivity
 */
export async function testGroqConnection(): Promise<boolean> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say hello world",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 100,
    })

    const response = completion.choices[0]?.message?.content || ""
    console.log("Groq API Test Response:", response)
    return response.length > 0
  } catch (error) {
    console.error("Groq API Test Error:", error)
    return false
  }
}

/**
 * Function to generate Clarity code using Groq API
 */
export async function generateClarityCode(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    })

    return completion.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("Groq API Error:", error)
    throw error
  }
}