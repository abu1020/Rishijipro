import React from 'react';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden animate-fadeIn">
        {/* Background ambient glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Badge & Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-800/90 border border-slate-700/80 text-emerald-400 flex items-center justify-center shadow-inner">
          <FileQuestion className="w-8 h-8" />
        </div>

        {/* Title & Copy */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            Error 404 · Unrecorded Route
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The ledger path or financial view you requested does not exist or has been relocated.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Security watermark */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>rishi Jha · Professional GST and TDS Accountant</span>
          </span>
          <span className="font-mono text-[10px]">404_NOT_FOUND</span>
        </div>
      </div>
    </div>
  );
};
