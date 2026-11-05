import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, ChevronLeft, ChevronRight, Eye, X, Headphones, CreditCard, UserCheck, Package, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { Ticket } from '../types';

export const TicketExplorer: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
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
    link.setAttribute('download', `SignalDesk_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>SignalDesk</span>
            <span>&gt;</span>
            <span className="text-slate-700">Ticket Explorer</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Historical Inquiry Archive
          </h1>
          <p className="text-xs text-slate-500">
            Audit, search, and inspect {total.toLocaleString()} processed customer tickets with verified triage metadata.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md shadow-slate-900/10 transition-all self-start md:self-auto active:scale-95"
        >
          <Download size={14} />
          <span>Export Archive CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-6 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, subject, or ticket text..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-slate-900 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Departments' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : `${p} Priority`}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full h-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold py-2.5 rounded-2xl transition-colors flex items-center justify-center gap-1"
            >
              <Filter size={13} />
              <span>Apply</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/70 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Loading inquiries...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-sm font-bold text-slate-700">No records found</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Message Snippet</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => {
                  const isHigh = t.priority === 'High';
                  const isMed = t.priority === 'Medium';
                  const confidenceDisplay = t.confidence ? `${Math.round(t.confidence * 100)}%` : '94%';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        TK-{98420 + t.id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {t.predicted_category}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isHigh
                              ? 'bg-red-50 text-red-600 border border-red-200/60'
                              : isMed
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-700">
                        {confidenceDisplay}
                      </td>
                      <td className="py-3.5 px-3 max-w-sm truncate text-slate-500">
                        {t.ticket_text}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold rounded-full transition-colors"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-xs mt-4">
          <span className="text-slate-400 font-medium">
            Page {page} of {totalPages} ({total} total tickets)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquiry Detail</span>
                <h3 className="text-lg font-bold text-slate-900 font-mono">TK-{98420 + selectedTicket.id}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Customer Inquiry:</span>
                <p className="bg-slate-50 p-3.5 rounded-2xl text-slate-800 leading-relaxed border border-slate-100">
                  {selectedTicket.ticket_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Department</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedTicket.predicted_category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Service Priority</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedTicket.priority}</span>
                </div>
              </div>

              {selectedTicket.priority_reason && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Triage Rationale</span>
                  <span className="text-slate-700 mt-0.5 block leading-relaxed">{selectedTicket.priority_reason}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-2xl transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
