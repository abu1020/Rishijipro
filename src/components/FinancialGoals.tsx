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
  X,
} from 'lucide-react';
import { hapticTap, hapticPress, hapticSuccess } from '../utils/haptics';

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
    hapticPress();
    const val = parseFloat(goalInput);
    if (isNaN(val) || val < 1) {
      error('Please enter a valid goal amount greater than 0.');
      return;
    }

    setIsSavingGoal(true);
    try {
      await setMonthlyGoal(val);
      hapticSuccess();
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
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>Final Stretch ({(100 - progressPercent).toFixed(0)}% to target)</span>
        </span>
      );
    }
    if (progressPercent >= 50) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
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
    <div className="bg-[#0d1630] border border-blue-500/20 rounded-xl p-5 sm:p-6 transition-all shadow-lg shadow-blue-950/30">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-500/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#101c3d] text-blue-300 border border-blue-500/20 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {monthName} Financial Goal
              </h2>
              <span className="text-blue-500/40">·</span>
              <span className="text-xs text-slate-300 font-mono">
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
              hapticTap();
              setGoalInput(targetGoal.toString());
              setIsEditingGoal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111e40] hover:bg-[#182955] text-xs font-semibold text-slate-200 hover:text-white border border-blue-500/20 transition-colors cursor-pointer tactile-btn"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Set Target</span>
          </button>
        </div>
      </div>

      {/* Main Metric Row */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Metric 1: Realized Net vs Target */}
        <div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Realized Net Income
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums">
              {formatCurrency(currentMonthNet, currency)}
            </span>
            <span className="text-sm font-mono tabular-nums text-slate-400">
              / {formatCurrency(targetGoal, currency)}
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
            <span>Gross: {formatCurrency(currentMonthGross, currency)}</span>
            <span>·</span>
            <span>{currentMonthEarnings.length} records</span>
          </div>
        </div>

        {/* Metric 2: Progress Percentage & Progress Bar */}
        <div className="md:border-x md:border-blue-500/15 md:px-5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">Goal Attainment</span>
            <span className="font-mono tabular-nums font-bold text-emerald-400">
              {progressPercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-blue-950/80 border border-blue-500/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>
              {isGoalAchieved ? (
                <span className="text-emerald-400 font-semibold">Target Completed</span>
              ) : (
                <span>
                  Remaining: <strong className="text-white font-mono font-bold">{formatCurrency(remainingAmount, currency)}</strong>
                </span>
              )}
            </span>
            <span>{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</span>
          </div>
        </div>

        {/* Metric 3: Pace & Run Rate */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-[#101c3d] border border-blue-500/15">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Current Pace
            </span>
            <div className="text-sm font-bold font-mono tabular-nums text-white mt-1">
              {formatCurrency(currentDailyPace, currency)}
              <span className="text-[10px] text-slate-400 font-normal">/day</span>
            </div>
            <span className="text-[10px] text-slate-400">Day {currentDay} of {daysInCurrentMonth}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#101c3d] border border-blue-500/15">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Required Pace
            </span>
            <div className="text-sm font-bold font-mono tabular-nums text-white mt-1">
              {isGoalAchieved ? 'Met' : formatCurrency(requiredDailyPace, currency)}
              {!isGoalAchieved && <span className="text-[10px] text-slate-400 font-normal">/day</span>}
            </div>
            <span className="text-[10px] text-slate-400">
              {isGoalAchieved ? 'Surplus running' : 'To hit 100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Setting Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsEditingGoal(false)}
          />

          <div className="relative w-full max-w-sm bg-[#0d1836] border border-blue-500/25 rounded-xl p-5 shadow-2xl z-10 space-y-4 animate-fadeIn shadow-blue-950/60">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Update Monthly Goal</h3>
              </div>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Target ({currency})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#091126] border border-blue-500/25 text-white font-mono text-sm focus:outline-none focus:border-blue-400/60"
                  placeholder="e.g. 100000"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGoal}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 border border-white"
                >
                  {isSavingGoal ? 'Saving...' : 'Save Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
