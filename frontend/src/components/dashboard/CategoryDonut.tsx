import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FiPieChart } from 'react-icons/fi';

interface CategoryDonutProps {
  data: Record<string, number>;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const COLORS = ['#019077', '#0E5E44', '#7BD5A5', '#FDA827', '#4FA3A1', '#B6E5D2'];

const SHORT_NAMES: Record<string, string> = {
  'Technical Support': 'Technical',
  'Account & Service': 'Account',
  'Billing & Payment': 'Billing',
  'Product Issues': 'Product',
  'Order & Delivery': 'Delivery',
  'General Inquiry': 'General',
};

export const CategoryDonut: React.FC<CategoryDonutProps> = ({
  data,
  activeCategory,
  onSelectCategory,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="card card-pad flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FiPieChart size={17} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink">Tickets by category</div>
            <div className="mt-0.5 text-[11px] text-ink-muted">Click a segment to filter</div>
          </div>
        </div>
        <span className="rounded-full bg-mint-50 px-2.5 py-1 text-[10px] font-semibold text-mint-600">
          Live
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-14 text-[12px] text-ink-muted">
          No tickets match the current filters.
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center">
          <div className="relative h-[172px] w-[172px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} tickets (${total ? ((value / total) * 100).toFixed(1) : 0}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid #E3E7DF',
                    boxShadow: '0 16px 40px -16px rgba(16,24,40,0.24)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <Pie
                  data={chartData}
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  animationDuration={700}
                >
                  {chartData.map((entry, index) => {
                    const isActive = activeCategory === entry.name;
                    const isDimmed =
                      (hovered !== null && hovered !== index) ||
                      (activeCategory && !isActive);
                    return (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={isDimmed ? 0.3 : 1}
                        stroke={isActive ? '#003437' : '#FFFFFF'}
                        strokeWidth={isActive ? 3 : 2.5}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHovered(index)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => onSelectCategory?.(entry.name)}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[24px] font-bold leading-none tracking-tight text-ink">
                {total.toLocaleString()}
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                In view
              </span>
            </div>
          </div>

          <div className="mt-4 grid w-full grid-cols-2 gap-1">
            {chartData.map((entry, index) => {
              const percent = total ? (entry.value / total) * 100 : 0;
              const isActive = activeCategory === entry.name;
              return (
                <button
                  key={entry.name}
                  onClick={() => onSelectCategory?.(entry.name)}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  className={`rounded-lg px-2.5 py-2 text-left transition-colors ${
                    isActive ? 'bg-brand-50' : 'hover:bg-[#F7F8FC]'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1.5">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span
                        className="truncate text-[10px] font-medium text-ink-soft"
                        title={entry.name}
                      >
                        {SHORT_NAMES[entry.name] || entry.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] font-semibold text-ink">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[#F1F2F8]">
                    <span
                      className="block h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
