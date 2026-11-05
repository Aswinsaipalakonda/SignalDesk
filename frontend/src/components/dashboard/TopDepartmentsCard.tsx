import React from 'react';
import { Globe2, MoreHorizontal, Headphones, CreditCard, UserCheck, Package } from 'lucide-react';

interface TopDepartmentsCardProps {
  categories: Record<string, number>;
}

export const TopDepartmentsCard: React.FC<TopDepartmentsCardProps> = ({ categories }) => {
  const total = Object.values(categories).reduce((acc, curr) => acc + curr, 0) || 1;

  // Transform record into sorted array
  const sortedCategories = Object.entries(categories)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const icons = [Headphones, CreditCard, UserCheck, Package];
  const colors = [
    'bg-emerald-50 text-emerald-600',
    'bg-amber-50 text-amber-600',
    'bg-sky-50 text-sky-600',
    'bg-indigo-50 text-indigo-600',
  ];

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Globe2 size={16} />
          </div>
          <span className="text-sm font-bold text-slate-900">Top Departments</span>
        </div>
        <button className="w-7 h-7 rounded-full bg-slate-100/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {sortedCategories.map((item, idx) => {
          const Icon = icons[idx % icons.length];
          const colorClass = colors[idx % colors.length];

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                {/* Left: Icon & Name */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon size={12} strokeWidth={2.2} />
                  </div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                </div>

                {/* Right: Count & Percentage Badge */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.count} tickets</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(item.percentage * 1.5, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
