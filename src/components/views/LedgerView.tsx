import React from 'react';
import { Earning, FilterState, PaymentStatus } from '../../types';
import { FilterBar } from '../FilterBar';
import { EarningsTable } from '../EarningsTable';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, exportEarningsToCSV } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Plus,
  Printer,
  Download,
  Calculator,
} from 'lucide-react';
import { hapticTap, hapticPress, hapticSuccess } from '../../utils/haptics';

interface LedgerViewProps {
  earnings: Earning[];
  filteredEarnings: Earning[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  paymentMethods: string[];
  onView: (earning: Earning) => void;
  onEdit: (earning: Earning) => void;
  onDuplicate: (earning: Earning) => void;
  onDelete: (earning: Earning) => void;
  onNew: () => void;
  onBulkUpdateStatus?: (ids: string[], status: PaymentStatus) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onOpenCalculator?: () => void;
  onOpenMonthlySummary?: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  earnings,
  filteredEarnings,
  filters,
  onFilterChange,
  categories,
  paymentMethods,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onNew,
  onBulkUpdateStatus,
  onBulkDelete,
  onOpenCalculator,
  onOpenMonthlySummary,
}) => {
  const { currency } = useAuth();

  const totalFilteredNet = filteredEarnings.reduce((acc, e) => acc + e.netAmount, 0);

  const handlePrint = () => {
    hapticSuccess();
    window.print();
  };

  const topCardClass = 'bg-[var(--card-bg)] border border-blue-500/20 text-white shadow-sm';

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      {/* Top Bar with Quick Stats & Print/Export Actions */}
      <div
        className={`border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${topCardClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--button-bg)]/50 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/20">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Transactions Ledger
              </h2>
              <span className="text-blue-500/30">·</span>
              <span className="text-xs font-mono font-medium text-slate-300">
                {filteredEarnings.length} records
              </span>
            </div>
            <p className="text-xs mt-0.5 text-slate-400">
              Comprehensive ledger of daily earnings, tax deductions, and payment status
            </p>
          </div>
        </div>

        {/* Quick summary & actions */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="px-3 py-1.5 rounded-lg border bg-[var(--card-subtle)] border-blue-500/15 text-right">
            <span className="text-[10px] uppercase font-bold block text-slate-400">
              Total Net in View
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-white">
              {formatCurrency(totalFilteredNet, currency)}
            </span>
          </div>

          {onOpenCalculator && (
            <button
              onClick={() => {
                hapticPress();
                onOpenCalculator();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
              title="GST & TDS Tax Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Tax Calculator</span>
            </button>
          )}

          <button
            onClick={() => {
              hapticPress();
              exportEarningsToCSV(filteredEarnings, currency);
              hapticSuccess();
            }}
            disabled={filteredEarnings.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer disabled:opacity-40 tactile-btn"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
            title="Print Financial Statement"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print</span>
          </button>

          {onOpenMonthlySummary && (
            <button
              onClick={() => {
                hapticPress();
                onOpenMonthlySummary();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
              title="Monthly PDF statement"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Monthly PDF</span>
            </button>
          )}

          <button
            onClick={() => {
              hapticPress();
              onNew();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-blue-50 text-slate-950 shadow-sm border border-white transition-all cursor-pointer tactile-btn"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Record Earning</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        categories={categories}
        paymentMethods={paymentMethods}
      />

      {/* Data Table */}
      <EarningsTable
        earnings={filteredEarnings}
        onView={onView}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onNew={onNew}
        onBulkUpdateStatus={onBulkUpdateStatus}
        onBulkDelete={onBulkDelete}
      />
    </div>
  );
};
