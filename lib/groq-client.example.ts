/**
 * Example usage of the Groq client with memory management
 * 
 * Make sure to set GROQ_API_KEY in your .env file:
 * GROQ_API_KEY=your_api_key_here
 */

import {
  chatCompletion,
  initializeConversation,
  clearConversationHistory,
  getConversationHistory,
  getMemoryStats,
} from "./groq-client"

// Example 1: Basic chat with memory
export async function exampleBasicChat() {
  const sessionId = "user-123"

  // Initialize conversation with system prompt
  initializeConversation(
    sessionId,
    "You are a helpful tea expert assistant. Provide friendly and informative responses about tea."
  )

  // First message
  const response1 = await chatCompletion({
    sessionId,
    message: "What's the difference between green tea and oolong tea?",
    temperature: 0.7,
    maxTokens: 500,
  })

  console.log("Assistant:", response1.content)
  console.log("Tokens used:", response1.usage)

  // Follow-up message (memory is maintained)
  const response2 = await chatCompletion({
    sessionId,
    message: "Which one has more caffeine?",
    temperature: 0.7,
    maxTokens: 300,
  })

  console.log("Assistant:", response2.content)
}

// Example 2: Using in a Next.js API route
export async function exampleApiRoute(sessionId: string, userMessage: string) {
  try {
    const response = await chatCompletion({
      sessionId,
      message: userMessage,
      systemPrompt: "You are a helpful assistant for a tea e-commerce website.",
      temperature: 0.7,
      maxTokens: 1024,
    })

    return {
      success: true,
      message: response.content,
      usage: response.usage,
    }
  } catch (error) {
    console.error("Chat error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Example 3: Clear conversation history
export function exampleClearHistory(sessionId: string) {
  clearConversationHistory(sessionId)
  console.log(`Conversation history cleared for session: ${sessionId}`)
}

// Example 4: Get conversation history
export function exampleGetHistory(sessionId: string) {
  const history = getConversationHistory(sessionId)
  console.log(`Conversation has ${history.length} messages`)
  return history
}

// Example 5: Check memory statistics
export function exampleMemoryStats() {
  const stats = getMemoryStats()
  console.log(`Total conversations: ${stats.totalConversations}`)
  console.log(`Total messages stored: ${stats.totalMessages}`)
  return stats
}

