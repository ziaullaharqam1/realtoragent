import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { Building2, X, Save, Image, DollarSign, Ruler, Sparkles, Eye, EyeOff } from 'lucide-react';

interface PropertyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onSave: (property: Property) => void;
}

export const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  isOpen,
  onClose,
  property,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    subtitle: '',
    location: '',
    neighborhood: 'Palm Jumeirah',
    priceAED: 25000000,
    priceUSD: 6800000,
    bedrooms: 4,
    bathrooms: 5,
    sqft: 6500,
    sqm: 603,
    rentalYield: 9.0,
    capitalAppreciation: 14.0,
    status: 'Exclusive',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    keyUSPs: [
      'Private glass cantilever heated pool',
      'Direct dual high-speed private elevator',
      'Miele Grand Chef Atelier kitchen',
    ],
    showToCustomers: true,
    architecturalStyle: 'Contemporary Luxury',
    completionDate: 'Ready to Move In',
  });

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        showToCustomers: property.showToCustomers !== undefined ? property.showToCustomers : true,
      });
    } else {
      setFormData({
        id: `prop-${Date.now()}`,
        title: '',
        subtitle: '',
        location: 'Dubai Marina, Waterfront, Dubai',
        neighborhood: 'Dubai Marina',
        priceAED: 22000000,
        priceUSD: 5990000,
        bedrooms: 3,
        bathrooms: 4,
        sqft: 4800,
        sqm: 446,
        rentalYield: 9.5,
        capitalAppreciation: 12.5,
        status: 'Exclusive',
        coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        keyUSPs: ['Unobstructed marine skyline view', 'Italian marble finishes', 'Smart Lutron automation'],
        showToCustomers: true,
        architecturalStyle: 'Modern Coastal Minimalist',
        completionDate: 'Ready for Handover',
        hotspots: [],
        galleryImages: [],
        vectorEmbeddingDims: 1536,
      });
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (aed: number) => {
    setFormData((prev) => ({
      ...prev,
      priceAED: aed,
      priceUSD: Math.round(aed / 3.6725),
    }));
  };

  const handleSqftChange = (sqft: number) => {
    setFormData((prev) => ({
      ...prev,
      sqft: sqft,
      sqm: Math.round(sqft * 0.092903),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.priceAED) return;
    const finalProp: Property = {
      id: formData.id || `prop-${Date.now()}`,
      title: formData.title || 'Untitled Luxury Listing',
      subtitle: formData.subtitle || '',
      location: formData.location || 'Dubai, UAE',
      neighborhood: formData.neighborhood || 'Palm Jumeirah',
      priceAED: Number(formData.priceAED) || 20000000,
      priceUSD: Number(formData.priceUSD) || 5400000,
      bedrooms: Number(formData.bedrooms) || 3,
      bathrooms: Number(formData.bathrooms) || 4,
      sqft: Number(formData.sqft) || 5000,
      sqm: Number(formData.sqm) || 465,
      rentalYield: Number(formData.rentalYield) || 8.5,
      capitalAppreciation: Number(formData.capitalAppreciation) || 12.0,
      status: formData.status as any || 'Exclusive',
      coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      galleryImages: formData.galleryImages || [],
      keyUSPs: formData.keyUSPs || ['Panoramic Gulf view', 'Private pool'],
      vectorEmbeddingDims: 1536,
      architecturalStyle: formData.architecturalStyle || 'Modern Minimalist',
      completionDate: formData.completionDate || 'Ready',
      showToCustomers: formData.showToCustomers !== false,
      hotspots: formData.hotspots || [
        {
          id: `hs-${Date.now()}`,
          position: [0, 1.8, 0],
          title: 'Architectural Living Pavilion',
          description: 'Double-volume ceilings with floor-to-ceiling panoramic glass facade.',
          category: 'architecture',
          spec: '7.4m Height Volume',
        },
      ],
    };
    onSave(finalProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {property ? 'Edit Property Listing' : 'Add New Trophy Property'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure listing details, 3D showroom settings, and customer visibility.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Row 1: Title and Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Property Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. The Skycrest Penthouse"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Headline</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Full-Floor Masterpiece with 360° Gulf Vistas"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Row 2: Location and Neighborhood */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Location Address</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Palm Jumeirah, Crescent West, Dubai"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Neighborhood / District</label>
              <select
                value={formData.neighborhood || 'Palm Jumeirah'}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="Palm Jumeirah">Palm Jumeirah</option>
                <option value="Downtown Dubai">Downtown Dubai</option>
                <option value="Dubai Marina">Dubai Marina</option>
                <option value="Emirates Hills">Emirates Hills</option>
                <option value="DIFC">DIFC</option>
                <option value="Jumeirah Bay Island">Jumeirah Bay Island</option>
              </select>
            </div>
          </div>

          {/* Row 3: Pricing and Returns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Price (AED) *</label>
              <input
                type="number"
                required
                value={formData.priceAED || 0}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-blue-700 font-bold focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Price (USD Approx.)</label>
              <input
                type="number"
                value={formData.priceUSD || 0}
                onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Net Rental Yield (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.rentalYield || 0}
                onChange={(e) => setFormData({ ...formData, rentalYield: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-emerald-700 font-bold focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Cap Appreciation (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.capitalAppreciation || 0}
                onChange={(e) => setFormData({ ...formData, capitalAppreciation: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-blue-700 font-bold focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Row 4: Bed, Bath, Sqft, Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms || 1}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms || 1}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Built-Up Area (Sq.Ft)</label>
              <input
                type="number"
                value={formData.sqft || 1000}
                onChange={(e) => handleSqftChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Listing Status</label>
              <select
                value={formData.status || 'Exclusive'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
              >
                <option value="Exclusive">Exclusive</option>
                <option value="Off-Market">Off-Market</option>
                <option value="Under Offer">Under Offer</option>
              </select>
            </div>
          </div>

          {/* Row 5: Image and Handover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cover Image URL</label>
              <input
                type="url"
                value={formData.coverImage || ''}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Handover Status / Timeline</label>
              <input
                type="text"
                value={formData.completionDate || ''}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                placeholder="e.g. Q4 2026 (Handover Ready)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Customer Visibility Toggle */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {formData.showToCustomers ? (
                  <Eye className="w-4 h-4 text-blue-700" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-900">Show Property in 3D Customer Showroom</span>
              </div>
              <p className="text-[11px] text-slate-600">
                When enabled, clients can explore this property in full 3D interactive mode and receive private access links.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showToCustomers !== false}
                onChange={(e) => setFormData({ ...formData, showToCustomers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{property ? 'Update Listing' : 'Publish Property'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
