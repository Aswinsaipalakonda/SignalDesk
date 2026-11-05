import React from 'react';
import { LayoutDashboard, Sparkles, Layers, BarChart3, Database, ShieldCheck, Activity } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Ticket', icon: Sparkles, badge: 'Live ML' },
    { id: 'explorer', label: 'Ticket Explorer', icon: Layers },
    { id: 'performance', label: 'Model Performance', icon: BarChart3, badge: 'Metrics' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#EAEFEA] flex flex-col justify-between h-screen sticky top-0 px-4 py-6 shadow-[2px_0_12px_rgba(0,0,0,0.015)] z-20">
      <div>
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => onPageChange('overview')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0E5E44] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-[#1A202C] tracking-tight">SignalDesk</span>
              <span className="text-[10px] font-bold bg-[#EBF5F0] text-[#0E5E44] px-1.5 py-0.5 rounded-md">v2.0</span>
            </div>
            <div className="text-[11px] font-medium text-[#64748B]">Ticket Intelligence</div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EBF5F0] text-[#0E5E44] shadow-xs'
                    : 'text-[#64748B] hover:bg-[#F8FAF8] hover:text-[#1A202C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className={isActive ? 'text-[#0E5E44]' : 'text-[#64748B]'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-[#0E5E44] text-white'
                        : 'bg-[#F1F5F2] text-[#64748B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sleek Infrastructure & Engine Status Card (Replaces broken placeholder) */}
      <div className="bg-[#F8FAF8] border border-[#E8EFE9] rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A202C]">
            <Activity size={14} className="text-[#0E5E44]" />
            <span>ML Engine Active</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-[#64748B]">
          <div className="flex items-center justify-between">
            <span>Model:</span>
            <span className="font-semibold text-[#1A202C]">Scikit Logistic Reg.</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Database:</span>
            <span className="font-semibold text-[#0E5E44] flex items-center gap-1">
              <Database size={11} /> Neon Cloud
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Avg Latency:</span>
            <span className="font-mono font-semibold text-[#1A202C]">~18 ms</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#E8EFE9] flex items-center justify-between text-[10px]">
          <span className="text-[#64748B]">Security & Isolation</span>
          <span className="font-bold text-emerald-700 flex items-center gap-0.5">
            <ShieldCheck size={12} /> SOC2 Compliant
          </span>
        </div>
      </div>
    </aside>
  );
};
