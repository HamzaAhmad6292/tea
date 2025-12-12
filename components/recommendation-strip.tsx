"use client"

import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"
import { getProductById } from "@/lib/products"
import { getSimilarProducts } from "@/lib/similarity-index"
import { logAnalyticsEvent } from "@/lib/analytics"

interface RecommendationStripProps {
  currentProduct: Product
}

export function RecommendationStrip({ currentProduct }: RecommendationStripProps) {
  const similarityMap = getSimilarProducts(currentProduct.id)

  if (!similarityMap) return null

  const similarProduct = getProductById(similarityMap.similar[0])
  const premiumProduct = getProductById(similarityMap.premium[0])
  const contrastProduct = getProductById(similarityMap.contrast[0])

  const handleClick = (type: string, productId: string) => {
    logAnalyticsEvent("RecommendationClicked", {
      type,
      currentProductId: currentProduct.id,
      recommendedProductId: productId,
    })
  }

  return (
    <section className="py-12 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 text-sm font-normal">
            Curated by Our Tea Sommelier
          </Badge>
          <h2 className="text-3xl font-serif font-semibold mb-2">Since you're exploring {currentProduct.name}</h2>
          <p className="text-muted-foreground">You may also love these exceptional selections</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {similarProduct && (
            <div>
              <div className="mb-2 text-center">
                <span className="text-sm font-semibold text-muted-foreground">Similar</span>
              </div>
              <ProductCard
                product={similarProduct}
                onAddToCart={() => handleClick("similar", similarProduct.id)}
                showCompare
              />
            </div>
          )}

          {premiumProduct && (
            <div>
              <div className="mb-2 text-center">
                <Badge className="bg-accent text-white">Top Pick</Badge>
              </div>
              <ProductCard
                product={premiumProduct}
                onAddToCart={() => handleClick("premium", premiumProduct.id)}
                showCompare
              />
            </div>
          )}

          {contrastProduct && (
            <div>
              <div className="mb-2 text-center">
                <span className="text-sm font-semibold text-muted-foreground">Explore</span>
              </div>
              <ProductCard
                product={contrastProduct}
                onAddToCart={() => handleClick("contrast", contrastProduct.id)}
                showCompare
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
