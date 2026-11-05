import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiArrowUpRight, FiCpu, FiLayers } from 'react-icons/fi';

interface ModelSnapshotCardProps {
  accuracy: number;
  f1Macro: number;
  avgConfidence: number;
  algorithm: string;
  numCategories: number;
  onNavigate: () => void;
}

export const ModelSnapshotCard: React.FC<ModelSnapshotCardProps> = ({
  accuracy,
  f1Macro,
  avgConfidence,
  algorithm,
  numCategories,
  onNavigate,
}) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, accuracy));

  return (
    <div className="card card-pad flex h-full flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
            <FiCpu size={17} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink">Model snapshot</div>
            <div className="mt-0.5 max-w-[150px] truncate text-[11px] text-ink-muted">
              {algorithm || 'Classifier'}
            </div>
          </div>
        </div>
        <span className="rounded-full bg-mint-50 px-2.5 py-1 text-[10px] font-semibold text-mint-600">
          Active
        </span>
      </div>

      <div className="my-5 flex flex-1 items-center gap-4">
        <div className="relative h-[116px] w-[116px] shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="modelRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#019077" />
                <stop offset="100%" stopColor="#7BD5A5" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F2F8" strokeWidth="9" />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#modelRing)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[22px] font-bold leading-none tracking-tight text-ink">
              {(accuracy * 100).toFixed(1)}%
            </span>
            <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Accuracy
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="rounded-xl bg-[#F7F8FC] px-3 py-2">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              <FiActivity size={10} /> Macro-F1
            </div>
            <div className="mt-1 font-mono text-[15px] font-semibold text-ink">
              {f1Macro.toFixed(3)}
            </div>
          </div>
          <div className="rounded-xl bg-[#F7F8FC] px-3 py-2">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              <FiLayers size={10} /> Categories
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-[15px] font-semibold text-ink">
                {numCategories}
              </span>
              <span className="text-[9px] font-medium text-ink-muted">
                {Math.round(avgConfidence * 100)}% avg conf.
              </span>
            </div>
          </div>
        </div>
      </div>

      <button onClick={onNavigate} className="btn-secondary w-full">
        View benchmarks
        <FiArrowUpRight size={14} />
      </button>
    </div>
  );
};
