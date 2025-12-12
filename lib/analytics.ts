type AnalyticsEvent =
  | "DiscoveryOpened"
  | "DiscoverySuggestionClicked"
  | "AdvisorOpened"
  | "RecommendationClicked"
  | "CompareClicked"
  | "AddToCartClicked"
  | "CreateTastingSetClicked"

export function logAnalyticsEvent(event: AnalyticsEvent, data?: Record<string, any>) {
  console.log(`[v0 Analytics] ${event}`, data || {})
}
