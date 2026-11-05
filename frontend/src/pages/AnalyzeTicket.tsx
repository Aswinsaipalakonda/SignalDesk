import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Clock, Send, Lightbulb } from 'lucide-react';
import { api } from '../services/api';
import { TicketPredictResponse } from '../types';

interface AnalyzeTicketProps {
  onTicketClassified?: (result: { category: string; priority: string }) => void;
}

export const AnalyzeTicket: React.FC<AnalyzeTicketProps> = ({ onTicketClassified }) => {
  const exampleTickets = [
    {
      label: 'Duplicate Charge',
      text: 'My credit card was charged twice for the annual subscription, but my dashboard still says inactive. Please refund the second charge immediately!',
    },
    {
      label: 'Access Lockout',
      text: 'Urgent: Unable to login to production admin console. It says account locked due to security policy and our team is blocked.',
    },
    {
      label: 'Delivery Tracking',
      text: 'Order #4892 was scheduled to arrive on Monday. Tracking has not updated in 48 hours and we need an estimated delivery date.',
    },
    {
      label: 'System Error',
      text: 'The reporting dashboard crashes with an unexpected error whenever selecting date ranges over 30 days. Tested on Chrome.',
    },
    {
      label: 'Billing Inquiry',
      text: 'Where can I update our company tax ID and request an itemized VAT invoice for last month?',
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
      setError(err?.response?.data?.detail || 'Failed to triage ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isHigh = result?.priority === 'High';
  const isMed = result?.priority === 'Medium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-7"
    >
      {/* Page Title & Breadcrumb */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>SignalDesk</span>
          <span>&gt;</span>
          <span className="text-slate-700">Triage & Classify</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Automated Ticket Triage
        </h1>
        <p className="text-xs text-slate-500">
          Instant inquiry classification, transparent operational priority assessment, and automated department routing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200/70 rounded-[28px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Lightbulb size={14} className="text-amber-500" />
              <span>Sample Inquiries</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {exampleTickets.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setInputText(ex.text)}
                  className="px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/80 text-xs font-semibold rounded-full text-slate-700 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Customer Message
            </label>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste customer support inquiry or complaint here..."
              className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-slate-900 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Understands context, negations, and service urgency</span>
              <span>{inputText.length} characters</span>
            </div>

            {error && (
              <div className="mt-3 text-xs font-semibold text-red-600 flex items-center gap-1.5 bg-red-50 p-3 rounded-2xl border border-red-200/60">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleClassify}
            disabled={loading}
            className="w-full mt-6 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md shadow-slate-900/15 flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={14} />
                <span>Run Intelligent Triage</span>
              </>
            )}
          </button>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-6 bg-white border border-slate-200/70 rounded-[28px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              <span>Triage Assessment</span>
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Result Hero Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Department</span>
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      Confidence: {result.confidence_percentage}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    {result.predicted_category}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Service SLA:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isHigh
                          ? 'bg-red-50 text-red-600 border border-red-200/60'
                          : isMed
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {result.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Priority Rule Rationale */}
                <div className="bg-white border-l-4 border-l-slate-900 border border-slate-200/80 rounded-r-2xl p-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-emerald-600" />
                    <span>Operational Rationale</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {result.priority_reason}{' '}
                    <span className="text-slate-400">
                      (Matched pattern: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-700">{result.matched_pattern}</code>)
                    </span>
                  </div>
                </div>

                {/* Probabilities Breakdown */}
                {result.probabilities && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-800 mb-2.5">
                      Routing Probability Distribution
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(result.probabilities)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, prob]) => {
                          const pct = Math.round(prob * 100);
                          const isWinner = cat === result.predicted_category;
                          return (
                            <div key={cat}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={isWinner ? 'font-bold text-slate-900' : 'text-slate-400'}>
                                  {cat}
                                </span>
                                <span className="font-semibold text-slate-800">{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isWinner ? 'bg-slate-900' : 'bg-slate-300'
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
              <div className="py-20 text-center text-slate-400">
                <Sparkles size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-xs font-bold text-slate-700">Ready for Live Analysis</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Type or select a customer inquiry to test real-time classification and transparent priority routing.
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-4 border-t border-slate-100 mt-4">
              <span>Case Record: <b className="font-mono text-slate-700">{result.ticket_id}</b></span>
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <Clock size={12} />
                Triage speed: {result.latency_ms} ms
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
