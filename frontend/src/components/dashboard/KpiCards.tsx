import React from 'react';
import { Ticket, CreditCard, Headphones, AlertTriangle, Target, Info } from 'lucide-react';
import { KpiMetric } from '../../types';

interface KpiCardsProps {
  metrics: KpiMetric[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'ticket':
        return <Ticket size={17} strokeWidth={2} className="text-[#019077]" />;
      case 'credit-card':
        return <CreditCard size={17} strokeWidth={2} className="text-[#003437]" />;
      case 'headphones':
        return <Headphones size={17} strokeWidth={2} className="text-[#019077]" />;
      case 'alert-triangle':
        return <AlertTriangle size={17} strokeWidth={2} className="text-[#DC2626]" />;
      case 'target':
        return <Target size={17} strokeWidth={2} className="text-[#019077]" />;
      default:
        return <Ticket size={17} strokeWidth={2} className="text-[#019077]" />;
    }
  };

  const sparklineD = [
    'M 0 18 Q 15 10, 30 14 T 60 4 T 90 8',
    'M 0 16 Q 20 18, 40 10 T 70 8 T 90 4',
    'M 0 15 Q 25 8, 50 16 T 75 10 T 90 6',
    'M 0 14 Q 20 17, 45 12 T 70 14 T 90 7',
    'M 0 16 Q 20 10, 45 14 T 70 6 T 90 8',
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
      {metrics.map((m, idx) => (
        <div
          key={m.title}
          className="bg-white border border-[#E2EBE4] hover:border-[#019077]/40 rounded-2xl p-4.5 shadow-[0_2px_8px_-2px_rgba(0,52,55,0.04)] hover:shadow-[0_6px_20px_-4px_rgba(0,52,55,0.08)] transition-all duration-200 flex flex-col justify-between group"
        >
          {/* Header */}
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAFBF9] border border-[#E2EBE4] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getIcon(m.icon)}
            </div>
            <span className="truncate">{m.title}</span>
          </div>

          {/* Value */}
          <div className="text-2xl lg:text-[28px] font-extrabold text-[#003437] tracking-tight mb-2.5">
            {m.value}
          </div>

          {/* Footer Trend & Sparkline */}
          <div className="flex items-center justify-between pt-1 border-t border-[#F4F8F5]">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#E6F4EF] text-[#019077]">
              ↑ {m.trend}
            </span>

            {/* Sparkline curve */}
            <svg width="72" height="20" viewBox="0 0 90 22" fill="none" className="overflow-visible opacity-85 group-hover:opacity-100 transition-opacity">
              <path
                d={sparklineD[idx % sparklineD.length]}
                stroke={m.title.includes('High') ? '#DC2626' : '#019077'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {m.title === 'Model Accuracy' && (
              <span title="Test evaluation accuracy on held-out records" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                <Info size={13} />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
