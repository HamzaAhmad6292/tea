"use client"

import Link from "next/link"
import { Leaf, ShoppingCart, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-serif text-2xl font-semibold text-foreground">Cultivate Taste</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/shop" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/brew-guide"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Brew Guide
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
