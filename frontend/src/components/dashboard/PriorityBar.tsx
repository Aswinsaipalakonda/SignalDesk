import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PriorityBarProps {
  data: Record<string, number>;
}

export const PriorityBar: React.FC<PriorityBarProps> = ({ data }) => {
  const tiers = ['High', 'Medium', 'Low'];
  const colors: Record<string, string> = {
    High: '#EF4444',   // Soft coral red
    Medium: '#F59E0B', // Warm amber
    Low: '#019077',    // Botanical teal from logo.png
  };

  const chartData = tiers.map((tier) => ({
    name: tier,
    count: data[tier] || 0,
    color: colors[tier],
  }));

  return (
    <div className="bg-white border border-[#E2EBE4] rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(0,52,55,0.03)] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[#003437]">Tickets by Priority</span>
        <span className="text-[11px] font-semibold text-slate-400">Triage Volume</span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -22, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#003437', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
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
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={42}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
