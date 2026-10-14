import React, { useState } from 'react';
import { Property } from '../../types';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Compass, 
  DollarSign, 
  Search, 
  TrendingUp, 
  Ruler, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface PropertiesManagementTabProps {
  properties: Property[];
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onToggleCustomerVisibility: (propertyId: string) => void;
  onLaunch3D: (property: Property) => void;
}

export const PropertiesManagementTab: React.FC<PropertiesManagementTabProps> = ({
  properties,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onToggleCustomerVisibility,
  onLaunch3D,
}) => {
  const [search, setSearch] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.location.toLowerCase().includes(search.toLowerCase()) ||
      prop.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesNeighborhood = selectedNeighborhood === 'All' || prop.neighborhood === selectedNeighborhood;
    return matchesSearch && matchesNeighborhood;
  });

  const neighborhoods = ['All', ...Array.from(new Set(properties.map((p) => p.neighborhood)))];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Exclusive Inventory & Customer Showroom Control
            </span>
            <span className="text-xs text-slate-500">· Admin CRUD Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Manage Property Portfolio ({properties.length} Listings)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Add new listings, modify pricing and specifications, and configure which properties are visible to customers in the 3D Virtual Showroom.
          </p>
        </div>

        <button
          onClick={onAddProperty}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings by title, location, neighborhood..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 shrink-0">
            District:
          </span>
          {neighborhoods.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedNeighborhood(n)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedNeighborhood === n
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((prop) => {
          const isVisible = prop.showToCustomers !== false;
          return (
            <div
              key={prop.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={prop.coverImage}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                      {prop.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white">
                      {prop.neighborhood}
                    </span>
                  </div>

                  {/* Customer Visibility Badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => onToggleCustomerVisibility(prop.id)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md shadow-sm border transition-all ${
                        isVisible
                          ? 'bg-emerald-500/90 text-white border-emerald-400'
                          : 'bg-slate-800/90 text-slate-300 border-slate-600'
                      }`}
                      title="Click to toggle visibility to customer"
                    >
                      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isVisible ? 'Shown to Customer' : 'Hidden'}</span>
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                    <span className="text-base font-extrabold font-display drop-shadow-md">
                      AED {(prop.priceAED / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs font-semibold text-slate-200 drop-shadow-md">
                      ${(prop.priceUSD / 1000000).toFixed(2)}M USD
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{prop.location}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bedrooms</span>
                      <span className="font-bold text-slate-800">{prop.bedrooms} Beds</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Area</span>
                      <span className="font-bold text-slate-800">{prop.sqft.toLocaleString()} sqft</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Yield</span>
                      <span className="font-bold text-emerald-700">+{prop.rentalYield}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Features:</span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                      {prop.keyUSPs.slice(0, 2).map((usp, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-full">
                          • {usp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => onLaunch3D(prop)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                  title="View in 3D Showroom"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>3D View</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditProperty(prop)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-300 transition-colors"
                    title="Edit Property"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteProperty(prop.id)}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 transition-colors"
                    title="Delete Property"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
