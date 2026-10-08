import React from 'react';
import { Earning } from '../../types';
import { FinancialGoals } from '../FinancialGoals';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Printer,
} from 'lucide-react';

interface GoalsViewProps {
  earnings: Earning[];
}

export const GoalsView: React.FC<GoalsViewProps> = ({ earnings }) => {
  const { currency, monthlyGoal } = useAuth();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthEarnings = earnings.filter((e) => e.date.startsWith(currentMonthPrefix));
  const currentMonthNet = currentMonthEarnings.reduce((acc, e) => acc + e.netAmount, 0);

  const targetGoal = monthlyGoal > 0 ? monthlyGoal : 100000;
  const currentDailyPace = currentDay > 0 ? currentMonthNet / currentDay : 0;
  const projectedMonthEnd = currentDailyPace * daysInMonth;
  const projectedDifference = projectedMonthEnd - targetGoal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center">
            <Target className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Monthly Financial Goals & Projections
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set net earning targets, monitor daily run rates, and view projected month-end outcomes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Print Goals Plan"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Goals Plan</span>
          </button>
        </div>
      </div>

      {/* Main Financial Goals Component */}
      <FinancialGoals earnings={earnings} />

      {/* Goal Projections & Run Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Projected Month End */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Projected Month-End Net
          </span>
          <div className="text-3xl font-bold font-mono text-white">
            {formatCurrency(projectedMonthEnd, currency)}
          </div>
          <p className="text-xs text-slate-400">
            Based on current run rate of{' '}
            <strong className="text-emerald-400 font-mono">
              {formatCurrency(currentDailyPace, currency)}/day
            </strong>{' '}
            across {currentDay} days.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px]">
            {projectedDifference >= 0 ? (
              <span className="text-emerald-400 font-medium">
                On track for +{formatCurrency(projectedDifference, currency)} above goal!
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                Estimated {formatCurrency(Math.abs(projectedDifference), currency)} shortfall at current pace.
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Days & Pacing Health */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Pacing Timeline
          </span>
          <div className="text-3xl font-bold font-mono text-cyan-400">
            {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Remaining
          </div>
          <p className="text-xs text-slate-400">
            {currentDay} of {daysInMonth} calendar days elapsed in this billing cycle.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target: {formatCurrency(targetGoal, currency)}</span>
          </div>
        </div>

        {/* Card 3: Milestone Achievement Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Milestone Tier
          </span>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            {currentMonthNet >= targetGoal ? (
              <span className="text-emerald-400">Target Achieved 🎉</span>
            ) : currentMonthNet >= targetGoal * 0.75 ? (
              <span className="text-cyan-400">Tier 3: Final Stretch</span>
            ) : currentMonthNet >= targetGoal * 0.5 ? (
              <span className="text-indigo-400">Tier 2: 50% Milestone</span>
            ) : (
              <span className="text-slate-300">Tier 1: Kickoff</span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Milestones celebrate your progress and keep financial momentum high.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            Updates in real-time as new transactions are booked
          </div>
        </div>
      </div>
    </div>
  );
};
