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
  ShieldCheck,
  User,
  Coins,
  Check,
  LogOut,
  Trash2,
  RotateCcw,
  Edit2,
  Calendar,
  Database,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileCheck,
  Sparkles,
} from 'lucide-react';

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
  const { user, userProfile, currency, setCurrency, monthlyGoal, setMonthlyGoal, logout } =
    useAuth();
  const { success, error, info } = useToast();

  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());
  const [displayNameInput, setDisplayNameInput] = useState(
    userProfile?.displayName || user?.displayName || ''
  );
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      await setMonthlyGoal(val);
      success('Monthly goal updated.');
    }
  };

  const handleResetGoal = async () => {
    await setMonthlyGoal(100000);
    setGoalInput('100000');
    success('Monthly goal reset to default ₹1,00,000.');
  };

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
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
      success('Profile display name updated successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleExportJSON = () => {
    if (earnings.length === 0) {
      info('Your ledger is currently empty. Add transactions first to export data.');
      return;
    }
    exportDatabaseBackupJSON(earnings, user?.email || '', currency);
    success(`Exported ${earnings.length} records as a Firebase JSON backup!`);
  };

  const handleExportCSV = () => {
    if (earnings.length === 0) {
      info('Your ledger is currently empty. Add transactions first to export CSV.');
      return;
    }
    exportEarningsToCSV(earnings, currency);
    success(`Exported ${earnings.length} records to CSV spreadsheet!`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-10">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Account, Database & System Settings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your currency, goals, Firebase backups, data portability, and profile
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTour}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          Product Tour
        </button>
      </div>

      {/* Profile & Display Name */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <User className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">User Profile Information</h3>
        </div>

        <form onSubmit={handleUpdateDisplayName} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name (Editable)
              </label>
              <input
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                maxLength={80}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                placeholder="Your Name or Studio Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Google Email Address
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/60 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingName}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isUpdatingName ? 'Saving...' : 'Update Display Name'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Currency Settings */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Coins className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Display Currency (Default: ₹ INR)</h3>
        </div>
        <p className="text-xs text-slate-400">
          Select your primary accounting currency. Real-time exchange symbols format instantly across the entire ledger.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {SUPPORTED_CURRENCIES.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-base font-bold text-emerald-400">{c.symbol}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-semibold text-white">{c.code}</div>
                <div className="text-[10px] text-slate-500 truncate">{c.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Monthly Goal Setting */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Settings className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Monthly Net Goal Target</h3>
        </div>
        <form onSubmit={handleUpdateGoal} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <input
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full pl-3 pr-12 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono tabular-nums text-sm focus:border-emerald-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
              {currency}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              Update Goal
            </button>
            <button
              type="button"
              onClick={handleResetGoal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Reset to default ₹1,00,000"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* DATABASE BACKUP, EXPORT & IMPORT (FIREBASE SYSTEM) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Database Backup, Export & Portability
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            {earningsCount} Documents
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Safeguard your entire financial history. Export a full-fidelity JSON database backup file that matches your Firebase Firestore collection structure. If you ever delete or migrate your data, you can restore your complete ledger with one click.
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Database Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Database Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Download a complete, structured JSON backup of all {earningsCount} daily records, tax deductions, vouchers, and timestamps.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                disabled={earningsCount === 0}
                className="flex-1 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={earningsCount === 0}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                title="Download CSV Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Import Database Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Import Database Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Restore records from a previously exported ProfitTrack JSON backup file. Supports clean replace or merge.
              </p>
            </div>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-emerald-500/50 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import / Restore Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Deletable Actions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Ledger Data Management & Erasure</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Erase all transactions from your ledger with safety confirmation. Active records in your database: <strong className="text-white font-mono">{earningsCount}</strong>.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onOpenClearAllModal}
            disabled={earningsCount === 0}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Permanently Delete All Transactions ({earningsCount})</span>
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
