import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryDonutProps {
  data: Record<string, number>;
}

export const CategoryDonut: React.FC<CategoryDonutProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // Exact botanical & muted teal palette matching assets/logo.png
  const COLORS = [
    '#003437', // Deep botanical green from logo
    '#019077', // Botanical teal from logo
    '#0284C7', // Slate sky blue
    '#F59E0B', // Warm amber
    '#8B5CF6', // Lavender violet
    '#64748B', // Cool charcoal
  ];

  return (
    <div className="bg-white border border-[#E2EBE4] rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(0,52,55,0.03)] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[#003437]">Tickets by Category</span>
        <span className="text-[11px] font-semibold text-[#019077] bg-[#E6F4EF] px-2 py-0.5 rounded-md">
          Live Distribution
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Donut Chart with Center Total */}
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: number) => [`${val.toLocaleString()} tickets`, 'Volume']}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                }}
              />
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-[#003437] leading-none">{total.toLocaleString()}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-1">Tickets</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 pl-2 overflow-hidden">
          {chartData.map((item, idx) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-slate-600 truncate font-medium text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-[#003437] text-[11px] shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
