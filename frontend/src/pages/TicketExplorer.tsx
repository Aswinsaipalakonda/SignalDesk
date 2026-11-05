import React, { useEffect, useState } from 'react';
import { Search, Download, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { api } from '../services/api';
import { Ticket } from '../types';

export const TicketExplorer: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const categories = [
    'All',
    'Technical Support',
    'Product Issues',
    'Account & Service',
    'Billing & Payment',
    'Order & Delivery',
    'General Inquiry',
  ];

  const priorities = ['All', 'High', 'Medium', 'Low'];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getTickets(page, limit, category, priority, search);
      setTickets(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, category, priority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const exportCsv = () => {
    if (!tickets.length) return;
    const headers = ['ID', 'Category', 'Priority', 'Confidence', 'Text', 'Created At'];
    const rows = tickets.map((t) => [
      t.id,
      t.predicted_category,
      t.priority,
      t.confidence,
      `"${t.ticket_text.replace(/"/g, '""')}"`,
      t.created_at,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `signaldesk_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-text-main tracking-tight">
            Ticket Explorer & Historical Audit
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Search, filter, and audit {total.toLocaleString()} customer inquiries stored in PostgreSQL.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 bg-white border border-border-subtle hover:border-slate-300 text-text-main text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start md:self-auto"
        >
          <Download size={15} />
          <span>Export Filtered to CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-border-subtle rounded-2xl p-4 shadow-card mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, complaint text, or Ticket ID..."
              className="w-full pl-10 pr-4 py-2 bg-surface-warm/50 border border-border-subtle focus:border-brand-green rounded-xl text-xs text-text-main focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-surface-warm/50 border border-border-subtle focus:border-brand-green rounded-xl text-xs text-text-main focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-surface-warm/50 border border-border-subtle focus:border-brand-green rounded-xl text-xs text-text-main focus:outline-none"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-border-subtle rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-warm border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Customer Inquiry Preview</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted font-semibold">
                    Loading records...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No tickets match the specified criteria.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const isHigh = t.priority === 'High';
                  const isMed = t.priority === 'Medium';
                  const confPct = `${Math.round(t.confidence * 100)}%`;

                  return (
                    <tr key={t.id} className="hover:bg-surface-warm/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-text-main">{t.id}</td>
                      <td className="py-3 px-4 font-semibold text-text-main">{t.predicted_category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHigh
                              ? 'bg-priority-high-bg text-priority-high border border-priority-high-border'
                              : isMed
                              ? 'bg-priority-med-bg text-priority-med border border-priority-med-border'
                              : 'bg-priority-low-bg text-priority-low border border-priority-low-border'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-green h-full rounded-full"
                              style={{ width: confPct }}
                            ></div>
                          </div>
                          <span className="font-semibold text-text-muted">{confPct}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-main max-w-sm truncate" title={t.ticket_text}>
                        {t.ticket_text}
                      </td>
                      <td className="py-3 px-4 text-text-muted whitespace-nowrap">{t.created_at}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="p-1 hover:bg-slate-100 rounded text-text-muted hover:text-brand-green"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-warm/40 border-t border-border-subtle text-xs">
          <span className="text-text-muted font-medium">
            Page <b>{page}</b> of <b>{totalPages}</b> ({total.toLocaleString()} total entries)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border-subtle bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border-subtle bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border-subtle">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs font-bold text-text-muted">Ticket {selectedTicket.id}</span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-text-muted hover:text-text-main font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="text-sm font-bold text-text-main mb-2">Customer Message</div>
            <div className="p-3 bg-surface-warm rounded-xl text-xs text-text-main leading-relaxed mb-4 max-h-48 overflow-y-auto">
              {selectedTicket.ticket_text}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-text-muted block font-semibold mb-1">Predicted Category</span>
                <span className="font-bold text-text-main">{selectedTicket.predicted_category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-text-muted block font-semibold mb-1">Priority Tier</span>
                <span className="font-bold text-text-main">{selectedTicket.priority}</span>
              </div>
            </div>
            {selectedTicket.priority_reason && (
              <div className="text-xs text-text-muted bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg mb-4">
                <b>Priority Reason:</b> {selectedTicket.priority_reason}
              </div>
            )}
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2 bg-brand-green text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
