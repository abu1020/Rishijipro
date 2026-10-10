import React from 'react';
import { Earning } from '../../types';
import { FinancialGoals } from '../FinancialGoals';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Target,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { hapticTap, hapticPress, hapticSuccess } from '../../utils/haptics';

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
    hapticSuccess();
    window.print();
  };

  const panelClass = 'bg-[#0d1630] border border-blue-500/20 text-white shadow-sm';
  const subCardClass = 'bg-[#101c3d] border border-blue-500/15 text-white';

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      {/* Top Banner */}
      <div
        className={`border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${panelClass}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-900/50 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Monthly Financial Goals & Projections
            </h2>
            <p className="text-xs mt-0.5 text-slate-400">
              Net targets, daily pacing curves, and projected month-end realization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#111e40] hover:bg-[#182955] text-slate-200 hover:text-white border border-blue-500/20 transition-all cursor-pointer tactile-btn"
            title="Print Goals Plan"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Financial Goals Component */}
      <FinancialGoals earnings={earnings} />

      {/* Goal Projections & Run Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Projected Month End */}
        <div
          onClick={hapticTap}
          className={`border rounded-xl p-4 space-y-2 cursor-pointer tactile-press ${subCardClass}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Projected Month-End Net
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {formatCurrency(projectedMonthEnd, currency)}
          </div>
          <p className="text-xs text-slate-400">
            Current pace of{' '}
            <strong className="font-mono font-bold text-white">
              {formatCurrency(currentDailyPace, currency)}/day
            </strong>{' '}
            across {currentDay} days.
          </p>
          <div className="pt-2 border-t border-blue-500/10 text-[11px]">
            {projectedDifference >= 0 ? (
              <span className="text-emerald-400 font-bold">
                On track for +{formatCurrency(projectedDifference, currency)} above goal
              </span>
            ) : (
              <span className="text-amber-400 font-bold">
                Estimated {formatCurrency(Math.abs(projectedDifference), currency)} shortfall at current pace
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Days & Pacing Health */}
        <div
          onClick={hapticTap}
          className={`border rounded-xl p-4 space-y-2 cursor-pointer tactile-press ${subCardClass}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            Pacing Timeline
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Remaining
          </div>
          <p className="text-xs text-slate-400">
            {currentDay} of {daysInMonth} calendar days elapsed in current cycle.
          </p>
          <div className="pt-2 border-t border-blue-500/10 text-[11px] flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">Target: {formatCurrency(targetGoal, currency)}</span>
          </div>
        </div>

        {/* Card 3: Milestone Achievement Status */}
        <div
          onClick={hapticTap}
          className={`border rounded-xl p-4 space-y-2 cursor-pointer tactile-press ${subCardClass}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Milestone Status
          </span>
          <div className="text-lg font-bold flex items-center gap-2">
            {currentMonthNet >= targetGoal ? (
              <span className="text-emerald-400 font-bold">Target Achieved!</span>
            ) : currentMonthNet >= targetGoal * 0.75 ? (
              <span className="text-white">Final Stretch (75%+)</span>
            ) : currentMonthNet >= targetGoal * 0.5 ? (
              <span className="text-white">Midpoint (50%+)</span>
            ) : (
              <span className="text-slate-400">Initial Phase</span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Realized take-home:{' '}
            <span className="font-mono font-bold text-white">
              {formatCurrency(currentMonthNet, currency)}
            </span>
          </p>
          <div className="pt-2 border-t border-blue-500/10 text-[11px] text-slate-400">
            Synchronized with settings target
          </div>
        </div>
      </div>
    </div>
  );
};
