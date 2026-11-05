import axios from 'axios';
import {
  AnalyticsFilters,
  AnalyticsOverview,
  DatasetInfo,
  HealthStatus,
  ModelPerformanceData,
  Ticket,
  TicketListResponse,
  TicketPredictResponse,
} from '../types';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE = configuredApiBase
  ? configuredApiBase.replace(/\/+$/, '')
  : '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

function cleanFilters(filters?: AnalyticsFilters): Record<string, string> {
  if (!filters) return {};
  const params: Record<string, string> = {};
  if (filters.category && filters.category !== 'All') params.category = filters.category;
  if (filters.priority && filters.priority !== 'All') params.priority = filters.priority;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  return params;
}

export const api = {
  getHealth: async (): Promise<HealthStatus> => {
    const res = await client.get('/health');
    return res.data;
  },

  getAnalyticsOverview: async (filters?: AnalyticsFilters): Promise<AnalyticsOverview> => {
    const res = await client.get('/analytics/overview', { params: cleanFilters(filters) });
    return res.data;
  },

  getDatasetInfo: async (): Promise<DatasetInfo> => {
    const res = await client.get('/analytics/dataset');
    return res.data;
  },

  predictTicket: async (ticket_text: string, save = true): Promise<TicketPredictResponse> => {
    const res = await client.post('/tickets/predict', { ticket_text, save });
    return res.data;
  },

  getTickets: async (
    page = 1,
    limit = 20,
    category?: string,
    priority?: string,
    search?: string,
  ): Promise<TicketListResponse> => {
    const params: Record<string, string | number> = { page, limit };
    if (category && category !== 'All') params.category = category;
    if (priority && priority !== 'All') params.priority = priority;
    if (search && search.trim()) params.search = search.trim();

    const res = await client.get('/tickets', { params });
    return res.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const res = await client.get(`/tickets/${id}`);
    return res.data;
  },

  updateTicketPriority: async (
    id: string,
    priority: string,
    reason?: string,
  ): Promise<Ticket> => {
    const res = await client.patch(`/tickets/${id}/priority`, { priority, reason });
    return res.data;
  },

  getModelPerformance: async (): Promise<ModelPerformanceData> => {
    const res = await client.get('/models/performance');
    return res.data;
  },
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg || String(item)).join(', ');
    }
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. The API may still be starting up.';
    }
    if (!error.response) {
      return 'Unable to reach the SignalDesk API. Please confirm the backend is running.';
    }
  }
  return fallback;
}
