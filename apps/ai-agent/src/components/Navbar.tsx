import React, { useEffect, useRef, useState } from 'react';
import { UserPrincipal } from '../types';
import { 
  Compass, 
  Sparkles,
  LogOut,
  MoreHorizontal,
  MessageSquare,
  Layers,
  Clock,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserPrincipal;
  onOpen3DModal: () => void;
  onLogout: () => void;
  pendingApprovalsCount: number;
}

const PRIMARY_TABS = [
  { id: 'overview', label: 'Home' },
  { id: 'properties', label: 'Properties' },
  { id: '3d-showroom', label: '3D' },
  { id: 'leads', label: 'Leads' },
  { id: 'approvals', label: 'Approvals' },
] as const;

const MORE_TABS = [
  { id: 'conversations', label: 'Chat', icon: MessageSquare },
  { id: 'studio', label: 'Studio', icon: Layers },
  { id: 'nurture', label: 'Nurture', icon: Clock },
  { id: 'ops-settings', label: 'Config', icon: Settings },
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpen3DModal,
  onLogout,
  pendingApprovalsCount,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = MORE_TABS.some((t) => t.id === currentTab);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [moreOpen]);

  const selectTab = (id: string) => {
    onSelectTab(id);
    setMoreOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-6">
        
        {/* Brand */}
        <button
          type="button"
          onClick={() => selectTab('overview')}
          className="flex items-center gap-2.5 shrink-0 select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
            PropPilot
          </span>
        </button>

        {/* Primary nav — short labels, no icon row */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0">
          {PRIMARY_TABS.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {tab.label}
                  {tab.id === 'approvals' && pendingApprovalsCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                moreActive || moreOpen
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              More
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {moreOpen && (
              <div
                role="menu"
                className="absolute top-full right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50"
              >
                {MORE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="menuitem"
                      onClick={() => selectTab(tab.id)}
                      className={`w-full px-3.5 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 transition-colors ${
                        active
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-70" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpen3DModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Present</span>
          </button>

          <div className="hidden lg:block text-right pl-2 border-l border-slate-200">
            <p className="text-sm font-bold text-slate-900 leading-tight font-display">
              {currentUser.displayName.split(' ')[0]}
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 inline-flex items-center justify-center transition-colors border border-slate-200"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile / tablet compact bar */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-100 bg-white">
        {[...PRIMARY_TABS, ...MORE_TABS.map(({ id, label }) => ({ id, label }))].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectTab(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600'
            }`}
          >
            {item.label}
            {item.id === 'approvals' && pendingApprovalsCount > 0 ? ` (${pendingApprovalsCount})` : ''}
          </button>
        ))}
      </div>
    </header>
  );
};
