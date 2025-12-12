import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"
import { Button } from "@/components/ui/button"

export default function ShopPage() {
  const categories = ["All", "Oolong", "Japanese Green", "Green", "White", "Floral"]

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold mb-4">Our Tea Collection</h1>
          <p className="text-xl text-muted-foreground">Explore our curated selection of premium organic teas</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button key={category} variant={category === "All" ? "default" : "outline"} className="rounded-full">
              {category}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
