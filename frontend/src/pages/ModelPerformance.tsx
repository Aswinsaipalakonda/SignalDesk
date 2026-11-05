import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiAlertCircle,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiTarget,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, getApiErrorMessage } from '../services/api';
import { DatasetInfo, ModelPerformanceData } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { formatDate, formatNumber } from '../lib/format';

const COMPARISON_COLORS = {
  Accuracy: '#003437',
  Precision: '#019077',
  Recall: '#4FA3A1',
  'F1 Score': '#FDA827',
};

export const ModelPerformance: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [performance, datasetInfo] = await Promise.all([
          api.getModelPerformance(),
          api.getDatasetInfo(),
        ]);
        if (cancelled) return;
        setData(performance);
        setDataset(datasetInfo);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Unable to load model evaluation metrics.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading && !data) {
    return (
      <div className="page-shell space-y-6">
        <div className="h-16 w-1/2 animate-pulse rounded-2xl bg-[#E9EBF4]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-[150px] animate-pulse rounded-3xl bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="h-[380px] animate-pulse rounded-3xl bg-white xl:col-span-7" />
          <div className="h-[380px] animate-pulse rounded-3xl bg-white xl:col-span-5" />
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
          <h2 className="font-display text-lg font-bold text-ink">Performance metrics unavailable</h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
            {error || 'The model metadata could not be loaded.'}
          </p>
          <button onClick={() => setReloadKey((key) => key + 1)} className="btn-primary mt-5">
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const categories = data.categories || [];
  const matrix = data.confusion_matrix || [];
  const comparisonData = Object.entries(data.comparison || {}).map(([name, metrics]) => ({
    name,
    Accuracy: +(metrics.accuracy * 100).toFixed(2),
    Precision: +(metrics.precision_macro * 100).toFixed(2),
    Recall: +(metrics.recall_macro * 100).toFixed(2),
    'F1 Score': +(metrics.f1_macro * 100).toFixed(2),
  }));

  const metricCards = [
    {
      label: 'Test accuracy',
      value: data.accuracy * 100,
      decimals: 1,
      suffix: '%',
      icon: FiTarget,
      detail: `${formatNumber(data.test_samples)} held-out tickets`,
      accent: 'bg-brand-50 text-brand-600',
      bar: 'bg-brand-500',
    },
    {
      label: 'Macro-F1',
      value: data.f1_macro,
      decimals: 3,
      suffix: '',
      icon: FiActivity,
      detail: 'Equal weight across categories',
      accent: 'bg-mint-50 text-mint-600',
      bar: 'bg-mint-500',
    },
    {
      label: 'Macro precision',
      value: data.precision_macro,
      decimals: 3,
      suffix: '',
      icon: FiAward,
      detail: 'Positive predictive quality',
      accent: 'bg-sky-50 text-sky-600',
      bar: 'bg-sky-500',
    },
    {
      label: 'Macro recall',
      value: data.recall_macro,
      decimals: 3,
      suffix: '',
      icon: FiLayers,
      detail: 'Coverage across support classes',
      accent: 'bg-amber-50 text-amber-600',
      bar: 'bg-amber-500',
    },
  ];

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Model Performance"
        title="Benchmarks you can audit."
        description={`Genuine evaluation results from a stratified held-out split of ${formatNumber(data.test_samples)} tickets. No metrics are hardcoded.`}
        actions={
          <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[11px] font-medium text-ink-muted shadow-sm">
            <FiCalendar size={13} className="text-brand-500" />
            Trained {data.training_date || '—'}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="card card-pad group transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.accent}`}>
                  <Icon size={16} />
                </span>
                <FiCheckCircle size={13} className="text-mint-500" />
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {card.label}
              </div>
              <div className="mt-1.5 font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-ink">
                <AnimatedNumber value={card.value} decimals={card.decimals} suffix={card.suffix} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[10px] text-ink-muted">{card.detail}</span>
                <span className={`h-1 w-10 shrink-0 rounded-full ${card.bar} opacity-60`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="card card-pad xl:col-span-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiBarChart2 size={16} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">Algorithm comparison</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  Accuracy, precision, recall, and F1 on the same held-out split
                </div>
              </div>
            </div>
            <span className="rounded-full bg-[#F1F2F8] px-2.5 py-1 text-[10px] font-semibold text-ink-muted">
              {comparisonData.length} algorithms
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#355655', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#98A2B3' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E3E7DF',
                    boxShadow: '0 12px 30px rgba(16,24,40,0.10)',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }}
                  iconType="circle"
                  iconSize={7}
                />
                {Object.keys(COMPARISON_COLORS).map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COMPARISON_COLORS[key as keyof typeof COMPARISON_COLORS]}
                    radius={[5, 5, 0, 0]}
                    barSize={20}
                    animationDuration={700}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad xl:col-span-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FiCpu size={16} />
            </span>
            <div>
              <div className="text-[13px] font-semibold text-ink">Selected model</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">
                Chosen from genuine evaluation results
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-[#003437] p-5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-brand-500/25 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-mint-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                  Production active
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[9px] font-medium text-white/80">
                  v{data.version || '2.1'}
                </span>
              </div>
              <div className="mt-3 max-w-[240px] font-display text-[20px] font-semibold leading-tight tracking-tight">
                {data.algorithm}
              </div>
              <div className="mt-1 text-[10px] text-white/55">
                {data.model_name} · seed {data.random_seed ?? '—'}
              </div>
            </div>
          </div>

          <p className="mt-4 rounded-xl border border-line/70 bg-[#FAFBFD] p-4 text-[11px] leading-relaxed text-ink-muted">
            <b className="font-semibold text-ink">Why this model: </b>
            {data.selected_reason}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#FAFBFD] p-3.5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                Train rows
              </div>
              <div className="mt-1 font-mono text-[15px] font-semibold text-ink">
                {formatNumber(data.train_samples)}
              </div>
            </div>
            <div className="rounded-xl bg-[#FAFBFD] p-3.5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                Test rows
              </div>
              <div className="mt-1 font-mono text-[15px] font-semibold text-ink">
                {formatNumber(data.test_samples)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="card card-pad xl:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-ink">Confusion matrix</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">
                Actual category vs. predicted category
              </div>
            </div>
            <span className="rounded-lg bg-[#F1F2F8] px-2.5 py-1 font-mono text-[9px] font-medium text-ink-muted">
              {formatNumber(data.test_samples)} rows
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-[10px]">
              <thead>
                <tr>
                  <th className="p-1.5 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Actual ↓ / Predicted →
                  </th>
                  {categories.map((category) => (
                    <th
                      key={category}
                      className="max-w-[68px] truncate p-1.5 text-[9px] font-semibold text-ink-soft"
                      title={category}
                    >
                      {category.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rowIndex) => {
                  const rowMax = Math.max(...row, 1);
                  return (
                    <tr key={categories[rowIndex] || rowIndex}>
                      <td
                        className="max-w-[110px] truncate p-1.5 text-left text-[9px] font-semibold text-ink-muted"
                        title={categories[rowIndex]}
                      >
                        {categories[rowIndex]}
                      </td>
                      {row.map((value, columnIndex) => {
                        const isDiagonal = rowIndex === columnIndex;
                        const intensity = isDiagonal ? 1 : value / rowMax;
                        return (
                          <td
                            key={columnIndex}
                            title={`${categories[rowIndex]} → ${categories[columnIndex]}: ${value}`}
                            className="rounded-lg p-2 font-mono font-semibold transition-transform hover:scale-105"
                            style={{
                              backgroundColor: isDiagonal
                                ? `rgba(0,52,55,${0.78 + intensity * 0.22})`
                                : `rgba(1,144,119,${Math.min(0.65, intensity * 0.7)})`,
                              color: isDiagonal || intensity > 0.38 ? '#FFFFFF' : '#355655',
                            }}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-ink-muted">
            Darker diagonal cells indicate correct classifications. Off-diagonal cells show
            confusion between related support categories.
          </p>
        </div>

        <div className="card card-pad xl:col-span-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FiDatabase size={16} />
            </span>
            <div>
              <div className="text-[13px] font-semibold text-ink">Dataset provenance</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">Reproducible training inputs</div>
            </div>
          </div>

          <div className="space-y-2.5 text-[11px]">
            <div className="flex items-start justify-between gap-3 rounded-xl bg-[#FAFBFD] px-3.5 py-2.5">
              <span className="text-ink-muted">Dataset</span>
              <span className="text-right font-semibold text-ink">
                {data.dataset_name || dataset?.dataset_name || '—'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 rounded-xl bg-[#FAFBFD] px-3.5 py-2.5">
              <span className="shrink-0 text-ink-muted">Source file</span>
              <span className="max-w-[190px] break-all text-right font-mono text-[9.5px] font-medium text-ink-soft">
                {data.dataset_source || dataset?.dataset_source || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FAFBFD] px-3.5 py-2.5">
              <span className="text-ink-muted">Rows</span>
              <span className="font-mono font-semibold text-ink">
                {formatNumber(
                  dataset?.total_records ||
                    data.dataset_summary?.total_rows ||
                    data.total_samples,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FAFBFD] px-3.5 py-2.5">
              <span className="text-ink-muted">Date range</span>
              <span className="font-medium text-ink-soft">
                {formatDate(dataset?.date_min || data.dataset_summary?.date_min)} –{' '}
                {formatDate(dataset?.date_max || data.dataset_summary?.date_max)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FAFBFD] px-3.5 py-2.5">
              <span className="text-ink-muted">Categories</span>
              <span className="font-mono font-semibold text-ink">{data.num_categories}</span>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-line/70 bg-white p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              <FiFileText size={10} className="text-brand-500" /> Vectorizer configuration
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.vectorizer_config || {}).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-md border border-line bg-[#FAFBFD] px-1.5 py-0.5 font-mono text-[9px] text-ink-muted"
                >
                  {key}: {Array.isArray(value) ? value.join('–') : String(value)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <div className="text-[13px] font-semibold text-ink">Per-class precision and recall</div>
          <div className="mt-0.5 text-[11px] text-ink-muted">
            Held-out performance for every supported category
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-line bg-[#F8F9FC] text-[9px] uppercase tracking-[0.1em] text-ink-muted">
                <th className="px-5 py-3 font-semibold">Support category</th>
                <th className="px-5 py-3 font-semibold">Precision</th>
                <th className="px-5 py-3 font-semibold">Recall</th>
                <th className="px-5 py-3 font-semibold">F1-score</th>
                <th className="px-5 py-3 text-right font-semibold">Test support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {Object.entries(data.classification_report || {}).map(
                ([category, scores]: [string, any]) => {
                  if (typeof scores !== 'object' || scores?.['f1-score'] === undefined) return null;
                  return (
                    <tr key={category} className="transition-colors hover:bg-[#FAFBFD]">
                      <td className="px-5 py-3.5 font-semibold text-ink">{category}</td>
                      <td className="px-5 py-3.5 font-mono text-ink-soft">
                        {Number(scores.precision).toFixed(3)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-ink-soft">
                        {Number(scores.recall).toFixed(3)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-semibold text-brand-600">
                            {Number(scores['f1-score']).toFixed(3)}
                          </span>
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F1F2F8]">
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: `${Number(scores['f1-score']) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              className="block h-full rounded-full bg-brand-500"
                            />
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-ink-muted">
                        {formatNumber(Number(scores.support), 0)}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
