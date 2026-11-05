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
  currentPageTitle,
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
    <header className="flex items-center justify-between py-4 px-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      {/* Auto Search Bar (matching reference design) */}
      <div className="relative flex-1 max-w-md" ref={dropdownRef}>
        <div className="flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl px-3.5 py-2.5 transition-all">
          <Search size={16} className="text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            placeholder="Search tickets, issues, IDs..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setResults([]); }} className="text-slate-400 hover:text-slate-600 mr-2">
              <X size={14} />
            </button>
          )}
          <span className="text-[10px] font-mono font-bold bg-white text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs mr-2 shrink-0">
            ⌘K
          </span>
          <button className="text-slate-400 hover:text-slate-700 shrink-0" title="Search Filters">
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Live Auto-Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
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
                className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="truncate max-w-[300px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono font-bold text-slate-900 text-[11px]">{t.id}</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded">
                      {t.predicted_category}
                    </span>
                  </div>
                  <div className="text-slate-600 truncate text-[11px]">{t.ticket_text}</div>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls (matching reference design) */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60">
          <button className="w-6 h-6 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-xs">
            <Sun size={13} />
          </button>
          <button className="w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 flex items-center justify-center">
            <Moon size={13} />
          </button>
        </div>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Team Avatars Stack (matching reference design) */}
        <div className="flex items-center -space-x-2">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Team" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" />
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Team" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" />
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Team" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" />
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shadow-2xs">
            +6
          </div>
        </div>

        {/* Dark Primary Action Button (matching reference "+ Invite") */}
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-slate-900/10 hover:shadow-lg active:scale-95"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Ticket</span>
        </button>
      </div>
    </header>
  );
};
