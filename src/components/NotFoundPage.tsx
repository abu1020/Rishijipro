import React from 'react';
import {
  FileQuestion,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { hapticPress, hapticTap } from '../utils/haptics';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-[#080f24] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-900 selection:text-white relative">
      {/* Ambient Radial Blue Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(37,99,235,0.14),transparent)]" />

      <div className="max-w-md w-full bg-[#0d1630] border border-blue-500/20 rounded-2xl p-7 sm:p-8 shadow-2xl text-center space-y-5 animate-fadeIn shadow-blue-950/50">
        {/* 404 Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#101c3d] text-blue-400 border border-blue-500/25 flex items-center justify-center shadow-inner">
          <FileQuestion className="w-7 h-7" />
        </div>

        {/* Title & Copy */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-blue-400 font-mono uppercase tracking-wider font-bold">
            Status 404 · Unrecognized Route
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            The ledger ledger view or destination requested does not exist or has been relocated within the financial workspace.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => {
              hapticPress();
              onGoHome();
            }}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border border-white tactile-btn shadow-sm"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Workspace</span>
          </button>

          <button
            onClick={() => {
              hapticTap();
              window.history.back();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#111e40] hover:bg-[#182955] text-slate-200 text-xs font-semibold border border-blue-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2 tactile-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
