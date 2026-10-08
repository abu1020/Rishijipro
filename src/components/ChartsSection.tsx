import React, { useState } from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { formatShortDate } from '../utils/dateUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  TooltipItem,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsSectionProps {
  earnings: Earning[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ earnings }) => {
  const { currency } = useAuth();
  const [trendChartType, setTrendChartType] = useState<'line' | 'bar'>('line');

  if (earnings.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300 mb-1">No Data for Visual Charts</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add new earnings or adjust your active filters to generate trend analytics and category distributions.
        </p>
      </div>
    );
  }

  // 1. Group earnings by Date for trend chart
  const dateMap: { [date: string]: { gross: number; net: number; deductions: number } } = {};
  earnings.forEach((e) => {
    if (!dateMap[e.date]) {
      dateMap[e.date] = { gross: 0, net: 0, deductions: 0 };
    }
    dateMap[e.date].gross += e.grossAmount;
    dateMap[e.date].net += e.netAmount;
    dateMap[e.date].deductions += e.deductions;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const trendLabels = sortedDates.map((d) => formatShortDate(d));
  const trendGrossData = sortedDates.map((d) => dateMap[d].gross);
  const trendNetData = sortedDates.map((d) => dateMap[d].net);
  const trendDeductionsData = sortedDates.map((d) => dateMap[d].deductions);

  // 2. Group earnings by Category for doughnut chart
  const categoryMap: { [cat: string]: number } = {};
  let totalNetSum = 0;
  earnings.forEach((e) => {
    const cat = e.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + e.netAmount;
    totalNetSum += e.netAmount;
  });

  // Sort categories by amount descending
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const categoryLabels = sortedCategories.map((c) => c[0]);
  const categoryValues = sortedCategories.map((c) => c[1]);

  const paletteColors = [
    '#10B981', // emerald-500
    '#06B6D4', // cyan-500
    '#3B82F6', // blue-500
    '#8B5CF6', // purple-500
    '#F59E0B', // amber-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#6366F1', // indigo-500
    '#F97316', // orange-500
    '#64748B', // slate-500
  ];

  // Trend Chart Config
  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Net Earnings',
        data: trendNetData,
        borderColor: '#10B981',
        backgroundColor:
          trendChartType === 'line'
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(16, 185, 129, 0.85)',
        tension: 0.35,
        fill: trendChartType === 'line',
        borderWidth: 2.5,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#042f2e',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Gross Earnings',
        data: trendGrossData,
        borderColor: '#38BDF8',
        backgroundColor:
          trendChartType === 'line'
            ? 'rgba(56, 189, 248, 0.05)'
            : 'rgba(56, 189, 248, 0.7)',
        tension: 0.35,
        fill: false,
        borderWidth: 2,
        borderDash: trendChartType === 'line' ? [4, 4] : undefined,
        pointBackgroundColor: '#38BDF8',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Deductions',
        data: trendDeductionsData,
        borderColor: '#F59E0B',
        backgroundColor:
          trendChartType === 'line'
            ? 'rgba(245, 158, 11, 0.05)'
            : 'rgba(245, 158, 11, 0.7)',
        tension: 0.35,
        fill: false,
        borderWidth: 1.5,
        pointBackgroundColor: '#F59E0B',
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#94A3B8',
          font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' },
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: TooltipItem<'line' | 'bar'>) => {
            const val = context.parsed.y ?? 0;
            return ` ${context.dataset.label}: ${formatCurrency(val, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: (value: string | number) => formatCurrency(Number(value), currency),
        },
      },
    },
  };

  // Doughnut Chart Config
  const doughnutChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: paletteColors.slice(0, categoryLabels.length),
        borderColor: '#0F172A',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const val = context.parsed;
            const pct = totalNetSum > 0 ? (val / totalNetSum) * 100 : 0;
            return ` ${formatCurrency(val, currency)} (${pct.toFixed(1)}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Earnings Trend Chart (2 Columns) */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Earnings Trend</h3>
              <p className="text-[11px] text-slate-400">Net vs Gross vs Deductions over time</p>
            </div>
          </div>

          {/* Line vs Bar toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 self-start sm:self-auto">
            <button
              onClick={() => setTrendChartType('line')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                trendChartType === 'line'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setTrendChartType('bar')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                trendChartType === 'bar'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 sm:h-72 w-full">
          {trendChartType === 'line' ? (
            <Line data={trendChartData} options={trendChartOptions} />
          ) : (
            <Bar data={trendChartData} options={trendChartOptions} />
          )}
        </div>
      </div>

      {/* Category Breakdown Doughnut Chart (1 Column) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Category Breakdown</h3>
            <p className="text-[11px] text-slate-400">Net revenue distribution</p>
          </div>
        </div>

        {/* Doughnut Canvas with Centered Stat */}
        <div className="relative h-48 w-full flex items-center justify-center mb-4">
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-400 font-medium">Top Category</span>
            <span className="text-xs font-bold text-emerald-400 max-w-[120px] truncate text-center">
              {categoryLabels[0] || 'N/A'}
            </span>
          </div>
        </div>

        {/* Category Legend List */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {sortedCategories.map(([cat, val], idx) => {
            const color = paletteColors[idx % paletteColors.length];
            const pct = totalNetSum > 0 ? (val / totalNetSum) * 100 : 0;

            return (
              <div
                key={cat}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 font-medium truncate">{cat}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-slate-200">{formatCurrency(val, currency)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold w-9 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
