import React, { useState, useEffect } from 'react';
import { Earning, EarningFormData, PaymentStatus, DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getTodayISO } from '../utils/dateUtils';
import { hapticTap, hapticPress, hapticSuccess, hapticWarning, hapticSelect } from '../utils/haptics';
import {
  X,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  User,
  AlertCircle,
  Percent,
  Sparkles,
  Plus,
  Receipt,
  Trash2,
  Check,
  Edit2,
  DollarSign,
  Calculator,
} from 'lucide-react';

interface EarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EarningFormData) => Promise<void>;
  onDelete?: (earning: Earning) => void;
  initialData?: Earning | null;
  mode: 'create' | 'edit' | 'duplicate';
  existingCategories: string[];
  onOpenCalculator?: () => void;
}

export const EarningModal: React.FC<EarningModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  mode,
  existingCategories,
  onOpenCalculator,
}) => {
  const { currency } = useAuth();

  // Combine default categories with unique existing categories
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  const [date, setDate] = useState<string>(getTodayISO());
  const [grossAmountStr, setGrossAmountStr] = useState<string>('');
  const [deductionsStr, setDeductionsStr] = useState<string>('0');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Received');
  const [referenceId, setReferenceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize or reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date || getTodayISO());
        setGrossAmountStr(initialData.grossAmount.toString());
        setDeductionsStr((initialData.deductions || 0).toString());

        const isStandard = DEFAULT_CATEGORIES.includes(initialData.category);
        if (isStandard) {
          setCategory(initialData.category);
          setIsCustomCategory(false);
          setCustomCategory('');
        } else {
          setCategory('custom_other');
          setIsCustomCategory(true);
          setCustomCategory(initialData.category);
        }

        setClientName(initialData.clientName || '');
        setPaymentMethod(initialData.paymentMethod || PAYMENT_METHODS[0]);
        setPaymentStatus(initialData.paymentStatus || 'Received');
        setReferenceId(
          mode === 'duplicate'
            ? initialData.referenceId ? `${initialData.referenceId}-COPY` : ''
            : initialData.referenceId || ''
        );
        setNotes(initialData.notes || '');
      } else {
        // Reset to clean defaults
        setDate(getTodayISO());
        setGrossAmountStr('');
        setDeductionsStr('0');
        setCategory(DEFAULT_CATEGORIES[0]);
        setIsCustomCategory(false);
        setCustomCategory('');
        setClientName('');
        setPaymentMethod(PAYMENT_METHODS[0]);
        setPaymentStatus('Received');
        setReferenceId('');
        setNotes('');
      }
      setFormError(null);
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  // Real-time calculation of Net Earnings
  const grossNum = parseFloat(grossAmountStr) || 0;
  const deductionsNum = parseFloat(deductionsStr) || 0;
  const netNum = grossNum - deductionsNum;
  const deductionRate = grossNum > 0 ? deductionsNum / grossNum : 0;

  // Quick Deduction percentage calculation helpers
  const applyDeductionPercent = (percent: number) => {
    hapticSelect();
    if (grossNum > 0) {
      const calculated = Math.round(grossNum * (percent / 100) * 100) / 100;
      setDeductionsStr(calculated.toString());
    } else {
      setDeductionsStr('0');
    }
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    hapticSelect();
    const val = e.target.value;
    if (val === 'custom_other') {
      setIsCustomCategory(true);
      setCategory('custom_other');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!date) {
      hapticWarning();
      setFormError('Please select a valid date.');
      return;
    }

    if (isNaN(grossNum) || grossNum <= 0) {
      hapticWarning();
      setFormError('Gross Amount must be greater than 0.');
      return;
    }

    if (isNaN(deductionsNum) || deductionsNum < 0) {
      hapticWarning();
      setFormError('Deductions must be 0 or greater.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      hapticWarning();
      setFormError('Please select or specify an earning category.');
      return;
    }

    hapticPress();
    setIsSubmitting(true);
    try {
      await onSave({
        date,
        grossAmount: Math.round(grossNum * 100) / 100,
        deductions: Math.round(deductionsNum * 100) / 100,
        netAmount: Math.round(netNum * 100) / 100,
        category: finalCategory,
        clientName: clientName.trim(),
        paymentMethod: paymentMethod || 'Bank Transfer',
        paymentStatus,
        referenceId: referenceId.trim(),
        notes: notes.trim(),
      });
      hapticSuccess();
      onClose();
    } catch (err: unknown) {
      hapticWarning();
      const msg = err instanceof Error ? err.message : 'Failed to save transaction entry.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHeaderTitle = () => {
    if (mode === 'edit') return 'Edit Bill / Transaction';
    if (mode === 'duplicate') return 'Duplicate Transaction';
    return 'Record Daily Earning';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        title="Click outside to close (Esc)"
      />

      {/* Modal Dialog Card (Liquid Glass Elevated) */}
      <div className="relative liquid-glass-elevated border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full z-10 my-auto max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
        {/* Specular Highlight Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] bg-[var(--app-bg)]/40 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl liquid-glass-emerald text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              {mode === 'edit' ? <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : <Receipt className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {getHeaderTitle()}
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                {mode === 'edit'
                  ? `Editing entry ID: ${initialData?.id || ''}`
                  : 'Encrypted & recorded to your personal account ledger'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl liquid-glass-button hover:border-rose-500/40 hover:text-rose-300 text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="shrink-0 mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="leading-relaxed">{formError}</div>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {/* Row 1: Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Transaction Date</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  style={{ colorScheme: 'dark' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-xs cursor-pointer"
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Status <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1 liquid-glass-subtle p-1 rounded-xl min-h-[42px]">
                  {(['Received', 'Pending', 'Partially Paid'] as PaymentStatus[]).map((st) => {
                    const isSelected = paymentStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPaymentStatus(st)}
                        className={`py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? st === 'Received'
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                              : st === 'Pending'
                              ? 'bg-rose-500 text-white font-bold shadow-sm'
                              : 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'Partially Paid' ? 'Partial' : st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: Gross & Deductions with Quick Tax Shortcuts */}
            <div className="liquid-glass-subtle rounded-2xl p-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Gross Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Gross Invoiced</span>
                      <span className="text-rose-400">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({currency})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={grossAmountStr}
                      onFocus={(e) => {
                        if (e.target.value === '0') setGrossAmountStr('');
                      }}
                      onChange={(e) => setGrossAmountStr(e.target.value)}
                      className="w-full pl-3 pr-12 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-sm font-mono font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {currency}
                    </span>
                  </div>
                </div>

                {/* Deductions / Tax / Fees */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tax / Deductions / Fees</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({currency})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={deductionsStr}
                      onFocus={(e) => {
                        if (e.target.value === '0') setDeductionsStr('');
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) setDeductionsStr('0');
                      }}
                      onChange={(e) => setDeductionsStr(e.target.value)}
                      className="w-full pl-3 pr-12 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-sm font-mono font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Tax & Deduction Preset Buttons */}
              <div className="flex items-center flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1">
                  Tax Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applyDeductionPercent(0)}
                  className="px-2 py-0.5 rounded-lg liquid-glass-button text-[11px] text-slate-300 cursor-pointer"
                >
                  0% (None)
                </button>
                <button
                  type="button"
                  onClick={() => applyDeductionPercent(5)}
                  className="px-2 py-0.5 rounded-lg liquid-glass-button text-[11px] text-slate-300 cursor-pointer"
                >
                  5% (Fee)
                </button>
                <button
                  type="button"
                  onClick={() => applyDeductionPercent(10)}
                  className="px-2 py-0.5 rounded-lg liquid-glass-button text-[11px] text-slate-300 cursor-pointer"
                >
                  10% (TDS)
                </button>
                <button
                  type="button"
                  onClick={() => applyDeductionPercent(18)}
                  className="px-2 py-0.5 rounded-lg liquid-glass-button text-[11px] text-slate-300 cursor-pointer"
                >
                  18% (GST)
                </button>
                {onOpenCalculator && (
                  <button
                    type="button"
                    onClick={onOpenCalculator}
                    className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg liquid-glass-button text-[11px] font-semibold text-cyan-300 border-cyan-500/30 hover:border-cyan-400/50 cursor-pointer"
                    title="Open GST & TDS Tax Calculator"
                  >
                    <Calculator className="w-3 h-3 text-cyan-400" />
                    <span>GST/TDS Calculator</span>
                  </button>
                )}
              </div>

              {/* Real-time Net Calculation Display */}
              <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Calculated Net Take-Home
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Gross ({formatCurrency(grossNum, currency)}) - Deductions ({formatCurrency(deductionsNum, currency)})
                  </span>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-mono font-bold tabular-nums ${
                      netNum < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatCurrency(netNum, currency)}
                  </div>
                  {grossNum > 0 && (
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      {formatPercent(deductionRate)} withheld
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Category Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category / Income Source</span>
                  <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    if (!isCustomCategory && !customCategory) {
                      setCustomCategory('');
                    }
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {isCustomCategory ? '← Choose from Standard Categories' : '+ Type Custom Category'}
                </button>
              </div>

              {isCustomCategory ? (
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category name (e.g. YouTube AdSense, Retainer)"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-xs border-emerald-500/60"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-mono">
                    Custom
                  </span>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={handleCategorySelectChange}
                  className="w-full px-3 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-xs cursor-pointer"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[var(--card-bg)] text-white">
                      {cat}
                    </option>
                  ))}
                  <option value="custom_other" className="bg-[var(--card-bg)] text-emerald-400">+ Type Custom Category...</option>
                </select>
              )}
            </div>

            {/* Row 4: Client & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Client / Company / Payer</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp, Jane Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  maxLength={150}
                  className="w-full px-3 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-xs placeholder-slate-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment Settlement Method</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-xs cursor-pointer"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method} className="bg-slate-900 text-white">
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: Reference / Invoice ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <span>Invoice # / Payment Reference ID (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-089, UPI/UTR Ref #"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2.5 min-h-[42px] rounded-xl liquid-glass-input text-white text-xs placeholder-slate-500 font-mono"
              />
            </div>

            {/* Row 6: Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Notes & Remarks (Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Scope of work, milestone delivered, fee breakdown details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                className="w-full px-3 py-2.5 rounded-xl liquid-glass-input text-white text-xs placeholder-slate-500 resize-none"
              />
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-white/[0.08] bg-[var(--app-bg)]/40 backdrop-blur-md flex items-center justify-between gap-3">
            {/* Delete button in edit mode */}
            {mode === 'edit' && initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(initialData);
                }}
                className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 min-h-[40px] rounded-xl liquid-glass-button text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 min-h-[40px] rounded-xl liquid-glass-emerald hover:brightness-110 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : mode === 'edit' ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[3]" />
                )}
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : mode === 'edit'
                    ? 'Update Bill'
                    : mode === 'duplicate'
                    ? 'Save Duplicate'
                    : 'Save Bill'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
