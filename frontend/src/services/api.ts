import axios from 'axios';
import { AnalyticsOverview, TicketPredictResponse, Ticket, ModelPerformanceData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await client.get('/analytics/overview');
    return res.data;
  },

  predictTicket: async (ticket_text: string, save = true): Promise<TicketPredictResponse> => {
    const res = await client.post('/tickets/predict', { ticket_text, save });
    return res.data;
  },

  getTickets: async (page = 1, limit = 20, category?: string, priority?: string, search?: string) => {
    const params: Record<string, any> = { page, limit };
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

  getModelPerformance: async (): Promise<ModelPerformanceData> => {
    const res = await client.get('/models/performance');
    return res.data;
  },
};
