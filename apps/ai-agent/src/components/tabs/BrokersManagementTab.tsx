import React, { useMemo, useState } from 'react';
import { BrokerAccount, BrokerRole, BrokerStatus } from '../../types';
import {
  Users,
  Plus,
  Search,
  Pencil,
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  BadgeCheck,
  Save,
  X,
} from 'lucide-react';

const ROLES: BrokerRole[] = [
  'Senior Managing Broker',
  'Admin',
  'Sales Director',
  'Listing Broker',
  'Junior Broker',
];

interface BrokersManagementTabProps {
  brokers: BrokerAccount[];
  currentUserId: string;
  onUpsertBroker: (broker: BrokerAccount) => void;
  onSetStatus: (brokerId: string, status: BrokerStatus) => void;
  onShowToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }) => void;
}

const emptyDraft = (): BrokerAccount => ({
  id: `broker-${Date.now()}`,
  displayName: '',
  email: '',
  role: 'Junior Broker',
  licenseNumber: '',
  phone: '',
  desk: '',
  status: 'invited',
  activeDeals: 0,
  joinedAt: 'Just now',
});

const statusStyles: Record<BrokerStatus, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  invited: 'bg-amber-50 text-amber-800 border-amber-200',
  suspended: 'bg-rose-50 text-rose-800 border-rose-200',
};

export const BrokersManagementTab: React.FC<BrokersManagementTabProps> = ({
  brokers,
  currentUserId,
  onUpsertBroker,
  onSetStatus,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<BrokerAccount | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brokers;
    return brokers.filter((b) =>
      [b.displayName, b.email, b.role, b.desk, b.licenseNumber].some((v) => v.toLowerCase().includes(q))
    );
  }, [brokers, query]);

  const activeCount = brokers.filter((b) => b.status === 'active').length;

  const openCreate = () => {
    setIsCreating(true);
    setEditing(emptyDraft());
  };

  const openEdit = (broker: BrokerAccount) => {
    setIsCreating(false);
    setEditing({ ...broker });
  };

  const closeEditor = () => {
    setEditing(null);
    setIsCreating(false);
  };

  const saveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.displayName.trim() || !editing.email.trim()) {
      onShowToast({ type: 'error', title: 'Missing details', message: 'Name and email are required.' });
      return;
    }
    onUpsertBroker({
      ...editing,
      displayName: editing.displayName.trim(),
      email: editing.email.trim().toLowerCase(),
      phone: editing.phone.trim(),
      desk: editing.desk.trim(),
      licenseNumber: editing.licenseNumber.trim(),
    });
    onShowToast({
      type: 'success',
      title: isCreating ? 'Broker invited' : 'Broker updated',
      message: `${editing.displayName} is now in your brokerage roster.`,
    });
    closeEditor();
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
            <Users className="w-3.5 h-3.5" />
            User management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Manage brokers
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Invite teammates, update RERA licenses and desks, and suspend access when needed.
            {` ${activeCount} of ${brokers.length} brokers are currently active.`}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold inline-flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Invite broker
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, desk, license…"
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-bold">Broker</th>
                <th className="px-5 py-3.5 font-bold">Role</th>
                <th className="px-5 py-3.5 font-bold">Desk</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold">Deals</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((broker) => {
                const initials = broker.displayName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr key={broker.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center border border-blue-200">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {broker.displayName}
                            {broker.id === currentUserId && (
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {broker.email}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            {broker.phone || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">{broker.role}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="w-3 h-3" />
                        {broker.licenseNumber || 'No license'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{broker.desk || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize ${statusStyles[broker.status]}`}>
                        {broker.status}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">Joined {broker.joinedAt}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{broker.activeDeals}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(broker)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {broker.status !== 'suspended' ? (
                          <button
                            type="button"
                            disabled={broker.id === currentUserId}
                            onClick={() => {
                              onSetStatus(broker.id, 'suspended');
                              onShowToast({
                                type: 'warning',
                                title: 'Broker suspended',
                                message: `${broker.displayName} can no longer access the portal.`,
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 inline-flex items-center gap-1 disabled:opacity-40"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSetStatus(broker.id, 'active');
                              onShowToast({
                                type: 'success',
                                title: 'Broker reactivated',
                                message: `${broker.displayName} is active again.`,
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No brokers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form
            onSubmit={saveEditor}
            className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  {isCreating ? 'Invite' : 'Edit'} broker
                </p>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {isCreating ? 'Add brokerage user' : editing.displayName}
                </h3>
              </div>
              <button type="button" onClick={closeEditor} className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Full name</span>
                <input
                  required
                  value={editing.displayName}
                  onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
                <input
                  required
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</span>
                <input
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</span>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as BrokerRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</span>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as BrokerStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">RERA license</span>
                <input
                  value={editing.licenseNumber}
                  onChange={(e) => setEditing({ ...editing, licenseNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Desk</span>
                <input
                  value={editing.desk}
                  onChange={(e) => setEditing({ ...editing, desk: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </label>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={closeEditor} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold inline-flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {isCreating ? 'Send invite' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
