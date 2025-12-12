import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TeaDiscoveryBar } from "@/components/tea-discovery-bar"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/products"
import { Sparkles, Leaf, Award } from "lucide-react"

export default function HomePage() {
  const featuredProducts = products.slice(0, 3)

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary">
          <Image
            src="/premium-tea-leaves-and-traditional-tea-ceremony.jpg"
            alt="Premium tea leaves"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-balance">Discover Your Perfect Tea</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
            Expertly curated organic specialty teas from single-origin estates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/shop">Explore Collection</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Tea Discovery Bar */}
      <TeaDiscoveryBar />

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">AI-Powered Discovery</h3>
              <p className="text-muted-foreground">Find your ideal tea with personalized recommendations</p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Organic & Ethical</h3>
              <p className="text-muted-foreground">Single-origin teas from sustainable family estates</p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Expert Curation</h3>
              <p className="text-muted-foreground">Each tea selected by our certified tea sommelier</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Featured Collection</h2>
            <p className="text-xl text-muted-foreground">Handpicked selections to begin your tea journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">View All Teas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-bold mb-4">More Than Just Tea</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We believe in educating and empowering tea lovers. Every purchase includes brewing guidance, origin
              stories, and access to our AI tea advisor for personalized recommendations.
            </p>
            <Button size="lg" asChild>
              <Link href="/brew-guide">Learn to Brew</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
