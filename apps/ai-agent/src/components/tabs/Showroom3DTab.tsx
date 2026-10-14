import React, { useState } from 'react';
import { Property, ClientBrief } from '../../types';
import { Property3DViewer } from '../three/Property3DViewer';
import { 
  Building2, 
  Sparkles, 
  Share2, 
  Download, 
  Sliders, 
  CheckCircle, 
  ShieldAlert, 
  PhoneCall, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Users,
  Compass,
  Eye,
  EyeOff
} from 'lucide-react';
import { exportPropertyPitchDeck } from '../../utils/pptxExport';

interface Showroom3DTabProps {
  properties: Property[];
  selectedProperty: Property;
  onSelectProperty: (property: Property) => void;
  clientBrief: ClientBrief;
  onOpenSalesInputModal: () => void;
  onShowToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }) => void;
}

export const Showroom3DTab: React.FC<Showroom3DTabProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  clientBrief,
  onOpenSalesInputModal,
  onShowToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [customerFilterOnly, setCustomerFilterOnly] = useState(false);

  const displayProperties = customerFilterOnly
    ? properties.filter((p) => p.showToCustomers !== false)
    : properties;

  const handleExportPPTX = async () => {
    try {
      setIsExporting(true);
      await exportPropertyPitchDeck(selectedProperty, clientBrief);
      onShowToast({
        type: 'success',
        title: 'Presentation Exported',
        message: `Investor Deck downloaded for ${selectedProperty.title}!`,
      });
    } catch (e: any) {
      onShowToast({
        type: 'error',
        title: 'Export Failed',
        message: `Error generating presentation: ${e.message}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareLink = () => {
    const url = `https://proppilot.vip/tour/${selectedProperty.id}?client=${encodeURIComponent(clientBrief.clientName)}`;
    navigator.clipboard.writeText(url);
    onShowToast({
      type: 'info',
      title: 'Link Copied',
      message: 'VIP Client 3D Access Link copied to clipboard!',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Property Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Portfolio Select:
            </span>
            <button
              onClick={() => setCustomerFilterOnly(!customerFilterOnly)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                customerFilterOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
              title="Toggle to view only listings approved to show to customer"
            >
              {customerFilterOnly ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              <span>{customerFilterOnly ? 'Customer Approved Only' : 'All Listings'}</span>
            </button>
          </div>

          {displayProperties.map((prop) => {
            const isVisibleToClient = prop.showToCustomers !== false;
            return (
              <button
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedProperty.id === prop.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-extrabold'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <span>{prop.title}</span>
                {!isVisibleToClient && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-600">Hidden</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSalesInputModal}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure Client Brief</span>
          </button>

          <button
            onClick={handleShareLink}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Client 3D Link</span>
          </button>

          <button
            onClick={handleExportPPTX}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating Deck...' : 'Export Presentation'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with Three.js */}
      <Property3DViewer
        property={selectedProperty}
        clientName={clientBrief.clientName}
        vipTier={clientBrief.vipTier}
        onOpenPitchInput={onOpenSalesInputModal}
        onExportPPTX={handleExportPPTX}
        onShareLink={handleShareLink}
      />

    </div>
  );
};
