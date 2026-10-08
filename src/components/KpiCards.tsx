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
  Percent,
  ArrowUpRight,
} from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Realized Net Earnings (Hero Metric) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden transition-colors hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Realized Net Profit
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1">
          {formatCurrency(totalNet, currency)}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Realized take-home</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">{earnings.length} entries</span>
        </div>
      </div>

      {/* 2. Total Gross Invoiced */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden transition-colors hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Gross Billed
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-200 font-mono tabular-nums mb-1">
          {formatCurrency(totalGross, currency)}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Before deductions</span>
          <span className="text-slate-600">·</span>
          <span>In period</span>
        </div>
      </div>

      {/* 3. Taxes & Deductions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden transition-colors hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Taxes & Deductions
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-amber-400 font-mono tabular-nums mb-1">
          {formatCurrency(totalDeductions, currency)}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="text-amber-300 font-mono">{formatPercent(effectiveDeductionRate)}</span>
          <span className="text-slate-600">·</span>
          <span>Effective rate</span>
        </div>
      </div>

      {/* 4. Pending Receivables to Collect */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden transition-colors hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
            Pending Receivables
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1">
          {formatCurrency(pendingAmount, currency)}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className={pendingCount > 0 ? 'text-rose-400 font-medium' : 'text-slate-500'}>
            {pendingCount} invoice{pendingCount === 1 ? '' : 's'}
          </span>
          <span className="text-slate-600">·</span>
          <span>Awaiting payout</span>
        </div>
      </div>

      {/* 5. Daily Average Pace */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden transition-colors hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            Daily Average
          </span>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums mb-1">
          {formatCurrency(dailyAverage, currency)}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Across {daysInPeriod} day{daysInPeriod === 1 ? '' : 's'}</span>
          <span className="text-slate-600">·</span>
          <span>Run rate</span>
        </div>
      </div>
    </div>
  );
};
