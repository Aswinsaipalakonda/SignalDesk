import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroBannerProps {
  onAnalyzeClick: () => void;
  onPerformanceClick: () => void;
  lastClassified?: {
    category: string;
    priority: string;
  };
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onAnalyzeClick,
  onPerformanceClick,
  lastClassified = { category: 'Billing & Payment', priority: 'High' }
}) => {
  const isHigh = lastClassified.priority === 'High';

  return (
    <div className="relative bg-gradient-to-br from-[#FAFBF9] via-[#FFFFFF] to-[#F2F8F5] border border-[#E2EBE4] rounded-3xl p-7 lg:p-8 shadow-[0_4px_24px_-4px_rgba(0,52,55,0.06)] overflow-hidden mb-7">
      {/* Background Decorative Mesh Elements */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#E6F4EF]/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-40 -bottom-20 w-60 h-60 bg-teal-100/30 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EF] border border-[#CDEAE0] text-xs font-bold text-[#019077] mb-3">
            <Sparkles size={13} className="text-[#019077]" />
            <span>AI-Powered Support Triage</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#003437] leading-[1.18] tracking-tight mb-3">
            Welcome to <span className="text-[#019077] underline decoration-[#019077]/30 underline-offset-4">SignalDesk</span>
          </h1>

          <p className="text-sm lg:text-[15px] text-slate-600 leading-relaxed mb-6 font-normal max-w-xl">
            AI-powered support ticket intelligence that classifies, prioritizes and analyzes customer queries in seconds with transparent routing logic.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={onAnalyzeClick}
              className="inline-flex items-center gap-2 bg-[#003437] hover:bg-[#014d4e] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#003437]/15 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles size={16} strokeWidth={2} />
              <span>Analyze a Ticket →</span>
            </button>
            <button
              onClick={onPerformanceClick}
              className="inline-flex items-center gap-1.5 bg-white border border-[#DCE8DF] hover:border-[#003437] text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 shadow-2xs"
            >
              <BarChart2 size={15} className="text-slate-500" />
              <span>Model Benchmarks</span>
            </button>
          </div>

          {/* Value Micro-Points */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-[#019077]">
              <CheckCircle2 size={14} /> Zero Data Leakage
            </span>
            <span className="flex items-center gap-1 text-[#019077]">
              <CheckCircle2 size={14} /> Explainable Priority Rules
            </span>
            <span className="flex items-center gap-1 text-[#019077]">
              <CheckCircle2 size={14} /> Sub-20ms Decision Latency
            </span>
          </div>
        </div>

        {/* Right Column: Live Decision Intelligence Simulation Card */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/95 backdrop-blur-md border border-[#E2EBE4] rounded-2xl p-5 shadow-lg shadow-[#003437]/5 relative"
          >
            {/* Live Triage Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#019077]"></span>
                </span>
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#003437]">
                  Active Decision Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#019077] bg-[#E6F4EF] px-2 py-0.5 rounded-md border border-[#CDEAE0]">
                ⚡ 14.8 ms
              </span>
            </div>

            {/* Simulated Live Inquiry */}
            <div className="text-xs text-slate-800 font-medium leading-relaxed bg-[#FAFBF9] p-3 rounded-xl border border-[#EAEFEA] mb-3">
              "Payment deducted twice for annual enterprise plan, but subscription shows unconfirmed. Please refund immediately!"
            </div>

            {/* Live Triage Metrics Card */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Classified Department:</span>
                <span className="font-extrabold text-[#003437] bg-[#E6F4EF] px-2.5 py-0.5 rounded-md border border-[#CDEAE0] flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#019077]" /> Billing & Payment (94%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Triage Severity:</span>
                <span className="font-extrabold text-[#DC2626] bg-[#FEF2F2] px-2.5 py-0.5 rounded-md border border-[#FEE2E2] flex items-center gap-1">
                  <ShieldAlert size={12} /> High Priority
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Matched Pattern:</span>
                <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">payment deducted</span>
              </div>
            </div>

            {/* Bottom verified badge */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-[#003437] font-semibold">
                <CheckCircle2 size={12} className="text-[#019077]" />
                Automated Verification
              </span>
              <span className="text-[#019077] font-bold">100% Deterministic</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
