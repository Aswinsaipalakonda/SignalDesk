import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Clock } from 'lucide-react';
import { api } from '../services/api';
import { TicketPredictResponse } from '../types';

interface AnalyzeTicketProps {
  onTicketClassified?: (result: { category: string; priority: string }) => void;
}

export const AnalyzeTicket: React.FC<AnalyzeTicketProps> = ({ onTicketClassified }) => {
  const exampleTickets = [
    {
      label: '💳 Duplicate Charge',
      text: 'My credit card was charged twice for the annual subscription, but my dashboard still says inactive. Please refund the second charge immediately!',
    },
    {
      label: '🔒 Account Lockout',
      text: 'Urgent: Unable to login to production admin console. It says account locked due to security policy and our team is blocked.',
    },
    {
      label: '📦 Tracking Delay',
      text: 'Order #4892 was scheduled to arrive on Monday. Tracking has not updated in 48 hours and we need an estimated delivery date.',
    },
    {
      label: '🛠️ Software Bug',
      text: 'The reporting dashboard crashes with a 500 error code whenever selecting date ranges over 30 days. Tested on Chrome.',
    },
    {
      label: '❓ API Inquiry',
      text: 'Where can I find documentation and guides regarding the webhook rate limits for your enterprise tier?',
    },
  ];

  const [inputText, setInputText] = useState(
    'Payment deducted from my credit card, but my subscription still shows inactive and order status is unconfirmed!'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketPredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async () => {
    if (!inputText.trim() || inputText.length < 4) {
      setError('Please enter a descriptive support message (minimum 4 characters).');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const pred = await api.predictTicket(inputText);
      setResult(pred);
      if (onTicketClassified) {
        onTicketClassified({ category: pred.predicted_category, priority: pred.priority });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to classify ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isHigh = result?.priority === 'High';
  const isMed = result?.priority === 'Medium';

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-7">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-text-main tracking-tight">
          Real-Time Ticket Classification & Triage
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Submit incoming inquiries to evaluate automated category routing and transparent priority assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Input Column */}
        <div className="lg:col-span-6 bg-white border border-border-subtle rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Quick Test Inquiries
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {exampleTickets.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setInputText(ex.text)}
                  className="px-3 py-1.5 bg-surface-warm border border-border-subtle hover:border-brand-green/40 text-xs font-semibold rounded-lg text-text-main transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold text-text-main mb-2">
              Customer Support Message
            </label>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste customer support inquiry or complaint here..."
              className="w-full bg-surface-warm/40 border border-border-subtle focus:border-brand-green rounded-xl p-3.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-green/10 transition-all resize-none"
            />
            <div className="flex justify-between items-center text-xs text-text-muted mt-2">
              <span>Preserves negations (e.g. "not", "no", "never") for accurate intent</span>
              <span>{inputText.length} characters</span>
            </div>

            {error && (
              <div className="mt-3 text-xs font-semibold text-priority-high flex items-center gap-1.5 bg-priority-high-bg p-2.5 rounded-lg border border-priority-high-border">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleClassify}
            disabled={loading}
            className="w-full mt-6 bg-brand-green hover:bg-brand-green-hover disabled:bg-slate-300 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles size={16} strokeWidth={2} />
                <span>Classify and Triage Ticket</span>
              </>
            )}
          </button>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-6 bg-white border border-border-subtle rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="text-base font-bold text-text-main mb-4">
              Prediction & Triage Results
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Result Hero Card */}
                <div className="bg-surface-warm border border-border-subtle rounded-xl p-4.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-muted">Predicted Department</span>
                    <span className="text-xs font-extrabold text-brand-green bg-brand-green-light px-2.5 py-0.5 rounded-full border border-emerald-100">
                      ML Confidence: {result.confidence_percentage}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-text-main mb-2">
                    {result.predicted_category}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-muted">Priority Tier:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isHigh
                          ? 'bg-priority-high-bg text-priority-high border border-priority-high-border'
                          : isMed
                          ? 'bg-priority-med-bg text-priority-med border border-priority-med-border'
                          : 'bg-priority-low-bg text-priority-low border border-priority-low-border'
                      }`}
                    >
                      {result.priority}
                    </span>
                  </div>
                </div>

                {/* Priority Rule Rationale */}
                <div className="bg-white border-l-4 border-l-brand-green border border-border-subtle rounded-r-xl p-3.5 shadow-xs">
                  <div className="text-xs font-bold text-brand-green mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>Transparent Priority Rationale</span>
                  </div>
                  <div className="text-xs text-text-main leading-relaxed">
                    {result.priority_reason}{' '}
                    <span className="text-text-muted">
                      (Trigger pattern: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{result.matched_pattern}</code>)
                    </span>
                  </div>
                </div>

                {/* Probabilities Breakdown */}
                {result.probabilities && (
                  <div>
                    <div className="text-xs font-bold text-text-main mb-2">
                      Category Probability Distribution
                    </div>
                    <div className="space-y-2">
                      {Object.entries(result.probabilities)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, prob]) => {
                          const pct = Math.round(prob * 100);
                          const isWinner = cat === result.predicted_category;
                          return (
                            <div key={cat}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={isWinner ? 'font-bold text-brand-green' : 'text-text-muted'}>
                                  {cat}
                                </span>
                                <span className="font-semibold text-text-main">{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isWinner ? 'bg-brand-green' : 'bg-slate-300'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-text-muted">
                <Sparkles size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">Ready for Analysis</p>
                <p className="text-xs text-text-muted max-w-xs mx-auto mt-1">
                  Type or select a customer query and click classify to generate real-time ML predictions.
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className="flex justify-between items-center text-[11px] text-text-muted pt-4 border-t border-border-subtle mt-4">
              <span>Saved to Database: <b>{result.ticket_id}</b></span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Inference latency: {result.latency_ms} ms
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
