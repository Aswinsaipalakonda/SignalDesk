import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OverviewCharts } from '../components/dashboard/OverviewCharts';
import { RecentActivityTable } from '../components/dashboard/RecentActivityTable';
import { TopDepartmentsCard } from '../components/dashboard/TopDepartmentsCard';
import { PriorityQueuesCard } from '../components/dashboard/PriorityQueuesCard';
import { AnalyticsOverview } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  onNavigate: (page: string) => void;
  lastClassified?: { category: string; priority: string };
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overview = await api.getAnalyticsOverview();
        setData(overview);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-[1440px] mx-auto">
        <div className="h-10 bg-slate-200/60 rounded-xl w-64 mb-6"></div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 h-80 bg-slate-100 rounded-3xl"></div>
          <div className="col-span-4 h-80 bg-slate-100 rounded-3xl"></div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 h-96 bg-slate-100 rounded-3xl"></div>
          <div className="col-span-4 h-96 bg-slate-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-7"
    >
      {/* Page Title & Breadcrumb (matching reference design) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>SignalDesk</span>
          <span>&gt;</span>
          <span className="text-slate-700">Dashboard</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Welcome Back, Operations Lead</span>
          <span className="text-2xl">👋</span>
        </h1>
      </div>

      {/* Row 1: Support Volume Overview (Left) + Triage Efficiency Speedometer (Right) */}
      <OverviewCharts
        totalTickets={data.total_tickets}
        accuracyRate={data.model_accuracy}
      />

      {/* Row 2: Recent Activity Table (Left 8 cols) + Top Departments & Priority Queues (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (8/12) */}
        <div className="lg:col-span-8">
          <RecentActivityTable
            tickets={data.recent_tickets}
            onViewAll={() => onNavigate('explorer')}
          />
        </div>

        {/* Right Col (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <TopDepartmentsCard categories={data.category_distribution} />
          <PriorityQueuesCard priorities={data.priority_distribution} />
        </div>
      </div>
    </motion.div>
  );
};
