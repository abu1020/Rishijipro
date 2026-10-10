import React from 'react';
import { motion } from 'framer-motion';
import { Earning, FilterState } from '../../types';
import { ExecutiveSummary } from '../ExecutiveSummary';
import { KpiCards } from '../KpiCards';
import { ChartsSection } from '../ChartsSection';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { formatHumanDate } from '../../utils/dateUtils';
import {
  TrendingUp,
  Receipt,
  ArrowRight,
  Plus,
  Clock,
  Printer,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  Target,
  Settings,
  Zap,
  Calculator,
  FileText,
} from 'lucide-react';
import { hapticTap, hapticPress, hapticSuccess } from '../../utils/haptics';

interface OverviewViewProps {
  earnings: Earning[];
  filteredEarnings: Earning[];
  filters: FilterState;
  onNavigateToLedger: () => void;
  onNavigateToAnalytics: () => void;
  onOpenNewEarningModal: () => void;
  onViewEarning: (earning: Earning) => void;
  onEditEarning: (earning: Earning) => void;
  onDeleteEarning: (earning: Earning) => void;
  onNavigateToGoals?: () => void;
  onNavigateToSettings?: () => void;
  onOpenCalculator?: () => void;
  onOpenMonthlySummary?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  earnings,
  filteredEarnings,
  filters,
  onNavigateToLedger,
  onNavigateToAnalytics,
  onOpenNewEarningModal,
  onViewEarning,
  onEditEarning,
  onDeleteEarning,
  onNavigateToGoals,
  onNavigateToSettings,
  onOpenCalculator,
  onOpenMonthlySummary,
}) => {
  const { currency, monthlyGoal } = useAuth();

  // Current Month Progress vs Monthly Goal
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(0, daysInCurrentMonth - currentDay);

  const currentMonthEarnings = earnings.filter((e) => e.date.startsWith(currentMonthPrefix));
  const currentMonthNet = currentMonthEarnings.reduce((acc, e) => acc + (e.netAmount || 0), 0);
  const currentMonthGross = currentMonthEarnings.reduce((acc, e) => acc + (e.grossAmount || 0), 0);

  const targetGoal = monthlyGoal > 0 ? monthlyGoal : 100000;
  const progressRatio = targetGoal > 0 ? currentMonthNet / targetGoal : 0;
  const progressPercent = Math.min(100, Math.max(0, progressRatio * 100));
  const isGoalAchieved = currentMonthNet >= targetGoal;
  const remainingAmount = Math.max(0, targetGoal - currentMonthNet);
  const surplusAmount = Math.max(0, currentMonthNet - targetGoal);

  const currentDailyPace = currentDay > 0 ? currentMonthNet / currentDay : 0;
  const requiredDailyPace = remainingAmount > 0 && daysRemaining > 0 ? remainingAmount / daysRemaining : 0;
  const projectedMonthEnd = currentDailyPace * daysInCurrentMonth;
  const projectedDiff = projectedMonthEnd - targetGoal;

  // Pending transactions
  const pendingItems = earnings.filter(
    (e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partially Paid'
  );
  const totalPendingAmount = pendingItems.reduce((acc, e) => acc + e.netAmount, 0);

  const handlePrint = () => {
    hapticSuccess();
    window.print();
  };

  const cardBaseStyle = 'bg-[var(--card-bg)] border border-blue-500/20 text-white shadow-sm';
  const subCardStyle = 'bg-[var(--card-subtle)] border border-blue-500/15 text-white';
  const dividerStyle = 'border-blue-500/15';

  return (
    <div className="space-y-6 pb-10 overflow-x-hidden">
      {/* 0. Executive Summary High-Level KPIs Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ExecutiveSummary
          earnings={earnings}
          onOpenNewEarningModal={onOpenNewEarningModal}
          onNavigateToLedger={onNavigateToLedger}
        />
      </motion.div>

      {/* 1. MINIMALIST MONTHLY GOAL PROGRESS SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`border rounded-xl p-5 sm:p-6 transition-all ${cardBaseStyle}`}
      >
        {/* Header Bar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${dividerStyle}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  {currentMonthName} Goal Progress
                </h2>
                <span className="text-blue-500/30">·</span>
                <span className="text-xs font-mono font-medium text-slate-300">
                  {currentMonthName} {currentYear}
                </span>
              </div>
              <p className="text-xs mt-0.5 text-slate-400">
                Target: <span className="font-bold font-mono text-white">{formatCurrency(targetGoal, currency)}</span> (configured in settings)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Status indicator */}
            <span className="text-xs font-mono font-bold">
              {isGoalAchieved ? (
                <span className="text-emerald-400">+{formatCurrency(surplusAmount, currency)} Surplus</span>
              ) : (
                <span className="text-white">
                  {progressPercent.toFixed(1)}% achieved
                </span>
              )}
            </span>

            {/* Monthly Summary PDF Action */}
            {onOpenMonthlySummary && (
              <button
                onClick={() => {
                  hapticPress();
                  onOpenMonthlySummary();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
                title="Generate formatted PDF statement"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Statement PDF</span>
              </button>
            )}

            {/* Settings Link */}
            {onNavigateToSettings && (
              <button
                onClick={() => {
                  hapticTap();
                  onNavigateToSettings();
                }}
                className="p-1.5 rounded-lg border border-blue-500/20 text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors cursor-pointer tactile-btn"
                title="Adjust Goal in Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Numbers & Visual Progress Bar Content */}
        <div className="py-4 space-y-3.5">
          {/* Top Numbers Comparison */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-baseline flex-wrap gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums text-white">
                {formatCurrency(currentMonthNet, currency)}
              </span>
              <span className="text-sm font-mono text-slate-400">
                / {formatCurrency(targetGoal, currency)}
              </span>
            </div>

            <div className="text-xs">
              {isGoalAchieved ? (
                <span className="text-emerald-400 font-bold">Monthly goal surpassed!</span>
              ) : (
                <span className="text-slate-300">
                  <strong className="font-mono font-bold text-emerald-400">
                    {formatCurrency(remainingAmount, currency)}
                  </strong>{' '}
                  to reach target
                </span>
              )}
            </div>
          </div>

          {/* Clean hairline progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-[var(--app-bg)] relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all duration-500 relative ${
                  isGoalAchieved ? 'bg-emerald-400' : 'bg-blue-500'
                }`}
              >
                {progressPercent > 80 && !isGoalAchieved && (
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20"
                  />
                )}
                {isGoalAchieved && (
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
              </motion.div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>0%</span>
              <span>50%</span>
              <span>100% ({formatCurrency(targetGoal, currency)})</span>
            </div>
          </div>

          {/* 4-Column Pacing & Insights Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: '#132249' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardStyle}`}
            >
              <span className="text-[11px] font-bold flex items-center gap-1.5 text-slate-300">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Current Run-Rate
              </span>
              <div className="text-sm font-bold font-mono mt-1 text-white">
                {formatCurrency(currentDailyPace, currency)}
                <span className="text-[10px] text-slate-400 font-normal"> / day</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Day {currentDay} of {daysInCurrentMonth}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: '#132249' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardStyle}`}
            >
              <span className="text-[11px] font-bold flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3 h-3 text-amber-400" />
                Required Pace
              </span>
              <div className="text-sm font-bold font-mono mt-1 text-white">
                {isGoalAchieved ? 'Target Met' : `${formatCurrency(requiredDailyPace, currency)} / day`}
              </div>
              <span className="text-[10px] text-slate-400">
                {isGoalAchieved ? 'Surplus running' : `${daysRemaining} days remaining`}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: '#132249' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardStyle}`}
            >
              <span className="text-[11px] font-bold flex items-center gap-1.5 text-slate-300">
                <Target className="w-3 h-3 text-sky-400" />
                Projected Finish
              </span>
              <div className="text-sm font-bold font-mono mt-1 text-white">
                {formatCurrency(projectedMonthEnd, currency)}
              </div>
              <span className="text-[10px] text-slate-400">
                {projectedDiff >= 0
                  ? `+${formatCurrency(projectedDiff, currency)} over goal`
                  : `${formatCurrency(Math.abs(projectedDiff), currency)} to target`}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: '#132249' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardStyle}`}
            >
              <span className="text-[11px] font-bold flex items-center gap-1.5 text-slate-300">
                <Receipt className="w-3 h-3 text-blue-400" />
                Gross Billed
              </span>
              <div className="text-sm font-bold font-mono mt-1 text-white">
                {formatCurrency(currentMonthGross, currency)}
              </div>
              <span className="text-[10px] text-slate-400">
                {currentMonthEarnings.length} records this month
              </span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2. Key Performance Indicator (KPI) Cards & Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Period Financial Overview
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-400">
              ({filteredEarnings.length} entries)
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
            title="Print Summary Report"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print</span>
          </button>
        </div>

        <KpiCards
          earnings={filteredEarnings}
          startDate={filters.startDate}
          endDate={filters.endDate}
        />
      </motion.div>

      {/* 3. Visual Charts Preview & Trends */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Revenue Trends & Distribution</span>
          </h3>
          <button
            onClick={() => {
              hapticTap();
              onNavigateToAnalytics();
            }}
            className="text-xs font-semibold flex items-center gap-1 text-blue-300 hover:text-white transition-colors cursor-pointer tactile-btn"
          >
            <span>Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ChartsSection earnings={filteredEarnings} />
      </motion.div>

      {/* 4. Cash Flow & Pending Collections Action Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Pending Receivables Column */}
        <div className={`border rounded-xl p-5 flex flex-col justify-between ${cardBaseStyle}`}>
          <div>
            <div className={`flex items-center justify-between pb-3.5 border-b ${dividerStyle}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Pending Receivables
                  </h4>
                  <p className="text-[11px] text-slate-400">Unsettled invoices</p>
                </div>
              </div>

              <button
                onClick={() => {
                  hapticTap();
                  onNavigateToLedger();
                }}
                className="text-xs font-semibold flex items-center gap-1 text-blue-300 hover:text-white transition-colors cursor-pointer tactile-btn"
              >
                <span>Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className={`my-4 p-3.5 rounded-lg border text-center ${subCardStyle}`}>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Total Pending to Collect
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400 mt-0.5">
                {formatCurrency(totalPendingAmount, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pendingItems.length === 0
                  ? 'All invoices have been settled in full'
                  : `${pendingItems.length} invoice${pendingItems.length === 1 ? '' : 's'} awaiting payout`}
              </p>
            </div>

            {/* Top pending invoices list */}
            {pendingItems.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Invoices
                </span>
                {pendingItems.slice(0, 4).map((item) => (
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: 'var(--card-hover-bg)' }}
                    key={item.id}
                    className="p-2.5 rounded-lg border border-blue-500/15 hover:border-blue-400/35 bg-[var(--card-subtle)] flex items-center justify-between text-xs transition-colors group"
                  >
                    <div
                      onClick={() => {
                        hapticTap();
                        onViewEarning(item);
                      }}
                      className="min-w-0 cursor-pointer flex-1"
                    >
                      <div className="font-bold truncate text-white">
                        {item.clientName || item.category}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatHumanDate(item.date)} · {item.category}
                        {item.referenceId && ` · #${item.referenceId}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div className="font-mono tabular-nums font-bold text-white">
                          {formatCurrency(item.netAmount, currency)}
                        </div>
                        <span className="text-[10px] text-rose-400 font-bold">
                          Pending
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          hapticPress();
                          onEditEarning(item);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors tactile-btn cursor-pointer"
                        title="Edit Earning"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1.5" />
                <span>Zero pending receivables</span>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-blue-500/15 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {pendingItems.length} unsettled transaction{pendingItems.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => {
                hapticPress();
                onOpenNewEarningModal();
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer tactile-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record invoice</span>
            </button>
          </div>
        </div>

        {/* Quick Tools & Fast Actions Column */}
        <div className={`border rounded-xl p-5 flex flex-col justify-between ${cardBaseStyle}`}>
          <div>
            <div className={`flex items-center justify-between pb-3.5 border-b ${dividerStyle}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[var(--button-bg)]/50 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/20">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Productivity Hub
                  </h4>
                  <p className="text-[11px] text-slate-400">Fast shortcuts & accounting tools</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3.5">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-lg border flex items-center justify-between ${subCardStyle}`}
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Quick Entry
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Log revenue, bill, invoice, or daily earning
                  </div>
                </div>
                <button
                  onClick={() => {
                    hapticPress();
                    onOpenNewEarningModal();
                  }}
                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-blue-50 text-slate-950 transition-colors cursor-pointer flex items-center gap-1 shrink-0 border border-white shadow-xs tactile-btn"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>New Entry</span>
                </button>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-lg border flex items-center justify-between ${subCardStyle}`}
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Transactions Ledger
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Search, filter, bulk update, and export
                  </div>
                </div>
                <button
                  onClick={() => {
                    hapticTap();
                    onNavigateToLedger();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0 tactile-btn"
                >
                  <span>Open Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>

              {onOpenCalculator && (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border flex items-center justify-between ${subCardStyle}`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-white">
                      <Calculator className="w-3 h-3 text-blue-400" />
                      <span>GST & TDS Calculator</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sections 194J/C/I, CGST/SGST/IGST, Advance Tax
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      hapticPress();
                      onOpenCalculator();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0 tactile-btn"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>
              )}

              {onOpenMonthlySummary && (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border flex items-center justify-between ${subCardStyle}`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-white">
                      <FileText className="w-3 h-3 text-blue-400" />
                      <span>Monthly Summary Statement</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Printable A4 summary with tax deduction breakdown
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      hapticPress();
                      onOpenMonthlySummary();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0 tactile-btn"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print PDF</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
