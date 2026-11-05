import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiRefreshCw, FiShield } from 'react-icons/fi';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CategoryDonut } from '../components/dashboard/CategoryDonut';
import { PriorityBar } from '../components/dashboard/PriorityBar';
import { RecentTickets } from '../components/dashboard/RecentTickets';
import { TicketVolumeChart } from '../components/dashboard/TicketVolumeChart';
import { ModelSnapshotCard } from '../components/dashboard/ModelSnapshotCard';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { AnalyticsFilters, AnalyticsOverview, ClassificationSummary, Ticket } from '../types';
import { api, getApiErrorMessage } from '../services/api';
import { formatDate, formatNumber } from '../lib/format';

interface DashboardProps {
  onNavigate: (page: string) => void;
  lastClassified?: ClassificationSummary;
  onSelectTicket: (ticket: Ticket) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  lastClassified,
  onSelectTicket,
}) => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<{ start?: string; end?: string }>({});
  const hasLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (hasLoaded.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const overview = await api.getAnalyticsOverview(filters);
        if (cancelled) return;
        setData(overview);
        hasLoaded.current = true;

        if (!filters.start_date && !filters.end_date && overview.date_range.start) {
          setBounds({
            start: overview.date_range.start,
            end: overview.date_range.end,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Unable to load dashboard analytics.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const toggleCategory = (category: string) => {
    setFilters((current) => ({
      ...current,
      category: current.category === category ? undefined : category,
    }));
  };

  const togglePriority = (priority: string) => {
    setFilters((current) => ({
      ...current,
      priority: current.priority === priority ? undefined : priority,
    }));
  };

  const resetFilters = () => setFilters({});

  if (loading && !data) {
    return (
      <div className="page-shell space-y-6">
        <div className="h-[430px] animate-pulse rounded-[28px] bg-[#E9EBF4]" />
        <div className="h-[136px] animate-pulse rounded-3xl bg-white" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-[168px] animate-pulse rounded-3xl bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="h-[390px] animate-pulse rounded-3xl bg-white xl:col-span-8" />
          <div className="h-[390px] animate-pulse rounded-3xl bg-white xl:col-span-4" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        <div className="card flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <FiAlertCircle size={24} />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Dashboard unavailable</h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
            {error || 'The analytics service did not return data.'}
          </p>
          <button
            onClick={() => setFilters({ ...filters })}
            className="btn-primary mt-5"
          >
            <FiRefreshCw size={15} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const recentTicket = data.recent_tickets[0] || null;
  const accuracy = parseFloat(data.model_accuracy) / 100 || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="page-shell space-y-6"
    >
      <HeroBanner
        onAnalyzeClick={() => onNavigate('analyze')}
        onPerformanceClick={() => onNavigate('performance')}
        lastClassified={lastClassified}
        recentTicket={recentTicket}
        accuracy={accuracy}
        f1Macro={data.f1_macro}
        totalTickets={data.total_tickets}
        numCategories={data.num_categories || Object.keys(data.category_distribution).length}
        avgConfidence={data.avg_confidence}
      />

      <DashboardFilters
        categories={data.categories}
        priorities={data.priorities}
        filters={filters}
        onApply={setFilters}
        onReset={resetFilters}
        loading={refreshing}
        bounds={bounds}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-700">
          <FiAlertCircle size={15} />
          {error}
        </div>
      )}

      <KpiCards metrics={data.kpi_cards} />

      <div
        className={`grid grid-cols-1 gap-6 transition-opacity xl:grid-cols-12 ${
          refreshing ? 'opacity-60' : ''
        }`}
      >
        <div className="xl:col-span-8">
          <TicketVolumeChart data={data.time_series} />
        </div>
        <div className="xl:col-span-4">
          <RecentTickets
            tickets={data.recent_tickets}
            onViewAllClick={() => onNavigate('explorer')}
            onSelectTicket={onSelectTicket}
          />
        </div>

        <div className="xl:col-span-4">
          <CategoryDonut
            data={data.category_distribution}
            activeCategory={filters.category}
            onSelectCategory={toggleCategory}
          />
        </div>
        <div className="xl:col-span-4">
          <PriorityBar
            data={data.priority_distribution}
            activePriority={filters.priority}
            onSelectPriority={togglePriority}
          />
        </div>
        <div className="xl:col-span-4">
          <ModelSnapshotCard
            accuracy={accuracy}
            f1Macro={data.f1_macro}
            avgConfidence={data.avg_confidence}
            algorithm={data.model_algorithm}
            numCategories={data.num_categories || Object.keys(data.category_distribution).length}
            onNavigate={() => onNavigate('performance')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line/80 bg-white/70 px-4 py-3 text-[11px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1.5">
          <FiShield size={12} className="text-brand-500" />
          Showing <b className="font-semibold text-ink">{formatNumber(data.total_tickets)}</b> tickets
          {filters.category ? ` in ${filters.category}` : ''}
          {filters.priority ? ` with ${filters.priority.toLowerCase()} priority` : ''}
          {data.date_range.start
            ? ` from ${formatDate(data.date_range.start)} to ${formatDate(data.date_range.end)}`
            : ''}
          .
        </span>
        <span className="text-ink-muted/80">
          Live metrics from stored history and persisted model metadata.
        </span>
      </div>
    </motion.div>
  );
};
