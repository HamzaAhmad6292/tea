"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Scale, Sparkles, Coffee, MessageCircle, Send, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product } from "@/lib/products"
import { getProductById } from "@/lib/products"
import { getSimilarProducts } from "@/lib/similarity-index"
import { logAnalyticsEvent } from "@/lib/analytics"

interface TeaAdvisorPanelProps {
  product: Product
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const PRESET_QUESTIONS = [
  "What makes this tea special?",
  "How should I brew this tea?",
  "What does this tea taste like?",
  "Is this tea good for beginners?",
]

export function TeaAdvisorPanel({ product }: TeaAdvisorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [showBrewGuide, setShowBrewGuide] = useState(false)
  const [showQA, setShowQA] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = `tea-advisor-${product.id}`
  const similarProducts = getSimilarProducts(product.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: message }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
          product,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.content,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetQuestion = (question: string) => {
    sendMessage(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleCompare = () => {
    logAnalyticsEvent("AdvisorOpened", { productId: product.id })
    setShowComparison(true)
  }

  const recommendationReasons = [
    `Exceptional ${product.tags.join(", ")} profile`,
    `Sourced from ${product.origin}`,
    `Perfect for ${product.brew.split("/")[1].trim()} brewing`,
  ]

  const similar1 = similarProducts?.similar?.[0] ? getProductById(similarProducts.similar[0]) ?? null : null
  const similar2 = similarProducts?.similar?.[1] ? getProductById(similarProducts.similar[1]) ?? null : null

  return (
    <>
      <Card className="lg:sticky lg:top-20 overflow-hidden">
        <CardHeader className="bg-secondary/30 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Tea Advisor • Compare & Choose
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 space-y-3">
            {!showQA ? (
              <>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Why we recommend
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {recommendationReasons.map((reason, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-accent">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={handleCompare} variant="outline" className="w-full gap-2 bg-transparent">
                  <Scale className="h-4 w-4" />
                  Compare with Similar
                </Button>

                <Button onClick={() => setShowBrewGuide(true)} variant="outline" className="w-full">
                  Brew Guidance
                </Button>

                <Button 
                  onClick={() => setShowQA(true)} 
                  variant="outline" 
                  className="w-full gap-2 bg-transparent"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask AI About This Tea
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 min-h-[400px]">
                {/* Back Button */}
                <Button 
                  onClick={() => setShowQA(false)} 
                  variant="ghost" 
                  size="sm"
                  className="w-fit -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {/* Pre-set Questions */}
                {messages.length === 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Quick Questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_QUESTIONS.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handlePresetQuestion(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                <ScrollArea className="flex-1 border rounded-md p-4 min-h-[250px] max-h-[350px]">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Ask me anything about {product.name}!</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about this tea..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Compare Teas</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {similar1 && <ProductCard product={similar1} showCompare />}
            {similar2 && <ProductCard product={similar2} showCompare />}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              className="flex-1"
              onClick={() => {
                logAnalyticsEvent("CreateTastingSetClicked", { products: [product.id, similar1?.id, similar2?.id] })
              }}
            >
              Create tasting set — save 10%
            </Button>
            <Button variant="outline" onClick={() => setShowComparison(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBrewGuide} onOpenChange={setShowBrewGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Brewing {product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold mb-2">Temperature & Time</h4>
              <p className="text-muted-foreground">{product.brew}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Steps</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Heat water to {product.brew.split("/")[0].trim()}</li>
                <li>Use 1 teaspoon per 8oz cup</li>
                <li>Steep for {product.brew.split("/")[1].trim()}</li>
                <li>Strain and enjoy</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
