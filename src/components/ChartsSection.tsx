import React, { useState } from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
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
      <div className="bg-[#0d1630] border border-blue-500/20 rounded-xl p-8 text-center shadow-lg shadow-blue-950/30">
        <div className="w-10 h-10 rounded-lg bg-blue-900/30 text-blue-300 border border-blue-500/20 mx-auto flex items-center justify-center mb-2.5">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-slate-200 mb-0.5">No Data for Visual Charts</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
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

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const categoryLabels = sortedCategories.map((c) => c[0]);
  const categoryValues = sortedCategories.map((c) => c[1]);

  const paletteColors = [
    '#38bdf8', // sky-400
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#818cf8', // indigo-400
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#94a3b8', // slate-400
  ];

  // Trend Chart Config
  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Net Earnings',
        data: trendNetData,
        borderColor: '#38bdf8',
        backgroundColor:
          trendChartType === 'line'
            ? 'rgba(56, 189, 248, 0.12)'
            : 'rgba(56, 189, 248, 0.85)',
        tension: 0.3,
        fill: trendChartType === 'line',
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#080f24',
        pointRadius: 3.5,
        pointHoverRadius: 5,
      },
      {
        label: 'Gross Billed',
        data: trendGrossData,
        borderColor: '#60a5fa',
        backgroundColor:
          trendChartType === 'line'
            ? 'rgba(96, 165, 250, 0.05)'
            : 'rgba(96, 165, 250, 0.65)',
        tension: 0.3,
        fill: false,
        borderWidth: 1.5,
        borderDash: trendChartType === 'line' ? [4, 4] : undefined,
        pointBackgroundColor: '#60a5fa',
        pointRadius: 2.5,
        pointHoverRadius: 4,
      },
      {
        label: 'Taxes / TDS',
        data: trendDeductionsData,
        borderColor: '#f59e0b',
        backgroundColor:
          trendChartType === 'line'
            ? 'rgba(245, 158, 11, 0.05)'
            : 'rgba(245, 158, 11, 0.7)',
        tension: 0.3,
        fill: false,
        borderWidth: 1.5,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 2.5,
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
          color: '#cbd5e1',
          font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0d1836',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(96, 165, 250, 0.25)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
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
          color: 'rgba(96, 165, 250, 0.08)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(96, 165, 250, 0.08)',
        },
        ticks: {
          color: '#94a3b8',
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
        borderColor: '#0d1630',
        borderWidth: 2,
        hoverOffset: 4,
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
        backgroundColor: '#0d1836',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(96, 165, 250, 0.25)',
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
    cutout: '74%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Earnings Trend Chart (2 Columns) */}
      <div className="lg:col-span-2 bg-[#0d1630] border border-blue-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg shadow-blue-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#101c3d] text-blue-300 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Earnings Trend</h3>
              <p className="text-[11px] text-slate-400">Net vs Gross vs Deductions</p>
            </div>
          </div>

          {/* Line vs Bar toggle */}
          <div className="flex items-center gap-0.5 bg-[#091126] border border-blue-500/20 rounded-lg p-0.5 self-start sm:self-auto">
            <button
              onClick={() => setTrendChartType('line')}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                trendChartType === 'line'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setTrendChartType('bar')}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                trendChartType === 'bar'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-60 sm:h-64 w-full">
          {trendChartType === 'line' ? (
            <Line data={trendChartData} options={trendChartOptions} />
          ) : (
            <Bar data={trendChartData} options={trendChartOptions} />
          )}
        </div>
      </div>

      {/* Category Breakdown Doughnut Chart (1 Column) */}
      <div className="bg-[#0d1630] border border-blue-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg shadow-blue-950/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-[#101c3d] text-blue-300 border border-blue-500/20 flex items-center justify-center">
            <PieChartIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Category Share</h3>
            <p className="text-[11px] text-slate-400">Net distribution</p>
          </div>
        </div>

        {/* Doughnut Canvas with Centered Stat */}
        <div className="relative h-44 w-full flex items-center justify-center mb-3">
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400">Top Category</span>
            <span className="text-xs font-semibold text-white max-w-[110px] truncate text-center">
              {categoryLabels[0] || 'N/A'}
            </span>
          </div>
        </div>

        {/* Category Legend List */}
        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
          {sortedCategories.map(([cat, val], idx) => {
            const color = paletteColors[idx % paletteColors.length];
            const pct = totalNetSum > 0 ? (val / totalNetSum) * 100 : 0;

            return (
              <div
                key={cat}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-[#101c3d] border border-blue-500/10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-200 font-medium truncate">{cat}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-white font-medium">{formatCurrency(val, currency)}</span>
                  <span className="text-[10px] text-slate-400 w-8 text-right font-mono">
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
