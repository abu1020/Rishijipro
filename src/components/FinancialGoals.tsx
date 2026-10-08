import React, { useState } from 'react';
import { Earning } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import {
  Target,
  Edit3,
  TrendingUp,
  Zap,
  Check,
  X,
  Calendar,
} from 'lucide-react';

interface FinancialGoalsProps {
  earnings: Earning[];
}

export const FinancialGoals: React.FC<FinancialGoalsProps> = ({ earnings }) => {
  const { currency, monthlyGoal, setMonthlyGoal } = useAuth();
  const { success, error } = useToast();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState<string>(monthlyGoal.toString());
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Compute Current Month Real-Time Net Earnings
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInCurrentMonth - currentDay);

  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthEarnings = earnings.filter((e) => e.date.startsWith(currentMonthPrefix));

  const currentMonthNet = currentMonthEarnings.reduce((sum, e) => sum + (e.netAmount || 0), 0);
  const currentMonthGross = currentMonthEarnings.reduce((sum, e) => sum + (e.grossAmount || 0), 0);

  const targetGoal = monthlyGoal > 0 ? monthlyGoal : 100000;
  const progressRatio = targetGoal > 0 ? currentMonthNet / targetGoal : 0;
  const progressPercent = Math.min(100, Math.max(0, progressRatio * 100));
  const isGoalAchieved = currentMonthNet >= targetGoal;
  const remainingAmount = Math.max(0, targetGoal - currentMonthNet);

  // Pace calculations
  const currentDailyPace = currentDay > 0 ? currentMonthNet / currentDay : 0;
  const requiredDailyPace = remainingAmount > 0 ? remainingAmount / daysRemaining : 0;
  const monthName = now.toLocaleString('en-US', { month: 'long' });

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(goalInput);
    if (isNaN(val) || val < 1) {
      error('Please enter a valid goal amount greater than 0.');
      return;
    }

    setIsSavingGoal(true);
    try {
      await setMonthlyGoal(val);
      success(`Monthly goal updated to ${formatCurrency(val, currency)}`);
      setIsEditingGoal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update goal.';
      error(msg);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const getStatusText = () => {
    if (isGoalAchieved) {
      const surplus = progressRatio > 1 ? `+${((progressRatio - 1) * 100).toFixed(0)}% surplus` : '100% met';
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Goal Achieved ({surplus})</span>
        </span>
      );
    }
    if (progressPercent >= 75) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Final Stretch ({(100 - progressPercent).toFixed(0)}% to target)</span>
        </span>
      );
    }
    if (progressPercent >= 50) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Halfway Crossed</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span>Building Momentum</span>
      </span>
    );
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-750">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 text-emerald-400 flex items-center justify-center">
            <Target className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {monthName} Financial Goal
              </h2>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-medium">
                {monthName} {currentYear}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target vs realized net income pace for active billing month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusText()}
          <button
            onClick={() => {
              setGoalInput(targetGoal.toString());
              setIsEditingGoal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Set Target</span>
          </button>
        </div>
      </div>

      {/* Main Metric Row */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Metric 1: Realized Net vs Target */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Realized Net Income
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
              {formatCurrency(currentMonthNet, currency)}
            </span>
            <span className="text-sm font-mono tabular-nums text-slate-500">
              / {formatCurrency(targetGoal, currency)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
            <span>Gross: {formatCurrency(currentMonthGross, currency)}</span>
            <span className="text-slate-600">·</span>
            <span>{currentMonthEarnings.length} records</span>
          </div>
        </div>

        {/* Metric 2: Progress Percentage & Progress Bar */}
        <div className="md:border-x md:border-slate-800/80 md:px-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Goal Attainment</span>
            <span className="font-mono tabular-nums font-bold text-emerald-400 text-sm">
              {progressPercent.toFixed(1)}%
            </span>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>
              {isGoalAchieved ? (
                <span className="text-emerald-400 font-medium">Target Completed</span>
              ) : (
                <span>
                  Remaining:{' '}
                  <strong className="text-slate-200 font-mono tabular-nums font-medium">
                    {formatCurrency(remainingAmount, currency)}
                  </strong>
                </span>
              )}
            </span>
            <span>{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</span>
          </div>
        </div>

        {/* Metric 3: Pace & Run Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Current Pace
            </span>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-1">
              {formatCurrency(currentDailyPace, currency)}
              <span className="text-[10px] text-slate-500 font-normal">/day</span>
            </div>
            <span className="text-[10px] text-slate-500">Day {currentDay} of {daysInCurrentMonth}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Required Pace
            </span>
            <div className="text-base font-bold font-mono tabular-nums text-amber-400 mt-1">
              {isGoalAchieved ? 'Met' : formatCurrency(requiredDailyPace, currency)}
              {!isGoalAchieved && <span className="text-[10px] text-slate-500 font-normal">/day</span>}
            </div>
            <span className="text-[10px] text-slate-500">
              {isGoalAchieved ? 'Surplus territory' : 'To hit 100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Setting Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setIsEditingGoal(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-sm w-full z-10 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Set Monthly Net Target
              </h3>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Target Net Earnings ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="5000"
                    required
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono tabular-nums text-base font-bold focus:border-emerald-500 focus:outline-none"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {currency}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saved directly to your account preferences.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGoal}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isSavingGoal ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                  <span>Save Target</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
