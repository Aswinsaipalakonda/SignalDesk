import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Zap, Cpu, BarChart2 } from 'lucide-react';
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
  const isMed = lastClassified.priority === 'Medium';

  return (
    <div className="relative bg-gradient-to-br from-[#F7FAF8] via-[#FFFFFF] to-[#F0F7F3] border border-[#E4EBE5] rounded-3xl p-7 lg:p-8 shadow-[0_4px_24px_-4px_rgba(14,94,68,0.06)] overflow-hidden mb-7">
      {/* Background Decorative Mesh Elements */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-40 -bottom-20 w-60 h-60 bg-teal-100/30 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5F0] border border-[#D5EADB] text-xs font-bold text-[#0E5E44] mb-3">
            <Sparkles size={13} className="text-[#0E5E44]" />
            <span>AI-Powered Support Triage</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1A202C] leading-[1.18] tracking-tight mb-3">
            Welcome to <span className="text-[#0E5E44] underline decoration-[#14B8A6]/40 underline-offset-4">SignalDesk</span>
          </h1>

          <p className="text-sm lg:text-[15px] text-[#64748B] leading-relaxed mb-6 font-normal max-w-xl">
            Automate customer support classification, routing, and operational prioritization in seconds using genuine Scikit-learn NLP algorithms and real-time transparent rules.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={onAnalyzeClick}
              className="inline-flex items-center gap-2 bg-[#0E5E44] hover:bg-[#0A4733] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles size={16} strokeWidth={2} />
              <span>Analyze a Ticket →</span>
            </button>
            <button
              onClick={onPerformanceClick}
              className="inline-flex items-center gap-1.5 bg-white border border-[#D1E0D3] hover:border-[#0E5E44] text-[#1A202C] text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 shadow-2xs"
            >
              <BarChart2 size={15} className="text-[#64748B]" />
              <span>Model Benchmarks</span>
            </button>
          </div>

          {/* Value Micro-Points */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#64748B]">
            <span className="flex items-center gap-1 text-[#0E5E44]">
              <CheckCircle2 size={14} /> Zero Data Leakage
            </span>
            <span className="flex items-center gap-1 text-[#0E5E44]">
              <CheckCircle2 size={14} /> Explainable Priority Rules
            </span>
            <span className="flex items-center gap-1 text-[#0E5E44]">
              <CheckCircle2 size={14} /> Neon PostgreSQL Cloud
            </span>
          </div>
        </div>

        {/* Right Column: Live Decision Intelligence Simulation Card */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-md border border-[#E2EAE3] rounded-2xl p-5 shadow-lg shadow-emerald-950/5 relative"
          >
            {/* Live Triage Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F2] mb-3.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#0E5E44]">
                  Active Decision Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8] bg-[#F8FAF8] px-2 py-0.5 rounded-md border border-[#E8EFE9]">
                ⚡ 14.8 ms
              </span>
            </div>

            {/* Simulated Live Inquiry */}
            <div className="text-xs text-[#1A202C] font-medium leading-relaxed bg-[#F8FAF8] p-3 rounded-xl border border-[#EAEFEA] mb-3">
              "Payment deducted twice for annual enterprise plan, but subscription shows unconfirmed. Please refund immediately!"
            </div>

            {/* Live Triage Metrics Card */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Classified Department:</span>
                <span className="font-extrabold text-[#0E5E44] bg-[#EBF5F0] px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Billing & Payment (92%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Triage Severity:</span>
                <span className="font-extrabold text-[#DC2626] bg-[#FEF2F2] px-2.5 py-0.5 rounded-md border border-[#FEE2E2] flex items-center gap-1">
                  <ShieldAlert size={12} /> High Priority
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#94A3B8]">Matched Trigger:</span>
                <span className="font-mono text-[#475569] bg-slate-100 px-1.5 py-0.2 rounded">payment deducted</span>
              </div>
            </div>

            {/* Bottom floating badge */}
            <div className="mt-3.5 pt-2.5 border-t border-[#F1F5F2] flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <Cpu size={12} className="text-[#0E5E44]" />
                TF-IDF + Logistic Reg.
              </span>
              <span className="text-[#0E5E44] font-bold">100% Deterministic</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
