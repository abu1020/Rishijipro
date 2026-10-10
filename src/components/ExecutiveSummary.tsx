import React from 'react';
import { motion } from 'framer-motion';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import {
  Briefcase,
  TrendingUp,
  Percent,
  Award,
  ShieldCheck,
  Printer,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { hapticTap, hapticPress, hapticSuccess } from '../utils/haptics';

interface ExecutiveSummaryProps {
  earnings: Earning[];
  onOpenNewEarningModal?: () => void;
  onNavigateToLedger?: () => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  earnings,
  onOpenNewEarningModal,
  onNavigateToLedger,
}) => {
  const { currency } = useAuth();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Filter for Current Month to Date (MTD)
  const monthEarnings = earnings.filter((e) => e.date.startsWith(currentMonthPrefix));

  const activeDataset = monthEarnings.length > 0 ? monthEarnings : earnings;
  const isFallbackAllTime = monthEarnings.length === 0 && earnings.length > 0;

  // 1. Total Monthly Revenue
  const totalGross = activeDataset.reduce((sum, e) => sum + (e.grossAmount || 0), 0);
  const totalNet = activeDataset.reduce((sum, e) => sum + (e.netAmount || 0), 0);
  const totalDeductions = activeDataset.reduce((sum, e) => sum + (e.deductions || 0), 0);

  // 2. Net Profit Margin Percentage
  const netProfitMargin = totalGross > 0 ? (totalNet / totalGross) * 100 : 0;
  const deductionRatio = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;

  // 3. Top-Performing Category Analysis
  const categoryStats: Record<string, { net: number; gross: number; count: number }> = {};
  activeDataset.forEach((item) => {
    const cat = item.category || 'General';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { net: 0, gross: 0, count: 0 };
    }
    categoryStats[cat].net += item.netAmount || 0;
    categoryStats[cat].gross += item.grossAmount || 0;
    categoryStats[cat].count += 1;
  });

  const sortedCategories = Object.entries(categoryStats).sort(
    (a, b) => b[1].net - a[1].net
  );

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
  const topCategoryName = topCategory ? topCategory[0] : 'None Recorded';
  const topCategoryNet = topCategory ? topCategory[1].net : 0;
  const topCategoryShare =
    totalNet > 0 && topCategory ? (topCategory[1].net / totalNet) * 100 : 0;

  // 4. Cash Realization & Collection Efficiency
  const receivedNet = activeDataset
    .filter((e) => e.paymentStatus === 'Received')
    .reduce((sum, e) => sum + (e.netAmount || 0), 0);

  const pendingNet = activeDataset
    .filter((e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partially Paid')
    .reduce((sum, e) => sum + (e.netAmount || 0), 0);

  const pendingCount = activeDataset.filter(
    (e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partially Paid'
  ).length;

  const collectionRate = totalNet > 0 ? (receivedNet / totalNet) * 100 : 100;
  const averageDealSize =
    activeDataset.length > 0 ? totalGross / activeDataset.length : 0;

  const handlePrint = () => {
    hapticSuccess();
    window.print();
  };

  return (
    <section className="bg-[#0d1630] border border-blue-500/20 rounded-xl p-5 sm:p-6 transition-all text-white shadow-sm">
      {/* Executive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-500/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-900/50 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Executive Financial Summary
              </h2>
              <span className="text-blue-500/30">·</span>
              <span className="text-xs font-mono font-medium text-slate-300">
                {isFallbackAllTime ? 'All-Time' : `${currentMonthName} ${currentYear}`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Operating margins, collection efficiency, and revenue concentration
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111e40] hover:bg-[#182955] text-xs font-semibold text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
            title="Print Executive Brief"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print</span>
          </button>

          {onOpenNewEarningModal && (
            <button
              onClick={() => {
                hapticPress();
                onOpenNewEarningModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer border border-white tactile-btn"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Record Earning</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        {/* KPI 1: Total Monthly Revenue */}
        <motion.div
          whileHover={{ y: -4, backgroundColor: '#132249', borderColor: 'rgba(96, 165, 250, 0.4)' }}
          onClick={hapticTap}
          className="p-3.5 rounded-lg bg-[#101c3d] border border-blue-500/15 flex flex-col justify-between space-y-2.5 cursor-pointer tactile-press transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Total Billed
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {formatCurrency(totalGross, currency)}
            </div>

            <div className="text-xs font-mono tabular-nums text-slate-300 mt-0.5">
              Net: <span className="text-white font-bold">{formatCurrency(totalNet, currency)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-500/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>{activeDataset.length} entries</span>
            <span>Avg {formatCurrency(averageDealSize, currency)}</span>
          </div>
        </motion.div>

        {/* KPI 2: Net Profit Margin Percentage */}
        <motion.div
          whileHover={{ y: -4, backgroundColor: '#132249', borderColor: 'rgba(96, 165, 250, 0.4)' }}
          onClick={hapticTap}
          className="p-3.5 rounded-lg bg-[#101c3d] border border-blue-500/15 flex flex-col justify-between space-y-2.5 cursor-pointer tactile-press transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Retention Margin
              </span>
              <Percent className="w-3.5 h-3.5 text-blue-400" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
                {netProfitMargin.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">retention</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-blue-950 mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, netProfitMargin))}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-blue-500/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Deductions:</span>
            <span className="text-amber-400 font-mono font-bold">
              -{formatCurrency(totalDeductions, currency)} ({deductionRatio.toFixed(1)}%)
            </span>
          </div>
        </motion.div>

        {/* KPI 3: Top-Performing Category */}
        <motion.div
          whileHover={{ y: -4, backgroundColor: '#132249', borderColor: 'rgba(96, 165, 250, 0.4)' }}
          onClick={hapticTap}
          className="p-3.5 rounded-lg bg-[#101c3d] border border-blue-500/15 flex flex-col justify-between space-y-2.5 cursor-pointer tactile-press transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Top Category
              </span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="text-sm font-bold text-white truncate" title={topCategoryName}>
              {topCategoryName}
            </div>

            <div className="text-xs font-mono tabular-nums font-bold text-slate-200 mt-0.5">
              {formatCurrency(topCategoryNet, currency)} net
            </div>
          </div>

          <div className="pt-2 border-t border-blue-500/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Share of Net:</span>
            <span className="font-mono font-bold text-white">
              {topCategoryShare.toFixed(1)}%
            </span>
          </div>
        </motion.div>

        {/* KPI 4: Cash Realization & Collection Efficiency */}
        <motion.div
          whileHover={{ y: -4, backgroundColor: '#132249', borderColor: 'rgba(96, 165, 250, 0.4)' }}
          onClick={hapticTap}
          className="p-3.5 rounded-lg bg-[#101c3d] border border-blue-500/15 flex flex-col justify-between space-y-2.5 cursor-pointer tactile-press transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Collection Rate
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
                {collectionRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">collected</span>
            </div>

            <div className="text-xs font-mono tabular-nums text-slate-300 mt-0.5">
              Settled: <span className="font-bold text-white">{formatCurrency(receivedNet, currency)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-500/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pending:</span>
            <span className={pendingCount > 0 ? 'text-rose-400 font-mono font-bold' : 'text-slate-400'}>
              {formatCurrency(pendingNet, currency)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Professional Work Digest Strip */}
      <div className="mt-4 p-3 rounded-lg bg-[#091126] border border-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs text-slate-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-950 flex items-center justify-center shrink-0 border border-blue-400/20">
            {pendingCount > 0 ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-white">
              {topCategory ? topCategoryName : 'Ledger Active'}
            </span>
            <span className="text-blue-500/30">·</span>
            <span>
              Margin: <strong className="font-mono text-white">{netProfitMargin.toFixed(1)}%</strong>
            </span>
            <span className="text-blue-500/30">·</span>
            <span className="font-medium text-slate-200">{collectionRate.toFixed(1)}% Settled</span>
            <span className="text-blue-500/30">·</span>
            <span className="text-slate-400 text-[11px]">
              {pendingCount > 0
                ? `${pendingCount} invoice(s) pending (${formatCurrency(pendingNet, currency)})`
                : 'All billings in period fully realized.'}
            </span>
          </div>
        </div>

        {onNavigateToLedger && (
          <button
            onClick={() => {
              hapticTap();
              onNavigateToLedger();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-white transition-colors shrink-0 cursor-pointer print:hidden tactile-btn"
          >
            <span>Open Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
