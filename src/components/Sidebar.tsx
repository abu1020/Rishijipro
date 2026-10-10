import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { DashboardTab } from './Navbar';
import {
  TrendingUp,
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Target,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  X,
  Calculator,
  Printer,
} from 'lucide-react';
import { hapticTap, hapticPress } from '../utils/haptics';

interface SidebarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenNewEarningModal: () => void;
  onOpenTour: () => void;
  ledgerCount: number;
  monthlyGoal: number;
  currentMonthNet: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCalculator?: () => void;
  onOpenMonthlySummary?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewEarningModal,
  onOpenTour,
  ledgerCount,
  monthlyGoal,
  currentMonthNet,
  isOpenMobile,
  onCloseMobile,
  onOpenCalculator,
  onOpenMonthlySummary,
}) => {
  const { user, currency, logout } = useAuth();

  const progressPercent =
    monthlyGoal > 0 ? Math.min(100, (currentMonthNet / monthlyGoal) * 100) : 0;

  const navItems = [
    {
      tab: 'overview' as DashboardTab,
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      tab: 'ledger' as DashboardTab,
      label: 'Transactions',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: ledgerCount,
    },
    {
      tab: 'analytics' as DashboardTab,
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: null,
    },
    {
      tab: 'goals' as DashboardTab,
      label: 'Financial Goals',
      icon: <Target className="w-4 h-4" />,
      badge: `${progressPercent.toFixed(0)}%`,
    },
    {
      tab: 'settings' as DashboardTab,
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => {
            hapticTap();
            onCloseMobile();
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-blue-500/15 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } text-slate-100`}
      >
        {/* Top: Brand & Workspace */}
        <div className="p-4 border-b border-blue-500/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Crisp white brand monogram icon with blue stroke */}
              <div className="w-7 h-7 rounded-lg bg-white text-blue-950 flex items-center justify-center font-bold shadow-sm">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white tracking-tight block truncate">
                  ProfitTrack
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-tight truncate">
                  GST & TDS Financial Suite
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => {
                hapticTap();
                onCloseMobile();
              }}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors tactile-btn cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Primary Action (Crisp White Element) */}
          <button
            onClick={() => {
              hapticPress();
              onCloseMobile();
              onOpenNewEarningModal();
            }}
            className="w-full mt-3.5 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-blue-50 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm border border-white tactile-btn"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Earning</span>
          </button>
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  hapticTap();
                  onTabChange(item.tab);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer tactile-btn ${
                  isActive
                    ? 'bg-blue-600/20 text-white font-bold border border-blue-400/30 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-blue-900/80 text-blue-200 border border-blue-400/30'
                        : 'bg-blue-950/60 text-slate-400 border border-blue-500/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary Shortcuts */}
          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tools
          </div>

          {onOpenMonthlySummary && (
            <button
              onClick={() => {
                hapticPress();
                onCloseMobile();
                onOpenMonthlySummary();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-950/50 transition-colors cursor-pointer tactile-btn"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Monthly PDF Statement</span>
            </button>
          )}

          {onOpenCalculator && (
            <button
              onClick={() => {
                hapticPress();
                onCloseMobile();
                onOpenCalculator();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-950/50 transition-colors cursor-pointer tactile-btn"
            >
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>GST & TDS Calculator</span>
            </button>
          )}

          <button
            onClick={() => {
              hapticTap();
              onCloseMobile();
              onOpenTour();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-950/50 transition-colors cursor-pointer tactile-btn"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Product Tour</span>
          </button>
        </div>

        {/* Bottom: Mini Goal Tracker & Account */}
        <div className="p-3 border-t border-blue-500/15 bg-[var(--app-bg)] space-y-3">
          {/* Monthly Target Progress */}
          <div
            onClick={() => {
              hapticTap();
              onTabChange('goals');
              onCloseMobile();
            }}
            className="p-2.5 rounded-lg bg-[var(--card-subtle)] border border-blue-500/20 hover:border-blue-400/40 transition-all cursor-pointer tactile-btn"
          >
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-300 font-semibold">Monthly Goal</span>
              <span className="font-mono text-xs font-bold text-white">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-blue-950 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
              <span className="font-bold text-white">{formatCurrency(currentMonthNet, currency)}</span>
              <span>/ {formatCurrency(monthlyGoal, currency)}</span>
            </div>
          </div>

          {/* User Account Tile */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2 min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-blue-400/30 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-blue-400/30">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.displayName || 'Account'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                hapticPress();
                logout();
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors cursor-pointer shrink-0 tactile-btn"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
