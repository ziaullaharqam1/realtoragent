import React from 'react';
import { Property, Lead, ApprovalDraft } from '../../types';
import { SYSTEM_STATS, DUBAI_PORTALS_METRICS } from '../../data/mockData';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckSquare, 
  Compass, 
  Sparkles, 
  ArrowUpRight, 
  PhoneCall, 
  Send, 
  ShieldCheck, 
  Layers, 
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';

interface DashboardOverviewProps {
  properties: Property[];
  leads: Lead[];
  approvals: ApprovalDraft[];
  onSelectPropertyFor3D: (property: Property) => void;
  onOpen3DModal: () => void;
  onApproveDraft: (approvalId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  properties,
  leads,
  approvals,
  onSelectPropertyFor3D,
  onOpen3DModal,
  onApproveDraft,
  onNavigateTab,
}) => {
  const featuredProp = properties[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Banner & Performance Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 p-6 rounded-2xl border border-blue-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Active Broker Session · All Dubai Portals Live Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-1 tracking-tight">
            Welcome back, Marcus. You have <span className="text-blue-700">4 VIP buyers</span> active right now.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time leads streaming from <strong>Property Finder</strong>, <strong>Bayut</strong>, <strong>Dubizzle</strong>, and <strong>Houza</strong> with automated pgvector property matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('properties')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 shadow-xs transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Manage Properties ({properties.length})</span>
          </button>

          <button
            onClick={onOpen3DModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Launch 3D Customer Pitch</span>
          </button>
        </div>
      </div>

      {/* 4 Commercial Power KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pipeline Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3 font-display">{SYSTEM_STATS.activeDealsVolumeAED}</h3>
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-semibold">
            <span>{SYSTEM_STATS.activeDealsVolumeUSD} USD</span>
            <span className="text-slate-400 font-normal">· 4 Escrow Drafts</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl glass-panel-brand border border-blue-300 transition-all">
          <div className="flex items-center justify-between text-blue-900 text-xs font-bold uppercase tracking-wider">
            <span>Projected Broker Commission</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-700 border border-blue-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-blue-900 mt-3 font-display">{SYSTEM_STATS.projectedCommissionAED}</h3>
          <p className="text-xs text-blue-800 flex items-center gap-1 mt-1 font-medium">
            <span className="font-bold">{SYSTEM_STATS.projectedCommissionUSD} USD</span>
            <span className="text-slate-600">· 2.0% standard broker fee</span>
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Dubai Portals Feed</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3 font-display">{leads.length} Ingested</h3>
          <p className="text-xs text-blue-700 flex items-center gap-1 mt-1 font-semibold">
            <span>PropertyFinder, Bayut, Dubizzle</span>
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Shadow Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3 font-display">{approvals.length} Pending</h3>
          <p className="text-xs text-indigo-800 flex items-center gap-1 mt-1 font-semibold">
            <span>1-Click Signoff</span>
            <span className="text-slate-400 font-normal">· Zero Hallucinations</span>
          </p>
        </div>

      </div>

      {/* Main Center Stage: 3D Showcase Hero Card */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/20 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>3D Virtual Customer Showroom Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display leading-tight">
              Present <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-900">{featuredProp.title}</span> in Real-Time 3D
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Showcase full dollhouse architectural cutaways, switch finishes live with the client (Calacatta Marble vs French Oak), simulate sunset & daylight solar angles, and send private VIP access links.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                📍 {featuredProp.location}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                📐 {featuredProp.sqft.toLocaleString()} sq.ft
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                💰 {featuredProp.rentalYield}% Net Yield
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectPropertyFor3D(featuredProp);
                  onNavigateTab('3d-showroom');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Enter 3D Interactive Showroom</span>
              </button>

              <button
                onClick={onOpen3DModal}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-2 border border-slate-300 transition-all shadow-xs"
              >
                <span>Input Client Briefing</span>
              </button>
            </div>
          </div>

          {/* Mini Interactive Preview Thumbnail */}
          <div 
            onClick={() => {
              onSelectPropertyFor3D(featuredProp);
              onNavigateTab('3d-showroom');
            }}
            className="w-full lg:w-96 h-56 rounded-xl overflow-hidden relative cursor-pointer group border border-slate-300 shadow-md"
          >
            <img 
              src={featuredProp.coverImage} 
              alt={featuredProp.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Click to Open 3D Viewport</span>
              <h4 className="text-sm font-bold text-white font-display">{featuredProp.title}</h4>
              <p className="text-xs text-slate-200 font-medium">AED {(featuredProp.priceAED / 1000000).toFixed(1)}M (${(featuredProp.priceUSD / 1000000).toFixed(1)}M)</p>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-blue-400 flex items-center justify-center text-blue-700 shadow-md">
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Pending Approvals & Qualified Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Pending Shadow Approvals */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                Broker Shadow Approvals ({approvals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('approvals')}
              className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {approvals.slice(0, 2).map((appr) => (
              <div key={appr.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-display">{appr.leadName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      {appr.channel}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{appr.createdAt}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white text-xs text-slate-700 italic border border-slate-200">
                  "{appr.incomingQuery}"
                </div>

                <div className="text-xs text-slate-800 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
                  <span className="font-bold text-blue-900 text-[10px] uppercase block mb-1">AI Drafted Reply ({appr.confidenceScore}% Confidence):</span>
                  {appr.aiSuggestedReply}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onApproveDraft(appr.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Send via {appr.channel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: High-Intent Leads Qualified via pgvector */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                Multi-Portal Dubai Leads ({leads.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <span>All Portals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 3).map((lead) => (
              <div key={lead.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {lead.source}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Budget: <strong className="text-blue-700">{lead.budgetAED}</strong> · {lead.preferredArea}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    Matched to {lead.matchedProperty} ({(lead.vectorSimilarity * 100).toFixed(1)}% match)
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                    Score: {lead.intentScore}
                  </span>
                  <button
                    onClick={() => {
                      const prop = properties.find((p) => p.title.toLowerCase().includes(lead.matchedProperty.toLowerCase())) || properties[0];
                      onSelectPropertyFor3D(prop);
                      onOpen3DModal();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-xs font-bold text-blue-700 flex items-center gap-1 border border-blue-300 shadow-2xs"
                  >
                    <Compass className="w-3 h-3 text-blue-600" />
                    <span>3D Pitch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
