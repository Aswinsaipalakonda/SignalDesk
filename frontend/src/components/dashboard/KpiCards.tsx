import React from 'react';
import { Ticket, CreditCard, Headphones, AlertTriangle, Target, Info } from 'lucide-react';
import { KpiMetric } from '../../types';

interface KpiCardsProps {
  metrics: KpiMetric[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const getIcon = (name: string, color: string) => {
    switch (name) {
      case 'ticket':
        return <Ticket size={18} strokeWidth={1.75} style={{ color }} />;
      case 'credit-card':
        return <CreditCard size={18} strokeWidth={1.75} style={{ color }} />;
      case 'headphones':
        return <Headphones size={18} strokeWidth={1.75} style={{ color }} />;
      case 'alert-triangle':
        return <AlertTriangle size={18} strokeWidth={1.75} style={{ color }} />;
      case 'target':
        return <Target size={18} strokeWidth={1.75} style={{ color }} />;
      default:
        return <Ticket size={18} strokeWidth={1.75} style={{ color }} />;
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
          className="bg-white border border-border-subtle hover:border-border-hover rounded-2xl p-4.5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center gap-2 text-text-muted text-xs font-semibold mb-2.5">
            {getIcon(m.icon, m.color)}
            <span>{m.title}</span>
          </div>

          {/* Value */}
          <div className="text-2xl lg:text-3xl font-extrabold text-text-main tracking-tight mb-2">
            {m.value}
          </div>

          {/* Footer Trend & Sparkline */}
          <div className="flex items-center justify-between mt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-brand-green-light text-brand-green">
              ↑ {m.trend}
            </span>

            {/* Sparkline */}
            <svg width="78" height="22" viewBox="0 0 90 22" fill="none" className="overflow-visible">
              <path
                d={sparklineD[idx % sparklineD.length]}
                stroke={m.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {m.title === 'Model Accuracy' && (
              <span title="Test evaluation accuracy on held-out split" className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <Info size={14} />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
