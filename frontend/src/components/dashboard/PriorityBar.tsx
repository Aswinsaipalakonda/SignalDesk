import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PriorityBarProps {
  data: Record<string, number>;
}

export const PriorityBar: React.FC<PriorityBarProps> = ({ data }) => {
  const tiers = ['High', 'Medium', 'Low'];
  const colors: Record<string, string> = {
    High: '#F87171',   // Soft coral red
    Medium: '#FBBF24', // Warm amber
    Low: '#34D399',    // Soft emerald green
  };

  const chartData = tiers.map((tier) => ({
    name: tier,
    count: data[tier] || 0,
    color: colors[tier],
  }));

  return (
    <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-card h-full flex flex-col justify-between">
      <div className="text-base font-bold text-text-main mb-2">Tickets by Priority</div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1E293B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(val: number) => [`${val.toLocaleString()} tickets`, 'Volume']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
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
