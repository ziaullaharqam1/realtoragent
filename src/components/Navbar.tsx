import React from 'react';
import { UserPrincipal } from '../types';
import { 
  Building, 
  Compass, 
  Users, 
  CheckSquare, 
  MessageSquare, 
  Layers, 
  Clock, 
  Settings, 
  Sparkles,
  LogOut,
  ChevronDown,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserPrincipal;
  onOpen3DModal: () => void;
  onLogout: () => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpen3DModal,
  onLogout,
  pendingApprovalsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Market Ticker */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onSelectTab('overview')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">PropPilot</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  DUBAI PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block -mt-1 font-medium">
                Dubai Portals & 3D Luxury Sales Command Center
              </p>
            </div>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Command Center
            </button>

            <button
              onClick={() => onSelectTab('properties')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'properties'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Manage Properties</span>
            </button>

            <button
              onClick={() => onSelectTab('3d-showroom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === '3d-showroom'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>3D Showroom</span>
            </button>

            <button
              onClick={() => onSelectTab('leads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'leads'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dubai Leads</span>
            </button>

            <button
              onClick={() => onSelectTab('approvals')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'approvals'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('conversations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'conversations'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => onSelectTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'studio'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Studio (Canva/Gamma)</span>
            </button>

            <button
              onClick={() => onSelectTab('nurture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'nurture'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Nurture</span>
            </button>

            <button
              onClick={() => onSelectTab('ops-settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'ops-settings'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Portals & Config</span>
            </button>
          </nav>
        </div>

        {/* Right CTA & Broker Profile */}
        <div className="flex items-center gap-3">
          
          {/* Highlighted 3D Pitch Launch Button in Royal Cobalt Blue */}
          <button
            onClick={onOpen3DModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Present in 3D</span>
            <span className="sm:hidden">3D Tour</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight font-display">{currentUser.displayName}</p>
              <p className="text-[10px] text-blue-700 font-semibold">{currentUser.role}</p>
            </div>
            
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all border border-slate-200"
              title="Sign Out / Switch Demo Persona"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-200 bg-white">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'properties', label: 'Properties' },
          { id: '3d-showroom', label: '3D Tour' },
          { id: 'leads', label: 'Dubai Leads' },
          { id: 'approvals', label: 'Approvals' },
          { id: 'conversations', label: 'Chat' },
          { id: 'studio', label: 'Studio (Canva/Gamma)' },
          { id: 'nurture', label: 'Nurture' },
          { id: 'ops-settings', label: 'Portals' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === item.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
