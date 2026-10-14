import React, { useEffect, useState } from 'react';
import { UserPrincipal, BrokerRole } from '../../types';
import { User, Mail, Phone, BadgeCheck, Building2, FileText, LogOut, Save } from 'lucide-react';

const ROLES: BrokerRole[] = [
  'Senior Managing Broker',
  'Admin',
  'Sales Director',
  'Listing Broker',
  'Junior Broker',
];

interface ProfileEditModalProps {
  isOpen: boolean;
  user: UserPrincipal;
  onClose: () => void;
  onSave: (user: UserPrincipal) => void;
  onLogout: () => void;
  onManageBrokers: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  onLogout,
  onManageBrokers,
}) => {
  const [draft, setDraft] = useState<UserPrincipal>(user);

  useEffect(() => {
    if (isOpen) setDraft(user);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const initials = draft.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const update = <K extends keyof UserPrincipal>(key: K, value: UserPrincipal[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...draft,
      displayName: draft.displayName.trim(),
      email: draft.email.trim(),
      phone: draft.phone?.trim(),
      desk: draft.desk?.trim(),
      bio: draft.bio?.trim(),
      brokerage: draft.brokerage.trim(),
      licenseNumber: draft.licenseNumber.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center shadow-md">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Your Profile</p>
              <h2 className="text-xl font-bold text-slate-900 font-display">Edit broker profile</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold border border-slate-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Display name
              </span>
              <input
                required
                value={draft.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <input
                required
                type="email"
                value={draft.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </span>
              <input
                value={draft.phone || ''}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" /> Role
              </span>
              <select
                value={draft.role}
                onChange={(e) => update('role', e.target.value as BrokerRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> RERA license
              </span>
              <input
                required
                value={draft.licenseNumber}
                onChange={(e) => update('licenseNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Brokerage
              </span>
              <input
                required
                value={draft.brokerage}
                onChange={(e) => update('brokerage', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Desk / coverage</span>
              <input
                value={draft.desk || ''}
                onChange={(e) => update('desk', e.target.value)}
                placeholder="e.g. Palm & Downtown Desk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bio</span>
              <textarea
                rows={3}
                value={draft.bio || ''}
                onChange={(e) => update('bio', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onManageBrokers();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700"
              >
                Manage brokers
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-red-50 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
