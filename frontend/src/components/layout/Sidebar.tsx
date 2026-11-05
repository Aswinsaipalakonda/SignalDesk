import React from 'react';
import { LayoutDashboard, Sparkles, Layers, BarChart3, Info } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Ticket', icon: Sparkles },
    { id: 'explorer', label: 'Ticket Explorer', icon: Layers },
    { id: 'performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border-subtle flex flex-col justify-between h-screen sticky top-0 px-4 py-6 shadow-sm z-20">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <img src="/assets/logo_icon.png" alt="SignalDesk Logo" className="w-9 h-9 rounded-lg object-contain" />
          <span className="text-xl font-extrabold text-text-main tracking-tight">SignalDesk</span>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-green-light text-brand-green shadow-xs'
                    : 'text-text-muted hover:bg-surface-subtle hover:text-text-main'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={isActive ? 'text-brand-green' : 'text-text-muted'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Illustration Card */}
      <div className="bg-surface-warm border border-border-subtle rounded-2xl p-3.5 text-center">
        <img
          src="/assets/sidebar_support.png"
          alt="AI Support Desk"
          className="w-full h-24 object-cover rounded-xl mb-2.5"
        />
        <div className="text-xs font-bold text-text-main leading-tight">
          AI-Powered Support Ticket Intelligence
        </div>
        <div className="text-[11px] text-brand-green font-semibold mt-1 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
          Model Active (v2.0)
        </div>
      </div>
    </aside>
  );
};
