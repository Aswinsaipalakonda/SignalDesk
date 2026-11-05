import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiFilter, FiRotateCcw, FiSliders } from 'react-icons/fi';
import { AnalyticsFilters } from '../../types';

interface DashboardFiltersProps {
  categories: string[];
  priorities: string[];
  filters: AnalyticsFilters;
  onApply: (filters: AnalyticsFilters) => void;
  onReset: () => void;
  loading?: boolean;
  bounds?: { start?: string; end?: string };
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  categories,
  priorities,
  filters,
  onApply,
  onReset,
  loading = false,
  bounds,
}) => {
  const [draft, setDraft] = useState<AnalyticsFilters>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const activeCount = [
    draft.category && draft.category !== 'All',
    draft.priority && draft.priority !== 'All',
    draft.start_date,
    draft.end_date,
  ].filter(Boolean).length;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onApply(draft);
  };

  const reset = () => {
    setDraft({});
    onReset();
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04, duration: 0.3 }}
      className="card p-4 lg:p-5"
    >
      <div className="flex flex-col gap-3.5 xl:flex-row xl:items-end">
        <div className="flex items-center gap-2.5 pb-1 xl:w-[150px] xl:pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FiSliders size={15} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              Filters
              {activeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </div>
            <div className="text-[10px] text-ink-muted">Refine the workspace</div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="field-label">Department</label>
            <select
              value={draft.category || 'All'}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
              className="input-field cursor-pointer"
            >
              <option value="All">All departments</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Priority</label>
            <select
              value={draft.priority || 'All'}
              onChange={(event) =>
                setDraft((current) => ({ ...current, priority: event.target.value }))
              }
              className="input-field cursor-pointer"
            >
              <option value="All">All priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority} priority
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">From</label>
            <div className="relative">
              <FiCalendar
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/60"
              />
              <input
                type="date"
                value={draft.start_date || ''}
                min={bounds?.start}
                max={bounds?.end}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, start_date: event.target.value }))
                }
                className="input-field pl-9 text-[12px]"
                title="Start date"
              />
            </div>
          </div>

          <div>
            <label className="field-label">To</label>
            <div className="relative">
              <FiCalendar
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/60"
              />
              <input
                type="date"
                value={draft.end_date || ''}
                min={bounds?.start}
                max={bounds?.end}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, end_date: event.target.value }))
                }
                className="input-field pl-9 text-[12px]"
                title="End date"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 xl:pb-0">
          <button type="submit" disabled={loading} className="btn-primary flex-1 xl:flex-none">
            <FiFilter size={14} />
            {loading ? 'Applying...' : 'Apply filters'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="icon-btn h-11 w-11"
            title="Clear filters"
            aria-label="Clear filters"
          >
            <FiRotateCcw size={15} />
          </button>
        </div>
      </div>
    </motion.form>
  );
};
