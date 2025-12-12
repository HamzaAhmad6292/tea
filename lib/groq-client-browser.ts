import Groq from "groq-sdk"
import type { Product } from "@/lib/products"

// Client-side Groq client for browser usage
// Uses NEXT_PUBLIC_ prefix to make API key available client-side
// Note: For production, consider using a server-side API route for better security

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ""

// Model configuration - using fast, capable model
export const GROQ_MODEL = "llama-3.3-70b-versatile"

export interface TeaRecommendation {
  productIds: string[]
  sommelierComment: string
}

/**
 * Generate tea recommendations based on user preference using Groq LLM
 */
export async function getTeaRecommendations(
  userPreference: string,
  products: Product[]
): Promise<TeaRecommendation> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  // Create a concise product catalog for the prompt
  const productCatalog = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tags: p.tags,
    description: p.short,
    origin: p.origin,
    price: p.price,
  }))

  const systemPrompt = `You are an expert tea sommelier with deep knowledge of tea varieties, flavor profiles, and brewing traditions. Your role is to recommend teas based on customer preferences.

IMPORTANT GUIDELINES:
- Prioritize Oolong, Japanese Green, and Korean Green teas when they match the customer's preferences
- Provide warm, knowledgeable recommendations like a friendly expert
- Focus on flavor profiles, origins, and brewing characteristics
- Keep explanations concise but informative

You MUST respond in valid JSON format with this exact structure:
{
  "productIds": ["id1", "id2", "id3"],
  "sommelierComment": "Your expert recommendation text here..."
}

The sommelierComment should be 2-3 sentences explaining why these teas match what the customer is looking for. Be warm and conversational.`

  const userPrompt = `Customer preference: "${userPreference}"

Available teas:
${JSON.stringify(productCatalog, null, 2)}

Based on the customer's preference, recommend 3-5 teas that best match what they're looking for. Return your response as JSON with productIds (array of tea IDs) and sommelierComment (your expert recommendation).`

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 512,
    response_format: { type: "json_object" },
  })

  const content = completion.choices[0]?.message?.content || ""

  try {
    const parsed = JSON.parse(content)
    return {
      productIds: parsed.productIds || [],
      sommelierComment: parsed.sommelierComment || "Here are some teas you might enjoy.",
    }
  } catch {
    // If JSON parsing fails, try to extract IDs from the response
    console.error("Failed to parse Groq response:", content)
    throw new Error("Failed to parse recommendation response")
  }
}

/**
 * Fallback rule-based matching when LLM is unavailable
 */
export function getFallbackRecommendations(
  userPreference: string,
  products: Product[]
): TeaRecommendation {
  const preference = userPreference.toLowerCase()
  const scored: { product: Product; score: number }[] = []

  // Priority categories get a base boost
  const priorityCategories = ["oolong", "japanese green", "korean green"]

  for (const product of products) {
    let score = 0

    // Check category priority
    if (priorityCategories.some((cat) => product.category.toLowerCase().includes(cat))) {
      score += 2
    }

    // Check for keyword matches in tags
    for (const tag of product.tags) {
      if (preference.includes(tag.toLowerCase())) {
        score += 3
      }
    }

    // Check for matches in description
    const descWords = product.short.toLowerCase().split(/\s+/)
    for (const word of descWords) {
      if (word.length > 3 && preference.includes(word)) {
        score += 1
      }
    }

    // Keyword-based scoring
    const keywordMap: Record<string, string[]> = {
      strong: ["roasted", "oolong", "wuyi"],
      sweet: ["floral", "honeyed", "jasmine"],
      calming: ["jasmine", "floral", "white"],
      energizing: ["green", "japanese", "sencha"],
      focus: ["oolong", "mountain", "jade"],
      floral: ["jasmine", "floral", "scented"],
      earthy: ["oolong", "roasted", "mineral"],
      nutty: ["genmaicha", "toasty", "roasted"],
      vegetal: ["green", "sencha", "umami"],
      smooth: ["white", "silver", "delicate"],
      light: ["white", "green", "jasmine"],
      bold: ["oolong", "roasted", "wuyi"],
      morning: ["sencha", "green", "energizing"],
      afternoon: ["oolong", "floral", "jasmine"],
      evening: ["jasmine", "white", "calming"],
      relaxing: ["jasmine", "white", "floral"],
    }

    for (const [keyword, matches] of Object.entries(keywordMap)) {
      if (preference.includes(keyword)) {
        for (const match of matches) {
          if (
            product.tags.some((t) => t.toLowerCase().includes(match)) ||
            product.category.toLowerCase().includes(match) ||
            product.name.toLowerCase().includes(match)
          ) {
            score += 2
          }
        }
      }
    }

    scored.push({ product, score })
  }

  // Sort by score and take top 3-5
  scored.sort((a, b) => b.score - a.score)
  const topProducts = scored.slice(0, Math.min(4, scored.length)).filter((s) => s.score > 0)

  // If no good matches, return priority teas
  if (topProducts.length < 3) {
    const priorityProducts = products.filter((p) =>
      priorityCategories.some((cat) => p.category.toLowerCase().includes(cat))
    )
    const remaining = priorityProducts
      .filter((p) => !topProducts.some((tp) => tp.product.id === p.id))
      .slice(0, 3 - topProducts.length)
    topProducts.push(...remaining.map((p) => ({ product: p, score: 1 })))
  }

  const recommendedProducts = topProducts.slice(0, 4).map((tp) => tp.product)

  // Generate a simple sommelier comment
  const sommelierComment = generateFallbackComment(userPreference, recommendedProducts)

  return {
    productIds: recommendedProducts.map((p) => p.id),
    sommelierComment,
  }
}

function generateFallbackComment(preference: string, products: Product[]): string {
  if (products.length === 0) {
    return "Explore our curated selection of premium teas."
  }

  const categories = [...new Set(products.map((p) => p.category))]
  const categoryText = categories.slice(0, 2).join(" and ")

  const phrases = [
    `Based on your preference for "${preference}", I'd recommend exploring our ${categoryText} selections.`,
    `For what you're looking for, these ${categoryText} teas offer wonderful flavor profiles that should delight your palate.`,
    `These carefully selected teas from our ${categoryText} collection align beautifully with your taste preferences.`,
  ]

  return phrases[Math.floor(Math.random() * phrases.length)] + " Each offers unique characteristics worth exploring."
}

