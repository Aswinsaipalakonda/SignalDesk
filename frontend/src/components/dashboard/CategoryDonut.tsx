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

  // Exact botanical & muted teal palette from design
  const COLORS = [
    '#0E5E44', // Deep botanical green
    '#14B8A6', // Muted teal
    '#38BDF8', // Cyan blue
    '#FBBF24', // Amber
    '#818CF8', // Indigo/violet
    '#94A3B8', // Slate grey
  ];

  return (
    <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-card h-full flex flex-col justify-between">
      <div className="text-base font-bold text-text-main mb-2">Tickets by Category</div>

      <div className="flex items-center justify-between">
        {/* Donut Chart with Center Total */}
        <div className="relative w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: number) => [`${val.toLocaleString()} tickets`, 'Count']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
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
            <span className="text-xl font-extrabold text-text-main leading-tight">{total.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-text-muted">Tickets</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 pl-4 space-y-1.5">
          {chartData.map((item, idx) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[130px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-text-main font-medium truncate">{item.name}</span>
                </div>
                <span className="text-text-muted font-semibold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
