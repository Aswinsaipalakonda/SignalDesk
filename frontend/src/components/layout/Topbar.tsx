import React from 'react';
import { Bell } from 'lucide-react';

interface TopbarProps {
  currentPageTitle: string;
}

export const Topbar: React.FC<TopbarProps> = ({ currentPageTitle }) => {
  return (
    <header className="flex items-center justify-between py-3.5 px-8 border-b border-border-subtle bg-surface-warm/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center text-sm font-medium">
        <span className="text-text-muted">Workspace</span>
        <span className="text-border-subtle mx-2">/</span>
        <span className="text-brand-green font-bold capitalize">{currentPageTitle}</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <div className="relative cursor-pointer text-text-muted hover:text-text-main transition-colors" title="3 Unresolved Alerts">
          <Bell size={19} strokeWidth={1.75} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-priority-high rounded-full border-2 border-white"></span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 bg-white border border-border-subtle pl-1 pr-3 py-1 rounded-full shadow-xs">
          <div className="w-7 h-7 rounded-full bg-brand-green text-white font-bold text-xs flex items-center justify-center">
            SD
          </div>
          <span className="text-xs font-semibold text-text-main">Support Lead</span>
        </div>
      </div>
    </header>
  );
};
