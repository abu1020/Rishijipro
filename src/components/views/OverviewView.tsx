import React from 'react';
import { Earning, FilterState } from '../../types';
import { ExecutiveSummary } from '../ExecutiveSummary';
import { KpiCards } from '../KpiCards';
import { FinancialGoals } from '../FinancialGoals';
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
  ShieldCheck,
  Printer,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

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
}) => {
  const { currency } = useAuth();

  // Pending transactions
  const pendingItems = earnings.filter(
    (e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partially Paid'
  );
  const totalPendingAmount = pendingItems.reduce((acc, e) => acc + e.netAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 0. Executive Summary High-Level KPIs Widget */}
      <ExecutiveSummary
        earnings={earnings}
        onOpenNewEarningModal={onOpenNewEarningModal}
        onNavigateToLedger={onNavigateToLedger}
      />

      {/* 1. Financial Goals & Monthly Net Progress (Hero Section) */}
      <FinancialGoals earnings={earnings} />

      {/* 2. Key Performance Indicator (KPI) Cards & Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Period Financial Metrics
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              ({filteredEarnings.length} records)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Summary Report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Summary</span>
            </button>
          </div>
        </div>

        <KpiCards
          earnings={filteredEarnings}
          startDate={filters.startDate}
          endDate={filters.endDate}
        />
      </div>

      {/* 3. Visual Charts Preview & Trends */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Performance & Revenue Breakdown
          </h3>
          <button
            onClick={onNavigateToAnalytics}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Detailed Analytics & Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ChartsSection earnings={filteredEarnings} />
      </div>

      {/* 4. Cash Flow & Pending Collections Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Receivables Column */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Pending Receivables
                  </h4>
                  <p className="text-[11px] text-slate-400">Unsettled client invoices</p>
                </div>
              </div>

              <button
                onClick={onNavigateToLedger}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Pending to Collect
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-400 mt-1">
                {formatCurrency(totalPendingAmount, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {pendingItems.length === 0
                  ? 'All invoices have been settled in full'
                  : `${pendingItems.length} invoice${pendingItems.length === 1 ? '' : 's'} awaiting settlement`}
              </p>
            </div>

            {/* Top pending invoices list */}
            {pendingItems.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Actionable Pending Invoices
                </span>
                {pendingItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors group"
                  >
                    <div
                      onClick={() => onViewEarning(item)}
                      className="min-w-0 cursor-pointer flex-1"
                    >
                      <div className="font-semibold text-slate-200 truncate">
                        {item.clientName || item.category}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatHumanDate(item.date)} · {item.category}
                        {item.referenceId && ` · #${item.referenceId}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div className="font-mono tabular-nums font-bold text-white">
                          {formatCurrency(item.netAmount, currency)}
                        </div>
                        <span className="text-[10px] text-rose-400 font-semibold">
                          {item.paymentStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditEarning(item)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Edit Bill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEarning(item)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1.5" />
                <span className="text-slate-300 font-medium">100% Cash Flow Realized</span>
                <span className="text-slate-500 text-[11px] mt-0.5">
                  No unpaid or pending receivables in your ledger
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Audit-ready payment tracking</span>
            <button
              onClick={onNavigateToLedger}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Open Ledger →
            </button>
          </div>
        </div>

        {/* Ledger & Financial Actions Quick Hub */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Transactions Hub
                  </h4>
                  <p className="text-[11px] text-slate-400">Ledger shortcuts & actions</p>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {earnings.length} Total Entries
              </span>
            </div>

            <div className="my-5 space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Record Daily Transaction</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Log new revenue, bill, invoice, or freelance earnings
                  </div>
                </div>
                <button
                  onClick={onOpenNewEarningModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Entry</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Open Transactions Ledger</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Search, filter, edit, duplicate, and export all entries
                  </div>
                </div>
                <button
                  onClick={onNavigateToLedger}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Visual Reports & Analytics</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Inspect category distribution and monthly growth trends
                  </div>
                </div>
                <button
                  onClick={onNavigateToAnalytics}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted and private to your verified account</span>
          </div>
        </div>
      </div>
    </div>
  );
};
