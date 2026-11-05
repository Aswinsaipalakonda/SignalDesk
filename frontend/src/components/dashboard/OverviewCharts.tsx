import React, { useState } from 'react';
import {
  TrendingUp,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown,
  Gauge,
  Flame,
  X,
  ArrowUpRight
} from 'lucide-react';

interface OverviewChartsProps {
  totalTickets: number;
  accuracyRate: string;
}

export const OverviewCharts: React.FC<OverviewChartsProps> = ({ totalTickets, accuracyRate }) => {
  const [activeMonth, setActiveMonth] = useState('Apr');
  const [showNotification, setShowNotification] = useState(true);

  // Month bar dataset mimicking the reference design's pill bars
  const volumeData = [
    { month: 'Jan', val: 55, tag: '+8%', tagColor: 'text-emerald-600 bg-emerald-50' },
    { month: 'Feb', val: 38, tag: '-5%', tagColor: 'text-red-600 bg-red-50' },
    { month: 'Mar', val: 65, tag: '+3%', tagColor: 'text-emerald-600 bg-emerald-50' },
    { month: 'Apr', val: 92, tag: '+12%', tagColor: 'text-emerald-600 bg-emerald-50', active: true },
    { month: 'May', val: 42, tag: '-10%', tagColor: 'text-red-600 bg-red-50' },
    { month: 'Jun', val: 78, tag: '+5%', tagColor: 'text-emerald-600 bg-emerald-50' },
    { month: 'Jul', val: 68, tag: '+3%', tagColor: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-7">
      {/* 1. Left Card: Total Volume Overview (matching reference design) */}
      <div className="lg:col-span-8 bg-white border border-slate-200/70 rounded-[28px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
        {/* Card Header & Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <TrendingUp size={16} />
            </div>
            <span className="text-sm font-bold text-slate-900">Support Volume Overview</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors">
              <span>This Month</span>
              <ChevronDown size={13} />
            </button>
            <button className="w-7 h-7 rounded-full bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
              <SlidersHorizontal size={12} />
            </button>
            <button className="w-7 h-7 rounded-full bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Big Number & Legend */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {totalTickets.toLocaleString()} <span className="text-base font-bold text-slate-400">Tickets</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
              <ArrowUpRight size={14} />
              <span>+12.4%</span>
              <span className="text-slate-400 font-normal">Compared to last period</span>
            </div>
          </div>

          {/* Legend dots */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Highest Day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Lowest Day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span> Average
            </span>
          </div>
        </div>

        {/* Visual Pill-Bar Graph (matching reference design) */}
        <div className="grid grid-cols-7 gap-3 items-end h-48 pt-4 pb-2">
          {volumeData.map((d) => {
            const isSelected = d.month === activeMonth;
            return (
              <div
                key={d.month}
                onClick={() => setActiveMonth(d.month)}
                className="flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                {/* Floating percentage badge */}
                <div
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-2 transition-transform duration-200 group-hover:-translate-y-1 ${
                    isSelected ? 'bg-emerald-500 text-white shadow-xs' : d.tagColor
                  }`}
                >
                  {d.tag}
                </div>

                {/* Pill Pillar */}
                <div
                  className={`w-full max-w-[46px] rounded-2xl transition-all duration-300 relative ${
                    isSelected
                      ? 'bg-slate-900 shadow-lg shadow-slate-900/25 ring-2 ring-emerald-500/40'
                      : 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                  style={{ height: `${d.val}%` }}
                >
                  {/* Textured pattern inside pill */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px] rounded-2xl"></div>
                </div>

                {/* Month label */}
                <span className={`text-xs mt-2 font-semibold ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right Card: Triage Accuracy & SLA Gauge (matching reference design) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/70 rounded-[28px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Gauge size={16} />
            </div>
            <span className="text-sm font-bold text-slate-900">Triage Efficiency</span>
          </div>
          <button className="w-7 h-7 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-600">
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Semi-Circular Segmented Radial Gauge Arc (matching reference design) */}
        <div className="relative flex flex-col items-center justify-center py-4">
          <svg width="220" height="120" viewBox="0 0 220 120" className="overflow-visible">
            {/* Background Arc Ticks */}
            {[...Array(19)].map((_, i) => {
              const angle = (i * 10) - 180;
              const rad = (angle * Math.PI) / 180;
              const x1 = 110 + 75 * Math.cos(rad);
              const y1 = 110 + 75 * Math.sin(rad);
              const x2 = 110 + 95 * Math.cos(rad);
              const y2 = 110 + 95 * Math.sin(rad);
              const isFilled = i <= 15; // 80-90% filled
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isFilled ? '#10B981' : '#E2E8F0'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="transition-colors duration-500"
                />
              );
            })}
          </svg>

          {/* Center Value */}
          <div className="absolute bottom-1 text-center">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {accuracyRate}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Accuracy Target</div>
          </div>
        </div>

        {/* Sub-Metrics Split Row */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] text-slate-500 font-semibold">Processed</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">+6%</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">1,660</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] text-slate-500 font-semibold">Triage Speed</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">-12%</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">18 ms</div>
          </div>
        </div>

        {/* Announcement Pill (matching reference design) */}
        {showNotification && (
          <div className="mt-2 bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Flame size={13} />
              </div>
              <span className="truncate text-[11px] font-medium text-slate-200">
                Critical queries auto-escalated to Tier-2
              </span>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-slate-400 hover:text-white ml-2 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
