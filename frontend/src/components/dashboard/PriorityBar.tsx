import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface PriorityBarProps {
  data: Record<string, number>;
  activePriority?: string;
  onSelectPriority?: (priority: string) => void;
}

const TIERS = [
  { name: 'High', color: '#D45B4A', bg: 'bg-rose-50', text: 'text-rose-600' },
  { name: 'Medium', color: '#FDA827', bg: 'bg-amber-50', text: 'text-amber-600' },
  { name: 'Low', color: '#019077', bg: 'bg-mint-50', text: 'text-mint-600' },
];

export const PriorityBar: React.FC<PriorityBarProps> = ({
  data,
  activePriority,
  onSelectPriority,
}) => {
  const total = TIERS.reduce((sum, tier) => sum + (data[tier.name] || 0), 0);

  return (
    <div className="card card-pad flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <FiAlertTriangle size={17} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink">Priority mix</div>
            <div className="mt-0.5 text-[11px] text-ink-muted">Rule-engine assessment</div>
          </div>
        </div>
        <span className="rounded-full bg-[#F7F8FC] px-2.5 py-1 text-[10px] font-semibold text-ink-muted">
          {total.toLocaleString()} total
        </span>
      </div>

      <div className="mt-1 flex h-3 w-full overflow-hidden rounded-full bg-[#F1F2F8]">
        {TIERS.map((tier) => {
          const value = data[tier.name] || 0;
          const width = total ? (value / total) * 100 : 0;
          return (
            <span
              key={tier.name}
              className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
              style={{ width: `${width}%`, backgroundColor: tier.color }}
              title={`${tier.name}: ${value}`}
            />
          );
        })}
      </div>

      <div className="mt-6 grid flex-1 grid-cols-3 gap-2.5">
        {TIERS.map((tier) => {
          const value = data[tier.name] || 0;
          const percent = total ? (value / total) * 100 : 0;
          const active = activePriority === tier.name;
          return (
            <button
              key={tier.name}
              onClick={() => onSelectPriority?.(tier.name)}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                active
                  ? 'border-brand-200 bg-brand-50/60 shadow-sm'
                  : 'border-line/80 bg-[#FBFBFD] hover:border-brand-200 hover:bg-white'
              }`}
            >
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <span className={`text-[10px] font-semibold ${tier.text}`}>{tier.name}</span>
              </div>
              <div className="font-display text-[20px] font-bold leading-none tracking-tight text-ink">
                {value.toLocaleString()}
              </div>
              <div className="mt-1.5 text-[10px] font-medium text-ink-muted">
                {percent.toFixed(1)}%
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F7F8FC] px-3 py-2 text-[10px] text-ink-muted">
        <span>Independent from ML category prediction</span>
        <span className="font-semibold text-ink-soft">{activePriority || 'All priorities'}</span>
      </div>
    </div>
  );
};
