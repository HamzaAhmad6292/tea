import Groq from "groq-sdk"

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
})

// Model configuration
// Available models: llama-3.3-70b-versatile, llama-3.1-70b-versatile, llama-3-70b-8192
// Check https://console.groq.com/docs/models for the latest model names
export const GROQ_MODEL = "llama-3.3-70b-versatile"

// Message types for conversation history
export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

// Memory store interface
interface ConversationMemory {
  messages: ChatMessage[]
  maxMessages: number
  createdAt: number
  lastAccessed: number
}

// In-memory store for conversation history
// In production, consider using Redis, database, or other persistent storage
const memoryStore = new Map<string, ConversationMemory>()

// Configuration
const DEFAULT_MAX_MESSAGES = 50 // Keep last 50 messages per conversation
const MEMORY_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Get or create a conversation memory
 */
function getConversationMemory(sessionId: string): ConversationMemory {
  const existing = memoryStore.get(sessionId)
  
  if (existing) {
    existing.lastAccessed = Date.now()
    return existing
  }

  const newMemory: ConversationMemory = {
    messages: [],
    maxMessages: DEFAULT_MAX_MESSAGES,
    createdAt: Date.now(),
    lastAccessed: Date.now(),
  }

  memoryStore.set(sessionId, newMemory)
  return newMemory
}

/**
 * Clean up old conversations (older than TTL)
 */
function cleanupOldMemories() {
  const now = Date.now()
  for (const [sessionId, memory] of memoryStore.entries()) {
    if (now - memory.lastAccessed > MEMORY_TTL) {
      memoryStore.delete(sessionId)
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldMemories, 60 * 60 * 1000)
}

/**
 * Add a message to conversation history
 */
function addMessage(sessionId: string, message: ChatMessage) {
  const memory = getConversationMemory(sessionId)
  memory.messages.push(message)

  // Trim messages if exceeding max
  if (memory.messages.length > memory.maxMessages) {
    // Keep system messages and remove oldest user/assistant pairs
    const systemMessages = memory.messages.filter((m) => m.role === "system")
    const otherMessages = memory.messages.filter((m) => m.role !== "system")
    const toRemove = otherMessages.length - (memory.maxMessages - systemMessages.length)
    
    if (toRemove > 0) {
      memory.messages = [
        ...systemMessages,
        ...otherMessages.slice(toRemove),
      ]
    }
  }
}

/**
 * Get conversation history for a session
 */
export function getConversationHistory(sessionId: string): ChatMessage[] {
  const memory = getConversationMemory(sessionId)
  return [...memory.messages] // Return a copy
}

/**
 * Clear conversation history for a session
 */
export function clearConversationHistory(sessionId: string) {
  memoryStore.delete(sessionId)
}

/**
 * Chat completion with memory management
 */
export interface ChatCompletionOptions {
  sessionId: string
  message: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Send a chat message with automatic memory management
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  // Validate API key
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY environment variable is not set. Please add it to your .env file."
    )
  }

  const {
    sessionId,
    message,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 1024,
    stream = false,
  } = options

  // Get conversation memory
  const memory = getConversationMemory(sessionId)

  // Build messages array
  const messages: ChatMessage[] = []

  // Add system prompt if provided and not already in history
  if (systemPrompt) {
    const hasSystemMessage = memory.messages.some((m) => m.role === "system")
    if (!hasSystemMessage) {
      messages.push({ role: "system", content: systemPrompt })
    }
  }

  // Add conversation history
  messages.push(...memory.messages.filter((m) => m.role !== "system" || !systemPrompt))

  // Add current user message
  messages.push({ role: "user", content: message })
  addMessage(sessionId, { role: "user", content: message })

  try {
    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: messages as any,
      temperature,
      max_tokens: maxTokens,
      stream,
    })

    if (stream) {
      // Handle streaming response
      let fullContent = ""
      const stream = completion as any

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ""
        fullContent += content
      }

      // Save assistant response to memory
      addMessage(sessionId, { role: "assistant", content: fullContent })

      return {
        content: fullContent,
        usage: undefined, // Usage not available for streaming
      }
    } else {
      const content = (completion as any).choices[0]?.message?.content || ""
      const usage = (completion as any).usage

      // Save assistant response to memory
      addMessage(sessionId, { role: "assistant", content })

      return {
        content,
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens || 0,
              completionTokens: usage.completion_tokens || 0,
              totalTokens: usage.total_tokens || 0,
            }
          : undefined,
      }
    }
  } catch (error) {
    console.error("Groq API error:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to get chat completion"
    )
  }
}

/**
 * Create a streaming chat completion
 */
export async function* chatCompletionStream(
  options: ChatCompletionOptions
): AsyncGenerator<string, void, unknown> {
  const response = await chatCompletion({ ...options, stream: true })
  // For streaming, we'd need to modify the function to yield chunks
  // This is a simplified version - you may want to refactor for true streaming
  yield response.content
}

/**
 * Initialize a new conversation with a system prompt
 */
export function initializeConversation(
  sessionId: string,
  systemPrompt: string
) {
  const memory = getConversationMemory(sessionId)
  // Clear existing messages and set system prompt
  memory.messages = [{ role: "system", content: systemPrompt }]
}

/**
 * Get memory statistics
 */
export function getMemoryStats() {
  return {
    totalConversations: memoryStore.size,
    totalMessages: Array.from(memoryStore.values()).reduce(
      (sum, mem) => sum + mem.messages.length,
      0
    ),
  }
}

