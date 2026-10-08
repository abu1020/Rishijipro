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
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      {/* Top Utility Bar */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
        {/* Brand & Live Date */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  ProfitTrack
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Daily
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onTabChange('ledger')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'ledger'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transactions Ledger</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-950 text-slate-400">
              {ledgerCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'analytics'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('goals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'goals'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Financial Goals</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Action Controls & User Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher (Default INR ₹) */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-slate-700 transition-colors cursor-pointer"
              title="Change Display Currency"
            >
              <span className="text-emerald-400 font-mono font-bold text-sm">
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
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1 z-50 overflow-hidden">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    Select Currency (Default: INR)
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${
                          currency === c.code
                            ? 'text-emerald-400 font-bold bg-emerald-500/10'
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Start Interactive Product Tour"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Tour</span>
          </button>

          {/* Add Daily Earning Button */}
          <button
            onClick={onOpenNewEarningModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden xs:inline">Add Earning</span>
            <span className="xs:hidden">Add</span>
          </button>

          {/* User Profile Pill / Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {user?.displayName || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user?.email || ''}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-semibold text-white truncate">
                      {user?.displayName || 'Google Account'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                    <div className="mt-2 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Google Account Verified</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onTabChange('settings');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account & Preferences</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenTour();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Product Tour & Guide</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-navigation bar on mobile/tablet */}
      <div className="lg:hidden border-t border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === 'overview'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('ledger')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            currentTab === 'ledger'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Ledger</span>
          <span className="font-mono text-[10px] text-slate-400">({ledgerCount})</span>
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === 'analytics'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Reports & Analytics
        </button>
        <button
          onClick={() => onTabChange('goals')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === 'goals'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Goals
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
