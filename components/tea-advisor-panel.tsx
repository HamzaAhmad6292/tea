"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Scale, Sparkles, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Product } from "@/lib/products"
import { getProductById } from "@/lib/products"
import { getSimilarProducts } from "@/lib/similarity-index"
import { logAnalyticsEvent } from "@/lib/analytics"

interface TeaAdvisorPanelProps {
  product: Product
}

export function TeaAdvisorPanel({ product }: TeaAdvisorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [showBrewGuide, setShowBrewGuide] = useState(false)
  const similarProducts = getSimilarProducts(product.id)

  const handleCompare = () => {
    logAnalyticsEvent("AdvisorOpened", { productId: product.id })
    setShowComparison(true)
  }

  const recommendationReasons = [
    `Exceptional ${product.tags.join(", ")} profile`,
    `Sourced from ${product.origin}`,
    `Perfect for ${product.brew.split("/")[1].trim()} brewing`,
  ]

  const similar1 = similarProducts ? getProductById(similarProducts.similar[0]) : null
  const similar2 = similarProducts ? getProductById(similarProducts.similar[1]) : null

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
