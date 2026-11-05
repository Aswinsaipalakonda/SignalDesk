import React from 'react';
import { Layers, MoreHorizontal, Flame, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface PriorityQueuesCardProps {
  priorities: Record<string, number>;
}

export const PriorityQueuesCard: React.FC<PriorityQueuesCardProps> = ({ priorities }) => {
  const highStat = priorities['High'] || 102;
  const medStat = priorities['Medium'] || 135;
  const lowStat = priorities['Low'] || 64;

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers size={16} />
          </div>
          <span className="text-sm font-bold text-slate-900">Priority Workstreams</span>
        </div>
        <button className="w-7 h-7 rounded-full bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Two Cards Row (matching reference design) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Card 1: Dark Carbon High Priority Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-slate-900/15 group cursor-pointer">
          {/* Subtle carbon texture overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px]"></div>

          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 backdrop-blur-xs">
              <Flame size={16} />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={10} /> +18%
            </span>
          </div>

          <div className="relative z-10">
            <div className="text-[11px] font-bold text-slate-300">Urgent SLA</div>
            <div className="text-lg font-black tracking-tight mt-0.5">{highStat} Active</div>
            <div className="text-[10px] text-slate-400 mt-1">High Severity Queue</div>
          </div>
        </div>

        {/* Card 2: Light Clean Standard Priority Card */}
        <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-800">
              <ShieldCheck size={16} />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
              <ArrowUpRight size={10} /> +6%
            </span>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-700">Standard SLA</div>
            <div className="text-lg font-black text-slate-900 tracking-tight mt-0.5">{medStat + lowStat} Queued</div>
            <div className="text-[10px] text-slate-400 mt-1">Normal Resolution</div>
          </div>
        </div>
      </div>
    </div>
  );
};
