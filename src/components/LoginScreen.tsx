import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  PieChart,
  FileSpreadsheet,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  Receipt,
  Wallet,
} from 'lucide-react';
import { isConfigValid } from '../firebase';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { error } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      error(`Sign-in failed: ${msg}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-emerald-600/10 blur-3xl -z-10 pointer-events-none" />

      {/* Top Header - Super Clean with NO Top Sign In Button */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25">
            <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              ProfitTrack <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">Daily</span>
            </h1>
            <p className="text-xs text-slate-400">Financial Reports & Daily Earnings Tracker</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Private & Verified Cloud Storage</span>
        </div>
      </header>

      {/* Main Big Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 sm:py-16 flex-1 flex flex-col items-center justify-center">
        {/* Hero Content Header */}
        <div className="max-w-4xl text-center space-y-6 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-emerald-400 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart Financial Tracking for Independent Creators, Freelancers & Businesses</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Master your daily cash flow with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              complete clarity.
            </span>
          </h2>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Record every daily earning, automate gross vs. net take-home calculations, monitor monthly run rates, and generate audit-ready financial statements.
          </p>
        </div>

        {/* Hero Grid: Interactive Feature Visual + Google Sign-In Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl items-stretch">
          {/* Left Feature & Interactive Preview Card (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Real-Time Financial Precision</h3>
                    <p className="text-xs text-slate-400">Automatic Net Take-Home = Gross Revenue − Deductions</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Cloud Ledger
                </span>
              </div>

              {/* Key Capabilities List */}
              <div className="space-y-4 py-6">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Daily Earning & Deduction Logging</p>
                    <p className="text-xs text-slate-400 mt-0.5">Track every transaction, tax deduction (TDS), payment mode, and client voucher in real-time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Visual Analytics & Category Intelligence</p>
                    <p className="text-xs text-slate-400 mt-0.5">Interactive breakdown charts, monthly pacing curves, and client distribution insights.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Multi-Currency & CSV Export</p>
                    <p className="text-xs text-slate-400 mt-0.5">Formatted for INR (₹), USD ($), EUR (€), and GBP (£) with one-click accounting exports.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Isolated private cloud workspace</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">v2.4 Production Ready</span>
            </div>
          </div>

          {/* Right Sign-In Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl flex flex-col justify-between relative">
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex p-4 rounded-3xl bg-slate-800/90 border border-slate-700/80 shadow-inner">
                  <Lock className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">Private User Workspace</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Sign in with your Google account to access your personal financial ledger.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={isSigningIn || !isConfigValid}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base flex items-center justify-center gap-3.5 shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSigningIn ? (
                  <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isSigningIn ? 'Authenticating...' : 'Sign in with Google'}</span>
                <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Privacy & Account Isolation Notice */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Account Isolation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your entries are strictly private to your verified account. No other user can access or view your records.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mt-12 sm:mt-16">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Daily Income Logging</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track gross revenue, taxes, platform cuts, and payment methods with ease.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Visual Analytics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand revenue distribution across categories, clients, and time intervals.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Financial Goal Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set monthly targets, monitor required daily run-rates, and achieve milestones.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">CSV & Print Reports</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export full financial ledgers formatted cleanly for accountants and tax filings.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 ProfitTrack Daily • Real-Time Daily Financial Ledger</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cloud Sync Active
          </span>
          <span>Google Workspace Verified</span>
        </div>
      </footer>
    </div>
  );
};
