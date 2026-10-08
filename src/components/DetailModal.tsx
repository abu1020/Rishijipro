import React, { useEffect, useState } from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { formatHumanDate } from '../utils/dateUtils';
import { generateReceiptPDF } from '../utils/pdfReceiptGenerator';
import {
  X,
  Receipt,
  Printer,
  Copy,
  Check,
  Edit2,
  Trash2,
  Calendar,
  User,
  CreditCard,
  Hash,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
  FileDown,
  Download,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DetailModalProps {
  isOpen: boolean;
  earning: Earning | null;
  onClose: () => void;
  onEdit: (earning: Earning) => void;
  onDelete: (earning: Earning) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  earning,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user, currency } = useAuth();
  const { success, error } = useToast();
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const copyReferenceId = () => {
    if (earning.referenceId) {
      navigator.clipboard.writeText(earning.referenceId);
      setCopiedRef(true);
      success('Reference ID copied to clipboard');
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const copyEntryId = () => {
    navigator.clipboard.writeText(earning.id);
    setCopiedId(true);
    success('Transaction ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPDF(true);
      generateReceiptPDF(earning, currency, user?.email || '');
      success('Professional PDF receipt downloaded successfully!');
    } catch (err: unknown) {
      console.error('Error generating PDF receipt:', err);
      error('Failed to generate PDF receipt. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const deductionRate =
    earning.grossAmount > 0 ? earning.deductions / earning.grossAmount : 0;

  const getStatusBadge = () => {
    switch (earning.paymentStatus) {
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settled / Paid</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Payment</span>
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Partially Paid</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        title="Click outside to close (Esc)"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full z-10 overflow-hidden my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-fadeIn print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:max-h-none print:max-w-none">
        
        {/* Header: Clean & Uncluttered (No duplicate buttons) */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                Payment Voucher
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span className="truncate">#{earning.id.slice(0, 12)}</span>
                <button
                  onClick={copyEntryId}
                  className="text-slate-500 hover:text-emerald-400 p-0.5 transition-colors cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Voucher Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 print:p-6 print:space-y-4">
          
          {/* Printable Formal Header (Visible only when printed) */}
          <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-black uppercase tracking-wider">
                  Payment Receipt & Voucher
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  ProfitTrack Daily Financial Record · ID: {earning.id}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-black">{earning.paymentStatus.toUpperCase()}</div>
                <div className="text-xs text-slate-600">{earning.date}</div>
              </div>
            </div>
          </div>

          {/* Hero Net Amount Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-white print:border-slate-300">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Net Realized Amount
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400 tracking-tight mt-0.5 print:text-black">
                {formatCurrency(earning.netAmount, currency)}
              </div>
              <span className="text-xs text-slate-500 print:text-slate-600 font-mono">
                Currency: {currency}
              </span>
            </div>

            <div className="self-start sm:self-auto">
              {getStatusBadge()}
            </div>
          </div>

          {/* Primary Transaction Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Client / Payer */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 print:border-slate-200">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1 print:text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Client / Payer:</span>
              </span>
              <span className="font-bold text-white text-sm block truncate print:text-black">
                {earning.clientName || 'General / Direct'}
              </span>
            </div>

            {/* Date */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 print:border-slate-200">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1 print:text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Transaction Date:</span>
              </span>
              <span className="font-bold text-white text-sm block print:text-black">
                {formatHumanDate(earning.date)}
                <span className="text-xs text-slate-400 font-mono ml-1.5 font-normal">({earning.date})</span>
              </span>
            </div>

            {/* Category */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 print:border-slate-200">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1 print:text-slate-600">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Revenue Category:</span>
              </span>
              <span className="font-semibold text-white text-xs block truncate print:text-black">
                {earning.category}
              </span>
            </div>

            {/* Payment Method */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 print:border-slate-200">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1 print:text-slate-600">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Settlement Method:</span>
              </span>
              <span className="font-semibold text-white text-xs block truncate print:text-black">
                {earning.paymentMethod || 'Direct / Bank'}
              </span>
            </div>
          </div>

          {/* Reference / Invoice ID (if present) */}
          {earning.referenceId && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between text-xs print:border-slate-200">
              <span className="text-slate-400 flex items-center gap-1.5 print:text-slate-600">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Reference / Invoice #:</span>
              </span>
              <button
                onClick={copyReferenceId}
                className="font-mono font-semibold text-emerald-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:border-slate-700 transition-colors cursor-pointer print:border-none print:p-0 print:text-black"
                title="Click to copy"
              >
                <span>{earning.referenceId}</span>
                <span className="print:hidden">
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </span>
              </button>
            </div>
          )}

          {/* Formal Accounting Breakdown Table */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden text-xs print:border-slate-300">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider print:bg-slate-100 print:text-black">
              Line Item Accounting Breakdown
            </div>
            
            <div className="divide-y divide-slate-800/60 p-4 space-y-2.5 print:divide-slate-200">
              {/* Gross Billed */}
              <div className="flex justify-between items-center text-slate-300 print:text-black">
                <span className="text-slate-400 print:text-slate-600">Gross Invoiced Amount:</span>
                <span className="font-mono font-semibold text-white print:text-black text-sm tabular-nums">
                  {formatCurrency(earning.grossAmount, currency)}
                </span>
              </div>

              {/* Deductions & Taxes */}
              <div className="flex justify-between items-center text-slate-300 pt-2 print:text-black">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 print:text-slate-600">Taxes, Cuts & Deductions:</span>
                  {earning.grossAmount > 0 && earning.deductions > 0 && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      ({formatPercent(deductionRate)})
                    </span>
                  )}
                </div>
                <span className="font-mono font-semibold text-amber-400 text-sm tabular-nums print:text-red-600">
                  {earning.deductions > 0 ? `-${formatCurrency(earning.deductions, currency)}` : '₹0.00'}
                </span>
              </div>

              {/* Net Payout */}
              <div className="flex justify-between items-center pt-2.5 text-sm font-bold">
                <span className="text-emerald-400 print:text-black">Net Realized Take-Home:</span>
                <span className="font-mono text-emerald-400 print:text-black text-base tabular-nums">
                  {formatCurrency(earning.netAmount, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Scope of Work */}
          {earning.notes && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs space-y-1.5 print:border-slate-200">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 print:text-slate-600">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Notes & Remarks:</span>
              </span>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap pl-1 print:text-black">
                {earning.notes}
              </p>
            </div>
          )}

          {/* Security & Audit Footer */}
          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between print:text-black">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified Ledger Record</span>
            </span>
            <span className="font-mono text-[10px] text-slate-600 print:text-slate-500">
              ProfitTrack Daily · Verified Record
            </span>
          </div>
        </div>

        {/* Unified Bottom Action Bar (Single place for actions, zero clutter) */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3 print:hidden">
          {/* Left: Destructive Action */}
          <button
            onClick={() => {
              onClose();
              onDelete(earning);
            }}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Right: Primary Operational Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Download Professional PDF Receipt (jsPDF)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isGeneratingPDF ? 'Generating...' : 'PDF Receipt'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(earning);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
