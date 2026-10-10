import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Earning, SUPPORTED_CURRENCIES } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { exportDatabaseBackupJSON, exportEarningsToCSV } from '../../utils/formatters';
import { ImportBackupModal } from '../ImportBackupModal';
import {
  Settings,
  User,
  Coins,
  Check,
  Trash2,
  RotateCcw,
  Edit2,
  Database,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Vibrate,
  Sparkles,
} from 'lucide-react';
import {
  getHapticConfig,
  setHapticConfig,
  triggerHaptic,
  hapticTap,
  hapticPress,
  hapticSuccess,
  hapticWarning,
  hapticSelect,
  HapticType,
} from '../../utils/haptics';

interface SettingsViewProps {
  earnings: Earning[];
  earningsCount: number;
  onOpenClearAllModal: () => void;
  onOpenTour: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  earnings,
  earningsCount,
  onOpenClearAllModal,
  onOpenTour,
}) => {
  const { user, userProfile, currency, setCurrency, monthlyGoal, setMonthlyGoal } =
    useAuth();
  const { success, error, info } = useToast();

  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());
  const [displayNameInput, setDisplayNameInput] = useState(
    userProfile?.displayName || user?.displayName || ''
  );
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Haptic configuration state
  const [hapticState, setHapticState] = useState(getHapticConfig());

  const handleUpdateHaptic = (updates: Partial<typeof hapticState>) => {
    const updated = setHapticConfig(updates);
    setHapticState(updated);
    triggerHaptic('medium');
    success('Haptic settings updated.');
  };

  const handleTestHaptic = (type: HapticType, label: string) => {
    triggerHaptic(type);
    info(`Haptic impulse triggered: ${label}`);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticPress();
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      await setMonthlyGoal(val);
      hapticSuccess();
      success('Monthly goal updated.');
    }
  };

  const handleResetGoal = async () => {
    hapticPress();
    await setMonthlyGoal(100000);
    setGoalInput('100000');
    hapticSuccess();
    success('Monthly goal reset to ₹1,00,000.');
  };

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticPress();
    if (!user) return;
    if (!displayNameInput.trim()) {
      error('Display name cannot be empty.');
      return;
    }

    setIsUpdatingName(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayNameInput.trim(),
        updatedAt: new Date().toISOString(),
      });
      hapticSuccess();
      success('Profile display name updated successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleExportJSON = () => {
    hapticPress();
    if (earnings.length === 0) {
      info('Your ledger is currently empty. Add transactions first to export data.');
      return;
    }
    exportDatabaseBackupJSON(earnings, user?.email || '', currency);
    hapticSuccess();
    success(`Exported ${earnings.length} records as a JSON backup!`);
  };

  const handleExportCSV = () => {
    hapticPress();
    if (earnings.length === 0) {
      info('Your ledger is currently empty. Add transactions first to export CSV.');
      return;
    }
    exportEarningsToCSV(earnings, currency);
    hapticSuccess();
    success(`Exported ${earnings.length} records to CSV spreadsheet!`);
  };

  const panelClass = 'bg-[#0d1630] border border-blue-500/20 text-slate-100 shadow-sm';
  const sectionDivider = 'border-blue-500/15';

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Top Banner */}
      <div
        className={`border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${panelClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold bg-blue-900/50 text-blue-300 border border-blue-400/20">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Account & Application Settings
            </h2>
            <p className="text-xs mt-0.5 text-slate-400">
              Midnight blue suite, tactile haptics, accounting currency, and database portability
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            hapticTap();
            onOpenTour();
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/20 bg-[#111e40] hover:bg-[#182955] text-slate-200 hover:text-white transition-all cursor-pointer self-start sm:self-auto tactile-btn"
        >
          Product Tour
        </button>
      </div>

      {/* 1. Tactile Haptic Feel Engine */}
      <div className={`border rounded-xl p-5 space-y-4 transition-colors ${panelClass}`}>
        <div className={`flex items-center justify-between pb-2.5 border-b ${sectionDivider}`}>
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Tactile & Physical Haptic Feedback
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Hardware & Audio Impulses
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Simulates authentic physical mechanical switches and hardware vibration. Tapping buttons, tabs, presets, and checkboxes triggers native device vibration and subtle acoustic click impulses.
        </p>

        {/* Toggle Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Hardware Vibration Toggle */}
          <div className="p-3.5 rounded-lg border bg-[#0e1935] border-blue-500/15 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                Hardware Vibration
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Physical pulse via navigator.vibrate on mobile & trackpads
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUpdateHaptic({ vibration: !hapticState.vibration })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer tactile-btn ${
                hapticState.vibration ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                  hapticState.vibration ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Synthesized Micro-Click Sound */}
          <div className="p-3.5 rounded-lg border bg-[#0e1935] border-blue-500/15 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                Tactile Audio Impulse
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Crisp mechanical switch / crown click micro-pulse
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUpdateHaptic({ sound: !hapticState.sound })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer tactile-btn ${
                hapticState.sound ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                  hapticState.sound ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Interactive Test Palette */}
        <div className="pt-2">
          <div className="text-xs font-bold mb-2 text-slate-200">
            Feel Haptic Sensations (Tap buttons below to test impulse):
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleTestHaptic('light', 'Light Tap (12ms)')}
              className="p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer tactile-btn text-center bg-[#111e40] hover:bg-[#182955] border-blue-500/20 text-slate-200 hover:text-white"
            >
              Light Tap (Tabs)
            </button>

            <button
              type="button"
              onClick={() => handleTestHaptic('medium', 'Button Press (24ms)')}
              className="p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer tactile-btn text-center bg-[#111e40] hover:bg-[#182955] border-blue-500/20 text-slate-200 hover:text-white"
            >
              Medium Tap (CTA)
            </button>

            <button
              type="button"
              onClick={() => handleTestHaptic('success', 'Success Double-Tick')}
              className="p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer tactile-btn text-center text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/80 border-emerald-500/30"
            >
              Success Pulse
            </button>

            <button
              type="button"
              onClick={() => handleTestHaptic('warning', 'Warning Alert')}
              className="p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer tactile-btn text-center text-amber-400 bg-amber-950/40 hover:bg-amber-950/80 border-amber-500/30"
            >
              Warning Alert
            </button>
          </div>
        </div>
      </div>

      {/* 2. Profile & Display Name */}
      <div className={`border rounded-xl p-5 space-y-3.5 transition-colors ${panelClass}`}>
        <div className={`flex items-center gap-2 pb-2.5 border-b ${sectionDivider}`}>
          <User className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Profile Information
          </h3>
        </div>

        <form onSubmit={handleUpdateDisplayName} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                maxLength={80}
                className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none bg-[#091126] border-blue-500/20 text-white focus:border-blue-400/50"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">
                Google Account Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-1.5 rounded-lg border text-xs cursor-not-allowed bg-[#080d1a] border-blue-500/10 text-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingName}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-blue-50 text-slate-950 shadow-sm border border-white transition-all cursor-pointer disabled:opacity-50 tactile-btn"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isUpdatingName ? 'Saving...' : 'Update Name'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Accounting Currency */}
      <div className={`border rounded-xl p-5 space-y-3 transition-colors ${panelClass}`}>
        <div className={`flex items-center gap-2 pb-2.5 border-b ${sectionDivider}`}>
          <Coins className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Accounting Currency
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Select primary currency for ledger, PDF reports, and calculations.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {SUPPORTED_CURRENCIES.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  hapticSelect();
                  setCurrency(c.code);
                }}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer tactile-btn ${
                  isSelected
                    ? 'bg-white border-white text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0e1935] border-blue-500/15 text-slate-300 hover:bg-[#142247] hover:border-blue-400/40 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-bold">{c.symbol}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className="text-xs font-semibold">{c.code}</div>
                <div
                  className={`text-[10px] truncate ${
                    isSelected ? 'text-slate-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {c.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Target Monthly Goal Setting */}
      <div className={`border rounded-xl p-5 space-y-3 transition-colors ${panelClass}`}>
        <div className={`flex items-center gap-2 pb-2.5 border-b ${sectionDivider}`}>
          <Settings className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Monthly Net Goal Target
          </h3>
        </div>
        <form
          onSubmit={handleUpdateGoal}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md"
        >
          <div className="relative flex-1">
            <input
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full pl-3 pr-10 py-1.5 rounded-lg border font-mono tabular-nums text-xs font-bold focus:outline-none bg-[#091126] border-blue-500/20 text-white focus:border-blue-400/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">
              {currency}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-blue-50 text-slate-950 shadow-sm border border-white transition-all cursor-pointer whitespace-nowrap tactile-btn"
            >
              Update Goal
            </button>
            <button
              type="button"
              onClick={handleResetGoal}
              className="p-1.5 rounded-lg border border-blue-500/20 bg-[#111e40] hover:bg-[#182955] text-slate-300 hover:text-white transition-colors cursor-pointer tactile-btn"
              title="Reset to default ₹1,00,000"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 5. Database Backup & Portability */}
      <div className={`border rounded-xl p-5 space-y-3.5 transition-colors ${panelClass}`}>
        <div className={`flex items-center justify-between pb-2.5 border-b ${sectionDivider}`}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Database Backup & Portability
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {earningsCount} Documents
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Export full JSON backup files or restore previously exported backups with 1-click.
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Export Database Card */}
          <div className="p-3.5 rounded-lg border bg-[#0e1935] border-blue-500/15 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-white">
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export JSON / CSV Backup</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Structured backup of all {earningsCount} daily records, tax deductions, and vouchers.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                disabled={earningsCount === 0}
                className="flex-1 px-3 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-blue-50 text-slate-950 shadow-sm border border-white transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 tactile-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={earningsCount === 0}
                className="px-2.5 py-1.5 rounded-lg border border-blue-500/20 bg-[#111e40] hover:bg-[#182955] text-slate-200 hover:text-white transition-colors cursor-pointer disabled:opacity-40 tactile-btn"
                title="Download CSV Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Import Database Card */}
          <div className="p-3.5 rounded-lg border bg-[#0e1935] border-blue-500/15 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-white">
                <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Import JSON Backup</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Restore records from a previously exported ProfitTrack JSON backup file.
              </p>
            </div>

            <button
              onClick={() => {
                hapticPress();
                setIsImportModalOpen(true);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-blue-500/20 bg-[#111e40] hover:bg-[#182955] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 tactile-btn"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Danger Zone */}
      <div className={`border rounded-xl p-5 space-y-3 transition-colors ${panelClass}`}>
        <div className={`flex items-center gap-2 pb-2.5 border-b ${sectionDivider}`}>
          <Trash2 className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">
            Ledger Data Erasure
          </h3>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Permanently delete all transaction entries from your cloud database.
        </p>

        <div className="pt-1">
          <button
            onClick={() => {
              hapticWarning();
              onOpenClearAllModal();
            }}
            disabled={earningsCount === 0}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40 tactile-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Records ({earningsCount})</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      <ImportBackupModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentCount={earningsCount}
      />
    </div>
  );
};
