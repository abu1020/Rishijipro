import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardTab } from './Navbar';
import {
  Menu,
  Search,
  ChevronDown,
  Plus,
  HelpCircle,
  Calendar,
  LogOut,
  Settings,
  Calculator,
  Printer,
  Vibrate,
} from 'lucide-react';
import { hapticTap, hapticPress, triggerHaptic } from '../utils/haptics';

interface TopHeaderProps {
  currentTab: DashboardTab;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewEarningModal: () => void;
  onOpenTour: () => void;
  onTabChange?: (tab: DashboardTab) => void;
  onOpenCalculator?: () => void;
  onOpenMonthlySummary?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenNewEarningModal,
  onOpenTour,
  onTabChange,
  onOpenCalculator,
  onOpenMonthlySummary,
}) => {
  const { user, logout } = useAuth();
  const { info, error } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    hapticPress();
    setIsLoggingOut(true);
    try {
      await logout();
      info('Signed out successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed.';
      error(`Error during sign out: ${msg}`);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Overview';
      case 'ledger':
        return 'Transactions Ledger';
      case 'analytics':
        return 'Analytics & Reports';
      case 'goals':
        return 'Financial Goals';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--app-bg)]/95 backdrop-blur-md border-b border-blue-500/15 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-slate-100">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => {
            hapticTap();
            onOpenMobileSidebar();
          }}
          className="lg:hidden p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-blue-950/60 transition-colors tactile-btn cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-400 hidden sm:inline">Workspace</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h1 className="font-bold text-white tracking-tight truncate text-sm">
            {getBreadcrumbTitle()}
          </h1>
        </div>

        <span className="text-blue-500/30 hidden md:inline">·</span>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={() => {
          hapticTap();
          onOpenCommandPalette();
        }}
        className="hidden md:flex items-center justify-between w-56 lg:w-64 px-2.5 py-1.5 rounded-lg bg-[var(--card-bg)] border border-blue-500/20 hover:border-blue-400/40 text-xs text-slate-300 hover:text-white transition-all cursor-pointer group tactile-btn"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span className="truncate">Search commands...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 bg-blue-950/80 border border-blue-500/30 rounded shadow-xs">
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions + Haptic Feedback + User Menu */}
      <div className="flex items-center gap-2">
        {/* Quick Haptic Feedback Trigger / Pulse */}
        <button
          onClick={() => {
            triggerHaptic('success');
            info('Haptic feel active: Hardware vibration & tactile click enabled.');
          }}
          className="p-1.5 rounded-lg border border-blue-500/20 text-slate-300 hover:text-white hover:bg-blue-950/60 hover:border-blue-400/30 transition-all cursor-pointer tactile-btn"
          title="Tactile Haptic Feel Active (Click to Feel)"
        >
          <Vibrate className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Monthly Summary PDF Statement Button */}
        {onOpenMonthlySummary && (
          <button
            onClick={() => {
              hapticPress();
              onOpenMonthlySummary();
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#132249] border border-blue-500/20 hover:border-blue-400/30 transition-all cursor-pointer tactile-btn bg-[#0d1733]"
            title="Monthly Statement PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">Monthly PDF</span>
          </button>
        )}

        {/* Tax Calculator Button */}
        {onOpenCalculator && (
          <button
            onClick={() => {
              hapticPress();
              onOpenCalculator();
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#132249] border border-blue-500/20 hover:border-blue-400/30 transition-all cursor-pointer tactile-btn bg-[#0d1733]"
            title="GST & TDS Tax Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Tax Engine</span>
          </button>
        )}

        {/* Primary Action: Add Earning Button (Crisp High-Contrast White Element) */}
        <button
          onClick={() => {
            hapticPress();
            onOpenNewEarningModal();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-950 font-bold text-xs shadow-sm border border-white transition-all cursor-pointer tactile-btn"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">Add Earning</span>
        </button>

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                hapticTap();
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-1.5 rounded-lg border border-blue-500/20 hover:border-blue-400/40 bg-[var(--card-bg)] transition-colors cursor-pointer tactile-btn"
              title="Account Menu"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-60 bg-[var(--card-elevated)] border border-blue-500/25 rounded-xl shadow-2xl p-1.5 z-50 divide-y divide-blue-500/15 animate-fadeIn text-slate-100">
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName || 'Account'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {onTabChange && (
                      <button
                        onClick={() => {
                          hapticTap();
                          setShowUserMenu(false);
                          onTabChange('settings');
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs text-slate-200 hover:text-white hover:bg-blue-950/60 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-blue-400" />
                        <span>Settings & Haptics</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        hapticTap();
                        setShowUserMenu(false);
                        onOpenTour();
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs text-slate-200 hover:text-white hover:bg-blue-950/60 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Product Tour</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-2.5 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
