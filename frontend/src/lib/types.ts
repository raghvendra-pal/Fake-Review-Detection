export interface TokenAttribution {
  word: string;
  weight: number;
  type: "suspicious" | "authentic";
}

export interface ReviewForensicResult {
  id: string;
  reviewer_name: string;
  reviewer_id: string;
  review_text: string;
  rating: number;
  review_date?: string;
  helpful_votes: number;
  verified_purchase: boolean;
  fake_probability: number;
  is_flagged: boolean;
  linguistic_flags: string[];
  top_suspicious_words: TokenAttribution[];
  account_cluster_id?: string | null;
  account_risk_score: number;
}

export interface AccountRiskCard {
  reviewer_name: string;
  reviewer_id: string;
  total_reviews: number;
  average_rating: number;
  five_star_ratio: number;
  rating_variance: number;
  cluster_id?: string | null;
  pattern_flag?: string | null;
  account_risk_score: number;
  reviews_indices?: number[];
}

export interface NetworkNode {
  id: string;
  label: string;
  val: number;
  risk_score: number;
  group: number;
  cluster_name: string;
  total_reviews: number;
  avg_rating: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
  reason: string;
}

export interface RingDetail {
  ring_id: string;
  name: string;
  member_count: number;
  members: string[];
  average_risk: number;
  edges_count: number;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  rings_detected: number;
  ring_details?: RingDetail[];
}

export interface BurstTimelinePoint {
  date: string;
  review_count: number;
  average_rating: number;
  is_burst: boolean;
}

export interface MetricsSummary {
  rating_distribution: Record<string, number>;
  j_curve_detected: boolean;
  polarization_detected: boolean;
  distribution_verdict?: string;
  burst_windows_detected: number;
  account_rings_detected: number;
  avg_review_length: number;
  sentiment_mismatches: number;
  ai_generated_ratio: number;
  verified_purchase_ratio: number;
  burst_timeline: BurstTimelinePoint[];
  key_warnings: string[];
  positive_indicators: string[];
}

export interface AnalysisReport {
  id: string;
  target_url?: string | null;
  target_title: string;
  source_type: string;
  trust_score: number;
  verdict: "Trustworthy" | "Suspicious" | "High Risk";
  fake_probability: number;
  total_reviews: number;
  flagged_reviews: number;
  metrics_summary: MetricsSummary;
  network_graph: NetworkGraphData;
  reviews: ReviewForensicResult[];
  accounts: AccountRiskCard[];
  created_at?: string;
  success?: boolean;
}

export interface ScraperFallbackResponse {
  success: false;
  is_blocked: boolean;
  status_code: number;
  error_code: string;
  target_url: string;
  title: string;
  message: string;
  fallback_options: string[];
  suggested_demo?: string;
}

export interface QuickCheckResult {
  fake_probability: number;
  trust_score: number;
  verdict: string;
  linguistic_flags: string[];
  readability_score: number;
  readability_level: string;
  ai_generated_likelihood: number;
  sentiment_polarity: number;
  token_attributions: TokenAttribution[];
  explanation: string;
}

export interface CompareTargetResult {
  title: string;
  trust_score: number;
  verdict: string;
  fake_probability: number;
  total_reviews: number;
  flagged_reviews: number;
  account_rings_detected: number;
  burst_windows_detected: number;
  key_strengths: string[];
  key_warnings: string[];
}

export interface CompareResponse {
  comparison_id: string;
  targets: CompareTargetResult[];
  winner_title: string;
  summary_verdict: string;
}

export interface ArticleCheckResult {
  id: string;
  url?: string;
  title: string;
  credibility_score: number;
  clickbait_score: number;
  sensationalism_score: number;
  domain_reputation: string;
  domain_name?: string;
  flagged_phrases: Array<{ term: string; type: string; explanation: string }>;
  verdict: string;
  key_takeaways: string[];
  created_at?: string;
}

export interface DemoItem {
  id: string;
  title: string;
  description: string;
  review_count: number;
}
