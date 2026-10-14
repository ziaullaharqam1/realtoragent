import React, { useState } from 'react';
import { NurtureSequence } from '../../types';
import { NURTURE_SEQUENCES } from '../../data/mockData';
import { 
  Clock, 
  Send, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Users, 
  Plus
} from 'lucide-react';

export const NurtureTab: React.FC = () => {
  const [sequences, setSequences] = useState<NurtureSequence[]>(NURTURE_SEQUENCES);
  const [toast, setToast] = useState<string | null>(null);

  const toggleSequence = (id: string) => {
    setSequences(
      sequences.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    setToast('Cadence status updated.');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Automated Follow-Up Cadence & Nurture Engine
            </span>
            <span className="text-xs text-slate-500">· WhatsApp & Email Drips</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Client Nurture & Re-Engagement Sequences
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Never let high-value deals go cold. PropPilot executes scheduled value-add touchpoints (3D updates, new off-market drops, yield reports).
          </p>
        </div>

        <button
          onClick={() => {
            setToast('New nurture sequence template initialized.');
            setTimeout(() => setToast(null), 2500);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Cadence Trigger</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Cadences List */}
      <div className="space-y-4">
        {sequences.map((seq) => (
          <div
            key={seq.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 font-display">{seq.leadName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-amber-800 font-semibold border border-slate-200">
                  {seq.channel}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  seq.active ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {seq.active ? 'Active Cadence' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">Campaign: {seq.campaign}</p>
              <p className="text-[11px] text-slate-500">{seq.stage}</p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Next Touchpoint</span>
                <span className="text-xs text-amber-800 font-bold">{seq.nextTouchpoint}</span>
              </div>

              <button
                onClick={() => toggleSequence(seq.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  seq.active
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                    : 'bg-emerald-600 text-white font-bold'
                }`}
              >
                {seq.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{seq.active ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
