import React, { useState } from 'react';
import { FilterState, DatePreset } from '../types';
import { getPresetDateRange } from '../utils/dateUtils';
import {
  Search,
  RotateCcw,
  Calendar,
  X,
  CreditCard,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { hapticSelect, hapticTap, hapticPress } from '../utils/haptics';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  paymentMethods: string[];
  totalMatches?: number;
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'current_fy', label: 'Current FY' },
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
  const [showCustomDates, setShowCustomDates] = useState(
    filters.preset === 'custom'
  );

  const handlePresetSelect = (preset: DatePreset) => {
    hapticSelect();
    setShowCustomDates(false);
    const range = getPresetDateRange(preset);
    onFilterChange({
      ...filters,
      preset,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  };

  const handleCustomStartDate = (val: string) => {
    onFilterChange({
      ...filters,
      preset: 'custom',
      startDate: val,
    });
  };

  const handleCustomEndDate = (val: string) => {
    onFilterChange({
      ...filters,
      preset: 'custom',
      endDate: val,
    });
  };

  const handleResetFilters = () => {
    hapticPress();
    setShowCustomDates(false);
    const range = getPresetDateRange('this_month');
    onFilterChange({
      preset: 'this_month',
      startDate: range.startDate,
      endDate: range.endDate,
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
    <div className="bg-[#0d1630] border border-blue-500/20 rounded-xl p-3.5 sm:p-4 space-y-3 transition-colors text-white shadow-lg shadow-blue-950/30">
      {/* Top Row: Date Presets Carousel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
          {PRESETS.map((p) => {
            const isActive = filters.preset === p.id && !showCustomDates;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer tactile-btn ${
                  isActive
                    ? 'bg-white text-slate-950 border border-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-blue-900/40 border border-transparent'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          <button
            onClick={() => {
              hapticTap();
              setShowCustomDates(!showCustomDates);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer tactile-btn ${
              showCustomDates || filters.preset === 'custom'
                ? 'bg-white text-slate-950 border border-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40 border border-transparent'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Reset Filters Action */}
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="self-start sm:self-auto text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-md hover:bg-rose-500/10 transition-colors tactile-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Expandable Custom Date Range Selector */}
      {showCustomDates && (
        <div className="p-3 rounded-lg border border-blue-500/20 bg-[#101c3d] text-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-slate-300 shrink-0">From:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleCustomStartDate(e.target.value)}
              className="w-full bg-[#091126] border border-blue-500/25 text-white focus:border-blue-400/60 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-slate-300 shrink-0">To:</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleCustomEndDate(e.target.value)}
              className="w-full bg-[#091126] border border-blue-500/25 text-white focus:border-blue-400/60 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Quick Search & Granular Dropdown Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search client, voucher, note..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-blue-500/20 bg-[#091126] text-white placeholder-slate-400 focus:border-blue-400/60 text-xs focus:outline-none transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => {
                hapticTap();
                onFilterChange({ ...filters, searchQuery: '' });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.category}
            onChange={(e) => {
              hapticSelect();
              onFilterChange({ ...filters, category: e.target.value });
            }}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-blue-500/20 bg-[#091126] text-white focus:border-blue-400/60 text-xs appearance-none focus:outline-none cursor-pointer transition-colors"
          >
            <option value="all" className="bg-[#091126] text-white">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#091126] text-white">
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Payment Method Filter */}
        <div className="relative">
          <CreditCard className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.paymentMethod}
            onChange={(e) => {
              hapticSelect();
              onFilterChange({ ...filters, paymentMethod: e.target.value });
            }}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-blue-500/20 bg-[#091126] text-white focus:border-blue-400/60 text-xs appearance-none focus:outline-none cursor-pointer transition-colors"
          >
            <option value="all" className="bg-[#091126] text-white">All Payment Methods</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m} className="bg-[#091126] text-white">
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Payment Status Filter */}
        <div className="relative">
          <select
            value={filters.paymentStatus}
            onChange={(e) => {
              hapticSelect();
              onFilterChange({ ...filters, paymentStatus: e.target.value as any });
            }}
            className="w-full px-3 py-1.5 rounded-lg border border-blue-500/20 bg-[#091126] text-white focus:border-blue-400/60 text-xs appearance-none focus:outline-none cursor-pointer transition-colors"
          >
            <option value="all" className="bg-[#091126] text-white">All Statuses (Received & Pending)</option>
            <option value="Received" className="bg-[#091126] text-white">Status: Received</option>
            <option value="Pending" className="bg-[#091126] text-white">Status: Pending</option>
            <option value="Partially Paid" className="bg-[#091126] text-white">Status: Partially Paid</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
