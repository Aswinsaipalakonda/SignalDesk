import React from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiDatabase,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import { ClassificationSummary, Ticket } from '../../types';
import { formatNumber, truncate } from '../../lib/format';

interface HeroBannerProps {
  onAnalyzeClick: () => void;
  onPerformanceClick: () => void;
  lastClassified?: ClassificationSummary;
  recentTicket?: Ticket | null;
  accuracy: number;
  f1Macro: number;
  totalTickets: number;
  numCategories: number;
  avgConfidence: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onAnalyzeClick,
  onPerformanceClick,
  lastClassified,
  recentTicket,
  accuracy,
  f1Macro,
  totalTickets,
  numCategories,
  avgConfidence,
}) => {
  const category = lastClassified?.category || recentTicket?.predicted_category;
  const priority = lastClassified?.priority || recentTicket?.priority;
  const confidence = lastClassified?.confidence ?? recentTicket?.confidence ?? 0;
  const hasDecision = Boolean(category && priority);
  const isHigh = priority === 'High';
  const isMedium = priority === 'Medium';

  const stats = [
    { label: 'Live tickets', value: formatNumber(totalTickets), icon: FiDatabase },
    { label: 'Test accuracy', value: `${(accuracy * 100).toFixed(1)}%`, icon: FiTarget },
    { label: 'Macro-F1', value: f1Macro.toFixed(3), icon: FiActivity },
    { label: 'Avg. confidence', value: `${(avgConfidence * 100).toFixed(1)}%`, icon: FiZap },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#003437] p-6 text-white shadow-float lg:p-8">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-brand-500/25 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="lg:col-span-7"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-mint-400" />
            </span>
            Live workspace · model online
          </div>

          <h1 className="max-w-xl font-display text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-white lg:text-[42px]">
            Support operations,
            <span className="block bg-gradient-to-r from-brand-300 via-white to-brand-200 bg-clip-text text-transparent">
              in one calm view.
            </span>
          </h1>
          <p className="mt-3.5 max-w-lg text-[13px] leading-relaxed text-white/55 lg:text-sm">
            Route every inquiry with a trained classifier, review explainable priority
            decisions, and keep the queue moving without the noise.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAnalyzeClick}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#003437] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-brand-50 active:translate-y-0"
            >
              <FiZap size={15} className="text-brand-600" />
              Analyze a ticket
              <FiArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <button
              onClick={onPerformanceClick}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-white/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/[0.12] hover:text-white active:translate-y-0"
            >
              <FiBarChart2 size={15} />
              Model benchmarks
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/[0.09] bg-white/[0.055] px-3.5 py-3 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-white/45">
                    <Icon size={11} className="text-brand-300" />
                    {stat.label}
                  </div>
                  <div className="font-display text-[19px] font-semibold tracking-tight text-white">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="lg:col-span-5"
        >
          <div className="rounded-3xl border border-white/[0.12] bg-white/[0.065] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.09] pb-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  {lastClassified ? 'Latest live decision' : 'Latest stored inquiry'}
                </div>
                <div className="mt-1 text-[13px] font-semibold text-white">
                  AI triage snapshot
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-mint-400/20 bg-mint-400/10 px-2.5 py-1 text-[10px] font-semibold text-mint-400">
                <FiCheckCircle size={10} />
                Synced
              </span>
            </div>

            {hasDecision ? (
              <>
                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#002A2D]/45 p-3.5">
                  <p className="line-clamp-3 text-[11.5px] leading-relaxed text-white/55">
                    "{truncate(
                      lastClassified?.text ||
                        recentTicket?.ticket_text ||
                        'Ticket classified in this session.',
                      148,
                    )}"
                  </p>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-white/45">
                    <span>Predicted department</span>
                    <span>{numCategories} classes available</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-[18px] font-semibold tracking-tight text-white">
                      {category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${
                        isHigh
                          ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
                          : isMedium
                            ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                            : 'border-mint-400/20 bg-mint-400/10 text-mint-400'
                      }`}
                    >
                      <FiAlertTriangle size={10} />
                      {priority}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-[10px]">
                    <span className="text-white/45">Model confidence</span>
                    <span className="font-mono font-semibold text-white/80">
                      {confidence > 0 ? `${(confidence * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, confidence * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-amber-400"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3.5 text-[10px] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    {lastClassified?.latencyMs != null
                      ? `${lastClassified.latencyMs.toFixed(1)} ms inference`
                      : 'Loaded from history'}
                  </span>
                  <span className="font-mono">{lastClassified?.ticketId || recentTicket?.id}</span>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.07] text-white/50">
                  <FiZap size={22} />
                </span>
                <div className="text-[13px] font-semibold text-white">Ready for the next ticket</div>
                <p className="mx-auto mt-1.5 max-w-[240px] text-[11px] leading-relaxed text-white/40">
                  Submit a customer message to see category confidence and the priority rationale.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
