import React from 'react';
import { Property, Lead, ApprovalDraft } from '../../types';
import { SYSTEM_STATS } from '../../data/mockData';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckSquare, 
  Compass, 
  Sparkles, 
  ArrowUpRight, 
  Building2,
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
    <div className="space-y-10 pb-16">
      
      {/* Top Welcome Banner & Performance Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 px-8 py-8 sm:px-10 sm:py-10 rounded-3xl border border-blue-200/80 shadow-xs">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Active Broker Session · All Dubai Portals Live Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-snug">
            Welcome back, Marcus. You have <span className="text-blue-700">4 VIP buyers</span> active right now.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Real-time leads streaming from <strong>Property Finder</strong>, <strong>Bayut</strong>, <strong>Dubizzle</strong>, and <strong>Houza</strong> with automated pgvector property matching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('properties')}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center gap-2.5 border border-slate-300 shadow-xs transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Manage Properties ({properties.length})</span>
          </button>

          <button
            onClick={onOpen3DModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-md shadow-blue-500/25 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Launch 3D Customer Pitch</span>
          </button>
        </div>
      </div>

      {/* 4 Commercial Power KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
        
        {/* KPI 1 */}
        <div className="px-7 py-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all min-h-[168px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pipeline Volume</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">{SYSTEM_STATS.activeDealsVolumeAED}</h3>
            <p className="text-sm text-emerald-600 flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
              <span>{SYSTEM_STATS.activeDealsVolumeUSD} USD</span>
              <span className="text-slate-400 font-normal">· 4 Escrow Drafts</span>
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="px-7 py-7 rounded-3xl glass-panel-brand border border-blue-300 transition-all min-h-[168px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-900 text-xs font-bold uppercase tracking-wider">
            <span>Projected Broker Commission</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-700 border border-blue-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-3xl font-extrabold text-blue-900 font-display tracking-tight">{SYSTEM_STATS.projectedCommissionAED}</h3>
            <p className="text-sm text-blue-800 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
              <span className="font-bold">{SYSTEM_STATS.projectedCommissionUSD} USD</span>
              <span className="text-slate-600">· 2.0% standard broker fee</span>
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="px-7 py-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all min-h-[168px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Dubai Portals Feed</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">{leads.length} Ingested</h3>
            <p className="text-sm text-blue-700 font-semibold leading-relaxed">
              PropertyFinder, Bayut, Dubizzle
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="px-7 py-7 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all min-h-[168px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Shadow Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <h3 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">{approvals.length} Pending</h3>
            <p className="text-sm text-indigo-800 flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
              <span>1-Click Signoff</span>
              <span className="text-slate-400 font-normal">· Zero Hallucinations</span>
            </p>
          </div>
        </div>

      </div>

      {/* Main Center Stage: 3D Showcase Hero Card */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/20 px-8 py-10 sm:px-10 sm:py-12 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>3D Virtual Customer Showroom Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display leading-snug">
              Present <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-900">{featuredProp.title}</span> in Real-Time 3D
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Showcase full dollhouse architectural cutaways, switch finishes live with the client (Calacatta Marble vs French Oak), simulate sunset & daylight solar angles, and send private VIP access links.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                📍 {featuredProp.location}
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                📐 {featuredProp.sqft.toLocaleString()} sq.ft
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                💰 {featuredProp.rentalYield}% Net Yield
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectPropertyFor3D(featuredProp);
                  onNavigateTab('3d-showroom');
                }}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Enter 3D Interactive Showroom</span>
              </button>

              <button
                onClick={onOpen3DModal}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold flex items-center gap-2 border border-slate-300 transition-all shadow-xs"
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
            className="w-full lg:w-[26rem] h-64 sm:h-72 rounded-2xl overflow-hidden relative cursor-pointer group border border-slate-300 shadow-md shrink-0"
          >
            <img 
              src={featuredProp.coverImage} 
              alt={featuredProp.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Click to Open 3D Viewport</span>
              <h4 className="text-base font-bold text-white font-display">{featuredProp.title}</h4>
              <p className="text-sm text-slate-200 font-medium">AED {(featuredProp.priceAED / 1000000).toFixed(1)}M (${(featuredProp.priceUSD / 1000000).toFixed(1)}M)</p>
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-blue-400 flex items-center justify-center text-blue-700 shadow-md">
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Pending Approvals & Qualified Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-8">
        
        {/* Left: Pending Shadow Approvals */}
        <div className="px-7 py-8 sm:px-8 sm:py-9 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                Broker Shadow Approvals ({approvals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('approvals')}
              className="text-sm text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {approvals.slice(0, 2).map((appr) => (
              <div key={appr.id} className="px-5 py-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 font-display">{appr.leadName}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      {appr.channel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium shrink-0">{appr.createdAt}</span>
                </div>

                <div className="px-4 py-3.5 rounded-xl bg-white text-sm text-slate-700 italic border border-slate-200 leading-relaxed">
                  "{appr.incomingQuery}"
                </div>

                <div className="text-sm text-slate-800 bg-blue-50/70 px-4 py-3.5 rounded-xl border border-blue-200 leading-relaxed">
                  <span className="font-bold text-blue-900 text-[11px] uppercase block mb-2 tracking-wide">AI Drafted Reply ({appr.confidenceScore}% Confidence):</span>
                  {appr.aiSuggestedReply}
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => onApproveDraft(appr.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Send via {appr.channel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: High-Intent Leads Qualified via pgvector */}
        <div className="px-7 py-8 sm:px-8 sm:py-9 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                Multi-Portal Dubai Leads ({leads.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-sm text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>All Portals</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {leads.slice(0, 3).map((lead) => (
              <div key={lead.id} className="px-5 py-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{lead.name}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {lead.source}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Budget: <strong className="text-blue-700">{lead.budgetAED}</strong> · {lead.preferredArea}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 leading-relaxed">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Matched to {lead.matchedProperty} ({(lead.vectorSimilarity * 100).toFixed(1)}% match)
                  </p>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end gap-2.5 shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                    Score: {lead.intentScore}
                  </span>
                  <button
                    onClick={() => {
                      const prop = properties.find((p) => p.title.toLowerCase().includes(lead.matchedProperty.toLowerCase())) || properties[0];
                      onSelectPropertyFor3D(prop);
                      onOpen3DModal();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-sm font-bold text-blue-700 flex items-center gap-1.5 border border-blue-300 shadow-2xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
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
