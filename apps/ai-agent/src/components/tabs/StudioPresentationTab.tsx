import React, { useState, useEffect } from 'react';
import { Property, ClientBrief, PresentationDeckType, SlidePage } from '../../types';
import { 
  Layers, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  FileText, 
  Sliders, 
  Image, 
  Share2,
  TrendingUp,
  Building,
  Compass,
  Edit3,
  Plus,
  Trash2,
  Layout,
  Palette
} from 'lucide-react';
import { exportPropertyPitchDeck } from '../../utils/pptxExport';

function generateSlidesForProperty(property: Property, clientBrief: ClientBrief): SlidePage[] {
  return [
    {
      id: 's-1',
      title: property.title,
      subtitle: `${property.location} · AED ${(property.priceAED / 1000000).toFixed(1)}M`,
      content: `Confidential investment prospectus for ${clientBrief.clientName}. A trophy architectural residence engineered for elite privacy, soaring double-height volumes, and unprecedented capital growth.`,
      bullets: [
        `Valuation: AED ${(property.priceAED / 1000000).toFixed(1)}M (USD $${(property.priceUSD / 1000000).toFixed(2)}M)`,
        `${property.bedrooms} Bedroom Master Suites · ${property.sqft.toLocaleString()} Sq.Ft`,
        `Handover Status: ${property.completionDate}`,
      ],
      statLabel: 'Net Rental Yield',
      statValue: `+${property.rentalYield}% p.a.`,
      badge: 'Executive Cover',
      layout: 'hero',
    },
    {
      id: 's-2',
      title: 'Architectural Excellence & Engineering',
      subtitle: `${property.architecturalStyle} · Ultra-Luxury Specifications`,
      content: `Crafted with bookmatched Italian marble and floor-to-ceiling acoustic glass curtains. Includes private high-speed elevator access and world-class culinary atelier.`,
      bullets: property.keyUSPs && property.keyUSPs.length > 0 ? property.keyUSPs.slice(0, 3) : ['Italian marble finishes', 'Panoramic vistas', 'Private elevator access'],
      statLabel: 'Capital Appreciation',
      statValue: `+${property.capitalAppreciation}% YoY`,
      badge: 'Engineering Telemetry',
      layout: 'grid',
    },
    {
      id: 's-3',
      title: 'Interactive 3D Digital Twin & Escrow',
      subtitle: 'Verified Title Escrow · RERA Registered UAE Brokerage',
      content: `Experience the property in real-time 3D walkthrough mode with live material customizer. Ready for 10% title deposit and immediate SPA execution.`,
      bullets: [
        'Full 360° Dollhouse Floorplan & Virtual Room Walkthrough',
        'Live Material Switcher (Calacatta Gold vs Smoked French Oak)',
        'UAE 10-Year Golden Investor Residence Qualified',
      ],
      statLabel: 'Portal Cosine Match',
      statValue: '98.4%',
      badge: 'Closing Escrow',
      layout: 'split',
    },
  ];
}

interface StudioPresentationTabProps {
  properties: Property[];
  selectedProperty: Property;
  onSelectProperty: (property: Property) => void;
  clientBrief: ClientBrief;
  onOpen3DShowroom: () => void;
  onShowToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }) => void;
}

export const StudioPresentationTab: React.FC<StudioPresentationTabProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  clientBrief,
  onOpen3DShowroom,
  onShowToast,
}) => {
  const [deckType, setDeckType] = useState<PresentationDeckType>('canva');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic slides for the selected property, initialized immediately to avoid undefined slides
  const [slides, setSlides] = useState<SlidePage[]>(() =>
    generateSlidesForProperty(selectedProperty, clientBrief)
  );

  // Re-generate slides whenever selectedProperty or clientBrief changes
  useEffect(() => {
    setSlides(generateSlidesForProperty(selectedProperty, clientBrief));
    setActiveSlideIndex(0);
  }, [selectedProperty, clientBrief]);

  const fallbackSlide = generateSlidesForProperty(selectedProperty, clientBrief)[0];
  const activeSlide = (slides.length > 0 && slides[activeSlideIndex]) ? slides[activeSlideIndex] : (slides[0] || fallbackSlide);

  const handleUpdateSlideField = (field: keyof SlidePage, value: any) => {
    const updated = [...slides];
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      [field]: value,
    };
    setSlides(updated);
  };

  const handleUpdateBullet = (bulletIndex: number, text: string) => {
    const updated = [...slides];
    const currentBullets = [...(updated[activeSlideIndex].bullets || [])];
    currentBullets[bulletIndex] = text;
    updated[activeSlideIndex].bullets = currentBullets;
    setSlides(updated);
  };

  const handleAddBullet = () => {
    const updated = [...slides];
    updated[activeSlideIndex].bullets = [...(updated[activeSlideIndex].bullets || []), 'New specification highlight'];
    setSlides(updated);
    onShowToast({ type: 'info', message: 'Added new bullet point to current slide.' });
  };

  const handleDeleteBullet = (bulletIndex: number) => {
    const updated = [...slides];
    updated[activeSlideIndex].bullets = updated[activeSlideIndex].bullets.filter((_, i) => i !== bulletIndex);
    setSlides(updated);
    onShowToast({ type: 'info', message: 'Removed bullet point.' });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportPropertyPitchDeck(selectedProperty, clientBrief);
      onShowToast({
        type: 'success',
        message: `${deckType === 'canva' ? 'Canva' : 'Gamma'} Presentation Deck successfully downloaded for ${selectedProperty.title}!`,
      });
    } catch (e: any) {
      onShowToast({
        type: 'error',
        message: `Export failed: ${e.message}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Executive Presentation Studio
            </span>
            <span className="text-xs text-slate-500">· Canva & Gamma Format Decks</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Property Pitch Deck & Page Editor
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Select presentations against any listing, edit slide content and layout pages live, and export presentation decks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              onShowToast({
                type: 'info',
                message: isEditing ? 'Page editor closed.' : 'Page editor active. Modify titles, bullet points, and notes.',
              });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isEditing 
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Page...' : 'Edit Page Content'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating Presentation...' : 'Download Deck'}</span>
          </button>
        </div>
      </div>

      {/* Selector Row: Property and Deck Type (Canva / Gamma) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Select Property Listing
          </label>
          <select
            value={selectedProperty.id}
            onChange={(e) => {
              const p = properties.find((x) => x.id === e.target.value);
              if (p) {
                onSelectProperty(p);
                onShowToast({ type: 'info', message: `Presentation switched to ${p.title}.` });
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — AED {(p.priceAED / 1000000).toFixed(1)}M ({p.neighborhood})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Presentation Type Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setDeckType('canva');
                onShowToast({ type: 'info', message: 'Switched to Canva Style (Editorial & High-Bleed Luxury).' });
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                deckType === 'canva'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Canva Style (Visual Luxury)</span>
            </button>

            <button
              onClick={() => {
                setDeckType('gamma');
                onShowToast({ type: 'info', message: 'Switched to Gamma Style (Interactive Modular Cards).' });
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                deckType === 'gamma'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Gamma Style (Modular Cards)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setActiveSlideIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeSlideIndex === idx
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>Slide {idx + 1}: {s.badge || s.title}</span>
          </button>
        ))}
      </div>

      {/* Main Presentation Stage: Slide Canvas Preview & Slide Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Slide Preview Canvas (7 or 12 cols depending on editor state) */}
        <div className={`${isEditing ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
          
          {/* CANVA STYLE PRESENTATION CARD */}
          {deckType === 'canva' && (
            <div className="relative w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl overflow-hidden shadow-xl text-white p-8 flex flex-col justify-between border border-slate-300">
              {/* Background property image with subtle dark overlay */}
              <img
                src={selectedProperty.coverImage}
                alt={selectedProperty.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40">
                    CANVA LUXURY EDITORIAL · {activeSlide.badge}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Slide {activeSlideIndex + 1} of {slides.length}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold font-display mt-4 leading-tight tracking-tight text-white drop-shadow-md">
                  {activeSlide.title}
                </h2>
                <p className="text-sm text-blue-200 font-semibold mt-1">
                  {activeSlide.subtitle}
                </p>
              </div>

              <div className="relative z-10 space-y-3">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  {activeSlide.content}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {activeSlide.bullets?.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs text-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/20 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Key Valuation / Telemetry</span>
                  <span className="text-lg font-black text-blue-300 font-display">{activeSlide.statValue}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">{activeSlide.statLabel}</span>
                </div>

                <div className="text-right text-[11px] text-slate-300">
                  <p className="font-bold">Prepared for: {clientBrief.clientName}</p>
                  <p className="text-slate-400">PropPilot Dubai Private Client Desk</p>
                </div>
              </div>
            </div>
          )}

          {/* GAMMA STYLE PRESENTATION CARD */}
          {deckType === 'gamma' && (
            <div className="relative w-full aspect-video bg-white rounded-2xl overflow-hidden shadow-xl text-slate-900 p-8 flex flex-col justify-between border border-slate-300">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                      GAMMA MODULAR CARD · {activeSlide.badge}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Slide {activeSlideIndex + 1} of {slides.length}
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight">
                    {activeSlide.title}
                  </h2>
                  <p className="text-sm font-semibold text-blue-700 mt-1">
                    {activeSlide.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Narrative & Context</span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {activeSlide.content}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">{activeSlide.statLabel}</span>
                  <span className="text-2xl font-black text-blue-900 font-display mt-1">{activeSlide.statValue}</span>
                  <span className="text-[10px] text-blue-700 mt-0.5 font-medium">Verified RERA Data</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activeSlide.bullets?.map((b, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500">
                <span>Client: <strong className="text-slate-800">{clientBrief.clientName}</strong></span>
                <span>Exclusive Property Desk · Dubai, UAE</span>
              </div>
            </div>
          )}

        </div>

        {/* Slide Page Editor Drawer / Column */}
        {isEditing && (
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-300 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Edit Slide {activeSlideIndex + 1}
                </h3>
              </div>
              <button
                onClick={() => {
                  onShowToast({ type: 'success', message: `Slide ${activeSlideIndex + 1} modifications saved.` });
                  setIsEditing(false);
                }}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Save Page
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[500px] overflow-y-auto pr-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Slide Title</label>
                <input
                  type="text"
                  value={activeSlide.title || ''}
                  onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Narrative Content</label>
                <textarea
                  rows={3}
                  value={activeSlide.content || ''}
                  onChange={(e) => handleUpdateSlideField('content', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Stat Highlight Label</label>
                  <input
                    type="text"
                    value={activeSlide.statLabel || ''}
                    onChange={(e) => handleUpdateSlideField('statLabel', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Stat Value</label>
                  <input
                    type="text"
                    value={activeSlide.statValue || ''}
                    onChange={(e) => handleUpdateSlideField('statValue', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-blue-700 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Slide Bullet Points</label>
                  <button
                    onClick={handleAddBullet}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {activeSlide.bullets?.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => handleUpdateBullet(bi, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                      />
                      <button
                        onClick={() => handleDeleteBullet(bi)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
