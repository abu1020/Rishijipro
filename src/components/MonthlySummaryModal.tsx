import React, { useState } from 'react';
import { Earning, SUPPORTED_CURRENCIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { formatHumanDate, parseISODate } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';
import { hapticTap, hapticPress, hapticSuccess } from '../utils/haptics';
import {
  Printer,
  Download,
  X,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Receipt,
  DollarSign,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Sparkles,
  Info,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnings: Earning[];
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  isOpen,
  onClose,
  earnings,
}) => {
  const { currency, user } = useAuth();
  const { success, error } = useToast();

  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth(); // 0-indexed

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [isGeneratingDirectPdf, setIsGeneratingDirectPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compute month prefix: 'YYYY-MM'
  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthDate = new Date(selectedYear, selectedMonth, 1);
  const monthName = monthDate.toLocaleString('en-US', { month: 'long' });
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const startDateStr = `${monthName} 1, ${selectedYear}`;
  const endDateStr = `${monthName} ${daysInMonth}, ${selectedYear}`;

  // Filter earnings for selected month
  const monthEarnings = earnings
    .filter((e) => e.date && e.date.startsWith(monthPrefix))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate Key Metrics
  const totalGross = monthEarnings.reduce((acc, e) => acc + (e.grossAmount || 0), 0);
  const totalDeductions = monthEarnings.reduce((acc, e) => acc + (e.deductions || 0), 0);
  const totalNet = monthEarnings.reduce((acc, e) => acc + (e.netAmount || 0), 0);

  const effectiveTaxRate = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;
  const netRealizationRate = totalGross > 0 ? (totalNet / totalGross) * 100 : 0;

  // Status breakdown
  const receivedEarnings = monthEarnings.filter((e) => e.paymentStatus === 'Received');
  const pendingEarnings = monthEarnings.filter(
    (e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partially Paid'
  );

  const receivedNet = receivedEarnings.reduce((acc, e) => acc + (e.netAmount || 0), 0);
  const pendingNet = pendingEarnings.reduce((acc, e) => acc + (e.netAmount || 0), 0);
  const cashRealizationRate = totalNet > 0 ? (receivedNet / totalNet) * 100 : 0;

  // Category Breakdown
  const categoryMap: Record<
    string,
    { count: number; gross: number; deductions: number; net: number }
  > = {};

  monthEarnings.forEach((e) => {
    const cat = e.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, gross: 0, deductions: 0, net: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].gross += e.grossAmount || 0;
    categoryMap[cat].deductions += e.deductions || 0;
    categoryMap[cat].net += e.netAmount || 0;
  });

  const categoryBreakdown = Object.entries(categoryMap).sort((a, b) => b[1].net - a[1].net);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    hapticTap();
    if (selectedMonth === 0) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    hapticTap();
    if (selectedMonth === 11) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    hapticTap();
    setSelectedYear(defaultYear);
    setSelectedMonth(defaultMonth);
  };

  // Browser Print Trigger using browser print engine
  const handleBrowserPrint = () => {
    hapticSuccess();
    document.body.classList.add('printing-monthly-summary');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-monthly-summary');
    }, 500);
  };

  // Direct jsPDF generation fallback
  const handleDownloadDirectPDF = () => {
    hapticSuccess();
    try {
      setIsGeneratingDirectPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const currencyObj =
        SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

      const formatMoney = (val: number) =>
        `${currencyObj.code} ${val.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const rightX = pageWidth - margin;

      // Header background accent bar
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 6, 'F');

      // Top Header text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('rishi Jha', margin, 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text('PROFESSIONAL GST & TDS ACCOUNTANT', margin, 23);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Statutory Taxation · GST Compliance · TDS Reconciliation · Financial Audits', margin, 27);

      // Right Statement Meta
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('MONTHLY TAX & EARNINGS STATEMENT', rightX, 18, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Period: ${startDateStr} – ${endDateStr}`, rightX, 23, { align: 'right' });
      doc.text(`Ref: RJ-MS-${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`, rightX, 27, {
        align: 'right',
      });

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, 32, rightX, 32);

      let y = 38;

      // Executive KPI Summary Boxes (3 columns)
      const boxW = (rightX - margin - 8) / 3;
      const boxH = 18;

      // 1. Gross
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, boxW, boxH, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL GROSS REVENUE', margin + 4, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(formatMoney(totalGross), margin + 4, y + 13);

      // 2. Deductions
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin + boxW + 4, y, boxW, boxH, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(185, 28, 28);
      doc.text('STATUTORY TAX DEDUCTIONS', margin + boxW + 8, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(225, 29, 72);
      doc.text(`-${formatMoney(totalDeductions)}`, margin + boxW + 8, y + 13);

      // 3. Net
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(margin + (boxW * 2) + 8, y, boxW, boxH, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(4, 120, 87);
      doc.text('NET BANK TAKE-HOME', margin + (boxW * 2) + 12, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(5, 150, 105);
      doc.text(formatMoney(totalNet), margin + (boxW * 2) + 12, y + 13);

      y += boxH + 8;

      // Category breakdown table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('CATEGORY REVENUE & TAX WITHHOLDING BREAKDOWN', margin, y);
      y += 4;

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, rightX - margin, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('CATEGORY', margin + 3, y + 4);
      doc.text('ENTRIES', margin + 65, y + 4, { align: 'center' });
      doc.text('GROSS', margin + 95, y + 4, { align: 'right' });
      doc.text('TDS / DED.', margin + 130, y + 4, { align: 'right' });
      doc.text('NET TAKE-HOME', rightX - 3, y + 4, { align: 'right' });

      y += 6;

      categoryBreakdown.forEach(([cat, data], idx) => {
        const rowH = 6;
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, rightX - margin, rowH, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        doc.text(cat, margin + 3, y + 4);
        doc.text(String(data.count), margin + 65, y + 4, { align: 'center' });
        doc.text(formatMoney(data.gross), margin + 95, y + 4, { align: 'right' });
        doc.setTextColor(225, 29, 72);
        doc.text(`-${formatMoney(data.deductions)}`, margin + 130, y + 4, { align: 'right' });
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.text(formatMoney(data.net), rightX - 3, y + 4, { align: 'right' });

        y += rowH;
      });

      y += 6;

      // Itemized transactions table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('ITEMIZED DAILY TRANSACTIONS RECORD', margin, y);
      y += 4;

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, rightX - margin, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('CLIENT / DESCRIPTION', margin + 3, y + 4.8);
      doc.text('DATE', margin + 55, y + 4.8);
      doc.text('STATUS', margin + 78, y + 4.8);
      doc.text('GROSS', margin + 105, y + 4.8);
      doc.text('TDS / DED.', margin + 138, y + 4.8);
      doc.text('NET AMOUNT', rightX - 3, y + 4.8, { align: 'right' });

      y += 7;

      monthEarnings.slice(0, 18).forEach((e, idx) => {
        const rowH = 6.5;
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, rightX - margin, rowH, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + rowH, rightX, y + rowH);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        const title = (e.clientName || e.notes || e.category || 'Income').slice(0, 28);
        doc.text(title, margin + 3, y + 4.5);
        doc.text(e.date.slice(5), margin + 55, y + 4.5);
        doc.text(e.paymentStatus || 'Received', margin + 78, y + 4.5);
        doc.text(formatMoney(e.grossAmount), margin + 105, y + 4.5);
        doc.setTextColor(225, 29, 72);
        doc.text(`-${formatMoney(e.deductions)}`, margin + 138, y + 4.5);
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.text(formatMoney(e.netAmount), rightX - 3, y + 4.5, { align: 'right' });

        y += rowH;
      });

      if (monthEarnings.length > 18) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`...and ${monthEarnings.length - 18} additional itemized records included in verified digital ledger.`, margin + 3, y + 4);
        y += 6;
      }

      // Statutory Declaration & Signature Seal
      y = Math.max(y + 4, 255);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, rightX - margin - 50, 24, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, rightX - margin - 50, 24, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text('ACCOUNTANT AUDIT & STATUTORY DECLARATION:', margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        'This statement represents verified ledger gross revenues, statutory TDS withholdings as per CBDT Circular No. 23/2017, and net bank take-home earnings. Prepared for direct tax filing & financial compliance.',
        margin + 3,
        y + 10,
        { maxWidth: rightX - margin - 56 }
      );

      // Signature Block
      const sigX = rightX - 45;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(sigX, y, 45, 24, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(sigX, y, 45, 24, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text('AUTHORIZED PRACTICE', sigX + 3, y + 5);
      doc.setTextColor(16, 185, 129);
      doc.text('rishi Jha', sigX + 3, y + 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text('GST & TDS Accountant', sigX + 3, y + 16);
      doc.text(`Signed: ${new Date().toISOString().slice(0, 10)}`, sigX + 3, y + 20);

      doc.save(`Monthly-Summary-${monthName}-${selectedYear}.pdf`);
      success(`Downloaded ${monthName} ${selectedYear} Monthly Summary PDF!`);
    } catch (err) {
      console.error('Failed to generate direct PDF:', err);
      error('Failed to generate PDF summary.');
    } finally {
      setIsGeneratingDirectPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop (hidden during print) */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity print:hidden"
        onClick={onClose}
        title="Click outside to close (Esc)"
      />

      {/* Main Dialog Container */}
      <div className="relative liquid-glass-elevated border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full z-10 overflow-hidden my-auto max-h-[96vh] sm:max-h-[94vh] flex flex-col animate-fadeIn print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:max-h-none print:max-w-none print:overflow-visible">
        {/* Specular Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none print:hidden" />

        {/* Top Header / Modal Actions (hidden during print) */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl liquid-glass-emerald text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Monthly Statement & Tax Summary
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                  A4 Print Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Formatted statement of gross/net amounts, statutory deductions & ledger
              </p>
            </div>
          </div>

          {/* Month Selector & Print Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            {/* Prev / Next Month Nav */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-white min-w-[105px] text-center">
                {monthName} {selectedYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleCurrentMonth}
              className="px-2.5 py-1.5 rounded-xl liquid-glass-button text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer hidden md:inline-flex"
              title="Reset to Current Month"
            >
              Current
            </button>

            {/* Print via Browser Button */}
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-emerald hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              title="Print formatted PDF using browser print dialog"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Print / PDF</span>
            </button>

            {/* Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadDirectPDF}
              disabled={isGeneratingDirectPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-glass-button text-cyan-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Download direct PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl liquid-glass-button text-slate-300 hover:text-white transition-colors cursor-pointer ml-auto sm:ml-0"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Statement Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 space-y-5 sm:space-y-6 print:p-0 print:overflow-visible print:space-y-4 bg-slate-900/30 print:bg-white text-slate-100 print:text-slate-900">
          {/* ========================================================================= */}
          {/* STATEMENT DOCUMENT SHEET (Formatted for Screen Preview & Clean Print)     */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-white/10 print:border-none p-4 sm:p-8 bg-slate-950/70 print:bg-white shadow-xl print:shadow-none space-y-6 text-slate-100 print:text-slate-900">
            {/* 1. Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/10 print:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  RJ
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white print:text-slate-950 tracking-tight">
                    rishi Jha
                  </h1>
                  <p className="text-xs font-bold text-emerald-400 print:text-emerald-700 tracking-wider uppercase">
                    Professional GST and TDS Accountant
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                    Statutory Taxation · GST Compliance · TDS Reconciliation · Financial Audits
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/15 print:bg-emerald-100 text-emerald-300 print:text-emerald-900 font-bold font-mono text-xs border border-emerald-500/30 print:border-emerald-300">
                  MONTHLY STATEMENT
                </span>
                <div className="text-xs font-mono font-semibold text-white print:text-slate-900">
                  Period: {startDateStr} – {endDateStr}
                </div>
                <div className="text-[11px] font-mono text-slate-400 print:text-slate-600">
                  Ref: RJ-MS-{selectedYear}-{String(selectedMonth + 1).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-400 print:text-slate-600 truncate max-w-[260px] sm:max-w-none">
                  Account: {user?.email || 'Verified Ledger'}
                </div>
              </div>
            </div>

            {/* 2. Executive Highlights: Gross, Deductions, Net (3 KPI Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Gross Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 print:bg-slate-50 border border-white/10 print:border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 print:text-slate-600 uppercase tracking-wider block">
                  1. Total Gross Revenue
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white print:text-slate-950">
                  {formatCurrency(totalGross, currency)}
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  {monthEarnings.length} total billed transaction{monthEarnings.length === 1 ? '' : 's'}
                </p>
              </div>

              {/* Deductions Card */}
              <div className="p-4 rounded-xl bg-rose-500/10 print:bg-rose-50 border border-rose-500/20 print:border-rose-200 space-y-1">
                <span className="text-[11px] font-bold text-rose-300 print:text-rose-800 uppercase tracking-wider block">
                  2. Statutory Tax Deductions
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 print:text-rose-700">
                  -{formatCurrency(totalDeductions, currency)}
                </div>
                <p className="text-[11px] text-rose-300/80 print:text-rose-700">
                  {effectiveTaxRate.toFixed(1)}% effective tax withholding rate
                </p>
              </div>

              {/* Net Take-Home Card */}
              <div className="p-4 rounded-xl bg-emerald-500/10 print:bg-emerald-50 border border-emerald-500/30 print:border-emerald-300 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 print:text-emerald-800 uppercase tracking-wider block">
                  3. Net Bank Take-Home
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 print:text-emerald-700">
                  {formatCurrency(totalNet, currency)}
                </div>
                <p className="text-[11px] text-emerald-300/80 print:text-emerald-700">
                  {netRealizationRate.toFixed(1)}% of total gross realized
                </p>
              </div>
            </div>

            {/* 3. Cash Flow Realization Summary Bar */}
            <div className="p-3.5 rounded-xl bg-slate-900/40 print:bg-slate-100 border border-white/10 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-600 shrink-0" />
                <span className="text-slate-300 print:text-slate-700">
                  Received in Bank: <strong>{formatCurrency(receivedNet, currency)}</strong> (
                  {cashRealizationRate.toFixed(1)}%)
                </span>
              </div>
              {pendingNet > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 print:text-amber-600 shrink-0" />
                  <span className="text-amber-300 print:text-amber-800">
                    Pending Receivables: <strong>{formatCurrency(pendingNet, currency)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* 4. Category-Wise Breakdown Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-cyan-400 print:text-cyan-600" />
                  <span>Category Revenue & Tax Breakdown</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400 print:text-slate-600">
                  {categoryBreakdown.length} Categories
                </span>
              </div>

              {/* Desktop Table & Mobile Responsive Scroll */}
              <div className="overflow-x-auto rounded-xl border border-white/10 print:border-slate-300">
                <table className="w-full text-left text-xs min-w-[550px] sm:min-w-0">
                  <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-300 print:text-slate-800 border-b border-white/10 print:border-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Entries</th>
                      <th className="py-2.5 px-3 text-right">Gross Amount</th>
                      <th className="py-2.5 px-3 text-right">Tax Deductions</th>
                      <th className="py-2.5 px-3 text-right">Net Take-Home</th>
                      <th className="py-2.5 px-3 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] print:divide-slate-200">
                    {categoryBreakdown.map(([cat, data]) => {
                      const share = totalNet > 0 ? (data.net / totalNet) * 100 : 0;
                      return (
                        <tr key={cat} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                          <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">
                            {cat}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400 print:text-slate-700">
                            {data.count}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-slate-800">
                            {formatCurrency(data.gross, currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-rose-700 font-semibold">
                            -{formatCurrency(data.deductions, currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                            {formatCurrency(data.net, currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 print:text-slate-700">
                            {share.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900/60 print:bg-slate-100 font-bold text-white print:text-slate-950 border-t border-white/10 print:border-slate-300">
                    <tr>
                      <td className="py-2.5 px-3">Total Subtotals</td>
                      <td className="py-2.5 px-3 text-center font-mono">{monthEarnings.length}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatCurrency(totalGross, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-rose-700">
                        -{formatCurrency(totalDeductions, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-emerald-700">
                        {formatCurrency(totalNet, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 5. Itemized Monthly Ledger Transactions */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
                  <span>Itemized Daily Transactions Record</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400 print:text-slate-600">
                  {monthEarnings.length} Records
                </span>
              </div>

              {monthEarnings.length > 0 ? (
                <>
                  {/* Mobile Card View (< sm) for pristine mobile experience */}
                  <div className="block sm:hidden space-y-2.5">
                    {monthEarnings.map((earning) => (
                      <div
                        key={earning.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-slate-400 text-[11px]">
                            {earning.date}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              earning.paymentStatus === 'Received'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : earning.paymentStatus === 'Pending'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {earning.paymentStatus || 'Received'}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-white text-sm">
                            {earning.clientName || earning.notes || earning.category || 'General Revenue'}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Category: {earning.category}</span>
                            {earning.referenceId && <span>• Ref: {earning.referenceId}</span>}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 font-mono text-[11px] text-right">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Gross</span>
                            <span className="text-slate-200 font-semibold">
                              {formatCurrency(earning.grossAmount, currency)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Deduction</span>
                            <span className="text-rose-400 font-semibold">
                              {earning.deductions > 0 ? `-${formatCurrency(earning.deductions, currency)}` : '₹0'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Net Take-Home</span>
                            <span className="text-emerald-400 font-bold">
                              {formatCurrency(earning.netAmount, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tablet & Desktop Table View (>= sm) & Print */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 print:border-slate-300">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-300 print:text-slate-800 border-b border-white/10 print:border-slate-300 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Client / Source</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Gross</th>
                          <th className="py-2.5 px-3 text-right">TDS / Ded.</th>
                          <th className="py-2.5 px-3 text-right">Net Take-Home</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] print:divide-slate-200">
                        {monthEarnings.map((earning) => (
                          <tr
                            key={earning.id}
                            className="hover:bg-white/[0.02] print:hover:bg-transparent page-break-avoid"
                          >
                            <td className="py-2.5 px-3 font-mono text-slate-300 print:text-slate-800 whitespace-nowrap">
                              {earning.date}
                            </td>
                            <td className="py-2.5 px-3 text-white print:text-slate-900 font-semibold max-w-[200px] truncate">
                              {earning.clientName || earning.notes || earning.category || 'General Revenue'}
                              {earning.referenceId && (
                                <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono block">
                                  Ref: {earning.referenceId}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 print:text-slate-700 whitespace-nowrap">
                              {earning.category}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  earning.paymentStatus === 'Received'
                                    ? 'bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-800'
                                    : earning.paymentStatus === 'Pending'
                                    ? 'bg-amber-500/20 text-amber-300 print:bg-amber-100 print:text-amber-800'
                                    : 'bg-cyan-500/20 text-cyan-300 print:bg-cyan-100 print:text-cyan-800'
                                }`}
                              >
                                {earning.paymentStatus || 'Received'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-slate-800 whitespace-nowrap">
                              {formatCurrency(earning.grossAmount, currency)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-400 print:text-rose-700 font-semibold whitespace-nowrap">
                              {earning.deductions > 0
                                ? `-${formatCurrency(earning.deductions, currency)}`
                                : '₹0.00'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 print:text-emerald-700 whitespace-nowrap">
                              {formatCurrency(earning.netAmount, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 print:text-slate-600 border border-dashed border-white/10 print:border-slate-300 rounded-xl">
                  No earnings recorded for {monthName} {selectedYear}. Select another month or add
                  transactions to your ledger.
                </div>
              )}
            </div>

            {/* 6. Statutory Declaration & Signature Seal */}
            <div className="pt-4 border-t border-white/10 print:border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center page-break-avoid">
              <div className="sm:col-span-2 space-y-1 text-[11px] text-slate-400 print:text-slate-600">
                <div className="font-bold text-white print:text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-600" />
                  <span>Statutory Direct Tax & GST Statement</span>
                </div>
                <p className="leading-relaxed">
                  Generated via rishi Jha Statutory Tax Practice Engine. TDS withholding computed as
                  per CBDT Circular No. 23/2017. All amounts reconciled against verified digital
                  ledger entries.
                </p>
              </div>

              {/* Authorized Signatory Block */}
              <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-50 border border-white/10 print:border-slate-300 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">
                  Authorized Signatory
                </span>
                <div className="font-bold text-sm text-emerald-400 print:text-emerald-700 font-mono">
                  rishi Jha
                </div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                  Professional GST & TDS Accountant
                </span>
                <span className="text-[9px] text-slate-500 print:text-slate-500 font-mono block">
                  Verified {new Date().toISOString().slice(0, 10)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (hidden during print) */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-white/[0.08] bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-400 flex items-center gap-2 text-center sm:text-left">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Tip: Select <strong>"Save as PDF"</strong> in print dialog for official digital statement.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-emerald hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
