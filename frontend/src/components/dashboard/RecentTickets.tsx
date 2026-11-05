import React from 'react';
import { CreditCard, Headphones, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { Ticket } from '../../types';

interface RecentTicketsProps {
  tickets: Ticket[];
  onViewAllClick: () => void;
}

export const RecentTickets: React.FC<RecentTicketsProps> = ({ tickets, onViewAllClick }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Billing & Payment':
        return <CreditCard size={15} className="text-brand-green" />;
      case 'Technical Support':
        return <Headphones size={15} className="text-brand-green" />;
      case 'Product Issues':
        return <Layers size={15} className="text-brand-green" />;
      default:
        return <Sparkles size={15} className="text-brand-green" />;
    }
  };

  return (
    <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-card h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold text-text-main">Recent Tickets</span>
        <button
          onClick={onViewAllClick}
          className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
        >
          View All →
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {tickets.slice(0, 4).map((ticket, idx) => {
          const isHigh = ticket.priority === 'High';
          const isMed = ticket.priority === 'Medium';
          const minutesAgo = (idx + 1) * 7 + 1;

          return (
            <div key={ticket.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-lg bg-brand-green-light flex items-center justify-center shrink-0 border border-emerald-100">
                  {getCategoryIcon(ticket.predicted_category)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-text-main truncate max-w-[210px]" title={ticket.ticket_text}>
                    {ticket.ticket_text}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {ticket.predicted_category} • {minutesAgo} min ago
                  </div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isHigh
                    ? 'bg-priority-high-bg text-priority-high border border-priority-high-border'
                    : isMed
                    ? 'bg-priority-med-bg text-priority-med border border-priority-med-border'
                    : 'bg-priority-low-bg text-priority-low border border-priority-low-border'
                }`}
              >
                {ticket.priority}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
