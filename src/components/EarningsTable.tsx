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
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
  Square,
  MinusSquare,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { hapticSelect, hapticTap, hapticPress, hapticSuccess } from '../utils/haptics';

interface EarningsTableProps {
  earnings: Earning[];
  onView: (earning: Earning) => void;
  onEdit: (earning: Earning) => void;
  onDuplicate: (earning: Earning) => void;
  onDelete: (earning: Earning) => void;
  onNew: () => void;
  onBulkUpdateStatus?: (ids: string[], status: PaymentStatus) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
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
  onBulkUpdateStatus,
  onBulkDelete,
}) => {
  const { currency } = useAuth();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Sorting
  const handleSort = (field: SortField) => {
    hapticTap();
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

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [earnings, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedEarnings.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedEarnings = sortedEarnings.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => {
    hapticTap();
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    hapticTap();
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Selection
  const toggleSelectAll = () => {
    hapticSelect();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allCurrentPageSelected = paginatedEarnings.every((e) => next.has(e.id));
      if (allCurrentPageSelected) {
        paginatedEarnings.forEach((e) => next.delete(e.id));
      } else {
        paginatedEarnings.forEach((e) => next.add(e.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticSelect();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bulk actions
  const handleBulkStatusChange = async (status: PaymentStatus) => {
    if (!onBulkUpdateStatus || selectedIds.size === 0) return;
    try {
      setIsBulkActionLoading(true);
      await onBulkUpdateStatus(Array.from(selectedIds), status);
      hapticSuccess();
      setSelectedIds(new Set());
    } catch {
      // handled
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (!onBulkDelete || selectedIds.size === 0) return;
    const confirmMsg = `Delete ${selectedIds.size} selected transaction(s)? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      setIsBulkActionLoading(true);
      await onBulkDelete(Array.from(selectedIds));
      hapticSuccess();
      setSelectedIds(new Set());
    } catch {
      // handled
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkExportCSV = () => {
    hapticPress();
    const selectedList = earnings.filter((e) => selectedIds.has(e.id));
    exportEarningsToCSV(selectedList.length > 0 ? selectedList : sortedEarnings, currency);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Received</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Pending</span>
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
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
      <ArrowUp className="w-3 h-3 text-white" />
    ) : (
      <ArrowDown className="w-3 h-3 text-white" />
    );
  };

  return (
    <div className="bg-[#0d1630] border border-blue-500/20 rounded-xl overflow-hidden flex flex-col relative text-white shadow-lg shadow-blue-950/30 transition-colors">
      {/* Header with Title and Count */}
      <div className="p-3.5 sm:p-4 border-b border-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Transactions
            </h3>
            <span className="text-blue-500/40">·</span>
            <span className="text-xs font-mono font-medium text-slate-300">
              {earnings.length} entries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={() => {
              hapticPress();
              exportEarningsToCSV(sortedEarnings, currency);
            }}
            disabled={earnings.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#111e40] hover:bg-[#182955] text-slate-200 border border-blue-500/20 transition-all cursor-pointer disabled:opacity-40 tactile-btn"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {earnings.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-blue-900/30 text-blue-300 flex items-center justify-center mb-2.5 border border-blue-500/20">
            <FileQuestion className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">
            No transactions found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            No entries match your active filters. Try adjusting filters or record a new earning.
          </p>
          <button
            onClick={() => {
              hapticPress();
              onNew();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-white hover:bg-blue-50 text-slate-950 transition-colors cursor-pointer border border-white tactile-btn"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Record Earning</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. MOBILE RESPONSIVE CARD FEED (hidden on md) */}
          <div className="block md:hidden divide-y divide-blue-500/10">
            {paginatedEarnings.map((earning) => {
              const isSelected = selectedIds.has(earning.id);
              return (
                <div
                  key={earning.id}
                  className={`p-3.5 transition-colors space-y-2.5 ${
                    isSelected ? 'bg-blue-900/30' : 'hover:bg-blue-900/15'
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectOne(earning.id, e)}
                        className="p-1 -ml-1 text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">
                            {earning.clientName || 'General / Direct'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{formatHumanDate(earning.date)}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{earning.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-base font-bold text-white">
                        {formatCurrency(earning.netAmount, currency)}
                      </div>
                      <div className="mt-0.5">{getStatusBadge(earning.paymentStatus)}</div>
                    </div>
                  </div>

                  {/* Financial Breakdown Badges */}
                  <div className="flex items-center gap-3 text-xs font-mono py-1 px-2.5 rounded-lg bg-[#091126] border border-blue-500/15 text-slate-300">
                    <div>
                      <span className="text-slate-400">Gross: </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(earning.grossAmount, currency)}
                      </span>
                    </div>
                    {earning.deductions > 0 && (
                      <div>
                        <span className="text-slate-400">TDS: </span>
                        <span className="font-semibold text-amber-400">
                          -{formatCurrency(earning.deductions, currency)}
                        </span>
                      </div>
                    )}
                    <div className="ml-auto text-slate-400">
                      {earning.paymentMethod || 'Direct'}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        hapticTap();
                        onView(earning);
                      }}
                      className="p-1.5 rounded-md bg-[#111e40] text-slate-300 hover:text-white border border-blue-500/20 transition-colors tactile-btn"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        hapticTap();
                        onDuplicate(earning);
                      }}
                      className="p-1.5 rounded-md bg-[#111e40] text-slate-300 hover:text-white border border-blue-500/20 transition-colors tactile-btn"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        hapticTap();
                        onEdit(earning);
                      }}
                      className="p-1.5 rounded-md bg-[#111e40] text-slate-300 hover:text-white border border-blue-500/20 transition-colors tactile-btn"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        hapticPress();
                        onDelete(earning);
                      }}
                      className="p-1.5 rounded-md bg-[#111e40] text-slate-300 hover:text-rose-400 border border-blue-500/20 transition-colors tactile-btn"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. DESKTOP DATA GRID */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#091126] border-b border-blue-500/20 text-slate-300 text-[11px] uppercase tracking-wider font-bold select-none">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer tactile-btn"
                      title={
                        paginatedEarnings.length > 0 &&
                        paginatedEarnings.every((e) => selectedIds.has(e.id))
                          ? 'Deselect all'
                          : 'Select all'
                      }
                    >
                      {paginatedEarnings.length > 0 &&
                      paginatedEarnings.every((e) => selectedIds.has(e.id)) ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : paginatedEarnings.some((e) => selectedIds.has(e.id)) ? (
                        <MinusSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="py-2.5 px-3.5 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {renderSortIndicator('date')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('clientName')}
                    className="py-2.5 px-3.5 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Client / Source</span>
                      {renderSortIndicator('clientName')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="py-2.5 px-3.5 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category</span>
                      {renderSortIndicator('category')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('grossAmount')}
                    className="py-2.5 px-3.5 text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Gross Billed</span>
                      {renderSortIndicator('grossAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('deductions')}
                    className="py-2.5 px-3.5 text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Taxes / TDS</span>
                      {renderSortIndicator('deductions')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('netAmount')}
                    className="py-2.5 px-3.5 text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Net Realized</span>
                      {renderSortIndicator('netAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('paymentStatus')}
                    className="py-2.5 px-3.5 text-center cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      {renderSortIndicator('paymentStatus')}
                    </div>
                  </th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10">
                {paginatedEarnings.map((earning) => {
                  const isSelected = selectedIds.has(earning.id);
                  return (
                    <tr
                      key={earning.id}
                      className={`transition-colors group ${
                        isSelected
                          ? 'bg-blue-900/30'
                          : 'hover:bg-blue-900/15'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => toggleSelectOne(earning.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-white transition-colors cursor-pointer tactile-btn"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          {formatHumanDate(earning.date)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {earning.date}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-2.5 px-3.5 max-w-[200px]">
                        <div className="font-bold text-white truncate">
                          {earning.clientName || 'General / Direct'}
                        </div>
                        {earning.referenceId ? (
                          <div
                            className="text-[10px] text-slate-400 font-mono truncate"
                            title={earning.referenceId}
                          >
                            Ref: {earning.referenceId}
                          </div>
                        ) : null}
                      </td>

                      {/* Category & Payment Method */}
                      <td className="py-2.5 px-3.5 max-w-[160px]">
                        <div
                          className="font-medium text-slate-200 truncate"
                          title={earning.category}
                        >
                          {earning.category}
                        </div>
                        <div
                          className="text-[10px] text-slate-400 truncate"
                          title={earning.paymentMethod || 'Direct'}
                        >
                          {earning.paymentMethod || 'Direct'}
                        </div>
                      </td>

                      {/* Gross */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-medium text-slate-200">
                        {formatCurrency(earning.grossAmount, currency)}
                      </td>

                      {/* Deductions */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-amber-400 font-bold">
                        {earning.deductions > 0 ? (
                          <span>-{formatCurrency(earning.deductions, currency)}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Net Amount (Pure Crisp White) */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-sm text-white">
                        {formatCurrency(earning.netAmount, currency)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        {getStatusBadge(earning.paymentStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              hapticTap();
                              onView(earning);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer tactile-btn"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              hapticTap();
                              onDuplicate(earning);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer tactile-btn"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              hapticTap();
                              onEdit(earning);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer tactile-btn"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              hapticPress();
                              onDelete(earning);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-blue-900/40 transition-colors cursor-pointer tactile-btn"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Floating Minimalist Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="sticky bottom-3 z-30 px-3 sm:px-6 my-2 animate-fadeIn">
              <div className="bg-[#0d1836] border border-blue-500/30 rounded-xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded border border-blue-500/30 bg-[#111e40] text-slate-200 text-xs font-mono font-bold">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={() => {
                      hapticTap();
                      setSelectedIds(new Set());
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer tactile-btn"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center flex-wrap gap-1.5">
                  {onBulkUpdateStatus && (
                    <>
                      <button
                        onClick={() => handleBulkStatusChange('Received')}
                        disabled={isBulkActionLoading}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111e40] hover:bg-[#182955] text-xs font-bold text-emerald-400 cursor-pointer disabled:opacity-50 tactile-btn border border-blue-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Received</span>
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Pending')}
                        disabled={isBulkActionLoading}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111e40] hover:bg-[#182955] text-xs font-bold text-rose-400 cursor-pointer disabled:opacity-50 tactile-btn border border-blue-500/20"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mark Pending</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleBulkExportCSV}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111e40] hover:bg-[#182955] text-xs font-semibold text-slate-200 cursor-pointer tactile-btn border border-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  {onBulkDelete && (
                    <button
                      onClick={handleBulkDeleteConfirm}
                      disabled={isBulkActionLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111e40] hover:bg-[#182955] text-xs font-bold text-rose-400 cursor-pointer disabled:opacity-50 tactile-btn border border-blue-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Table Footer with Pagination */}
          <div className="p-3 border-t border-blue-500/15 bg-[#091126] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    hapticSelect();
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#101c3d] border border-blue-500/25 text-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <span className="font-mono text-slate-400">
                {startIndex + 1}-{Math.min(startIndex + pageSize, sortedEarnings.length)} of {sortedEarnings.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handlePrevPage}
                disabled={validCurrentPage === 1}
                className="p-1 rounded bg-[#101c3d] border border-blue-500/25 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer tactile-btn hover:bg-blue-900/40"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-xs font-bold text-white">
                {validCurrentPage} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={validCurrentPage === totalPages}
                className="p-1 rounded bg-[#101c3d] border border-blue-500/25 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer tactile-btn hover:bg-blue-900/40"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
