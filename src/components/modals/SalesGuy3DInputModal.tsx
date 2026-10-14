import React, { useState } from 'react';
import { Property, ClientBrief, LightingPreset, RoomView, FinishPalette } from '../../types';
import { PROPERTIES } from '../../data/mockData';
import { 
  Building2, 
  User, 
  DollarSign, 
  Sparkles, 
  Compass, 
  Layers, 
  Copy, 
  CheckCircle, 
  Download, 
  Flame, 
  Sliders, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';

interface SalesGuy3DInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty: Property;
  onSelectProperty: (property: Property) => void;
  clientBrief: ClientBrief;
  onSaveClientBrief: (brief: ClientBrief) => void;
  onLaunchPresentation: (config: {
    property: Property;
    brief: ClientBrief;
    view: RoomView;
    lighting: LightingPreset;
    finish: FinishPalette;
  }) => void;
  onExportPPTX: () => void;
}

export const SalesGuy3DInputModal: React.FC<SalesGuy3DInputModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onSelectProperty,
  clientBrief,
  onSaveClientBrief,
  onLaunchPresentation,
  onExportPPTX,
}) => {
  const [activePropertyId, setActivePropertyId] = useState(selectedProperty.id);
  const [brief, setBrief] = useState<ClientBrief>(clientBrief);
  const [initialView, setInitialView] = useState<RoomView>('dollhouse');
  const [initialLighting, setInitialLighting] = useState<LightingPreset>('golden-hour');
  const [initialFinish, setInitialFinish] = useState<FinishPalette>('carrara-brass');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentProp = PROPERTIES.find((p) => p.id === activePropertyId) || selectedProperty;

  const handleLaunch = () => {
    onSaveClientBrief(brief);
    onLaunchPresentation({
      property: currentProp,
      brief,
      view: initialView,
      lighting: initialLighting,
      finish: initialFinish,
    });
    onClose();
  };

  const vipLink = `https://proppilot.vip/tour/${currentProp.id}?client=${encodeURIComponent(brief.clientName)}&auth=vip_token_secure`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vipLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  Sales Agent Briefing Engine
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Step 1 of 2: Required Client Inputs</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                Configure 3D Customer Presentation & Virtual Showroom
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold border border-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          
          {/* Section 1: Property Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              1. Select Trophy Property for Customer Walkthrough
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {PROPERTIES.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    setActivePropertyId(prop.id);
                    onSelectProperty(prop);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activePropertyId === prop.id
                      ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-400/40'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                    <img src={prop.coverImage} alt={prop.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 text-blue-200">
                      AED {(prop.priceAED / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate font-display">{prop.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{prop.neighborhood}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">{prop.bedrooms} Bed · {prop.sqft.toLocaleString()} sqft</span>
                    <span className="text-emerald-700 font-bold">{prop.rentalYield}% Yield</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Client Profile & Psychological Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-700" />
                2. Target Client Profile (VIP Details)
              </label>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Client Full Name & Title</label>
                <input
                  type="text"
                  value={brief.clientName}
                  onChange={(e) => setBrief({ ...brief, clientName: e.target.value })}
                  placeholder="e.g. Dr. Elena Rostova or Sheikh Al-Mansoor"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-medium">VIP Tier / Investor Class</label>
                  <select
                    value={brief.vipTier}
                    onChange={(e) => setBrief({ ...brief, vipTier: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Platinum UHNW">Platinum UHNW ($10M+)</option>
                    <option value="Family Office">Family Office / Fund</option>
                    <option value="Gold Investor">Gold Investor</option>
                    <option value="First-Time Luxury Buyer">First-Time Luxury Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-medium">Timeline to Transact</label>
                  <select
                    value={brief.buyingTimeline}
                    onChange={(e) => setBrief({ ...brief, buyingTimeline: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Immediate (7-14 Days)">Immediate (7-14 Days)</option>
                    <option value="Within 30 Days">Within 30 Days</option>
                    <option value="Next Quarter">Next Quarter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Affiliated Entity / Office</label>
                <input
                  type="text"
                  value={brief.companyOrFamily}
                  onChange={(e) => setBrief({ ...brief, companyOrFamily: e.target.value })}
                  placeholder="e.g. Rostova Family Trust / London Swiss Fund"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-blue-700" />
                3. Primary Buying Trigger & Pitch Focus
              </label>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Core Motive</label>
                <select
                  value={brief.motive}
                  onChange={(e) => setBrief({ ...brief, motive: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Trophy Asset">Trophy Asset / Irreplaceable Flagship</option>
                  <option value="High ROI Rental Yield">High Net Short-Term Rental Yield</option>
                  <option value="Golden Visa & Tax Relocation">UAE 10-Yr Golden Visa & Tax Shelter</option>
                  <option value="Holiday Beachfront Home">Ultra-Luxury Winter Holiday Home</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Tailored Sales Hook / Objection to Counter</label>
                <textarea
                  rows={3}
                  value={brief.pitchAngle}
                  onChange={(e) => setBrief({ ...brief, pitchAngle: e.target.value })}
                  placeholder="e.g. Focus on wind-engineered terrace acoustics, privacy of private elevator, and 9.2% net short term rental yield."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI verified: <strong>{currentProp.title}</strong> has <strong>98.4%</strong> vector alignment with this buyer profile.</span>
              </div>
            </div>
          </div>

          {/* Section 3: 3D Scene Initialization Defaults */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              4. 3D Experience Starting Environment
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Initial Camera View</label>
                <select
                  value={initialView}
                  onChange={(e) => setInitialView(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium"
                >
                  <option value="dollhouse">Isometric Dollhouse Cutaway (Overview)</option>
                  <option value="living">Living Room Pavilion (Double Height)</option>
                  <option value="master">Presidential Master Sanctuary</option>
                  <option value="terrace">Cantilever Sunset Terrace</option>
                  <option value="kitchen">Grand Culinary Boffi Atelier</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Solar Lighting Rig</label>
                <select
                  value={initialLighting}
                  onChange={(e) => setInitialLighting(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium"
                >
                  <option value="golden-hour">Golden Hour Sunset (High Emotional Appeal)</option>
                  <option value="midday">Noon Daylight (Crisp Architectural Detail)</option>
                  <option value="twilight">Twilight Velvet Night (Warm Interior Lighting)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-medium">Finish Palette</label>
                <select
                  value={initialFinish}
                  onChange={(e) => setInitialFinish(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium"
                >
                  <option value="carrara-brass">Calacatta Gold Marble & Brushed Brass</option>
                  <option value="french-oak">Smoked French Herringbone Oak</option>
                  <option value="noir-matte">Nero Marquina & Matte Obsidian</option>
                  <option value="brutalist-concrete">Honed Travertine & Raw Slate</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 4: Shareable VIP Access Link with Watermark */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="w-full md:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Personalized Customer 3D Link</span>
              <p className="text-xs text-blue-900 font-mono font-bold truncate max-w-md">{vipLink}</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-all border border-slate-300 shadow-2xs"
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={onExportPPTX}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-900 flex items-center gap-1.5 transition-all border border-blue-300 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Export Presentation Deck</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Assigned Broker: <span className="text-slate-900 font-bold">Marcus Sterling (admin@proppilot.demo)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-all shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Launch 3D Customer Walkthrough</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
