import React, { useState } from 'react';
import { Earning, FilterState } from '../../types';
import { FilterBar } from '../FilterBar';
import { ChartsSection } from '../ChartsSection';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Printer,
  Download,
  Calendar,
  Layers,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { exportEarningsToCSV } from '../../utils/formatters';

interface AnalyticsViewProps {
  earnings: Earning[];
  filteredEarnings: Earning[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  paymentMethods: string[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  earnings,
  filteredEarnings,
  filters,
  onFilterChange,
  categories,
  paymentMethods,
}) => {
  const { currency } = useAuth();

  // Metrics
  const totalNet = filteredEarnings.reduce((acc, e) => acc + e.netAmount, 0);
  const totalGross = filteredEarnings.reduce((acc, e) => acc + e.grossAmount, 0);
  const totalDeductions = filteredEarnings.reduce((acc, e) => acc + e.deductions, 0);
  const effectiveTaxRate = totalGross > 0 ? totalDeductions / totalGross : 0;

  // Group by Payment Method
  const methodMap: { [key: string]: number } = {};
  filteredEarnings.forEach((e) => {
    const m = e.paymentMethod || 'Direct / Other';
    methodMap[m] = (methodMap[m] || 0) + e.netAmount;
  });
  const methodList = Object.entries(methodMap).sort((a, b) => b[1] - a[1]);

  // Group by Payment Status
  const statusMap = {
    Received: filteredEarnings.filter((e) => e.paymentStatus === 'Received'),
    Pending: filteredEarnings.filter((e) => e.paymentStatus === 'Pending'),
    'Partially Paid': filteredEarnings.filter((e) => e.paymentStatus === 'Partially Paid'),
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Financial Analytics & Visual Reports
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Comprehensive breakdowns, tax withholding metrics, and payment distribution analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportEarningsToCSV(filteredEarnings, currency)}
            disabled={filteredEarnings.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Engine */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        categories={categories}
        paymentMethods={paymentMethods}
        totalMatches={filteredEarnings.length}
      />

      {/* Visual Charts (Trend + Category Breakdown) */}
      <ChartsSection earnings={filteredEarnings} />

      {/* Distribution Cards: Payment Methods & Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Payment Channel Share</h4>
              <p className="text-[11px] text-slate-400">Total net revenue by payout method</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60 mt-3">
            {methodList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No data for selected period</div>
            ) : (
              methodList.map(([method, amount]) => {
                const pct = totalNet > 0 ? (amount / totalNet) * 100 : 0;
                return (
                  <div key={method} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span className="font-semibold text-slate-200 truncate">{method}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(amount, currency)}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Settlement Status Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Settlement Status Breakdown</h4>
              <p className="text-[11px] text-slate-400">Collected vs outstanding revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4">
            {/* Received */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Received</span>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(
                  statusMap.Received.reduce((acc, e) => acc + e.netAmount, 0),
                  currency
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {statusMap.Received.length} record{statusMap.Received.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Pending */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Pending</span>
              <div className="text-base font-bold font-mono text-rose-400 mt-1">
                {formatCurrency(
                  statusMap.Pending.reduce((acc, e) => acc + e.netAmount, 0),
                  currency
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {statusMap.Pending.length} record{statusMap.Pending.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Partially Paid */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Partial</span>
              <div className="text-base font-bold font-mono text-amber-400 mt-1">
                {formatCurrency(
                  statusMap['Partially Paid'].reduce((acc, e) => acc + e.netAmount, 0),
                  currency
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {statusMap['Partially Paid'].length} record{statusMap['Partially Paid'].length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Effective Tax / Deduction Withholding:</span>
            <span className="font-mono font-bold text-amber-400">
              {formatPercent(effectiveTaxRate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
