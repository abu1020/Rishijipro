import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { EarningFormData, PaymentStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Database,
  Layers,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
}

export const ImportBackupModal: React.FC<ImportBackupModalProps> = ({
  isOpen,
  onClose,
  currentCount,
}) => {
  const { user, currency } = useAuth();
  const { success, error, info } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<EarningFormData[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [parseError, setParseError] = useState<string | null>(null);
  const [backupMetadata, setBackupMetadata] = useState<{
    exportedAt?: string;
    currency?: string;
    totalRecords?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    processFile(dropped);
  };

  const processFile = (inputFile: File) => {
    setParseError(null);
    setFile(inputFile);
    setParsedRecords([]);
    setBackupMetadata(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let rawList: any[] = [];
        if (Array.isArray(parsed)) {
          rawList = parsed;
        } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.records)) {
          rawList = parsed.records;
          setBackupMetadata({
            exportedAt: parsed.exportedAt,
            currency: parsed.currency,
            totalRecords: parsed.totalRecords || rawList.length,
          });
        } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
          rawList = parsed.data;
          setBackupMetadata({
            exportedAt: parsed.exportedAt,
            currency: parsed.currency,
            totalRecords: parsed.totalRecords || rawList.length,
          });
        } else {
          throw new Error('Unrecognized JSON structure. Expected a backup with a "records" array or an array of items.');
        }

        if (rawList.length === 0) {
          throw new Error('The selected backup file contains 0 transactions.');
        }

        // Sanitize and validate every record
        const validated: EarningFormData[] = rawList.map((item, index) => {
          const gross = Math.max(0, parseFloat(item.grossAmount) || 0);
          const ded = Math.max(0, parseFloat(item.deductions) || 0);
          const net = parseFloat(item.netAmount) || Math.max(0, gross - ded);

          // Validate date format (YYYY-MM-DD)
          let dateStr = String(item.date || '').slice(0, 10);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            dateStr = new Date().toISOString().slice(0, 10);
          }

          const statusOptions: PaymentStatus[] = ['Received', 'Pending', 'Partially Paid'];
          const status: PaymentStatus = statusOptions.includes(item.paymentStatus as PaymentStatus)
            ? (item.paymentStatus as PaymentStatus)
            : 'Received';

          return {
            date: dateStr,
            grossAmount: gross,
            deductions: ded,
            netAmount: net,
            category: String(item.category || 'General Revenue').trim(),
            clientName: item.clientName ? String(item.clientName).trim() : '',
            paymentMethod: item.paymentMethod ? String(item.paymentMethod).trim() : 'Bank Transfer',
            paymentStatus: status as any,
            referenceId: item.referenceId ? String(item.referenceId).trim() : '',
            notes: item.notes ? String(item.notes).trim() : '',
          };
        });

        setParsedRecords(validated);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to parse JSON file.';
        setParseError(msg);
        setFile(null);
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read backup file from disk.');
      setFile(null);
    };
    reader.readAsText(inputFile);
  };

  const handleExecuteImport = async () => {
    if (!user || parsedRecords.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: parsedRecords.length });

    const subcollectionPath = `users/${user.uid}/earnings`;

    try {
      // 1. If replace mode is chosen, wipe existing records first
      if (importMode === 'replace') {
        info('Clearing current records before fresh restore...');
        const q = query(collection(db, 'users', user.uid, 'earnings'));
        const snapshot = await getDocs(q);
        const deleteOps = snapshot.docs.map((d) => deleteDoc(doc(db, 'users', user.uid, 'earnings', d.id)));
        await Promise.all(deleteOps);
      }

      // 2. Batch insert validated records to Firestore
      for (let i = 0; i < parsedRecords.length; i++) {
        const item = parsedRecords[i];
        await addDoc(collection(db, 'users', user.uid, 'earnings'), {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setProgress({ current: i + 1, total: parsedRecords.length });
      }

      success(
        `Successfully restored ${parsedRecords.length} records into your Firebase database!`
      );
      onClose();
    } catch (err: unknown) {
      console.error('Import failed:', err);
      handleFirestoreError(err, OperationType.CREATE, subcollectionPath);
      error('Failed to complete database import. Please check connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalGross = parsedRecords.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalNet = parsedRecords.reduce((acc, r) => acc + r.netAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Import Database Backup</h3>
              <p className="text-xs text-slate-400">Restore your records directly into Firebase</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-5">
          {!file && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center transition-all bg-slate-950/60 cursor-pointer group"
            >
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-upload"
              />
              <label htmlFor="backup-file-upload" className="cursor-pointer block space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 mx-auto flex items-center justify-center transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-emerald-300">
                    Click to browse or drop your JSON backup
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts ProfitTrack JSON export backups (.json)
                  </p>
                </div>
              </label>
            </div>
          )}

          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-rose-200">Invalid Backup File</strong>
                <span>{parseError}</span>
              </div>
            </div>
          )}

          {file && parsedRecords.length > 0 && (
            <div className="space-y-4">
              {/* File details card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {parsedRecords.length} validated transactions found
                      {backupMetadata?.exportedAt && ` · Exported ${new Date(backupMetadata.exportedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setParsedRecords([]);
                  }}
                  disabled={isProcessing}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Gross in Backup</span>
                  <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                    {formatCurrency(totalGross, currency)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Net in Backup</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                    {formatCurrency(totalNet, currency)}
                  </span>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Restore Mode:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    disabled={isProcessing}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      importMode === 'append'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Append / Merge</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Add to existing {currentCount} records without deleting anything.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    disabled={isProcessing}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Replace All</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Clear current {currentCount} records, then restore backup cleanly.
                    </span>
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              {isProcessing && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-2 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      Writing to Firebase Firestore...
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-150"
                      style={{
                        width: `${(progress.current / Math.max(1, progress.total)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={isProcessing || parsedRecords.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Restoring {progress.current}/{progress.total}...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Restore {parsedRecords.length} Transactions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
