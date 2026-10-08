import React, { useState, useMemo } from 'react';
import { Earning, PaymentStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { formatHumanDate } from '../utils/dateUtils';
import { exportEarningsToCSV } from '../utils/formatters';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Receipt,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface EarningsTableProps {
  earnings: Earning[];
  onView: (earning: Earning) => void;
  onEdit: (earning: Earning) => void;
  onDuplicate: (earning: Earning) => void;
  onDelete: (earning: Earning) => void;
  onNew: () => void;
}

type SortField =
  | 'date'
  | 'grossAmount'
  | 'deductions'
  | 'netAmount'
  | 'category'
  | 'paymentStatus'
  | 'clientName';
type SortOrder = 'asc' | 'desc';

export const EarningsTable: React.FC<EarningsTableProps> = ({
  earnings,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onNew,
}) => {
  const { currency } = useAuth();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(
        field === 'date' || field === 'grossAmount' || field === 'netAmount' ? 'desc' : 'asc'
      );
    }
  };

  const sortedEarnings = useMemo(() => {
    return [...earnings].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [earnings, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedEarnings.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedEarnings = sortedEarnings.slice(startIndex, startIndex + pageSize);

  // Sync currentPage whenever totalPages shrinks due to filtering
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, Math.min(p, totalPages) - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1));
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Received</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Pending</span>
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Partial</span>
          </span>
        );
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-400" />
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Header with Title, Count and Quick CSV Export */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Recorded Transactions
            </h3>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">
              {earnings.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-ready daily ledger with instant view, edit, duplicate, and delete actions
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={() => exportEarningsToCSV(sortedEarnings, currency)}
            disabled={earnings.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {earnings.length === 0 ? (
        <div className="p-10 sm:p-14 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mb-3">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">No transactions found</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            No entries match your active date, category, or search filters. Clear filters or record a new daily earning.
          </p>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record New Earning</span>
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. MOBILE RESPONSIVE CARD FEED (block md:hidden) - ZERO HORIZONTAL SCROLL */}
          {/* ========================================================================= */}
          <div className="block md:hidden divide-y divide-slate-800/80">
            {paginatedEarnings.map((earning) => (
              <div
                key={earning.id}
                className="p-4 hover:bg-slate-800/30 transition-colors space-y-3"
              >
                {/* Top Row: Date, Client, Net Amount */}
                <div
                  onClick={() => onView(earning)}
                  className="flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-white">
                        {formatHumanDate(earning.date)}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-slate-500">{earning.date}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-100 truncate">
                      {earning.clientName || earning.category}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{earning.category}</span>
                      {earning.paymentMethod && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">{earning.paymentMethod}</span>
                        </>
                      )}
                      {earning.referenceId && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            #{earning.referenceId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Net Amount & Status */}
                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-bold text-emerald-400 text-base">
                      {formatCurrency(earning.netAmount, currency)}
                    </div>
                    <div className="mt-1">{getStatusBadge(earning.paymentStatus)}</div>
                  </div>
                </div>

                {/* Sub-Metric Breakdown (Gross vs Deductions) */}
                <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono">
                  <div className="text-slate-400">
                    Gross: <span className="text-slate-200">{formatCurrency(earning.grossAmount, currency)}</span>
                  </div>
                  <div className="text-slate-400">
                    Deductions:{' '}
                    {earning.deductions > 0 ? (
                      <span className="text-amber-400">-{formatCurrency(earning.deductions, currency)}</span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </div>
                </div>

                {/* Mobile Action Bar: Touch Targets >= 44px */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => onView(earning)}
                    className="flex-1 min-h-[42px] py-2 px-2.5 rounded-xl bg-slate-800/90 active:bg-slate-750 text-slate-300 active:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/80 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voucher</span>
                  </button>

                  <button
                    onClick={() => onEdit(earning)}
                    className="flex-1 min-h-[42px] py-2 px-2.5 rounded-xl bg-slate-800/90 active:bg-slate-750 text-emerald-400 active:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/80 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDuplicate(earning)}
                    className="min-h-[42px] min-w-[42px] px-3 rounded-xl bg-slate-800/90 active:bg-slate-750 text-slate-400 active:text-cyan-400 border border-slate-700/80 flex items-center justify-center transition-colors"
                    title="Duplicate Entry"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(earning)}
                    className="min-h-[42px] min-w-[42px] px-3 rounded-xl bg-slate-800/90 active:bg-rose-500/20 text-slate-400 active:text-rose-400 border border-slate-700/80 flex items-center justify-center transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 2. DESKTOP / TABLET DATA GRID TABLE (hidden md:block)                     */}
          {/* ========================================================================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold select-none">
                <tr>
                  <th
                    onClick={() => handleSort('date')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {renderSortIndicator('date')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('clientName')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Client / Reference</span>
                      {renderSortIndicator('clientName')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category & Method</span>
                      {renderSortIndicator('category')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('grossAmount')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Gross</span>
                      {renderSortIndicator('grossAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('deductions')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Deductions</span>
                      {renderSortIndicator('deductions')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('netAmount')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Net Earnings</span>
                      {renderSortIndicator('netAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('paymentStatus')}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      {renderSortIndicator('paymentStatus')}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {paginatedEarnings.map((earning) => (
                  <tr
                    key={earning.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">
                        {formatHumanDate(earning.date)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {earning.date}
                      </div>
                    </td>

                    {/* Client / Reference */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-semibold text-slate-200 truncate">
                        {earning.clientName || 'General / Direct'}
                      </div>
                      {earning.referenceId ? (
                        <div
                          className="text-[10px] text-slate-400 font-mono truncate"
                          title={earning.referenceId}
                        >
                          Ref: {earning.referenceId}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500">No invoice #</div>
                      )}
                    </td>

                    {/* Category & Payment Method */}
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{earning.category}</div>
                      <div className="text-[10px] text-slate-400">
                        {earning.paymentMethod || 'Direct'}
                      </div>
                    </td>

                    {/* Gross */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {formatCurrency(earning.grossAmount, currency)}
                    </td>

                    {/* Deductions */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-400/90">
                      {earning.deductions > 0 ? (
                        <span>-{formatCurrency(earning.deductions, currency)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Net Amount */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-400 text-sm">
                      {formatCurrency(earning.netAmount, currency)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(earning.paymentStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(earning)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicate(earning)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Duplicate as new entry"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(earning)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(earning)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Responsive Pagination & Page Size */}
          <div className="p-3.5 sm:p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <span className="font-mono">
                {startIndex + 1}-{Math.min(startIndex + pageSize, sortedEarnings.length)} of{' '}
                {sortedEarnings.length}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handlePrevPage}
                disabled={validCurrentPage === 1}
                className="min-h-[38px] px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="sm:hidden">Prev</span>
              </button>

              <span className="px-2 font-mono text-white text-xs">
                Page {validCurrentPage} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={validCurrentPage === totalPages}
                className="min-h-[38px] px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                title="Next page"
              >
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
