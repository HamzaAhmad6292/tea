export interface SimilarityMapping {
  similar: string[]
  premium: string[]
  contrast: string[]
  weights: {
    similar: number
    premium: number
    contrast: number
  }
}

export const similarityIndex: Record<string, SimilarityMapping> = {
  "eastern-beauty-oolong": {
    similar: ["high-mountain-jade-oolong", "wuyi-oolong"],
    premium: ["high-mountain-jade-oolong"],
    contrast: ["sencha"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
  "wuyi-oolong": {
    similar: ["eastern-beauty-oolong", "high-mountain-jade-oolong"],
    premium: ["eastern-beauty-oolong"],
    contrast: ["dragonwell"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
  "high-mountain-jade-oolong": {
    similar: ["eastern-beauty-oolong", "wuyi-oolong"],
    premium: ["eastern-beauty-oolong"],
    contrast: ["jasmine-pearl"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
  sencha: {
    similar: ["genmaicha", "dragonwell"],
    premium: ["korean-woojeon-demo", "dragonwell"],
    contrast: ["wuyi-oolong"],
    weights: { similar: 0.6, premium: 0.3, contrast: 0.1 },
  },
  genmaicha: {
    similar: ["sencha", "jasmine-pearl"],
    premium: ["sencha"],
    contrast: ["eastern-beauty-oolong"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
  "korean-woojeon-demo": {
    similar: ["sencha", "genmaicha"],
    premium: ["high-mountain-jade-oolong"],
    contrast: ["jasmine-silver-needle"],
    weights: { similar: 0.7, premium: 0.2, contrast: 0.1 },
  },
  dragonwell: {
    similar: ["sencha", "genmaicha"],
    premium: ["korean-woojeon-demo"],
    contrast: ["wuyi-oolong"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
  "jasmine-pearl": {
    similar: ["jasmine-silver-needle", "genmaicha"],
    premium: ["jasmine-silver-needle"],
    contrast: ["wuyi-oolong"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
  "jasmine-silver-needle": {
    similar: ["jasmine-pearl", "high-mountain-jade-oolong"],
    premium: ["high-mountain-jade-oolong"],
    contrast: ["wuyi-oolong"],
    weights: { similar: 0.6, premium: 0.25, contrast: 0.15 },
  },
}

export function getSimilarProducts(productId: string) {
  return similarityIndex[productId] || null
}
