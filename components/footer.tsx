import Link from "next/link"
import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">Cultivate Taste</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium organic specialty teas, ethically sourced from single-origin estates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop?category=oolong" className="text-muted-foreground hover:text-foreground">
                  Oolong
                </Link>
              </li>
              <li>
                <Link href="/shop?category=green" className="text-muted-foreground hover:text-foreground">
                  Green Tea
                </Link>
              </li>
              <li>
                <Link href="/shop?category=white" className="text-muted-foreground hover:text-foreground">
                  White Tea
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground">
                  All Teas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/brew-guide" className="text-muted-foreground hover:text-foreground">
                  Brewing Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Our Teas
                </Link>
              </li>
              <li>
                <Link href="/origins" className="text-muted-foreground hover:text-foreground">
                  Tea Origins
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-muted-foreground hover:text-foreground">
                  Wholesale
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cultivate Taste Tea. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
