import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldAlert,
  CheckSquare,
  Square,
  KeyRound,
  Download,
  ArrowRight,
  RotateCcw,
  Flame,
} from 'lucide-react';

interface ClearAllModalProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onDownloadBackup?: () => void;
}

export const ClearAllModal: React.FC<ClearAllModalProps> = ({
  isOpen,
  count,
  onClose,
  onConfirm,
  onDownloadBackup,
}) => {
  // Step 1: Checkbox Acknowledgment
  // Step 2: Verification Phrase Challenge
  // Step 3: Final Armed Trigger Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [typedVerification, setTypedVerification] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const REQUIRED_PHRASE = 'DELETE PERMANENTLY';

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep(1);
      setHasAcknowledged(false);
      setTypedVerification('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  const handleFinalDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const isPhraseMatch = typedVerification.trim().toUpperCase() === REQUIRED_PHRASE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
        title="Click outside to cancel (Esc)"
      />

      {/* Dialog Card */}
      <div className="relative bg-slate-900 border border-rose-500/50 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 z-10 overflow-hidden my-auto max-h-[92vh] animate-fadeIn">
        {/* Progress Step Indicator (3 Steps) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              1
            </span>
            <span className="text-slate-600">―</span>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : step > 2
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              2
            </span>
            <span className="text-slate-600">―</span>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              3
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Safety Step {step} of 3
          </span>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Acknowledgment Checkbox */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Permanent Ledger Deletion Request
                </h3>
                <p className="text-xs text-rose-300 font-semibold mt-0.5">
                  WARNING: Data CANNOT be recovered once deleted!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed">
                You are about to erase <strong className="text-white font-mono">{count} transactions</strong> from your Firebase cloud ledger.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>All gross revenues, expenses, and TDS records will be permanently wiped.</li>
                <li>Monthly goal statistics, pacing metrics, and charts will reset to zero.</li>
                <li><strong>No backup is stored on our servers — deletion is final and permanent.</strong></li>
              </ul>
            </div>

            {/* Verification Method 1: Checkbox Acknowledgment */}
            <div
              onClick={() => setHasAcknowledged(!hasAcknowledged)}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-start gap-3 select-none"
            >
              <div className="mt-0.5 text-rose-400 shrink-0">
                {hasAcknowledged ? (
                  <CheckSquare className="w-4 h-4 text-rose-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <label className="text-xs text-slate-300 cursor-pointer leading-snug">
                I explicitly confirm that I understand this deletion is <strong className="text-white">permanent</strong> and my financial data <strong className="text-rose-400 underline">cannot be recovered</strong> once deleted.
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {onDownloadBackup ? (
                <button
                  type="button"
                  onClick={onDownloadBackup}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-emerald-400 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup First</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!hasAcknowledged}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-600/20"
                >
                  <span>Step 2: Verification Phrase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Phrase Challenge Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Security Confirmation Challenge
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm intentionality by typing the exact verification phrase below:
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Type the following phrase in uppercase:
              </span>
              <code className="text-sm font-mono font-black text-rose-400 tracking-wider bg-rose-950/40 px-3 py-1 rounded-md border border-rose-500/30 inline-block">
                {REQUIRED_PHRASE}
              </code>
            </div>

            {/* Verification Method 2: Text Input matching */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Security Input:
              </label>
              <input
                type="text"
                autoFocus
                value={typedVerification}
                onChange={(e) => setTypedVerification(e.target.value)}
                placeholder={`Type "${REQUIRED_PHRASE}" here`}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs font-mono tracking-wider focus:outline-none transition-colors ${
                  isPhraseMatch
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
                    : 'border-slate-800 text-white focus:border-rose-500'
                }`}
              />
              {typedVerification && !isPhraseMatch && (
                <p className="text-[11px] text-rose-400">
                  Phrase does not match yet. Please type {REQUIRED_PHRASE} exactly.
                </p>
              )}
              {isPhraseMatch && (
                <p className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Verification phrase matched correctly.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Back to Step 1</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isPhraseMatch}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-600/20"
                >
                  <span>Step 3: Final Arming</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Final Armed Destruction Trigger */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 animate-bounce">
                <Flame className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Final Authorization: Permanent Deletion
                </h3>
                <p className="text-xs text-rose-400 font-bold mt-0.5">
                  Point of No Return: Data cannot be restored or recovered!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 text-center space-y-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-rose-400 block">
                Permanently Deleting:
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {count} Transactions
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clicking the button below will immediately wipe these records from your Firestore database.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-xl shadow-rose-600/40 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Permanently Destroying Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Permanently Destroy All ({count})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
