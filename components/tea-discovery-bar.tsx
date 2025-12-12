"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, Loader2, RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { products, getProductById } from "@/lib/products"
import { logAnalyticsEvent } from "@/lib/analytics"
import {
  getTeaRecommendations,
  getFallbackRecommendations,
  type TeaRecommendation,
} from "@/lib/groq-client-browser"
import type { Product } from "@/lib/products"

const placeholderSuggestions = [
  "I want something strong and a bit sweet",
  "Something floral for the afternoon",
  "Smooth and calming tea for relaxation",
  "A tea with nutty, earthy notes",
  "Energizing tea for my morning routine",
]

export function TeaDiscoveryBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<TeaRecommendation | null>(null)
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [usedFallback, setUsedFallback] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rotate placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    logAnalyticsEvent("TeaSommelierOpened")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setUsedFallback(false)
    logAnalyticsEvent("TeaSommelierQuery", { query })

    try {
      // Try LLM-based recommendations first
      const result = await getTeaRecommendations(query, products)
      setRecommendation(result)

      // Map product IDs to actual products
      const matchedProducts = result.productIds
        .map((id) => getProductById(id))
        .filter((p): p is Product => p !== undefined)

      setSuggestedProducts(matchedProducts)
      logAnalyticsEvent("TeaSommelierSuccess", {
        query,
        productIds: result.productIds,
        usedFallback: false,
      })
    } catch (err) {
      console.error("LLM recommendation failed, using fallback:", err)

      // Fallback to rule-based matching
      try {
        const fallbackResult = getFallbackRecommendations(query, products)
        setRecommendation(fallbackResult)
        setUsedFallback(true)

        const matchedProducts = fallbackResult.productIds
          .map((id) => getProductById(id))
          .filter((p): p is Product => p !== undefined)

        setSuggestedProducts(matchedProducts)
        logAnalyticsEvent("TeaSommelierFallback", {
          query,
          productIds: fallbackResult.productIds,
        })
      } catch (fallbackErr) {
        setError("Unable to generate recommendations. Please try again.")
        logAnalyticsEvent("TeaSommelierError", { query, error: String(fallbackErr) })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setQuery("")
    setRecommendation(null)
    setSuggestedProducts([])
    setError(null)
    setUsedFallback(false)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    inputRef.current?.focus()
  }

  return (
    <div className="w-full bg-gradient-to-b from-secondary/60 to-secondary/30 border-y border-border py-10">
      <div className="container mx-auto px-4">
        {!isOpen ? (
          // Collapsed state - invitation to open
          <button
            onClick={handleOpen}
            className="w-full max-w-3xl mx-auto flex items-center gap-4 px-6 py-5 bg-card border border-border rounded-xl hover:shadow-lg hover:border-accent/50 transition-all group"
            aria-label="Open Tea Sommelier"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-lg font-medium group-hover:text-accent transition-colors">
                Ask Our Tea Sommelier
              </span>
              <span className="block text-sm text-muted-foreground">
                Describe what you&apos;re looking for in natural language
              </span>
            </div>
            <Button size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Get Started
            </Button>
          </button>
        ) : (
          // Expanded state - input and results
          <Card className="max-w-4xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold">Tea Sommelier</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your ideal tea experience
                </p>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholderSuggestions[placeholderIndex]}
                    className="h-12 text-base pr-12"
                    disabled={isLoading}
                    aria-label="Describe your tea preference"
                  />
                  {query && !isLoading && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear input"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!query.trim() || isLoading}
                  className="h-12 px-6 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Ask</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Suggestions */}
            {!recommendation && !isLoading && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {placeholderSuggestions.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-accent/10 animate-pulse" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-accent animate-pulse" />
                </div>
                <p className="text-muted-foreground">
                  Our sommelier is curating your perfect selection...
                </p>
              </div>
            )}

            {/* Results */}
            {recommendation && suggestedProducts.length > 0 && !isLoading && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Sommelier Comment */}
                <div className="relative p-5 rounded-xl bg-gradient-to-br from-accent/5 via-primary/5 to-secondary border border-accent/20">
                  <div className="absolute -top-3 left-4 px-2 bg-card">
                    <span className="text-xs font-medium text-accent uppercase tracking-wide">
                      Sommelier&apos;s Pick
                    </span>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/90 italic">
                    &ldquo;{recommendation.sommelierComment}&rdquo;
                  </p>
                  {usedFallback && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      * Using smart matching (AI temporarily unavailable)
                    </p>
                  )}
                </div>

                {/* Product Cards */}
                <div>
                  <h4 className="font-serif font-semibold text-lg mb-4">
                    Recommended for You
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {suggestedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={() =>
                          logAnalyticsEvent("TeaSommelierAddToCart", {
                            productId: product.id,
                            query,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ask Something Else
                </Button>
              </div>
            )}

            {/* No Results */}
            {recommendation && suggestedProducts.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  We couldn&apos;t find teas matching your exact criteria.
                </p>
                <Button variant="outline" onClick={handleReset}>
                  Try a Different Query
                </Button>
              </div>
            )}

            {/* Close/Minimize Option */}
            {!recommendation && !isLoading && (
              <div className="text-center pt-4 border-t border-border mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe later
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
