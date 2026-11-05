import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiActivity } from 'react-icons/fi';
import { TimeSeriesPoint } from '../../types';
import { formatNumber, formatShortDate } from '../../lib/format';

interface TicketVolumeChartProps {
  data: TimeSeriesPoint[];
}

export const TicketVolumeChart: React.FC<TicketVolumeChartProps> = ({ data }) => {
  const hasData = data.some((point) => point.tickets > 0);
  const total = data.reduce((sum, point) => sum + point.tickets, 0);
  const peak = data.reduce((max, point) => Math.max(max, point.tickets), 0);

  return (
    <div className="card card-pad flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FiActivity size={17} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink">Ticket volume</div>
            <div className="mt-0.5 text-[11px] text-ink-muted">
              Daily intake and urgent share
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[#F7F8FC] px-2.5 py-1.5 text-[10px] font-medium text-ink-muted">
            {formatNumber(total)} total
          </span>
          <span className="rounded-lg bg-[#F7F8FC] px-2.5 py-1.5 text-[10px] font-medium text-ink-muted">
            Peak {formatNumber(peak)}
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-1 items-center justify-center py-20 text-[12px] text-ink-muted">
          No dated tickets match the current filters.
        </div>
      ) : (
        <>
          <div className="h-[252px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#019077" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#019077" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="priorityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDA827" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#FDA827" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#EEF0F6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 10, fill: '#98A2B3' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={32}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#98A2B3' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(label) => formatShortDate(String(label))}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} tickets`,
                    name === 'high_priority' ? 'High priority' : 'All tickets',
                  ]}
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid #E3E7DF',
                    boxShadow: '0 16px 40px -16px rgba(16,24,40,0.24)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#019077"
                  strokeWidth={2.4}
                  fill="url(#volumeGradient)"
                  animationDuration={800}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0E5E44', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="high_priority"
                  stroke="#FDA827"
                  strokeWidth={1.8}
                  fill="url(#priorityGradient)"
                  animationDuration={900}
                  dot={false}
                  activeDot={{ r: 3.5, fill: '#C97E12', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-line/70 pt-4 text-[10px] font-medium text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> All tickets
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> High priority
            </span>
            <span className="ml-auto hidden text-ink-muted/70 sm:block">
              Daily aggregation from stored history
            </span>
          </div>
        </>
      )}
    </div>
  );
};
