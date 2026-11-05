export interface Ticket {
  id: string;
  ticket_text: string;
  predicted_category: string;
  confidence: number;
  priority: 'High' | 'Medium' | 'Low' | string;
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
}

export interface AnalyticsOverview {
  total_tickets: number;
  billing_tickets: number;
  technical_tickets: number;
  high_priority_tickets: number;
  model_accuracy: string;
  kpi_cards: KpiMetric[];
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
  recent_tickets: Ticket[];
}

export interface TicketPredictResponse {
  ticket_id: string;
  original_text: string;
  cleaned_text: string;
  predicted_category: string;
  confidence: number;
  confidence_percentage: string;
  priority: string;
  priority_reason: string;
  matched_pattern: string;
  probabilities: Record<string, number>;
  latency_ms: number;
  status: string;
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
  categories: string[];
  confusion_matrix: number[][];
  classification_report: Record<string, any>;
  comparison: Record<string, {
    accuracy: number;
    precision_macro: number;
    recall_macro: number;
    f1_macro: number;
  }>;
}
