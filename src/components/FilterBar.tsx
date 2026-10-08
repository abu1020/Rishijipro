import React, { useState } from 'react';
import { FilterState, DatePreset, PaymentStatus } from '../types';
import { getPresetDateRange, getTodayISO } from '../utils/dateUtils';
import {
  Search,
  RotateCcw,
  Calendar,
  Filter,
  X,
  CreditCard,
  Tag,
  ChevronDown,
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  categories: string[];
  paymentMethods: string[];
  totalMatches: number;
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'all_time', label: 'All Time' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
  paymentMethods,
  totalMatches,
}) => {
  const [showCustomDates, setShowCustomDates] = useState(filters.preset === 'custom');

  const handlePresetSelect = (preset: DatePreset) => {
    setShowCustomDates(false);
    const range = getPresetDateRange(preset);
    onFilterChange({
      ...filters,
      preset,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  };

  const handleCustomStartDate = (date: string) => {
    onFilterChange({
      ...filters,
      preset: 'custom',
      startDate: date,
    });
  };

  const handleCustomEndDate = (date: string) => {
    onFilterChange({
      ...filters,
      preset: 'custom',
      endDate: date,
    });
  };

  const handleResetFilters = () => {
    const defaultRange = getPresetDateRange('this_month');
    setShowCustomDates(false);
    onFilterChange({
      preset: 'this_month',
      startDate: defaultRange.startDate,
      endDate: defaultRange.endDate,
      category: 'all',
      paymentMethod: 'all',
      paymentStatus: 'all',
      searchQuery: '',
    });
  };

  const isFiltered =
    filters.preset !== 'this_month' ||
    filters.category !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
      {/* Top Row: Date Presets Carousel (Fluid Horizontal Scroll for Mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
          {PRESETS.map((p) => {
            const isActive = filters.preset === p.id && !showCustomDates;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          <button
            onClick={() => setShowCustomDates(!showCustomDates)}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              showCustomDates || filters.preset === 'custom'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom Dates</span>
          </button>
        </div>

        {/* Reset Filters Action */}
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="self-start sm:self-auto text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 cursor-pointer py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Expandable Custom Date Range Selector */}
      {showCustomDates && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 font-medium shrink-0">From:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleCustomStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 font-medium shrink-0">To:</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleCustomEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Middle Row: Multi-Attribute Filters (Search, Category, Payment Method, Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Instant Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search client, ref #, notes..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2.5 min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full pl-9 pr-8 py-2.5 min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Payment Method Dropdown */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <select
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value })}
            className="w-full pl-9 pr-8 py-2.5 min-h-[42px] rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Payment Status Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 min-h-[42px]">
          <button
            onClick={() => onFilterChange({ ...filters, paymentStatus: 'all' })}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.paymentStatus === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, paymentStatus: 'Received' })}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.paymentStatus === 'Received'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, paymentStatus: 'Pending' })}
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.paymentStatus === 'Pending'
                ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Filter Status Badge */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Matching entries: <strong className="text-slate-300 font-mono">{totalMatches}</strong></span>
        {isFiltered && <span className="text-emerald-400">Filters applied</span>}
      </div>
    </div>
  );
};
