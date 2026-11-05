import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  BarChart3,
  Settings,
  Users,
  HelpCircle,
  LogOut,
  ChevronsUpDown,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const mainNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Ticket', icon: Sparkles, count: 4 },
    { id: 'explorer', label: 'Ticket Explorer', icon: Layers, count: 12 },
    { id: 'performance', label: 'Model Performance', icon: BarChart3 },
  ];

  const othersNav = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'team', label: 'Team Members', icon: Users, count: 3 },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'logout', label: 'Sign Out', icon: LogOut },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E8EFE9] flex flex-col justify-between h-screen sticky top-0 px-4 py-5 shadow-xs z-20 select-none">
      <div className="space-y-6">
        {/* Workspace Brand Switcher using assets/logo.png */}
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#F4F8F5] transition-colors cursor-pointer border border-transparent hover:border-[#DCE8DF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAFBF9] border border-[#E2EBE4] flex items-center justify-center p-1.5 shadow-xs">
              <img src="/assets/logo.png" alt="SignalDesk Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-[#003437] tracking-tight">SignalDesk</span>
                <span className="text-[10px] font-bold bg-[#E6F4EF] text-[#019077] px-1.5 py-0.2 rounded-md">Pro</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400">AI Ticket Intelligence</div>
            </div>
          </div>
          <ChevronsUpDown size={15} className="text-slate-400" />
        </div>

        {/* Menu Navigation */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Menu
          </div>
          <nav className="space-y-1.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#003437] text-white shadow-md shadow-[#003437]/20'
                      : 'text-slate-600 hover:bg-[#F4F8F5] hover:text-[#003437]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.75} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E6F4EF] text-[#019077]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Others Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Others
          </div>
          <nav className="space-y-1">
            {othersNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-[#F4F8F5] hover:text-[#003437] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} strokeWidth={1.75} className="text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Status Card (matching original design) */}
      <div className="space-y-3 pt-4 border-t border-[#E8EFE9]">
        <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2EBE4] space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#019077]"></span>
            </span>
            <span className="text-[11px] font-bold text-[#003437]">Triage Engine Active</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Classifying inquiries with sub-20ms latency and zero data leakage.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white hover:bg-[#F4F8F5] transition-colors cursor-pointer border border-[#E8EFE9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#003437] text-white flex items-center justify-center font-bold text-xs">
              SD
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#003437] truncate">Support Lead</div>
              <div className="text-[10px] text-slate-400 truncate">lead@signaldesk.io</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
