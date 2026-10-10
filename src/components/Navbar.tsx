import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SUPPORTED_CURRENCIES } from '../types';
import {
  TrendingUp,
  Plus,
  LogOut,
  Settings,
  ChevronDown,
  Calendar,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  BarChart3,
  Target,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

export type DashboardTab = 'overview' | 'ledger' | 'analytics' | 'goals' | 'settings';

interface NavbarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenNewEarningModal: () => void;
  onOpenTour: () => void;
  ledgerCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewEarningModal,
  onOpenTour,
  ledgerCount,
}) => {
  const { user, userProfile, currency, setCurrency, logout } = useAuth();
  const { info, error } = useToast();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      info('Signed out successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed.';
      error(`Error during sign out: ${msg}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const selectedCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#080f24]/95 backdrop-blur-xl border-b border-blue-500/15">
      {/* Top Utility Bar */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
        {/* Brand & Live Date */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform font-bold">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  ProfitTrack
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Daily
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0a1226] border border-blue-500/20 p-1 rounded-2xl">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-blue-600/30 text-white shadow-sm border border-blue-400/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onTabChange('ledger')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'ledger'
                ? 'bg-blue-600/30 text-white shadow-sm border border-blue-400/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Transactions</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#080f24] text-blue-300 border border-blue-500/20">
              {ledgerCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'analytics'
                ? 'bg-blue-600/30 text-white shadow-sm border border-blue-400/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('goals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'goals'
                ? 'bg-blue-600/30 text-white shadow-sm border border-blue-400/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>Financial Goals</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-blue-600/30 text-white shadow-sm border border-blue-400/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Action Controls & User Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1630] border border-blue-500/20 text-xs font-semibold text-slate-200 hover:border-blue-400/40 transition-colors cursor-pointer"
              title="Change Display Currency"
            >
              <span className="text-blue-400 font-mono font-bold text-sm">
                {selectedCurrency.symbol}
              </span>
              <span className="font-semibold">{selectedCurrency.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCurrencyDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-[#0d1836] border border-blue-500/25 rounded-2xl shadow-2xl py-1 z-50 overflow-hidden text-slate-100">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 border-b border-blue-500/15 uppercase tracking-wider">
                    Select Currency (Default: INR)
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-blue-500/10">
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-900/30 transition-colors cursor-pointer ${
                          currency === c.code
                            ? 'text-white font-bold bg-blue-600/20'
                            : 'text-slate-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-xs">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tour Trigger */}
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d1630] hover:bg-[#111e40] border border-blue-500/20 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Start Interactive Product Tour"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Tour</span>
          </button>

          {/* Add Daily Earning CTA (Pure White Solid Element) */}
          <button
            onClick={onOpenNewEarningModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer border border-white"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Record Daily Earning</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
