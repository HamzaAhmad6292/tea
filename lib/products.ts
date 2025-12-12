import productsData from "@/data/products.json"

export interface Product {
  id: string
  name: string
  category: string
  price: number
  priceRange?: string
  short: string
  long: string
  origin: string
  brew: string
  image: string
  tags: string[]
}

export const products: Product[] = productsData

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()))
}

export function getProductsByTags(tags: string[]): Product[] {
  return products.filter((p) => tags.some((tag) => p.tags.includes(tag.toLowerCase())))
}
