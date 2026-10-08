import React, { useState, useEffect } from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { formatHumanDate } from '../utils/dateUtils';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  earning: Earning | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  earning,
  onClose,
  onConfirm,
}) => {
  const { currency } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !earning) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(earning.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        title="Click outside to cancel (Esc)"
      />

      {/* Dialog */}
      <div className="relative bg-slate-900 border border-rose-500/40 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 z-10 overflow-hidden my-auto max-h-[92vh]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white tracking-tight">
              Delete Earning Record?
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              This action cannot be undone. This earning entry will be permanently removed from your ledger.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            title="Cancel (Esc)"
          >
            <span>Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Preview Card */}
        <div className="my-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-500">Date:</span>
            <span className="font-semibold text-white">{formatHumanDate(earning.date)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-500">Client / Payer:</span>
            <span className="font-medium text-slate-200">{earning.clientName || 'General / Direct'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-500">Category:</span>
            <span className="font-medium text-slate-200">{earning.category}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
            <span className="text-slate-500 font-semibold">Net Earnings:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formatCurrency(earning.netAmount, currency)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
