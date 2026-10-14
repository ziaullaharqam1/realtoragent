import React, { useState } from 'react';
import { Lead, Property } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  PhoneCall, 
  MessageSquare, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  ArrowUpRight,
  TrendingUp,
  Zap
} from 'lucide-react';

interface LeadsPipelineTabProps {
  leads: Lead[];
  properties: Property[];
  onSelectPropertyFor3D: (property: Property) => void;
  onOpen3DModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LeadsPipelineTab: React.FC<LeadsPipelineTabProps> = ({
  leads,
  properties,
  onSelectPropertyFor3D,
  onOpen3DModal,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.matchedProperty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || lead.qualificationStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Intelligent Lead Intake & Qualification
            </span>
            <span className="text-xs text-slate-500">· Powered by pgvector (1,536-dim embeddings)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            VIP Leads & Acquisition Pipeline
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Incoming buyer requests from WhatsApp, Bayut, and PropertyFinder are scored for intent and matched against exclusive off-market listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5"
          >
            <span>Broker Approvals (3 Pending)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, phone, or property..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Qualified Hot', 'Viewing Requested', 'Offer Drafting', 'Nurture Drip'].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                stageFilter === stage
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Client / Investor</th>
                <th className="py-3.5 px-4">Source & Contact</th>
                <th className="py-3.5 px-4">Budget Range</th>
                <th className="py-3.5 px-4">pgvector Match</th>
                <th className="py-3.5 px-4">Buying Stage</th>
                <th className="py-3.5 px-4">Intent Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const matchedProp = properties.find((p) => p.title.toLowerCase().includes(lead.matchedProperty.toLowerCase())) || properties[0];
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm font-display">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{lead.lastMessageSnippet}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px]">
                          {lead.source}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phone}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-amber-800">{lead.budgetAED}</div>
                      <div className="text-[10px] text-slate-500">{lead.preferredArea}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{lead.matchedProperty}</div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>{(lead.vectorSimilarity * 100).toFixed(1)}% vector cosine match</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        lead.qualificationStage === 'Offer Drafting'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : lead.qualificationStage === 'Viewing Requested'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : lead.qualificationStage === 'Qualified Hot'
                          ? 'bg-sky-100 text-sky-900 border border-sky-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.qualificationStage}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-extrabold text-slate-900">{lead.intentScore}/100</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            onSelectPropertyFor3D(matchedProp);
                            onOpen3DModal();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                          title="Launch Tailored 3D Walkthrough for Client"
                        >
                          <Compass className="w-3 h-3" />
                          <span>3D Pitch</span>
                        </button>

                        <button
                          onClick={() => onNavigateTab('conversations')}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          title="Open WhatsApp Thread"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
