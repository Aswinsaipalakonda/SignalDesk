import React from 'react';
import { Sparkles, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroBannerProps {
  onAnalyzeClick: () => void;
  onLearnMoreClick: () => void;
  lastClassified?: {
    category: string;
    priority: string;
  };
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onAnalyzeClick,
  onLearnMoreClick,
  lastClassified = { category: 'Billing & Payment', priority: 'High' }
}) => {
  const isHigh = lastClassified.priority === 'High';
  const isMed = lastClassified.priority === 'Medium';

  return (
    <div className="relative bg-[#F7FAF8] border border-border-subtle rounded-3xl p-8 lg:p-9 overflow-hidden shadow-card flex items-center justify-between mb-7">
      {/* Left Content */}
      <div className="max-w-xl z-10">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-text-main leading-tight mb-2.5 tracking-tight">
          Welcome to <span className="text-brand-green">SignalDesk</span>
        </h1>
        <p className="text-sm lg:text-base text-text-muted leading-relaxed mb-6 font-normal">
          AI-powered support ticket intelligence that classifies, prioritizes and analyzes customer queries in seconds.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onAnalyzeClick}
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles size={16} strokeWidth={2} />
            <span>Analyze a Ticket →</span>
          </button>
          <button
            onClick={onLearnMoreClick}
            className="inline-flex items-center gap-1.5 bg-white border border-border-subtle hover:border-slate-300 text-text-main text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50"
          >
            <Play size={14} className="fill-current text-text-muted" />
            <span>See How it Works</span>
          </button>
        </div>
      </div>

      {/* Overlapping Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex flex-col bg-white/95 backdrop-blur-md border border-border-subtle rounded-2xl p-4 shadow-xl absolute right-[32%] top-1/2 -translate-y-1/2 z-20 min-w-[210px]"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-main mb-2">
          <div className="w-5 h-5 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green">
            <Check size={12} strokeWidth={2.5} />
          </div>
          <span>Ticket Classified</span>
        </div>
        <div className="text-xs text-text-muted mb-1.5">
          • Category: <span className="font-semibold text-text-main">{lastClassified.category}</span>
        </div>
        <div className="text-xs text-text-muted flex items-center gap-1.5">
          • Priority:
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isHigh
                ? 'bg-priority-high-bg text-priority-high border border-priority-high-border'
                : isMed
                ? 'bg-priority-med-bg text-priority-med border border-priority-med-border'
                : 'bg-priority-low-bg text-priority-low border border-priority-low-border'
            }`}
          >
            {lastClassified.priority}
          </span>
        </div>
      </motion.div>

      {/* Right Hero Image */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[42%] overflow-hidden rounded-r-3xl">
        <img
          src="/assets/hero_agent.png"
          alt="Support Agent Specialist"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};
