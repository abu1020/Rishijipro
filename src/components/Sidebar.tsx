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
  Database,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X,
} from 'lucide-react';

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
      label: 'Reports & Analytics',
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
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Workspace */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block">
                  rishi Jha
                </span>
                <span className="text-[10px] text-emerald-400 font-medium block -mt-0.5 leading-tight">
                  Professional GST and TDS Accountant
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Primary Action */}
          <button
            onClick={() => {
              onCloseMobile();
              onOpenNewEarningModal();
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Daily Earning</span>
          </button>
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspace
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  onTabChange(item.tab);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-slate-900 text-emerald-400'
                        : 'bg-slate-900/60 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary Shortcuts */}
          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Resources
          </div>

          <button
            onClick={() => {
              onCloseMobile();
              onOpenTour();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Product Tour & Guide</span>
          </button>
        </div>

        {/* Bottom: Mini Goal Tracker & Account */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {/* Monthly Target Progress Capsule */}
          <div
            onClick={() => {
              onTabChange('goals');
              onCloseMobile();
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-400 font-medium">Monthly Goal</span>
              <span className="font-mono font-bold text-emerald-400">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
              <span>{formatCurrency(currentMonthNet, currency)}</span>
              <span>/ {formatCurrency(monthlyGoal, currency)}</span>
            </div>
          </div>

          {/* User Account Tile */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2 min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.displayName || 'Google Account'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Sign Out of ProfitTrack"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
