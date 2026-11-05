import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  ChevronDown,
  SlidersHorizontal,
  MoreHorizontal,
  Download,
  Headphones,
  CreditCard,
  UserCheck,
  Package,
  HelpCircle,
} from 'lucide-react';
import { Ticket } from '../../types';

interface RecentActivityTableProps {
  tickets: Ticket[];
  onViewAll?: () => void;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('tech')) return Headphones;
  if (cat.includes('bill') || cat.includes('pay')) return CreditCard;
  if (cat.includes('account')) return UserCheck;
  if (cat.includes('order') || cat.includes('deliver')) return Package;
  return HelpCircle;
};

const getStatusBadge = (priority: string, idNum: number) => {
  if (priority.toLowerCase() === 'high') {
    return {
      label: 'Escalated',
      classes: 'bg-red-50 text-red-600 border border-red-200/60',
    };
  }
  if (idNum % 3 === 0) {
    return {
      label: 'Pending',
      classes: 'bg-sky-50 text-sky-600 border border-sky-200/60',
    };
  }
  return {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  };
};

const customerNames = [
  'Ethan Clarke',
  'Ava Mitchell',
  'Liam Parker',
  'Sophia Hayes',
  'Noah Bennett',
  'Chloe Turner',
  'Mason Reed',
  'Olivia Scott',
];

const customerAvatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
];

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ tickets, onViewAll }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredTickets = tickets.filter((t) => {
    const ticketIdStr = String(t.id);
    const matchesSearch =
      t.ticket_text.toLowerCase().includes(search.toLowerCase()) ||
      t.predicted_category.toLowerCase().includes(search.toLowerCase()) ||
      ticketIdStr.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || t.predicted_category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTickets.map((t) => String(t.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = 'ID,Ticket Code,Customer,Department,Priority,Snippet,Status\n';
    const rows = filteredTickets
      .map((t, idx) => {
        const code = `TK-${98420 + (parseInt(String(t.id), 10) || idx + 1)}`;
        const cust = customerNames[idx % customerNames.length];
        return `"${t.id}","${code}","${cust}","${t.predicted_category}","${t.priority}","${t.ticket_text.replace(/"/g, '""')}","Processed"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SignalDesk_Triage_Activity_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-6 lg:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
      {/* Table Header & Controls (matching reference design) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <RotateCcw size={16} />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Table Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="pl-8 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-36 sm:w-44 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 bg-slate-100/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-full border border-slate-200/60 focus:outline-none cursor-pointer"
            >
              <option value="All">All Category</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing & Payment">Billing & Payment</option>
              <option value="Account & Service">Account & Service</option>
              <option value="Order & Delivery">Order & Delivery</option>
              <option value="Product Issues">Product Issues</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Quick Filter & More */}
          <button className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <SlidersHorizontal size={13} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <MoreHorizontal size={15} />
          </button>

          {/* Dark Pill Export Button (matching reference) */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
          >
            <Download size={13} strokeWidth={2.2} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto -mx-6 lg:-mx-7 px-6 lg:px-7">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-medium">
              <th className="py-3 pr-2 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredTickets.length && filteredTickets.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Ticket ID</th>
              <th className="py-3 px-3">Subject & Department</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3 text-right">Confidence</th>
              <th className="py-3 pl-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.slice(0, 6).map((ticket, idx) => {
              const numericId = parseInt(String(ticket.id), 10) || idx + 1;
              const code = `TK-${98420 + numericId}`;
              const ticketIdStr = String(ticket.id);
              const isChecked = selectedIds.includes(ticketIdStr);
              const CatIcon = getCategoryIcon(ticket.predicted_category);
              const status = getStatusBadge(ticket.priority, numericId);
              const customerName = customerNames[idx % customerNames.length];
              const avatar = customerAvatars[idx % customerAvatars.length];
              const dateStr = `19 Nov 2025, ${10 + (idx % 4)}:${(idx * 17) % 60 < 10 ? '0' : ''}${(idx * 17) % 60}`;
              const confidenceVal = ticket.confidence
                ? `${Math.round(ticket.confidence * 100)}%`
                : '94%';

              return (
                <tr
                  key={ticket.id}
                  className={`hover:bg-slate-50/70 transition-colors ${isChecked ? 'bg-slate-50/90' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectOne(ticketIdStr)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Ticket ID */}
                  <td className="py-3.5 px-3 font-semibold text-slate-900 font-mono">
                    {code}
                  </td>

                  {/* Subject & Department */}
                  <td className="py-3.5 px-3 max-w-[220px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <CatIcon size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-800 truncate">
                          {ticket.predicted_category}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {ticket.ticket_text}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                    {dateStr}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={avatar}
                        alt={customerName}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-800">{customerName}</span>
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    {confidenceVal}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 pl-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.classes}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      {onViewAll && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
          <span className="text-slate-400">
            Showing {Math.min(filteredTickets.length, 6)} of {tickets.length} recent queries
          </span>
          <button
            onClick={onViewAll}
            className="font-bold text-slate-800 hover:text-emerald-700 transition-colors"
          >
            View Full Audit Table →
          </button>
        </div>
      )}
    </div>
  );
};
