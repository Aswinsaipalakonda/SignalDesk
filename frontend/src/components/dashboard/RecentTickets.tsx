import React from 'react';
import {
  FiArrowUpRight,
  FiCreditCard,
  FiHeadphones,
  FiLayers,
  FiShoppingCart,
  FiZap,
} from 'react-icons/fi';
import { Ticket } from '../../types';
import { formatRelativeTime, truncate } from '../../lib/format';

interface RecentTicketsProps {
  tickets: Ticket[];
  onViewAllClick: () => void;
  onSelectTicket?: (ticket: Ticket) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Billing & Payment':
      return { icon: <FiCreditCard size={15} />, chip: 'bg-mint-50 text-mint-600' };
    case 'Technical Support':
      return { icon: <FiHeadphones size={15} />, chip: 'bg-sky-50 text-sky-600' };
    case 'Product Issues':
      return { icon: <FiLayers size={15} />, chip: 'bg-sky-50 text-sky-600' };
    case 'Order & Delivery':
      return { icon: <FiShoppingCart size={15} />, chip: 'bg-amber-50 text-amber-600' };
    default:
      return { icon: <FiZap size={15} />, chip: 'bg-brand-50 text-brand-600' };
  }
};

export const RecentTickets: React.FC<RecentTicketsProps> = ({
  tickets,
  onViewAllClick,
  onSelectTicket,
}) => {
  return (
    <div className="card card-pad flex h-full flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-ink">Recent inquiries</div>
          <div className="mt-0.5 text-[11px] text-ink-muted">Latest tickets in the queue</div>
        </div>
        <button
          onClick={onViewAllClick}
          className="group flex h-8 items-center gap-1.5 rounded-lg bg-[#F7F8FC] px-2.5 text-[10px] font-semibold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          View all
          <FiArrowUpRight
            size={12}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12 text-[12px] text-ink-muted">
          No tickets match the current filters.
        </div>
      ) : (
        <div className="space-y-1">
          {tickets.slice(0, 5).map((ticket) => {
            const meta = getCategoryIcon(ticket.predicted_category);
            const isHigh = ticket.priority === 'High';
            const isMedium = ticket.priority === 'Medium';
            return (
              <button
                key={ticket.id}
                onClick={() => onSelectTicket?.(ticket)}
                className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[#F7F8FC]"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}
                >
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink" title={ticket.ticket_text}>
                    {truncate(ticket.ticket_text, 66)}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-muted">
                    <span className="font-medium text-ink-soft">{ticket.predicted_category}</span>
                    <span className="text-ink-muted/40">·</span>
                    <span>{formatRelativeTime(ticket.created_at)}</span>
                    {ticket.confidence > 0 && (
                      <>
                        <span className="text-ink-muted/40">·</span>
                        <span className="font-mono">{Math.round(ticket.confidence * 100)}%</span>
                      </>
                    )}
                  </span>
                </span>

                <span
                  className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-semibold ${
                    isHigh
                      ? 'bg-rose-50 text-rose-600'
                      : isMedium
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-mint-50 text-mint-600'
                  }`}
                >
                  {ticket.priority}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
