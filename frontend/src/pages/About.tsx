import React from 'react';
import { Layers, ShieldCheck, Zap, Database, Server, Terminal } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-text-main tracking-tight">
          About SignalDesk & Technical Architecture
        </h2>
        <p className="text-sm text-text-muted mt-1">
          High-performance customer support ticket categorization and triage powered by Scikit-learn, FastAPI, and Neon PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-7">
        {/* ML Overview */}
        <div className="lg:col-span-6 bg-white border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-brand-green">
            <Zap size={22} />
            <h3 className="text-base font-bold text-text-main">Machine Learning & NLP Architecture</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            SignalDesk uses a genuinely trained Scikit-learn classification backend rather than generic external LLM API calls.
          </p>
          <ul className="space-y-2 text-xs text-text-main">
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Text Preprocessing:</b> Lowercasing, HTML/URL stripping, tokenization, lemmatization, and intentional preservation of sentiment negations (<i>"not"</i>, <i>"no"</i>, <i>"never"</i>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>TF-IDF Vectorization:</b> Sublinear term frequency scaling with unigram and bigram extraction (6,000 max features).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Class-Balanced Logistic Regression:</b> Provides probabilistic confidence scores and handles real-world category imbalance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Transparent Priority Engine:</b> Independent rule-based assessment that flags security breaches, payment outages, and delays with actionable explanations.
              </span>
            </li>
          </ul>
        </div>

        {/* Database & Cloud */}
        <div className="lg:col-span-6 bg-white border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-brand-green">
            <Database size={22} />
            <h3 className="text-base font-bold text-text-main">Full-Stack Cloud Infrastructure</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Migrated from monolithic Streamlit to a decoupled modern architecture designed for scale and high concurrency.
          </p>
          <ul className="space-y-2 text-xs text-text-main">
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Frontend:</b> React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, and Recharts. Hosted on Vercel.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Backend:</b> FastAPI (Python 3.11+) with Pydantic v2 validation and Uvicorn ASGI server. Hosted on Render.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Database:</b> Neon Serverless PostgreSQL with SQLAlchemy 2.0 connection pooling and automatic schema management.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>
                <b>Design Reference:</b> Pixel-accurate recreation of the visual design reference with warm white background and botanical accents.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
