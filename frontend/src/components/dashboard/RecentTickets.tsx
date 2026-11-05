import React from 'react';
import { CreditCard, Headphones, Layers, Sparkles } from 'lucide-react';
import { Ticket } from '../../types';

interface RecentTicketsProps {
  tickets: Ticket[];
  onViewAllClick: () => void;
}

export const RecentTickets: React.FC<RecentTicketsProps> = ({ tickets, onViewAllClick }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Billing & Payment':
        return <CreditCard size={14} className="text-[#019077]" />;
      case 'Technical Support':
        return <Headphones size={14} className="text-[#003437]" />;
      case 'Product Issues':
        return <Layers size={14} className="text-[#019077]" />;
      default:
        return <Sparkles size={14} className="text-[#003437]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2EBE4] rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(0,52,55,0.03)] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[#003437]">Recent Inquiries</span>
        <button
          onClick={onViewAllClick}
          className="text-xs font-bold text-[#019077] hover:underline flex items-center gap-1 transition-all"
        >
          View All →
        </button>
      </div>

      <div className="divide-y divide-[#F1F5F2]">
        {tickets.slice(0, 4).map((ticket, idx) => {
          const isHigh = ticket.priority === 'High';
          const isMed = ticket.priority === 'Medium';
          const minutesAgo = (idx + 1) * 7 + 1;

          return (
            <div key={ticket.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#FAFBF9] px-1 rounded-xl transition-colors">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4EF] flex items-center justify-center shrink-0 border border-[#CDEAE0]">
                  {getCategoryIcon(ticket.predicted_category)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[210px]" title={ticket.ticket_text}>
                    {ticket.ticket_text}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {ticket.predicted_category} • {minutesAgo} min ago
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isHigh
                    ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]'
                    : isMed
                    ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]'
                    : 'bg-[#E6F4EF] text-[#019077] border border-[#CDEAE0]'
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
