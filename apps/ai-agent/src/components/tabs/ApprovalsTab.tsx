import React, { useState } from 'react';
import { ApprovalDraft, Property } from '../../types';
import { 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Compass
} from 'lucide-react';
import { ChannelAvatar, ChannelBadge } from '../ui/ChannelBadge';

interface ApprovalsTabProps {
  approvals: ApprovalDraft[];
  onApprove: (id: string) => void;
  onSelectPropertyFor3D: (property: Property) => void;
  properties: Property[];
  onOpen3DModal: () => void;
  onShowToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }) => void;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({
  approvals,
  onApprove,
  onSelectPropertyFor3D,
  properties,
  onOpen3DModal,
  onShowToast,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<{ [id: string]: string }>({});

  const handleApprove = (id: string) => {
    onApprove(id);
    onShowToast({
      type: 'success',
      title: 'Message Approved & Dispatched',
      message: 'Approved! AI co-pilot reply dispatched to client via verified channel.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Human-in-the-Loop Broker Supervised AI
            </span>
            <span className="text-xs text-emerald-700 font-semibold">· Multi-Portal Feeds Active</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Shadow Drafts & Message Approvals
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            The AI co-pilot prepares grounded replies to leads from Property Finder, Bayut, and Dubizzle referencing live RERA regulations and off-market inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Average Approval Speed: <strong>1.4 mins</strong></span>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 font-display">All Caught Up!</h3>
            <p className="text-xs text-slate-500 mt-1">Zero pending drafts in queue. PropPilot is monitoring incoming channels across Dubai portals.</p>
          </div>
        ) : (
          approvals.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-xs"
            >
              {/* Top metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <ChannelAvatar channel={item.channel} size="md" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display flex flex-wrap items-center gap-2">
                      <span>{item.leadName}</span>
                      <ChannelBadge channel={item.channel} size="sm" />
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                        {item.propertyContext}
                      </span>
                    </h3>
                    <p className="text-[11px] text-blue-700 font-medium">Trigger: {item.triggerEvent}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">{item.createdAt}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                    {item.confidenceScore}% AI Confidence
                  </span>
                </div>
              </div>

              {/* Incoming Lead Message */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Incoming Portal Message:</span>
                <p className="italic">"{item.incomingQuery}"</p>
              </div>

              {/* AI Suggested Response (Editable) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/60 to-white border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Proposed message · ready for {item.channel}
                  </span>
                  <button
                    onClick={() => {
                      if (editingId === item.id) {
                        setEditingId(null);
                        onShowToast({
                          type: 'info',
                          title: 'Changes Saved',
                          message: 'Draft message revisions saved in queue.',
                        });
                      } else {
                        setEditingId(item.id);
                        setEditedText({ ...editedText, [item.id]: item.aiSuggestedReply });
                      }
                    }}
                    className="text-[11px] text-slate-600 hover:text-slate-950 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{editingId === item.id ? 'Save Edit' : 'Edit Text'}</span>
                  </button>
                </div>

                {editingId === item.id ? (
                  <textarea
                    rows={4}
                    value={editedText[item.id] !== undefined ? editedText[item.id] : item.aiSuggestedReply}
                    onChange={(e) => setEditedText({ ...editedText, [item.id]: e.target.value })}
                    className="w-full p-3 bg-white border border-blue-400 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                    {editedText[item.id] || item.aiSuggestedReply}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const matchedProp = properties.find((p) => item.propertyContext.toLowerCase().includes(p.title.toLowerCase())) || properties[0];
                      onSelectPropertyFor3D(matchedProp);
                      onOpen3DModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 border border-blue-300"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>Configure 3D Tour for this Lead</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Send via {item.channel}</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
