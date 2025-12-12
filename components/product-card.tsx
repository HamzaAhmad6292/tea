"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
  showCompare?: boolean
}

export function ProductCard({ product, onAddToCart, showCompare = false }: ProductCardProps) {
  const { toast } = useToast()

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
    onAddToCart?.()
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/20">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/shop/${product.id}`}>
            <h3 className="font-serif font-semibold text-lg leading-tight hover:text-accent transition-colors">
              {product.name}
            </h3>
          </Link>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {product.category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.short}</p>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">{product.origin}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button onClick={handleAddToCart} className="flex-1 gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
        {showCompare && (
          <Button variant="outline" size="sm">
            Compare
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
