import React, { useEffect } from 'react';
import { ToastNotification } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastNotification; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-white border-emerald-300 text-slate-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      accent: 'border-l-4 border-l-emerald-600',
      badge: 'Success',
      badgeClass: 'bg-emerald-50 text-emerald-700',
    },
    error: {
      bg: 'bg-white border-rose-300 text-slate-900',
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      accent: 'border-l-4 border-l-rose-600',
      badge: 'Error',
      badgeClass: 'bg-rose-50 text-rose-700',
    },
    warning: {
      bg: 'bg-white border-blue-300 text-slate-900',
      icon: <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />,
      accent: 'border-l-4 border-l-blue-600',
      badge: 'Warning',
      badgeClass: 'bg-blue-50 text-blue-700',
    },
    info: {
      bg: 'bg-white border-slate-300 text-slate-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      accent: 'border-l-4 border-l-blue-600',
      badge: 'Notice',
      badgeClass: 'bg-blue-50 text-blue-700',
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all transform animate-in slide-in-from-top-3 duration-200 ${config.bg} ${config.accent}`}
    >
      <div className="pt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.badgeClass}`}>
            {toast.title || config.badge}
          </span>
        </div>
        <p className="text-xs text-slate-700 font-medium leading-relaxed break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
