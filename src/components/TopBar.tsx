import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { WorkspaceTab } from './Sidebar';

interface TopBarProps {
  activeTab: WorkspaceTab;
  onOpenMobile: () => void;
  creatorInitial?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const TAB_TITLES: Record<WorkspaceTab, string> = {
  overview: 'Overview',
  brief: 'Brief',
  opportunities: 'Opportunities',
  trends: 'Trends',
  draft_studio: 'Draft Studio',
  distribution: 'Distribution',
  calendar: 'Calendar',
  performance: 'Performance',
  sheets: 'Sheets',
  settings: 'Settings',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobile,
  creatorInitial,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="h-14 px-4 sm:px-8 border-b border-[#E8E2D6] dark:border-[#22352E] flex items-center justify-between bg-[#F7F4EE]/90 dark:bg-[#0E1714]/90 backdrop-blur-xs sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 text-[#54645E] dark:text-[#9FB1A9] hover:text-[#182521] dark:hover:text-white rounded-lg hover:bg-[#ECE5DA] dark:hover:bg-[#192722] cursor-pointer transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Minimal breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono tracking-wider">
          <span className="text-[#8B9892] dark:text-[#7A8E85] uppercase font-semibold">Apex</span>
          <span className="text-[#CAD1CD] dark:text-[#31483E]">/</span>
          <span className="text-[#1A2521] dark:text-[#E8ECE9] font-medium">{TAB_TITLES[activeTab]}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs ${
            isDark
              ? 'bg-[#16231E] hover:bg-[#1E2F29] border-[#2A3E36] text-[#E2A968]'
              : 'bg-white hover:bg-[#FAF8F4] border-[#E8E2D6] text-[#54645E] hover:text-[#1A2521]'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#E2A968] animate-in spin-in-180 duration-300" />
              <span className="text-[11px] font-mono tracking-wide text-[#E8ECE9]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#54645E] animate-in spin-in-180 duration-300" />
              <span className="text-[11px] font-mono tracking-wide text-[#54645E]">Dark</span>
            </>
          )}
        </button>

        {/* Creator Initial avatar */}
        {creatorInitial && (
          <div className="w-7 h-7 rounded-full bg-[#172822] dark:bg-[#E2A968] text-white dark:text-[#172822] flex items-center justify-center font-serif text-xs font-bold shadow-2xs">
            {creatorInitial}
          </div>
        )}
      </div>
    </header>
  );
};

