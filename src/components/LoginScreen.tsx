import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  Receipt,
  BarChart3,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { isConfigValid } from '../firebase';
import { hapticPress } from '../utils/haptics';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { error } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    hapticPress();
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
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-100 flex flex-col justify-between selection:bg-blue-900 selection:text-white relative">
      {/* Subtle top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full px-6 sm:px-8 py-6 flex items-center justify-between border-b border-blue-500/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              rishi Jha
            </h1>
            <p className="text-[11px] text-slate-400">Professional GST and TDS Accountant</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Encrypted Cloud Storage</span>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-5xl mx-auto w-full px-6 sm:px-8 py-12 sm:py-16 flex-1 flex flex-col items-center justify-center">
        {/* Hero Title */}
        <div className="max-w-2xl text-center space-y-4 mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Financial Ledger & Tax Computation Software
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Record daily revenue, compute 194J/C/I statutory TDS and GST, track monthly targets, and generate audit-ready statements.
          </p>
        </div>

        {/* Center Grid: Feature Preview + Google Sign-In Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
          {/* Capabilities Card */}
          <div className="md:col-span-7 bg-[var(--card-bg)] border border-blue-500/20 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-lg shadow-blue-950/30">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-blue-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--card-subtle)] text-blue-300 border border-blue-500/20 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Daily Ledger & Tax Engine</h3>
                    <p className="text-xs text-slate-400">Real-time calculations & statutory breakdown</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-blue-400">Cloud Sync</span>
              </div>

              <div className="space-y-3.5 py-5">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-md bg-[var(--card-subtle)] text-emerald-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Daily Earning & Deduction Logging</p>
                    <p className="text-slate-400 mt-0.5">Track gross invoiced amounts, statutory TDS deductions, and client settlement status.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-md bg-[var(--card-subtle)] text-emerald-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">GST & TDS Statutory Tax Calculator</p>
                    <p className="text-slate-400 mt-0.5">Built-in engine for 194J/194C/194I, CGST/SGST/IGST, Advance Tax schedules & shareable vouchers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-md bg-[var(--card-subtle)] text-emerald-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Monthly PDF Summaries & CSV Export</p>
                    <p className="text-slate-400 mt-0.5">Printable monthly statements and full CSV accounting exports for filing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-500/15 flex items-center justify-between text-xs text-slate-400">
              <span>Verified Account Privacy</span>
              <span className="font-mono text-blue-400">v2.4</span>
            </div>
          </div>

          {/* Sign-In Card */}
          <div className="md:col-span-5 bg-[var(--card-elevated)] border border-blue-500/25 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-blue-950/40">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-xl bg-[var(--card-subtle)] text-blue-300 border border-blue-500/20 mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Private Account Access</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Sign in with your verified Google account to access your personal financial records.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={isSigningIn || !isConfigValid}
                className="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md border border-white tactile-btn"
              >
                {isSigningIn ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-500" />
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-500/15 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Entries are encrypted and private to your verified account.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-5xl mt-8">
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-blue-500/20 shadow-md">
            <div className="w-7 h-7 rounded-md bg-[var(--card-subtle)] text-blue-300 border border-blue-500/20 flex items-center justify-center mb-2.5">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200 mb-0.5">Visual Analytics</h4>
            <p className="text-xs text-slate-400">
              Interactive revenue charts, monthly run-rate pacing, and category shares.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-blue-500/20 shadow-md">
            <div className="w-7 h-7 rounded-md bg-[var(--card-subtle)] text-blue-300 border border-blue-500/20 flex items-center justify-center mb-2.5">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200 mb-0.5">Financial Goal Tracking</h4>
            <p className="text-xs text-slate-400">
              Set monthly net profit targets, monitor daily pacing, and projected outcomes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-blue-500/20 shadow-md">
            <div className="w-7 h-7 rounded-md bg-[var(--card-subtle)] text-blue-300 border border-blue-500/20 flex items-center justify-center mb-2.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200 mb-0.5">Audit-Ready Export</h4>
            <p className="text-xs text-slate-400">
              Formatted A4 PDF statements and CSV ledgers for tax compliance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 sm:px-8 py-5 border-t border-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>© 2026 rishi Jha • Professional GST and TDS Accountant</p>
        <div className="flex items-center gap-3">
          <span className="text-blue-400">Cloud Sync Active</span>
          <span>·</span>
          <span>Google Workspace Verified</span>
        </div>
      </footer>
    </div>
  );
};
