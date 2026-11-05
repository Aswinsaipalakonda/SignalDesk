import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Sun, Moon, Bell, Plus, X, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { Ticket } from '../../types';

interface TopbarProps {
  onNewTicketClick?: () => void;
  onSelectTicket?: (ticket: Ticket) => void;
  currentPageTitle?: string;
  onNavigateAnalyze?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onNewTicketClick,
  onSelectTicket,
  currentPageTitle = 'Overview',
  onNavigateAnalyze,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Ticket[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAction = onNewTicketClick || onNavigateAnalyze || (() => {});

  // Auto-search debounce effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getTickets(1, 6, undefined, undefined, searchQuery);
        setResults(res.items || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between py-4 px-8 border-b border-[#E8EFE9] bg-white/80 backdrop-blur-md sticky top-0 z-30">
      {/* Auto Search Bar */}
      <div className="relative flex-1 max-w-md" ref={dropdownRef}>
        <div className="flex items-center bg-[#F7FAF8] hover:bg-[#F0F5F2] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#019077]/20 border border-[#E2EBE4] rounded-2xl px-3.5 py-2.5 transition-all">
          <Search size={16} className="text-[#019077] shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            placeholder="Search customer inquiries, departments, tickets..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setResults([]); }} className="text-slate-400 hover:text-slate-600 mr-2">
              <X size={14} />
            </button>
          )}
          <span className="text-[10px] font-mono font-bold bg-white text-slate-500 border border-[#E2EBE4] px-1.5 py-0.5 rounded-md shadow-2xs mr-2 shrink-0">
            ⌘K
          </span>
          <button className="text-slate-400 hover:text-[#003437] shrink-0" title="Search Filters">
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Live Auto-Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E2EBE4] rounded-2xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
            <div className="text-[10px] font-bold text-[#019077] uppercase tracking-wider px-3 py-1.5">
              {isSearching ? 'Searching...' : `Found ${results.length} Matching Inquiries`}
            </div>
            {results.length === 0 && !isSearching && (
              <div className="text-xs text-slate-500 px-3 py-3 text-center">
                No tickets match "{searchQuery}"
              </div>
            )}
            {results.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  if (onSelectTicket) onSelectTicket(t);
                  setShowDropdown(false);
                }}
                className="p-2.5 hover:bg-[#F7FAF8] rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="truncate max-w-[300px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono font-bold text-[#003437] text-[11px]">{t.id}</span>
                    <span className="text-[10px] font-bold bg-[#E6F4EF] text-[#019077] px-1.5 py-0.2 rounded">
                      {t.predicted_category}
                    </span>
                  </div>
                  <div className="text-slate-600 truncate text-[11px]">{t.ticket_text}</div>
                </div>
                <ArrowUpRight size={14} className="text-[#019077] shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-bold text-[#003437]">{currentPageTitle}</span>
        </div>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-full bg-white border border-[#E2EBE4] flex items-center justify-center text-slate-600 hover:text-[#003437] shadow-2xs transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#019077] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Pill Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E8EFE9]">
          <div className="w-8 h-8 rounded-full bg-[#003437] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SD
          </div>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">Support Lead</span>
        </div>

        {/* Primary Action Button using assets/logo.png botanical green */}
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 bg-[#003437] hover:bg-[#014d4e] text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-[#003437]/15 hover:shadow-lg active:scale-95"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Analyze a Ticket</span>
        </button>
      </div>
    </header>
  );
};
