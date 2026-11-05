import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowUpRight,
  FiBell,
  FiCheckCircle,
  FiChevronRight,
  FiLoader,
  FiMenu,
  FiPlus,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { api } from '../../services/api';
import { Ticket } from '../../types';
import { formatRelativeTime, truncate } from '../../lib/format';

interface TopbarProps {
  currentPageTitle: string;
  onMenuClick: () => void;
  onNavigateAnalyze: () => void;
  onSelectTicket: (ticket: Ticket) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPageTitle,
  onMenuClick,
  onNavigateAnalyze,
  onSelectTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Ticket[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [highPriority, setHighPriority] = useState<Ticket[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await api.getTickets(1, 6, undefined, undefined, searchQuery);
        setResults(response.items || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setShowDropdown(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const openNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (!nextOpen || highPriority.length > 0) return;
    setNotificationsLoading(true);
    try {
      const response = await api.getTickets(1, 5, undefined, 'High');
      setHighPriority(response.items || []);
    } catch {
      setHighPriority([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 md:gap-5 md:px-7 xl:px-10">
        <button
          onClick={onMenuClick}
          className="icon-btn lg:hidden"
          aria-label="Open navigation"
        >
          <FiMenu size={18} />
        </button>

        <div className="hidden min-w-0 items-center gap-2 whitespace-nowrap text-[12px] md:flex">
          <span className="font-medium text-ink-muted">Workspace</span>
          <FiChevronRight size={13} className="text-ink-muted/40" />
          <span className="font-semibold text-ink">{currentPageTitle}</span>
        </div>

        <div ref={searchRef} className="relative ml-auto w-full max-w-[480px] flex-1 md:ml-2">
          <div className="flex h-10 items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 shadow-sm transition-all focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10">
            <FiSearch size={16} className="shrink-0 text-ink-muted/70" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowDropdown(true);
              }}
              placeholder="Search tickets, IDs, or categories"
              className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted/60 focus:outline-none"
            />
            {isSearching && <FiLoader size={14} className="animate-spin text-brand-500" />}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setResults([]);
                  setShowDropdown(false);
                }}
                className="text-ink-muted/60 transition-colors hover:text-ink"
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
            <kbd className="hidden shrink-0 rounded-md border border-line bg-[#F9FAFC] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-ink-muted/70 sm:block">
              Ctrl K
            </kbd>
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-float"
              >
                <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                  <span>{isSearching ? 'Searching...' : 'Matching tickets'}</span>
                  <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-brand-600">
                    {results.length}
                  </span>
                </div>
                {!isSearching && results.length === 0 && (
                  <div className="px-3 py-8 text-center text-[12px] text-ink-muted">
                    No tickets found for "{searchQuery}"
                  </div>
                )}
                {results.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      onSelectTicket(ticket);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition-colors hover:bg-brand-50/60"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-brand-600">
                          {ticket.id}
                        </span>
                        <span className="rounded-md bg-[#F3F4F8] px-1.5 py-0.5 text-[9px] font-semibold text-ink-muted">
                          {ticket.predicted_category}
                        </span>
                      </div>
                      <div className="truncate text-[12px] text-ink-soft">
                        {truncate(ticket.ticket_text, 92)}
                      </div>
                    </div>
                    <FiArrowUpRight
                      size={15}
                      className="shrink-0 text-ink-muted/40 transition-colors group-hover:text-brand-600"
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 md:gap-2.5">
          <div ref={notificationsRef} className="relative">
            <button
              onClick={openNotifications}
              className="icon-btn relative"
              aria-label="High priority notifications"
            >
              <FiBell size={16} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-2xl border border-line bg-white shadow-float sm:w-[360px]"
                >
                  <div className="flex items-center justify-between border-b border-line/80 px-4 py-3.5">
                    <div>
                      <div className="text-[13px] font-semibold text-ink">High priority queue</div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">
                        Latest rule-based escalations
                      </div>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <FiCheckCircle size={15} />
                    </span>
                  </div>
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-10 text-[12px] text-ink-muted">
                      <FiLoader size={14} className="animate-spin" /> Loading queue...
                    </div>
                  ) : highPriority.length === 0 ? (
                    <div className="px-4 py-10 text-center text-[12px] text-ink-muted">
                      No high priority tickets in history.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto p-2">
                      {highPriority.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => {
                            onSelectTicket(ticket);
                            setNotificationsOpen(false);
                          }}
                          className="w-full rounded-xl p-3 text-left transition-colors hover:bg-[#F9FAFC]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] font-semibold text-rose-600">
                              {ticket.id}
                            </span>
                            <span className="text-[10px] text-ink-muted">
                              {formatRelativeTime(ticket.created_at)}
                            </span>
                          </div>
                          <div className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
                            {ticket.ticket_text}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onNavigateAnalyze} className="btn-primary hidden sm:inline-flex">
            <FiPlus size={16} />
            New analysis
          </button>
          <button
            onClick={onNavigateAnalyze}
            className="icon-btn border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700 hover:text-white sm:hidden"
            aria-label="New analysis"
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
