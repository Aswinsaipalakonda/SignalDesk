import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiFilter,
  FiInbox,
  FiLoader,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiX,
} from 'react-icons/fi';
import { api, getApiErrorMessage } from '../services/api';
import { Ticket } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { formatDate, formatRelativeTime, truncate } from '../lib/format';

interface TicketExplorerProps {
  initialTicket?: Ticket | null;
  onInitialTicketHandled?: () => void;
}

const PAGE_SIZE = 10;
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const FALLBACK_CATEGORIES = [
  'Technical Support',
  'Product Issues',
  'Account & Service',
  'Billing & Payment',
  'Order & Delivery',
  'General Inquiry',
];

export const TicketExplorer: React.FC<TicketExplorerProps> = ({
  initialTicket,
  onInitialTicketHandled,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalPriority, setModalPriority] = useState('Low');
  const [savingPriority, setSavingPriority] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!initialTicket) return;
    setSelectedTicket(initialTicket);
    setModalPriority(initialTicket.priority);
    onInitialTicketHandled?.();
  }, [initialTicket, onInitialTicketHandled]);

  useEffect(() => {
    let cancelled = false;
    api
      .getDatasetInfo()
      .then((info) => {
        if (cancelled) return;
        const values = Object.keys(info.categories || {});
        if (values.length > 0) setCategories(values.sort());
      })
      .catch(() => {
        /* Keep fallback categories when the API is still starting. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getTickets(page, PAGE_SIZE, category, priority, search);
        if (cancelled) return;
        setTickets(response.items || []);
        setTotal(response.total || 0);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Unable to load ticket history.'));
          setTickets([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTickets();
    return () => {
      cancelled = true;
    };
  }, [page, category, priority, search, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilterCount = useMemo(
    () =>
      [category !== 'All', priority !== 'All', search.length > 0].filter(Boolean).length,
    [category, priority, search],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const clearFilters = () => {
    setCategory('All');
    setPriority('All');
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const exportCsv = () => {
    if (!tickets.length) return;
    const headers = ['ID', 'Category', 'Priority', 'Confidence', 'Text', 'Created At'];
    const rows = tickets.map((ticket) => [
      ticket.id,
      ticket.predicted_category,
      ticket.priority,
      ticket.confidence,
      `"${ticket.ticket_text.replace(/"/g, '""')}"`,
      ticket.created_at,
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `SignalDesk_Tickets_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalPriority(ticket.priority);
    setToast(null);
  };

  const savePriority = async () => {
    if (!selectedTicket) return;
    setSavingPriority(true);
    try {
      const updated = await api.updateTicketPriority(
        selectedTicket.id,
        modalPriority,
        'Priority manually corrected by a support agent from the Ticket Explorer.',
      );
      setSelectedTicket(updated);
      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );
      setToast(`Ticket ${updated.id} priority set to ${updated.priority}.`);
      window.setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not update priority.'));
    } finally {
      setSavingPriority(false);
    }
  };

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Ticket Explorer"
        title="Search every decision."
        description={`Audit, search, and inspect ${total.toLocaleString()} stored tickets with model confidence and transparent priority rationale.`}
        actions={
          <>
            <button
              onClick={() => setRefreshKey((key) => key + 1)}
              className="btn-secondary h-10"
              title="Refresh"
            >
              <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={exportCsv} disabled={!tickets.length} className="btn-primary h-10">
              <FiDownload size={13} />
              Export page
            </button>
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-4"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <FiSearch
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search ticket text, ID, or department..."
              className="input-field h-11 pl-10 pr-9"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="input-field h-11 cursor-pointer md:col-span-3"
          >
            <option value="All">All departments</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value);
              setPage(1);
            }}
            className="input-field h-11 cursor-pointer md:col-span-2"
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item === 'All' ? 'All priorities' : `${item} priority`}
              </option>
            ))}
          </select>

          <div className="md:col-span-1">
            <button
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-[#FAFBFD] text-[11px] font-semibold text-ink-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
              title="Clear filters"
            >
              <FiFilter size={13} />
              {activeFilterCount || ''}
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-600">
          <FiAlertCircle size={15} />
          {error}
        </div>
      )}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-2xl border border-mint-100 bg-mint-50 px-4 py-3 text-[12px] font-medium text-mint-700"
        >
          <FiShield size={14} className="text-mint-600" />
          {toast}
        </motion.div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-[#F8F9FC] text-[9.5px] uppercase tracking-[0.1em] text-ink-muted">
                <th className="px-5 py-3.5 font-semibold">Ticket</th>
                <th className="px-5 py-3.5 font-semibold">Department</th>
                <th className="px-5 py-3.5 font-semibold">Priority</th>
                <th className="px-5 py-3.5 font-semibold">Confidence</th>
                <th className="px-5 py-3.5 font-semibold">Message</th>
                <th className="px-5 py-3.5 font-semibold">Created</th>
                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-[#F1F2F8]" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-28 rounded-md bg-[#F1F2F8]" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-14 rounded-md bg-[#F1F2F8]" /></td>
                    <td className="px-5 py-4"><div className="h-3 w-12 rounded bg-[#F1F2F8]" /></td>
                    <td className="px-5 py-4"><div className="h-3 w-64 rounded bg-[#F1F2F8]" /></td>
                    <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-[#F1F2F8]" /></td>
                    <td className="px-5 py-4"><div className="ml-auto h-7 w-16 rounded-lg bg-[#F1F2F8]" /></td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F2F8] text-ink-muted">
                      <FiInbox size={20} />
                    </span>
                    <p className="text-[13px] font-semibold text-ink">No tickets found</p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      Try clearing filters or using a broader search term.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const isHigh = ticket.priority === 'High';
                  const isMedium = ticket.priority === 'Medium';
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className="group cursor-pointer transition-colors hover:bg-[#FAFBFD]"
                    >
                      <td className="px-5 py-4 font-mono text-[10.5px] font-semibold text-ink">
                        {ticket.id}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700">
                          {ticket.predicted_category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9.5px] font-semibold ${
                            isHigh
                              ? 'bg-rose-50 text-rose-600'
                              : isMedium
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-mint-50 text-mint-600'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-9 font-mono text-[10.5px] font-medium text-ink-soft">
                            {ticket.confidence > 0
                              ? `${Math.round(ticket.confidence * 100)}%`
                              : '—'}
                          </span>
                          {ticket.confidence > 0 && (
                            <span className="h-1 w-12 overflow-hidden rounded-full bg-[#F1F2F8]">
                              <span
                                className="block h-full rounded-full bg-brand-400"
                                style={{ width: `${Math.min(100, ticket.confidence * 100)}%` }}
                              />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="max-w-sm px-5 py-4 text-[11.5px] text-ink-muted">
                        <span className="line-clamp-1">{truncate(ticket.ticket_text, 90)}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[10.5px] text-ink-muted">
                        {formatRelativeTime(ticket.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9.5px] font-semibold text-ink-muted transition-colors group-hover:border-brand-200 group-hover:text-brand-700">
                          <FiEye size={11} />
                          Inspect
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 text-[10.5px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page <b className="font-semibold text-ink">{page}</b> of{' '}
            <b className="font-semibold text-ink">{totalPages}</b> · {total.toLocaleString()}{' '}
            matching tickets
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="icon-btn h-8 w-8 disabled:opacity-40"
              aria-label="Previous page"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="icon-btn h-8 w-8 disabled:opacity-40"
              aria-label="Next page"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#003437]/45 p-4 backdrop-blur-sm"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between border-b border-line/70 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FiEye size={17} />
                  </span>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Inquiry detail
                    </span>
                    <h3 className="font-mono text-[15px] font-semibold text-ink">
                      {selectedTicket.id}
                    </h3>
                    <div className="mt-0.5 text-[10px] text-ink-muted">
                      {formatDate(selectedTicket.created_at)} · {selectedTicket.status}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="icon-btn h-8 w-8"
                  aria-label="Close"
                >
                  <FiX size={15} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Customer inquiry
                  </span>
                  <p className="max-h-40 overflow-y-auto rounded-xl border border-line bg-[#FAFBFD] p-4 text-[12px] leading-relaxed text-ink-soft">
                    {selectedTicket.ticket_text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-[#FAFBFD] p-3.5">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      Department
                    </span>
                    <span className="mt-1 block text-[12px] font-semibold text-ink">
                      {selectedTicket.predicted_category}
                    </span>
                  </div>
                  <div className="rounded-xl border border-line bg-[#FAFBFD] p-3.5">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      Model confidence
                    </span>
                    <span className="mt-1 block font-mono text-[12px] font-semibold text-ink">
                      {selectedTicket.confidence > 0
                        ? `${(selectedTicket.confidence * 100).toFixed(1)}%`
                        : 'Not available'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-white p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink">
                    <FiShield size={13} className="text-brand-500" />
                    Priority rationale
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-ink-muted">
                    {selectedTicket.priority_reason || 'No rationale stored for this ticket.'}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink">
                      Manual priority correction
                    </span>
                    <span className="text-[9px] text-ink-muted">Updates stored history</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <select
                      value={modalPriority}
                      onChange={(event) => setModalPriority(event.target.value)}
                      className="input-field flex-1 cursor-pointer"
                    >
                      {PRIORITIES.filter((item) => item !== 'All').map((item) => (
                        <option key={item} value={item}>
                          {item} priority
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={savePriority}
                      disabled={savingPriority || modalPriority === selectedTicket.priority}
                      className="btn-primary h-10 px-4"
                    >
                      {savingPriority ? (
                        <FiLoader size={13} className="animate-spin" />
                      ) : (
                        <FiShield size={13} />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-line/70 pt-4">
                <button onClick={() => setSelectedTicket(null)} className="btn-secondary h-10">
                  Close inspector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
