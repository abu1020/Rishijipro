import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Target,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewEarningModal?: () => void;
}

interface TourStep {
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  keyPoints: { label: string; detail: string }[];
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ProfitTrack Daily',
    badge: 'Step 1 of 5 • Overview',
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    description:
      'ProfitTrack Daily is your private financial command center designed to track daily income, calculate real-time net take-home pay, and generate audit-ready reports.',
    keyPoints: [
      {
        label: 'Private Account Workspace',
        detail: 'Your financial entries are strictly private and isolated to your account.',
      },
      {
        label: 'Live Real-Time Sync',
        detail: 'Instant live synchronization updates your analytics automatically.',
      },
      {
        label: 'Default Currency (₹ INR)',
        detail: 'Preconfigured in Indian Rupees (₹) with authentic Indian numbering format.',
      },
    ],
    tip: 'Your financial data is completely private and accessible only when signed in with your account.',
  },
  {
    title: 'Recording a Daily Earning',
    badge: 'Step 2 of 5 • Entry Form',
    icon: <Plus className="w-5 h-5 text-cyan-400" />,
    description:
      'Click the "+ Record Daily Earning" button in the top navigation anytime to open the financial entry form.',
    keyPoints: [
      {
        label: 'Date & Time',
        detail: 'Defaults to today, or select historical dates for retroactive records.',
      },
      {
        label: 'Gross vs Deductions',
        detail: 'Enter gross billed amount and any taxes, TDS, platform cuts, or gateway fees.',
      },
      {
        label: 'Auto Real-Time Net',
        detail: 'Gross - Deductions = Net Take-Home calculated dynamically in real-time!',
      },
      {
        label: 'UPI & Payment Methods',
        detail: 'Track UPI, NEFT/RTGS, Stripe, Cards, Cash, or PayPal with Received/Pending status.',
      },
    ],
    tip: 'Mark entries as "Received", "Pending", or "Partially Paid" to keep outstanding receivables under control.',
  },
  {
    title: 'Setting Monthly Financial Goals',
    badge: 'Step 3 of 5 • Goals & Pace',
    icon: <Target className="w-5 h-5 text-amber-400" />,
    description:
      'Stay motivated and on track with the Financial Goals engine that calculates your daily run rate and milestone achievement in real-time.',
    keyPoints: [
      {
        label: 'Target Monthly Net',
        detail: 'Define your desired net income target for the active month (default ₹1,00,000).',
      },
      {
        label: 'Visual Progress Bar',
        detail: 'Watch your progress bar advance as new earnings are recorded.',
      },
      {
        label: 'Current vs Required Pace',
        detail: 'Instantly view your average ₹/day pace and what is required to reach 100%.',
      },
    ],
    tip: 'Milestone badges celebrate when you cross 50%, reach the final stretch, or crush your goal!',
  },
  {
    title: 'Interactive Reports & Multi-Filter Engine',
    badge: 'Step 4 of 5 • Analytics',
    icon: <Filter className="w-5 h-5 text-indigo-400" />,
    description:
      'Slice and dice your income across multiple dimensions with instant filter synchronization across KPI cards, visual charts, and tables.',
    keyPoints: [
      {
        label: 'Date Range Presets',
        detail: 'Quick-toggle Today, Yesterday, This Week, This Month, Last Month, This Year, or Custom range.',
      },
      {
        label: 'Multi-Attribute Filters',
        detail: 'Filter by revenue Category, Payment Method (UPI, Bank Transfer, etc.), or Status.',
      },
      {
        label: 'Instant Search Bar',
        detail: 'Search clients, invoice numbers, or notes with immediate typing response.',
      },
    ],
    tip: 'KPI cards automatically recalculate gross, taxes withheld, net, and pending amounts based on active filters.',
  },
  {
    title: 'Visual Trends, Vouchers & CSV Export',
    badge: 'Step 5 of 5 • Accounting & Export',
    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
    description:
      'Seamlessly export your data for your accountant, tax filings, or spreadsheet workflows.',
    keyPoints: [
      {
        label: 'Visual Trends Chart',
        detail: 'Toggle between smooth Line and Bar charts comparing Net vs Gross vs Deductions.',
      },
      {
        label: 'Category Doughnut',
        detail: 'See which service or product generates the highest share of take-home revenue.',
      },
      {
        label: 'Export to CSV',
        detail: 'Click "Export to CSV" to download an accounting-ready spreadsheet of any filtered view.',
      },
      {
        label: 'Row Actions',
        detail: 'Print voucher receipts, duplicate recurring earnings, edit, or delete with safety prompts.',
      },
    ],
    tip: 'You can replay this tour anytime from the "Tour" button in the top navigation bar.',
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onOpenNewEarningModal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('earnings_tracker_tour_completed', 'true');
    onClose();
  };

  const handleRecordFirst = () => {
    handleFinish();
    if (onOpenNewEarningModal) {
      onOpenNewEarningModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Clickable Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={handleFinish}
        title="Click anywhere outside to close tour"
      />

      {/* Tour Dialog Modal - Guaranteed to fit on any screen without cutting off buttons */}
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Sticky Header with Prominent Close Button */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider truncate">
              {currentStep.badge}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFinish}
              className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={handleFinish}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Close Tour (Esc)"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Step Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              {currentStep.icon}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Key Bullet Points Box */}
          <div className="space-y-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            {currentStep.keyPoints.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white font-semibold">{item.label}:</strong>{' '}
                  <span className="text-slate-400">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Helpful Tip Footer Box */}
          {currentStep.tip && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="leading-tight">{currentStep.tip}</span>
            </div>
          )}
        </div>

        {/* Sticky Tour Navigation Footer - Always Visible on Screen */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStepIndex === idx
                    ? 'w-5 bg-emerald-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {isLastStep ? (
              <button
                onClick={handleRecordFirst}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
