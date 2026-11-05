import React, { useEffect, useState } from 'react';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CategoryDonut } from '../components/dashboard/CategoryDonut';
import { PriorityBar } from '../components/dashboard/PriorityBar';
import { RecentTickets } from '../components/dashboard/RecentTickets';
import { AnalyticsOverview } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  onNavigate: (page: string) => void;
  lastClassified?: { category: string; priority: string };
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, lastClassified }) => {
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
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-48 bg-slate-100 rounded-3xl w-full"></div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Hero Section */}
      <HeroBanner
        onAnalyzeClick={() => onNavigate('analyze')}
        onLearnMoreClick={() => onNavigate('about')}
        lastClassified={lastClassified}
      />

      {/* KPI Cards Row */}
      <KpiCards metrics={data.kpi_cards} />

      {/* 3-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4">
          <CategoryDonut data={data.category_distribution} />
        </div>
        <div className="lg:col-span-4">
          <PriorityBar data={data.priority_distribution} />
        </div>
        <div className="lg:col-span-4">
          <RecentTickets
            tickets={data.recent_tickets}
            onViewAllClick={() => onNavigate('explorer')}
          />
        </div>
      </div>
    </div>
  );
};
