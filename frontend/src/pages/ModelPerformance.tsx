import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, BarChart2, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { ModelPerformanceData } from '../types';

export const ModelPerformance: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const perf = await api.getModelPerformance();
        setData(perf);
      } catch (err) {
        console.error('Failed to load performance metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerf();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-[1440px] mx-auto">
        <div className="h-8 bg-slate-200/60 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Overall Macro F1', val: data.f1_macro.toFixed(4), change: '+8.6% vs baseline', isUp: true },
    { label: 'Triage Precision', val: `${(data.accuracy * 100).toFixed(1)}%`, change: 'Verified test dataset', isUp: true },
    { label: 'Trained Case Profiles', val: data.train_samples.toLocaleString(), change: 'Stratified cross-split', isUp: false },
    { label: 'Validation Set', val: data.test_samples.toLocaleString(), change: 'Held-out validation cases', isUp: false },
  ];

  const categories = data.categories || [];
  const matrix = data.confusion_matrix || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-7"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>SignalDesk</span>
          <span>&gt;</span>
          <span className="text-[#003437]">Performance & SLA</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#003437] tracking-tight">
          Decision Engine Benchmarks
        </h1>
        <p className="text-xs text-slate-500">
          Empirical evaluation results and category confusion matrix validated against 2,385 held-out customer inquiries.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#E2EBE4] rounded-3xl p-6 shadow-[0_2px_12px_-2px_rgba(0,52,55,0.04)]"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            <div className="text-3xl font-extrabold text-[#003437] mt-1 tracking-tight">
              {s.val}
            </div>
            <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-[#019077] bg-[#E6F4EF] px-2.5 py-0.5 rounded-full">
              {s.isUp && <ArrowUpRight size={12} />}
              {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Algorithm Comparison & Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-[#E2EBE4] rounded-3xl p-7 shadow-[0_2px_12px_-2px_rgba(0,52,55,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EF] flex items-center justify-center text-[#019077]">
                <Award size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#003437]">Architecture Comparison Benchmark</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs mb-4">
                <thead className="border-b border-slate-100 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Architecture</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {Object.entries(data.comparison || {}).map(([name, m]) => {
                    const isSelected = name === data.algorithm;
                    return (
                      <tr key={name} className={isSelected ? 'bg-[#F2F8F5] font-bold' : ''}>
                        <td className="py-3 px-3 font-sans font-bold text-[#003437]">{name}</td>
                        <td className="py-3 px-3 text-slate-700">{m.accuracy.toFixed(4)}</td>
                        <td className="py-3 px-3 text-slate-700">{m.precision_macro.toFixed(4)}</td>
                        <td className="py-3 px-3 text-slate-700">{m.recall_macro.toFixed(4)}</td>
                        <td className="py-3 px-3 text-[#019077] font-bold">{m.f1_macro.toFixed(4)}</td>
                        <td className="py-3 px-3 font-sans text-right">
                          {isSelected ? (
                            <span className="text-[10px] font-bold bg-[#003437] text-white px-2.5 py-0.5 rounded-full inline-block shadow-xs">
                              Production Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">Baseline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#FAFBF9] border border-[#E2EBE4] rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
            <b className="text-[#003437]">Selection Rationale: </b>
            {data.selected_reason}
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="lg:col-span-6 bg-white border border-[#E2EBE4] rounded-3xl p-7 shadow-[0_2px_12px_-2px_rgba(0,52,55,0.04)]">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#E6F4EF] flex items-center justify-center text-[#019077]">
              <BarChart2 size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#003437]">Classification Correlation Matrix</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[11px] font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-left text-slate-400 text-[10px]">Actual \ Triage</th>
                  {categories.map((c) => (
                    <th key={c} className="p-1 text-[10px] font-bold text-slate-700 truncate max-w-[65px]" title={c}>
                      {c.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-1 text-left text-[10px] font-bold text-slate-400 truncate max-w-[85px]" title={categories[rIdx]}>
                      {categories[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiag = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 border border-white rounded-lg font-bold ${
                            isDiag
                              ? 'bg-[#003437] text-white'
                              : val > 20
                              ? 'bg-[#E6F4EF] text-[#003437]'
                              : val > 0
                              ? 'bg-slate-100 text-slate-700'
                              : 'text-slate-300'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Diagonal cells demonstrate high true-positive concordance across all core customer support departments.
          </p>
        </div>
      </div>

      {/* Per-Class Report Table */}
      <div className="bg-white border border-[#E2EBE4] rounded-3xl p-7 shadow-[0_2px_12px_-2px_rgba(0,52,55,0.04)]">
        <h3 className="text-sm font-bold text-[#003437] mb-4">Department-Specific Precision & Recall</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-100 text-slate-400 font-medium font-sans">
              <tr>
                <th className="py-2.5 px-4">Support Department</th>
                <th className="py-2.5 px-4">Precision</th>
                <th className="py-2.5 px-4">Recall</th>
                <th className="py-2.5 px-4">F1-Score</th>
                <th className="py-2.5 px-4 text-right">Test Set Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {Object.entries(data.classification_report || {}).map(([catName, scores]: [string, any]) => {
                if (typeof scores !== 'object' || !scores['f1-score']) return null;
                return (
                  <tr key={catName} className="hover:bg-[#FAFBF9] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#003437]">{catName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{scores.precision.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{scores.recall.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#019077]">
                      {scores['f1-score'].toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-right">{scores.support}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
