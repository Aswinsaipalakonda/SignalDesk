import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiCpu,
  FiDatabase,
  FiGitBranch,
  FiLayers,
  FiLock,
  FiMessageSquare,
  FiSearch,
  FiServer,
  FiShield,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import { api } from '../services/api';
import { DatasetInfo, HealthStatus } from '../types';
import { formatNumber } from '../lib/format';

interface AboutProps {
  onAnalyzeClick: () => void;
}

const VALUES = [
  {
    icon: FiCpu,
    title: 'Genuine machine learning',
    body: 'TF-IDF features feed a Scikit-learn classifier that is trained locally, evaluated on held-out data, and loaded from persisted artifacts at inference time.',
  },
  {
    icon: FiShield,
    title: 'Explainable triage',
    body: 'Priority is assessed by an independent keyword rule engine. Every decision returns the matched pattern and a plain-language rationale — not a hidden black box.',
  },
  {
    icon: FiBarChart2,
    title: 'Operational analytics',
    body: 'Every submission is stored with category, model confidence, priority, and timestamp, powering live workload charts and an auditable ticket archive.',
  },
];

const ARCHITECTURE = [
  { icon: FiMessageSquare, label: 'Customer message', detail: 'Validated input' },
  { icon: FiSearch, label: 'Preprocessing', detail: 'Clean and normalize' },
  { icon: FiLayers, label: 'TF-IDF vectorizer', detail: 'Saved vocabulary' },
  { icon: FiCpu, label: 'ML classifier', detail: 'Category + probability' },
  { icon: FiShield, label: 'Priority rules', detail: 'Independent assessment' },
  { icon: FiDatabase, label: 'History + analytics', detail: 'Stored and aggregated' },
];

const STACK = [
  {
    group: 'Frontend',
    items: ['React 18', 'Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'react-icons'],
  },
  { group: 'Backend', items: ['FastAPI', 'Pydantic v2', 'SQLAlchemy 2.0', 'Uvicorn'] },
  {
    group: 'Machine learning',
    items: [
      'Scikit-learn',
      'TF-IDF',
      'Logistic Regression',
      'Multinomial Naive Bayes',
      'NLTK',
      'Joblib',
    ],
  },
  { group: 'Data & deployment', items: ['PostgreSQL / Neon', 'SQLite fallback', 'Vercel', 'Render'] },
];

const WORKFLOW = [
  'Load and validate the bundled customer support dataset.',
  'Clean text: lowercase, strip HTML and URLs, preserve negations, lemmatize.',
  'Create a stratified train/test split to protect evaluation integrity.',
  'Fit TF-IDF on the training split only, then transform both splits.',
  'Train Naive Bayes and Logistic Regression candidates.',
  'Evaluate accuracy, macro precision/recall/F1, and the confusion matrix.',
  'Select the strongest model by macro-F1 and persist the artifacts.',
  'Serve predictions through FastAPI using the saved model and vectorizer.',
];

export const About: React.FC<AboutProps> = ({ onAnalyzeClick }) => {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.getDatasetInfo(), api.getHealth()]).then((results) => {
      if (cancelled) return;
      if (results[0].status === 'fulfilled') setDataset(results[0].value);
      if (results[1].status === 'fulfilled') setHealth(results[1].value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalRecords = dataset?.total_records || dataset?.stored_records || health?.trained_on || 0;
  const accuracy = health?.model_accuracy ? `${(health.model_accuracy * 100).toFixed(1)}%` : '—';

  return (
    <div className="page-shell space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[28px] bg-[#003437] px-6 py-8 text-white shadow-float sm:px-8 lg:px-10 lg:py-12"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/70">
              <FiZap size={11} className="text-brand-300" />
              About SignalDesk
            </div>
            <h1 className="max-w-2xl font-display text-[32px] font-bold leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
              Support intelligence without outsourcing the reasoning.
            </h1>
            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-white/60 sm:text-[14px]">
              SignalDesk is a full-stack machine learning application that classifies customer
              support inquiries, explains operational priority, and turns every submission into
              analytics your support team can act on.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={onAnalyzeClick}
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[12px] font-semibold text-[#003437] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <FiZap size={14} className="text-brand-600" />
                Analyze a ticket
                <FiArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <span className="rounded-xl border border-white/15 bg-white/[0.07] px-3.5 py-2.5 text-[10px] font-medium text-white/70">
                FastAPI · React · Scikit-learn
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 lg:col-span-4">
            {[
              { label: 'Dataset rows', value: totalRecords ? formatNumber(totalRecords) : '—' },
              { label: 'Categories', value: dataset ? Object.keys(dataset.categories).length : '—' },
              { label: 'Test accuracy', value: accuracy },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 text-center backdrop-blur-sm"
              >
                <div className="font-display text-[20px] font-semibold leading-none tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[8.5px] font-semibold uppercase tracking-[0.08em] text-white/45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {VALUES.map((value, index) => {
          const Icon = value.icon;
          return (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="card card-pad transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={18} />
              </div>
              <h2 className="text-[13px] font-semibold text-ink">{value.title}</h2>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{value.body}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="card card-pad">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FiActivity size={16} />
          </span>
          <div>
            <h2 className="text-[13px] font-semibold text-ink">End-to-end architecture</h2>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Training is separate from inference; no external LLM is involved.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {ARCHITECTURE.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="group relative rounded-xl border border-line/70 bg-[#FAFBFD] p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                  <Icon size={14} />
                </span>
                <div className="text-[10.5px] font-semibold text-ink">{step.label}</div>
                <div className="mt-0.5 text-[9.5px] text-ink-muted">{step.detail}</div>
                {index < ARCHITECTURE.length - 1 && (
                  <FiArrowRight
                    size={12}
                    className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-[#C9CDDB] xl:block"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <div className="card card-pad">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiGitBranch size={16} />
              </span>
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Machine learning workflow</h2>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Reproducible from the bundled CSV
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {WORKFLOW.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-[9px] font-semibold text-brand-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11.5px] leading-relaxed text-ink-muted">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="card card-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-50 text-mint-600">
                <FiCheckCircle size={16} />
              </span>
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Reproducibility checks</h2>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Safeguards that keep the evaluation honest
                </p>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                'Fixed random seed for repeatable splits and training.',
                'TF-IDF vocabulary fitted on the training split only.',
                'Metrics persisted to model_metadata.json for audit.',
                'Artifacts loaded from disk at API startup.',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl bg-[#FAFBFD] px-3 py-2.5 text-[10.5px] leading-relaxed text-ink-muted"
                >
                  <FiCheckCircle size={11} className="mt-0.5 shrink-0 text-mint-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <div className="card card-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiServer size={16} />
              </span>
              <h2 className="text-[13px] font-semibold text-ink">Technology stack</h2>
            </div>
            <div className="space-y-3.5">
              {STACK.map((group) => (
                <div key={group.group}>
                  <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {group.group}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-line bg-[#FAFBFD] px-2 py-1 text-[9.5px] font-medium text-ink-soft"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <FiLock size={16} />
              </span>
              <h2 className="text-[13px] font-semibold text-ink">Scope and limitations</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                'Priority is rule-based, not a trained ML prediction.',
                'Model confidence is a probability, not a correctness guarantee.',
                'The bundled dataset is a benchmark-style support corpus, not live customer data.',
                'No authentication, email/chat sync, or payment processing is included.',
                'Category quality depends on the labels available in the uploaded dataset.',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-muted"
                >
                  <FiCheckCircle size={12} className="mt-0.5 shrink-0 text-[#C9CDDB]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-line/80 bg-white/70 px-4 py-3.5 text-[10.5px] text-ink-muted sm:flex-row sm:items-center">
        <span className="flex items-center gap-1.5">
          <FiTarget size={12} className="text-brand-500" />
          Built as a production-grade MVP: real training, real evaluation, real persistence.
        </span>
        <span className="flex items-center gap-1.5">
          <FiDatabase size={12} className="text-brand-500" />
          Dataset: {dataset?.dataset_name || 'bundled support ticket benchmark'}
        </span>
      </div>
    </div>
  );
};
