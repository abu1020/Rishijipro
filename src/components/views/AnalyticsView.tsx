import React from 'react';
import { motion } from 'framer-motion';
import { Earning, FilterState } from '../../types';
import { FilterBar } from '../FilterBar';
import { ChartsSection } from '../ChartsSection';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  BarChart3,
  Printer,
  Download,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { exportEarningsToCSV } from '../../utils/formatters';
import { hapticTap, hapticPress, hapticSuccess } from '../../utils/haptics';

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
    hapticSuccess();
    window.print();
  };

  const panelClass = 'bg-[var(--card-bg)] border border-blue-500/20 text-white shadow-sm';
  const subCardClass = 'bg-[var(--card-subtle)] border border-blue-500/15 text-white';
  const dividerClass = 'border-blue-500/15';

  return (
    <div className="space-y-5 pb-10 overflow-x-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${panelClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--button-bg)]/50 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Financial Analytics & Visual Reports
            </h2>
            <p className="text-xs mt-0.5 text-slate-400">
              Breakdowns, tax withholding metrics, and payment distribution analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              hapticPress();
              exportEarningsToCSV(filteredEarnings, currency);
              hapticSuccess();
            }}
            disabled={filteredEarnings.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer disabled:opacity-40 tactile-btn"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print</span>
          </button>
        </div>
      </motion.div>

      {/* Filter Engine */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        categories={categories}
        paymentMethods={paymentMethods}
      />

      {/* Visual Charts */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ChartsSection earnings={filteredEarnings} />
      </motion.div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Channels Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`border rounded-xl p-4 sm:p-5 transition-colors ${panelClass}`}
        >
          <div className={`flex items-center gap-2.5 pb-3 border-b ${dividerClass}`}>
            <div className="w-7 h-7 rounded-md bg-[var(--button-bg)]/50 text-blue-300 flex items-center justify-center border border-blue-400/20">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Payment Channels
              </h4>
              <p className="text-[11px] text-slate-400">Net revenue by payout method</p>
            </div>
          </div>

          <div className="divide-y divide-blue-500/10 mt-2">
            {methodList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No data for selected period</div>
            ) : (
              methodList.map(([method, amount]) => {
                const pct = totalNet > 0 ? (amount / totalNet) * 100 : 0;
                return (
                  <motion.div
                    key={method}
                    whileHover={{ x: 4, backgroundColor: 'rgba(30, 58, 138, 0.3)' }}
                    onClick={hapticTap}
                    className="py-2.5 flex items-center justify-between text-xs cursor-pointer tactile-press rounded px-1.5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate text-slate-200">
                        {method}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(amount, currency)}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 w-10 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Settlement Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`border rounded-xl p-4 sm:p-5 transition-colors ${panelClass}`}
        >
          <div className={`flex items-center gap-2.5 pb-3 border-b ${dividerClass}`}>
            <div className="w-7 h-7 rounded-md bg-[var(--button-bg)]/50 text-blue-300 flex items-center justify-center border border-blue-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Settlement Status
              </h4>
              <p className="text-[11px] text-slate-400">Collected vs outstanding</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {/* Received */}
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: 'var(--card-hover-bg)' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardClass}`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Received</span>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(
                  statusMap.Received.reduce((acc, e) => acc + e.netAmount, 0),
                  currency
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {statusMap.Received.length} records
              </span>
            </motion.div>

            {/* Pending */}
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: 'var(--card-hover-bg)' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardClass}`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending</span>
              <div className="text-sm font-bold font-mono text-rose-400 mt-1">
                {formatCurrency(
                  statusMap.Pending.reduce((acc, e) => acc + e.netAmount, 0),
                  currency
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {statusMap.Pending.length} records
              </span>
            </motion.div>

            {/* Partially Paid */}
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: 'var(--card-hover-bg)' }}
              onClick={hapticTap}
              className={`p-3 rounded-lg border cursor-pointer tactile-press ${subCardClass}`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Partial</span>
              <div className="text-sm font-bold font-mono text-amber-400 mt-1">
                {formatCurrency(
                  statusMap['Partially Paid'].reduce((acc, e) => acc + e.netAmount, 0),
                  currency
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {statusMap['Partially Paid'].length} records
              </span>
            </motion.div>
          </div>

          <div className="mt-3.5 p-2.5 rounded-lg border bg-[var(--card-subtle)] border-blue-500/15 text-slate-200 flex items-center justify-between text-xs">
            <span>Effective Tax / TDS Rate:</span>
            <span className="font-mono font-bold text-white">
              {formatPercent(effectiveTaxRate)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
