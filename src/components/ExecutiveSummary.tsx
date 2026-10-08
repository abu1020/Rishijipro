import React from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  Briefcase,
  TrendingUp,
  Percent,
  Award,
  ShieldCheck,
  Printer,
  Plus,
  ArrowUpRight,
  Clock,
  PieChart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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

  // If no transactions yet in the current month, fall back gracefully to all current active earnings
  const activeDataset = monthEarnings.length > 0 ? monthEarnings : earnings;
  const isFallbackAllTime = monthEarnings.length === 0 && earnings.length > 0;

  // 1. Total Monthly Revenue (Gross & Net)
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

  const marginHealthDescriptor =
    netProfitMargin >= 75
      ? 'exceptionally strong'
      : netProfitMargin >= 50
      ? 'healthy'
      : netProfitMargin >= 25
      ? 'moderate'
      : 'compressed';

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all hover:border-slate-750">
      {/* Executive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <Briefcase className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Executive Financial Summary
              </h2>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-semibold text-emerald-400">
                {isFallbackAllTime ? 'All-Time Aggregated' : `${currentMonthName} ${currentYear} MTD`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>High-level monthly KPIs, operating margins & revenue concentration</span>
              <span className="text-slate-600 hidden md:inline">·</span>
              <span className="text-slate-500 hidden md:inline">Real-Time Cloud Sync</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Print Executive Brief"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Brief</span>
          </button>

          {onOpenNewEarningModal && (
            <button
              onClick={onOpenNewEarningModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Record Earning</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        {/* KPI 1: Total Monthly Revenue */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Monthly Revenue
              </span>
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {formatCurrency(totalGross, currency)}
            </div>

            <div className="text-xs font-medium text-emerald-400 font-mono tabular-nums mt-0.5">
              Net: {formatCurrency(totalNet, currency)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Volume: {activeDataset.length} entries</span>
            <span>Avg: {formatCurrency(averageDealSize, currency)}</span>
          </div>
        </div>

        {/* KPI 2: Net Profit Margin Percentage */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Net Profit Margin
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums">
                {netProfitMargin.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">retention</span>
            </div>

            {/* Retention Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, netProfitMargin))}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Taxes & Cuts:</span>
            <span className="text-amber-400 font-mono tabular-nums">
              -{formatCurrency(totalDeductions, currency)} ({deductionRatio.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* KPI 3: Top-Performing Category */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Top Performing Category
              </span>
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-base font-bold text-white tracking-tight truncate" title={topCategoryName}>
              {topCategoryName}
            </div>

            <div className="text-xs font-mono tabular-nums text-emerald-400 mt-0.5">
              {formatCurrency(topCategoryNet, currency)} net take-home
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Share of Net:</span>
            <span className="text-white font-mono tabular-nums font-semibold">
              {topCategoryShare.toFixed(1)}% of total
            </span>
          </div>
        </div>

        {/* KPI 4: Cash Realization & Collection Efficiency */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                Cash Realization
              </span>
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-cyan-400 font-mono tabular-nums">
                {collectionRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">settled</span>
            </div>

            <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
              Collected: {formatCurrency(receivedNet, currency)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pending Payout:</span>
            <span className={pendingCount > 0 ? 'text-rose-400 font-mono font-medium' : 'text-slate-500'}>
              {formatCurrency(pendingNet, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Professional Work Digest & Ledger Action Strip */}
      <div className="mt-5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              pendingCount > 0
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            }`}
          >
            {pendingCount > 0 ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">
                {topCategory ? topCategoryName : 'All Ledger Entries'}
              </span>
              <span className="text-slate-600 font-mono hidden sm:inline">·</span>
              <span className="text-emerald-400 font-mono font-medium">
                {topCategory ? `${topCategoryShare.toFixed(1)}% of net income` : 'Ready'}
              </span>
              <span className="text-slate-600 font-mono hidden sm:inline">·</span>
              <span className="text-slate-300">
                Operating Margin: <strong className="text-white font-mono">{netProfitMargin.toFixed(1)}%</strong>
              </span>
              <span className="text-slate-600 font-mono hidden sm:inline">·</span>
              <span className="text-cyan-400 font-mono font-medium">
                {collectionRate.toFixed(1)}% Settled
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {pendingCount > 0
                ? `${pendingCount} transaction(s) pending settlement (${formatCurrency(pendingNet, currency)})`
                : 'All recorded earnings in this billing period are fully realized.'}
            </p>
          </div>
        </div>

        {onNavigateToLedger && (
          <button
            onClick={onNavigateToLedger}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-colors shrink-0 cursor-pointer print:hidden"
          >
            <span>View Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
      </div>
    </section>
  );
};
