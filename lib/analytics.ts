type AnalyticsEvent =
  | "DiscoveryOpened"
  | "DiscoverySuggestionClicked"
  | "AdvisorOpened"
  | "RecommendationClicked"
  | "CompareClicked"
  | "AddToCartClicked"
  | "CreateTastingSetClicked"
  | "TeaSommelierOpened"
  | "TeaSommelierQuery"
  | "TeaSommelierSuccess"
  | "TeaSommelierFallback"
  | "TeaSommelierError"
  | "TeaSommelierAddToCart"

export function logAnalyticsEvent(event: AnalyticsEvent, data?: Record<string, any>) {
  console.log(`[v0 Analytics] ${event}`, data || {})
}
