import React from 'react';
import {
  Compass,
  FileText,
  Lightbulb,
  Sparkles,
  Share2,
  Calendar,
  Activity,
  Sliders,
  FileSpreadsheet,
  Flame,
  X,
  Sun,
  Moon,
  Film,
} from 'lucide-react';

export type WorkspaceTab =
  | 'overview'
  | 'brief'
  | 'opportunities'
  | 'trends'
  | 'video_intelligence'
  | 'draft_studio'
  | 'distribution'
  | 'calendar'
  | 'performance'
  | 'sheets'
  | 'settings';

interface SidebarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  businessName: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  businessName,
  isOpenMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'overview' as WorkspaceTab, label: 'Overview', icon: Compass },
    { id: 'brief' as WorkspaceTab, label: 'Brief', icon: FileText },
    { id: 'opportunities' as WorkspaceTab, label: 'Opportunities', icon: Lightbulb },
    { id: 'trends' as WorkspaceTab, label: 'Trends', icon: Flame },
    { id: 'video_intelligence' as WorkspaceTab, label: 'Video Intelligence', icon: Film },
    { id: 'draft_studio' as WorkspaceTab, label: 'Draft Studio', icon: Sparkles },
    { id: 'distribution' as WorkspaceTab, label: 'Distribution', icon: Share2 },
    { id: 'calendar' as WorkspaceTab, label: 'Calendar', icon: Calendar },
    { id: 'performance' as WorkspaceTab, label: 'Performance', icon: Activity },
    { id: 'sheets' as WorkspaceTab, label: 'Sheets', icon: FileSpreadsheet },
    { id: 'settings' as WorkspaceTab, label: 'Settings', icon: Sliders },
  ];

  const handleSelect = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-[#172822] text-[#9EB2A9] flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-[#223930] lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand */}
          <div className="p-5 pb-4 flex items-center justify-between border-b border-[#223930]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#E2A968] text-[#172822] flex items-center justify-center font-serif font-bold text-sm shadow-xs shrink-0">
                A
              </div>
              <span className="text-white font-serif font-medium text-base tracking-tight">
                ApexGrowth
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-[#8BA096] hover:text-white p-1"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Minimal Workspace Info */}
          <div className="px-4 pt-4 pb-2">
            <div className="px-3 py-2.5 rounded-lg bg-[#111F1A] border border-[#20362E]">
              <div className="text-[10px] font-mono tracking-wider text-[#DFA058] uppercase">
                Workspace
              </div>
              <div className="text-xs font-medium text-white mt-0.5 truncate">
                {businessName || 'Morrow & Moss'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-2 flex-1">
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#E2A968] text-[#14231E] font-semibold'
                        : 'text-[#9EB2A9] hover:text-white hover:bg-[#1F352C]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[1.8] ${
                        isActive ? 'text-[#14231E]' : 'text-[#82978D]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer & Quick Theme Switch */}
        <div className="p-3.5 border-t border-[#223930] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#6A8075]">
            Editorial Desk
          </div>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111F1A] hover:bg-[#1C2C25] text-[#9EB2A9] hover:text-[#E2A968] border border-[#20362E] text-[11px] font-mono cursor-pointer transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-[#E2A968]" />
                <span className="text-[#D0DDD7]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-[#9EB2A9]" />
                <span className="text-[#9EB2A9]">Dark</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
