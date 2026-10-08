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
  ShieldCheck,
} from 'lucide-react';

interface TopHeaderProps {
  currentTab: DashboardTab;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewEarningModal: () => void;
  onOpenTour: () => void;
  onTabChange?: (tab: DashboardTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenNewEarningModal,
  onOpenTour,
  onTabChange,
}) => {
  const { user, logout } = useAuth();
  const { info, error } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
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
        return 'Executive Overview';
      case 'ledger':
        return 'Daily Transactions Ledger';
      case 'analytics':
        return 'Reports & Visual Analytics';
      case 'goals':
        return 'Financial Goals & Run-Rate';
      case 'settings':
        return 'Account & Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 hidden sm:inline">rishi Jha</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h1 className="font-bold text-white tracking-tight truncate text-sm">
            {getBreadcrumbTitle()}
          </h1>
        </div>

        <span className="text-slate-700 hidden md:inline">·</span>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center justify-between w-60 lg:w-72 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
          <span className="truncate">Search records, commands...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right: Add Earning + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Primary Action: Add Earning Button */}
        <button
          onClick={onOpenNewEarningModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">Add Earning</span>
        </button>

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
              title="Account Menu"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName || 'Google Account'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified Account</span>
                    </div>
                  </div>

                  <div className="py-1">
                    {onTabChange && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onTabChange('settings');
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Account & Settings</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenTour();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Product Tour</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer font-semibold"
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
