import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCopy,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiGitBranch,
  FiLoader,
  FiLock,
  FiSend,
  FiZap,
} from 'react-icons/fi';
import { api, getApiErrorMessage } from '../services/api';
import { ClassificationSummary, TicketPredictResponse } from '../types';
import { PageHeader } from '../components/ui/PageHeader';

interface AnalyzeTicketProps {
  onTicketClassified?: (summary: ClassificationSummary) => void;
}

const EXAMPLES = [
  {
    label: 'Duplicate charge',
    text: 'My credit card was charged twice for the annual subscription, but my dashboard still says inactive. Please refund the second charge immediately!',
  },
  {
    label: 'Access lockout',
    text: 'Urgent: Unable to login to the production admin console. It says my account is locked due to a security policy and our team is blocked.',
  },
  {
    label: 'Delivery tracking',
    text: 'Order #4892 was scheduled to arrive on Monday. Tracking has not updated in 48 hours and we need an estimated delivery date.',
  },
  {
    label: 'System error',
    text: 'The reporting dashboard crashes with an unexpected error whenever I select date ranges over 30 days. Tested on Chrome.',
  },
  {
    label: 'Billing inquiry',
    text: 'Where can I update our company tax ID and request an itemized VAT invoice for last month?',
  },
];

const PIPELINE_STEPS = [
  { label: 'Text preprocessing', detail: 'Lowercase, strip HTML/URLs, preserve negations', icon: FiFileText },
  { label: 'TF-IDF vectorization', detail: 'Transform with the saved vocabulary', icon: FiCpu },
  { label: 'Category classification', detail: 'Score classes with the trained model', icon: FiZap },
  { label: 'Priority assessment', detail: 'Apply independent, transparent rules', icon: FiAlertTriangle },
];

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export const AnalyzeTicket: React.FC<AnalyzeTicketProps> = ({ onTicketClassified }) => {
  const [inputText, setInputText] = useState(EXAMPLES[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketPredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [priority, setPriority] = useState('Low');
  const [savingPriority, setSavingPriority] = useState(false);
  const [priorityNotice, setPriorityNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);

  useEffect(() => {
    if (!loading) {
      setStage(PIPELINE_STEPS.length);
      return;
    }
    setStage(0);
    const interval = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, PIPELINE_STEPS.length - 1));
    }, 360);
    return () => window.clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!result) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleClassify();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const handleClassify = async () => {
    if (!inputText.trim() || inputText.trim().length < 4) {
      setError('Please enter a descriptive support message (minimum 4 characters).');
      return;
    }
    if (loading) return;

    setError(null);
    setPriorityNotice(null);
    setLoading(true);
    setResult(null);

    try {
      const prediction = await api.predictTicket(inputText.trim());
      setResult(prediction);
      setPriority(prediction.priority);
      onTicketClassified?.({
        category: prediction.predicted_category,
        priority: prediction.priority,
        confidence: prediction.confidence,
        latencyMs: prediction.latency_ms,
        ticketId: prediction.ticket_id,
        text: prediction.original_text,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to triage the ticket. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const applyPriority = async (value: string) => {
    if (!result || value === result.priority) return;
    setSavingPriority(true);
    setPriorityNotice(null);
    try {
      const updated = await api.updateTicketPriority(
        result.ticket_id,
        value,
        'Priority manually corrected by a support agent from the Analyze page.',
      );
      setResult((current) =>
        current
          ? {
              ...current,
              priority: updated.priority,
              priority_reason: updated.priority_reason || current.priority_reason,
              matched_pattern: 'manual_override',
            }
          : current,
      );
      setPriority(updated.priority);
      setPriorityNotice(`Priority updated to ${updated.priority}.`);
      onTicketClassified?.({
        category: result.predicted_category,
        priority: updated.priority,
        confidence: result.confidence,
        latencyMs: result.latency_ms,
        ticketId: result.ticket_id,
        text: result.original_text,
      });
    } catch (err) {
      setPriorityNotice(getApiErrorMessage(err, 'Could not update priority.'));
    } finally {
      setSavingPriority(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const summary = [
      `Ticket: ${result.ticket_id}`,
      `Category: ${result.predicted_category}`,
      `Confidence: ${result.confidence_percentage}`,
      `Priority: ${result.priority}`,
      `Reason: ${result.priority_reason}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const isHigh = result?.priority === 'High';
  const isMedium = result?.priority === 'Medium';

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Analyze ticket"
        title="Turn a message into a clear decision."
        description="Run a genuine Scikit-learn category prediction and an independent rule-based priority assessment. Nothing is sent to an external LLM."
        actions={
          <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[11px] font-medium text-ink-muted shadow-sm">
            <FiDatabase size={13} className="text-brand-500" />
            Predictions saved automatically
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card card-pad lg:col-span-5"
        >
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiZap size={18} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">New analysis</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">Compose or paste a ticket</div>
              </div>
            </div>
            <span className="rounded-full bg-mint-50 px-2.5 py-1 text-[10px] font-semibold text-mint-600">
              Model live
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Sample inquiries
            </label>
            <span className="text-[10px] text-ink-muted/70">Click to load</span>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                onClick={() => {
                  setInputText(example.text);
                  setResult(null);
                  setError(null);
                  setPriorityNotice(null);
                }}
                className="rounded-full border border-line bg-[#FAFBFD] px-3 py-1.5 text-[10.5px] font-medium text-ink-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 active:translate-y-0"
              >
                {example.label}
              </button>
            ))}
          </div>

          <label className="field-label">Customer message</label>
          <textarea
            rows={9}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Paste a customer support inquiry or complaint here..."
            className="w-full resize-none rounded-2xl border border-line bg-[#FAFBFD] p-4 text-[13px] leading-relaxed text-ink outline-none transition-all placeholder:text-ink-muted/60 hover:bg-white focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
          />
          <div className="mt-2 flex items-center justify-between text-[10px] text-ink-muted">
            <span>Negations such as "not" and "never" are preserved.</span>
            <span className="font-mono">{inputText.length.toLocaleString()} chars</span>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[12px] font-medium text-rose-600">
              <FiAlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleClassify}
            disabled={loading}
            className="btn-primary mt-6 h-12 w-full"
          >
            {loading ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                Running triage pipeline...
              </>
            ) : (
              <>
                <FiSend size={15} />
                Run intelligent triage
                <span className="ml-1 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-[9px] font-medium">
                  Ctrl + Enter
                </span>
              </>
            )}
          </button>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F7F8FC] px-3 py-2.5 text-[10px] leading-relaxed text-ink-muted">
            <FiLock size={12} className="mt-0.5 shrink-0 text-brand-500" />
            Local model inference · explainable priority rules · no external AI calls
          </div>

          <button
            onClick={() => setShowPipeline((current) => !current)}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-line bg-white px-3.5 py-3 text-[11px] font-semibold text-ink-soft transition-colors hover:border-brand-200 hover:text-brand-700"
          >
            <span className="flex items-center gap-2">
              <FiGitBranch size={13} className="text-brand-500" />
              Pipeline trace
            </span>
            <FiChevronDown
              size={14}
              className={`transition-transform ${showPipeline ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showPipeline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1 rounded-xl border border-line bg-[#FBFBFD] p-2.5">
                  {PIPELINE_STEPS.map((step, index) => {
                    const isDone = result !== null || (!loading && index < stage);
                    const isActive = loading && index === stage;
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.label}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                          isActive ? 'bg-brand-50' : ''
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                            isDone
                              ? 'bg-brand-600 text-white'
                              : isActive
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-[#F1F2F8] text-ink-muted/50'
                          }`}
                        >
                          {isDone ? (
                            <FiCheck size={11} />
                          ) : isActive ? (
                            <FiLoader size={11} className="animate-spin" />
                          ) : (
                            <Icon size={11} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-ink">{step.label}</div>
                          <div className="truncate text-[10px] text-ink-muted">{step.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="card card-pad flex min-h-[520px] flex-col lg:col-span-7"
        >
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-line/70 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
                <FiZap size={17} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">Triage result</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  Category confidence and routing rationale
                </div>
              </div>
            </div>
            {result && (
              <button
                onClick={copyResult}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[10px] font-semibold text-ink-muted transition-colors hover:border-brand-200 hover:text-brand-700"
              >
                {copied ? <FiCheck size={12} className="text-mint-600" /> : <FiCopy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col"
              >
                <div className="overflow-hidden rounded-2xl border border-line bg-[#FBFBFD]">
                  <div className="border-b border-line/70 bg-white p-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        Assigned department
                      </span>
                      <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700">
                        {result.confidence > 0
                          ? `${result.confidence_percentage} confidence`
                          : 'No probability output'}
                      </span>
                    </div>
                    <div className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em] text-ink">
                      {result.predicted_category}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold ${
                          isHigh
                            ? 'bg-rose-50 text-rose-600'
                            : isMedium
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-mint-50 text-mint-600'
                        }`}
                      >
                        <FiAlertTriangle size={10} />
                        {result.priority} priority
                      </span>
                      {result.saved && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F1F2F8] px-2.5 py-1 text-[10px] font-medium text-ink-muted">
                          <FiCheckCircle size={10} className="text-mint-600" /> Saved to history
                        </span>
                      )}
                    </div>
                    {result.confidence > 0 && (
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] text-ink-muted">
                          <span>Confidence</span>
                          <span className="font-mono font-semibold text-ink-soft">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F2F8]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, result.confidence * 100)}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                          />
                        </div>
                      </div>
                    )}
                    <p className="mt-3 text-[10px] leading-relaxed text-ink-muted/80">
                      Confidence is the model's probability for this category, not a guarantee of
                      correctness.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-brand-500 p-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink">
                      <FiAlertTriangle size={12} className="text-brand-500" />
                      Priority rationale
                    </div>
                    <p className="text-[12px] leading-relaxed text-ink-soft">
                      {result.priority_reason}
                    </p>
                    <div className="mt-2 text-[10px] text-ink-muted">
                      Matched pattern:{' '}
                      <code className="rounded-md bg-[#F1F2F8] px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                        {result.matched_pattern}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-ink">Manual correction</span>
                      <span className="text-[9px] text-ink-muted">Overrides rules</span>
                    </div>
                    <select
                      value={priority}
                      onChange={(event) => {
                        setPriority(event.target.value);
                        applyPriority(event.target.value);
                      }}
                      disabled={savingPriority}
                      className="input-field cursor-pointer text-[12px]"
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option} priority
                        </option>
                      ))}
                    </select>
                    {savingPriority && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-muted">
                        <FiLoader size={10} className="animate-spin" /> Saving change...
                      </div>
                    )}
                    {priorityNotice && (
                      <div className="mt-2 text-[10px] font-semibold text-brand-600">
                        {priorityNotice}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-line bg-white p-4">
                    <div className="mb-2 text-[11px] font-semibold text-ink">
                      Probability distribution
                    </div>
                    <div className="space-y-2">
                      {Object.entries(result.probabilities)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([category, probability]) => {
                          const percent = Math.round(probability * 100);
                          const isWinner = category === result.predicted_category;
                          return (
                            <div key={category}>
                              <div className="mb-1 flex items-center justify-between gap-2 text-[9.5px]">
                                <span
                                  className={`truncate ${
                                    isWinner ? 'font-semibold text-ink' : 'text-ink-muted'
                                  }`}
                                >
                                  {category}
                                </span>
                                <span className="font-mono font-medium text-ink-soft">
                                  {percent}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F2F8]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percent}%` }}
                                  transition={{ duration: 0.5 }}
                                  className={`h-full rounded-full ${
                                    isWinner ? 'bg-brand-500' : 'bg-[#D6D9E6]'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col items-center justify-center py-16 text-center"
              >
                {loading ? (
                  <div className="w-full max-w-xs space-y-2.5">
                    {PIPELINE_STEPS.map((step, index) => (
                      <div
                        key={step.label}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[11px] ${
                          index <= stage
                            ? 'border-brand-100 bg-brand-50/50 font-medium text-ink'
                            : 'border-line/70 bg-white text-ink-muted'
                        }`}
                      >
                        {index < stage || !loading ? (
                          <FiCheckCircle size={14} className="text-mint-600" />
                        ) : index === stage ? (
                          <FiLoader size={14} className="animate-spin text-brand-500" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-line" />
                        )}
                        {step.label}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-mint-50 text-brand-500">
                      <FiZap size={28} />
                    </span>
                    <p className="font-display text-[16px] font-semibold text-ink">
                      Ready for live analysis
                    </p>
                    <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-ink-muted">
                      Choose a sample or paste a message to see a real category prediction and
                      transparent priority routing.
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {result && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-4 text-[10px] text-ink-muted">
              <span>
                Case record:{' '}
                <b className="font-mono font-semibold text-ink">{result.ticket_id}</b>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-brand-600">
                <FiClock size={11} /> {result.latency_ms.toFixed(1)} ms server latency
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
