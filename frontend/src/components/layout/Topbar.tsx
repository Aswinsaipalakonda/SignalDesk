import React from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';

interface TopbarProps {
  currentPageTitle: string;
  onNavigateAnalyze?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentPageTitle, onNavigateAnalyze }) => {
  return (
    <header className="flex items-center justify-between py-3.5 px-8 border-b border-[#EAEFEA] bg-[#F8FAF8]/90 backdrop-blur-md sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm font-medium">
        <span className="text-[#64748B]">Workspace</span>
        <span className="text-[#CBD5E1] mx-2.5">/</span>
        <span className="text-[#0E5E44] font-bold capitalize">{currentPageTitle}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Triage CTA */}
        {onNavigateAnalyze && (
          <button
            onClick={onNavigateAnalyze}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF5F0] hover:bg-emerald-100/60 text-[#0E5E44] text-xs font-bold transition-all border border-[#D5EADB]"
          >
            <Sparkles size={13} />
            <span>Quick Triage</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative cursor-pointer text-[#64748B] hover:text-[#1A202C] transition-colors p-1" title="Real-Time System Alerts">
          <Bell size={18} strokeWidth={1.75} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white"></span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 bg-white border border-[#EAEFEA] pl-1 pr-3 py-1 rounded-full shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0E5E44] to-[#14B8A6] text-white font-extrabold text-[10px] flex items-center justify-center">
            SD
          </div>
          <span className="text-xs font-semibold text-[#1A202C]">Support Lead</span>
        </div>
      </div>
    </header>
  );
};
