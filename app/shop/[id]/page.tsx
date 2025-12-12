import { notFound } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TeaAdvisorPanel } from "@/components/tea-advisor-panel"
import { RecommendationStrip } from "@/components/recommendation-strip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProductById, products } from "@/lib/products"
import { ShoppingCart, Heart } from "lucide-react"

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Product Image & Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary/20">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    {product.category}
                  </Badge>
                  <h1 className="font-serif text-4xl font-bold mb-3">{product.name}</h1>
                  <p className="text-xl text-muted-foreground">{product.short}</p>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
                  {product.priceRange && (
                    <span className="text-sm text-muted-foreground">Range: ${product.priceRange}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <Button size="lg" className="w-full gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Add to cart
                  </Button>
                  <Button size="lg" variant="outline" className="w-full bg-transparent">
                    Add to subscription
                  </Button>
                  <Button size="lg" variant="ghost" className="w-full gap-2">
                    <Heart className="h-5 w-5" />
                    Save for later
                  </Button>
                </div>

                <div className="pt-4 space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Origin</span>
                    <span className="font-medium">{product.origin}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Brew</span>
                    <span className="font-medium">{product.brew}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Profile</span>
                    <span className="font-medium capitalize">{product.tags.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="font-serif text-2xl font-semibold mb-4">About This Tea</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.long}</p>
            </div>
          </div>

          {/* Tea Advisor Panel */}
          <div>
            <TeaAdvisorPanel product={product} />
          </div>
        </div>

        {/* Recommendation Strip */}
        <RecommendationStrip currentProduct={product} />
      </main>

      <Footer />
    </div>
  )
}
