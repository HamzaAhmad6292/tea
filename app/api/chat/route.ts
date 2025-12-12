import { NextRequest, NextResponse } from "next/server"
import { chatCompletion } from "@/lib/groq-client"
import type { Product } from "@/lib/products"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, product } = body

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" },
        { status: 400 }
      )
    }

    // Create a system prompt based on the product
    let systemPrompt = "You are a helpful tea expert assistant. Provide friendly, informative, and very concise responses about tea. Keep your answers brief and to the point - aim for 2-3 sentences maximum."
    
    if (product) {
      const productInfo = product as Product
      systemPrompt = `You are a helpful tea expert assistant specializing in ${productInfo.name}. 

Product Details:
- Name: ${productInfo.name}
- Origin: ${productInfo.origin}
- Category: ${productInfo.category}
- Tags: ${productInfo.tags.join(", ")}
- Brew Instructions: ${productInfo.brew}
- Description: ${productInfo.short}

Provide friendly, informative, and very concise responses about this specific tea. Keep your answers brief and to the point - aim for 2-3 sentences maximum. Answer questions about brewing, flavor profile, origin, and any other tea-related topics. Be conversational but keep responses short.`
    }

    // Initialize conversation if needed (first message)
    const response = await chatCompletion({
      sessionId,
      message,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return NextResponse.json({
      success: true,
      content: response.content,
      usage: response.usage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process chat message",
      },
      { status: 500 }
    )
  }
}

