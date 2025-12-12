"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"
import { logAnalyticsEvent } from "@/lib/analytics"

const placeholderTexts = ["I want something calming…", "Show me teas for focus…", "Something floral and light…"]

const flavorOptions = ["Floral", "Earthy", "Nutty", "Vegetal", "Roasted", "Unsure"]
const moodOptions = ["Calming", "Energizing", "Focus", "Social", "Explore"]
const strengthOptions = ["Light", "Medium", "Strong"]
const priceOptions = ["Everyday", "Gift", "Special"]

export function TeaDiscoveryBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    flavor: "",
    mood: "",
    strength: "",
    price: "",
  })
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const handleOpen = () => {
    setIsOpen(true)
    setStep(0)
    logAnalyticsEvent("DiscoveryOpened")
  }

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    if (step < 3) {
      setStep(step + 1)
    } else {
      generateSuggestions({ ...answers, [key]: value })
    }
  }

  const generateSuggestions = (finalAnswers: typeof answers) => {
    // Rule-based matching for demo
    const suggested = []

    if (finalAnswers.mood === "Calming") {
      suggested.push(products.find((p) => p.id === "jasmine-pearl"))
      suggested.push(products.find((p) => p.id === "korean-woojeon-demo"))
    } else if (finalAnswers.mood === "Energizing") {
      suggested.push(products.find((p) => p.id === "sencha"))
      suggested.push(products.find((p) => p.id === "genmaicha"))
    } else if (finalAnswers.mood === "Focus") {
      suggested.push(products.find((p) => p.id === "high-mountain-jade-oolong"))
      suggested.push(products.find((p) => p.id === "sencha"))
    }

    if (finalAnswers.flavor === "Floral") {
      suggested.push(products.find((p) => p.id === "jasmine-silver-needle"))
    } else if (finalAnswers.flavor === "Roasted") {
      suggested.push(products.find((p) => p.id === "wuyi-oolong"))
    }

    // Ensure we prioritize Oolong/Japanese/Korean
    const priority = products.filter(
      (p) => p.category.includes("Oolong") || p.category.includes("Japanese") || p.category.includes("Korean"),
    )

    while (suggested.length < 3) {
      const random = priority[Math.floor(Math.random() * priority.length)]
      if (!suggested.includes(random)) {
        suggested.push(random)
      }
    }

    setSuggestions(suggested.filter(Boolean).slice(0, 3))
  }

  const questions = [
    { key: "flavor", label: "What flavor family interests you?", options: flavorOptions },
    { key: "mood", label: "What mood are you seeking?", options: moodOptions },
    { key: "strength", label: "Preferred strength?", options: strengthOptions },
    { key: "price", label: "Price range?", options: priceOptions },
  ]

  return (
    <div className="w-full bg-secondary/50 border-y border-border py-8">
      <div className="container mx-auto px-4">
        {!isOpen ? (
          <button
            onClick={handleOpen}
            className="w-full max-w-3xl mx-auto flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-lg hover:shadow-md transition-all group"
          >
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
              {placeholderTexts[placeholderIndex % placeholderTexts.length]}
            </span>
            <Button size="sm" className="ml-auto">
              Ask the Tea Guide
            </Button>
          </button>
        ) : (
          <Card className="max-w-3xl mx-auto p-6">
            {suggestions.length === 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold">{questions[step].label}</h3>
                  <span className="text-sm text-muted-foreground">Step {step + 1} of 4</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {questions[step].options.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      onClick={() => handleAnswer(questions[step].key, option)}
                      className="h-auto py-3"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-semibold mb-2">Perfect Picks for You</h3>
                  <p className="text-muted-foreground">
                    Based on your preferences, we recommend these exceptional teas
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {suggestions.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={() => logAnalyticsEvent("DiscoverySuggestionClicked", { productId: product.id })}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    setSuggestions([])
                    setStep(0)
                    setAnswers({ flavor: "", mood: "", strength: "", price: "" })
                  }}
                  className="w-full"
                >
                  Start Over
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
