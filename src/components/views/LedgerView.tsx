import React from 'react';
import { Earning, FilterState } from '../../types';
import { FilterBar } from '../FilterBar';
import { EarningsTable } from '../EarningsTable';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, exportEarningsToCSV } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Plus,
  Printer,
  Download,
  Calendar,
} from 'lucide-react';

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
}) => {
  const { currency } = useAuth();

  const totalFilteredNet = filteredEarnings.reduce((acc, e) => acc + e.netAmount, 0);
  const totalFilteredGross = filteredEarnings.reduce((acc, e) => acc + e.grossAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Quick Stats & Print/Export Actions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Daily Transactions Ledger
                </h2>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredEarnings.length} records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-width audit ledger of every daily earning, tax deduction, and payment voucher
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary chips & Print / CSV / Add Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Net In View</span>
            <span className="text-sm font-bold font-mono tabular-nums text-emerald-400">
              {formatCurrency(totalFilteredNet, currency)}
            </span>
          </div>

          <button
            onClick={() => exportEarningsToCSV(filteredEarnings, currency)}
            disabled={filteredEarnings.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-40"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Print Financial Statement"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Ledger</span>
          </button>

          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Record Earning</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter & Search Engine */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        categories={categories}
        paymentMethods={paymentMethods}
        totalMatches={filteredEarnings.length}
      />

      {/* Comprehensive Full-Width Data Table with row-level edit & delete */}
      <EarningsTable
        earnings={filteredEarnings}
        onView={onView}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onNew={onNew}
      />
    </div>
  );
};
