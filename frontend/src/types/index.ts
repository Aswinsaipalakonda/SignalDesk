export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Ticket {
  id: string;
  ticket_text: string;
  predicted_category: string;
  confidence: number;
  priority: PriorityLevel | string;
  priority_reason?: string;
  status: string;
  created_at: string;
}

export interface KpiMetric {
  title: string;
  value: string;
  numeric_value: number;
  trend: string;
  icon: string;
  color: string;
  description?: string;
}

export interface TimeSeriesPoint {
  date: string;
  tickets: number;
  high_priority: number;
}

export interface AnalyticsOverview {
  total_tickets: number;
  billing_tickets: number;
  technical_tickets: number;
  high_priority_tickets: number;
  model_accuracy: string;
  avg_confidence: number;
  model_algorithm: string;
  f1_macro: number;
  num_categories: number;
  kpi_cards: KpiMetric[];
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
  time_series: TimeSeriesPoint[];
  categories: string[];
  priorities: string[];
  recent_tickets: Ticket[];
  date_range: { start?: string; end?: string };
}

export interface AnalyticsFilters {
  category?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
}

export interface TicketPredictResponse {
  ticket_id: string;
  original_text: string;
  cleaned_text: string;
  predicted_category: string;
  confidence: number;
  confidence_percentage: string;
  priority: PriorityLevel | string;
  priority_reason: string;
  matched_pattern: string;
  probabilities: Record<string, number>;
  latency_ms: number;
  status: string;
  saved: boolean;
}

export interface TicketListResponse {
  total: number;
  page: number;
  limit: number;
  items: Ticket[];
}

export interface AlgorithmMetrics {
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  f1_weighted?: number;
}

export interface ModelPerformanceData {
  model_name: string;
  algorithm: string;
  selected_reason: string;
  training_date: string;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  num_categories: number;
  accuracy: number;
  f1_macro: number;
  precision_macro: number;
  recall_macro: number;
  f1_weighted: number;
  categories: string[];
  confusion_matrix: number[][];
  classification_report: Record<string, any>;
  comparison: Record<string, AlgorithmMetrics>;
  dataset_name: string;
  dataset_source: string;
  dataset_summary: {
    total_rows?: number;
    categories?: Record<string, number>;
    priorities?: Record<string, number>;
    date_min?: string;
    date_max?: string;
  };
  vectorizer_config: Record<string, any>;
  preprocessing: Record<string, any>;
  random_seed?: number;
  test_size?: number;
  version: string;
}

export interface DatasetInfo {
  dataset_name: string;
  dataset_source: string;
  total_records: number;
  stored_records: number;
  categories: Record<string, number>;
  priorities: Record<string, number>;
  date_min?: string;
  date_max?: string;
  vectorizer_config: Record<string, any>;
  preprocessing: Record<string, any>;
  model_version: string;
  training_date: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | string;
  api: string;
  database: string;
  model_loaded: boolean;
  model_algorithm: string;
  model_accuracy: number;
  model_version: string;
  trained_on: number;
  version: string;
}

export interface ClassificationSummary {
  category: string;
  priority: string;
  confidence?: number;
  latencyMs?: number;
  ticketId?: string;
  text?: string;
}
