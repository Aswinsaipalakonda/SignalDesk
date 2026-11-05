import React from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiGrid,
  FiInfo,
  FiInbox,
  FiPlus,
  FiSettings,
  FiX,
  FiZap,
} from 'react-icons/fi';
import { HealthStatus } from '../../types';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  open: boolean;
  onClose: () => void;
  health: HealthStatus | null;
}

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: FiGrid },
      { id: 'analyze', label: 'Analyze ticket', icon: FiZap },
      { id: 'explorer', label: 'Ticket explorer', icon: FiInbox },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'performance', label: 'Model performance', icon: FiBarChart2 },
      { id: 'about', label: 'About SignalDesk', icon: FiInfo },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  open,
  onClose,
  health,
}) => {
  const navigate = (page: string) => {
    onPageChange(page);
    onClose();
  };

  const healthy = health?.status === 'healthy';

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#003437]/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[276px] shrink-0 flex-col overflow-hidden border-r border-line bg-[#FEFDFC] text-ink transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex h-full flex-col px-4 pb-4 pt-5">
          <div className="mb-6 flex items-center justify-between px-1">
            <button
              onClick={() => navigate('overview')}
              className="rounded-xl text-left transition-opacity hover:opacity-85"
              aria-label="SignalDesk overview"
            >
              <img
                src="/signaldesk-logo.png"
                alt="SignalDesk — AI-Powered Support Ticket Intelligence"
                className="h-auto w-[212px] select-none"
                draggable={false}
              />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-brand-50 hover:text-brand-700 lg:hidden"
              aria-label="Close menu"
            >
              <FiX size={17} />
            </button>
          </div>

          <button className="mb-7 flex w-full items-center gap-3 rounded-2xl border border-line bg-[#F6F8F2] p-3 text-left transition-all hover:border-brand-200 hover:bg-[#F2F7EF]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003437] text-[11px] font-bold text-white">
              SD
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-ink">
                Support Operations
              </span>
              <span className="mt-0.5 block text-[10px] text-ink-muted">
                Enterprise workspace
              </span>
            </span>
            <FiChevronDown size={14} className="text-ink-muted/50" />
          </button>

          <nav className="flex-1 space-y-6 overflow-y-auto pr-0.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted/55">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`group relative flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'text-brand-800'
                            : 'text-ink-soft hover:bg-[#F4F7F1] hover:text-ink'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl border border-brand-100 bg-brand-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        {isActive && (
                          <span className="absolute -left-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-500" />
                        )}
                        <Icon
                          size={17}
                          className={`relative z-10 ${
                            isActive
                              ? 'text-brand-600'
                              : 'text-ink-muted/55 group-hover:text-brand-600'
                          }`}
                        />
                        <span className="relative z-10">{item.label}</span>
                        {isActive && (
                          <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-5 space-y-3">
            <div className="relative overflow-hidden rounded-2xl bg-[#003437] p-3.5 text-white">
              <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand-400/25 blur-2xl" />
              <div className="relative">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                    <FiZap size={12} className="text-brand-300" />
                    Workspace ready
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-white/60">
                    Local
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-[0.08em] text-white/40">
                      Indexed tickets
                    </div>
                    <div className="mt-0.5 font-mono text-[15px] font-semibold text-white/90">
                      {health?.trained_on ? health.trained_on.toLocaleString() : '—'}
                    </div>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-400/15 text-brand-300">
                    <FiCheckCircle size={13} />
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-semibold text-ink-soft">
                  <span className="relative flex h-2 w-2">
                    {healthy && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        health ? (healthy ? 'bg-brand-500' : 'bg-amber-500') : 'bg-ink-muted/30'
                      }`}
                    />
                  </span>
                  {health ? (healthy ? 'All systems normal' : 'Degraded mode') : 'Connecting...'}
                </span>
                <FiActivity size={13} className="text-ink-muted/40" />
              </div>
              <div className="mt-2.5 space-y-1.5 text-[10px] text-ink-muted">
                <div className="flex items-center justify-between gap-2">
                  <span>Model</span>
                  <span className="max-w-[120px] truncate font-medium text-ink-soft">
                    {health?.model_algorithm || 'Loading'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Database</span>
                  <span className="flex items-center gap-1 font-medium text-ink-soft">
                    {health?.database === 'connected' && (
                      <FiCheckCircle size={10} className="text-brand-500" />
                    )}
                    {health?.database || 'checking'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-line/70 px-1.5 pt-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-[11px] font-bold text-white">
                  SL
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-ink">
                    Support Lead
                  </span>
                  <span className="block truncate text-[10px] text-ink-muted">Administrator</span>
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted/60 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  aria-label="Add member"
                >
                  <FiPlus size={14} />
                </button>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted/60 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  aria-label="Settings"
                >
                  <FiSettings size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
