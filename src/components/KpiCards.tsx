import React from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getDaysCountBetween } from '../utils/dateUtils';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { hapticTap } from '../utils/haptics';

interface KpiCardsProps {
  earnings: Earning[];
  startDate: string;
  endDate: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  earnings,
  startDate,
  endDate,
}) => {
  const { currency } = useAuth();

  // Dynamic calculations based strictly on current filtered records
  const totalGross = earnings.reduce((sum, item) => sum + (item.grossAmount || 0), 0);
  const totalDeductions = earnings.reduce((sum, item) => sum + (item.deductions || 0), 0);
  const totalNet = earnings.reduce((sum, item) => sum + (item.netAmount || 0), 0);

  const pendingAmount = earnings
    .filter((item) => item.paymentStatus === 'Pending' || item.paymentStatus === 'Partially Paid')
    .reduce((sum, item) => sum + (item.netAmount || 0), 0);

  const pendingCount = earnings.filter(
    (item) => item.paymentStatus === 'Pending' || item.paymentStatus === 'Partially Paid'
  ).length;

  const effectiveDeductionRate = totalGross > 0 ? totalDeductions / totalGross : 0;

  // Daily average calculation
  let daysInPeriod = 1;
  if (startDate && endDate) {
    daysInPeriod = getDaysCountBetween(startDate, endDate);
  } else if (earnings.length > 0) {
    const dates = earnings.map((e) => e.date).sort();
    daysInPeriod = getDaysCountBetween(dates[0], dates[dates.length - 1]);
  }
  const dailyAverage = daysInPeriod > 0 ? totalNet / daysInPeriod : totalNet;

  const cardStyle = "bg-[#0d1630] border border-blue-500/20 hover:border-blue-400/40 rounded-xl p-4 transition-all cursor-pointer shadow-sm tactile-press";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Realized Net Earnings (Hero Metric with White Accents) */}
      <div
        onClick={hapticTap}
        className={cardStyle}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Realized Net Profit
          </span>
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1 truncate"
          title={formatCurrency(totalNet, currency)}
        >
          {formatCurrency(totalNet, currency)}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>Net take-home</span>
          <span>·</span>
          <span className="font-mono text-slate-200 font-semibold">{earnings.length} entries</span>
        </div>
      </div>

      {/* 2. Total Gross Invoiced */}
      <div
        onClick={hapticTap}
        className={cardStyle}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Gross Billed
          </span>
          <div className="w-6 h-6 rounded-md bg-blue-900/60 text-blue-300 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1 truncate"
          title={formatCurrency(totalGross, currency)}
        >
          {formatCurrency(totalGross, currency)}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>Before tax deductions</span>
        </div>
      </div>

      {/* 3. Taxes & Deductions */}
      <div
        onClick={hapticTap}
        className={cardStyle}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Taxes & TDS
          </span>
          <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1 truncate"
          title={formatCurrency(totalDeductions, currency)}
        >
          {formatCurrency(totalDeductions, currency)}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="text-amber-400 font-mono font-bold">
            {formatPercent(effectiveDeductionRate)}
          </span>
          <span>·</span>
          <span>Effective rate</span>
        </div>
      </div>

      {/* 4. Pending Receivables to Collect */}
      <div
        onClick={hapticTap}
        className={cardStyle}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Pending Receivables
          </span>
          <div className="w-6 h-6 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1 truncate"
          title={formatCurrency(pendingAmount, currency)}
        >
          {formatCurrency(pendingAmount, currency)}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className={pendingCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
            {pendingCount} invoice{pendingCount === 1 ? '' : 's'}
          </span>
          <span>·</span>
          <span>Unsettled</span>
        </div>
      </div>

      {/* 5. Daily Pacing Velocity */}
      <div
        onClick={hapticTap}
        className={cardStyle}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Daily Velocity
          </span>
          <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1 truncate"
          title={formatCurrency(dailyAverage, currency)}
        >
          {formatCurrency(dailyAverage, currency)}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>Avg / day</span>
          <span>·</span>
          <span className="font-mono text-slate-300 font-medium">{daysInPeriod}d period</span>
        </div>
      </div>
    </div>
  );
};
