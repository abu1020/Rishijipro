/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Earning, EarningFormData, FilterState, PaymentStatus } from './types';
import { getPresetDateRange, getTodayISO } from './utils/dateUtils';
import { DashboardTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CommandPalette } from './components/CommandPalette';
import { LoginScreen } from './components/LoginScreen';
import { EarningModal } from './components/EarningModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DetailModal } from './components/DetailModal';
import { OnboardingTour } from './components/OnboardingTour';
import { ClearAllModal } from './components/ClearAllModal';
import { NotFoundPage } from './components/NotFoundPage';
import { GstTdsCalculatorModal } from './components/GstTdsCalculatorModal';
import { MonthlySummaryModal } from './components/MonthlySummaryModal';

// Dedicated Views
import { OverviewView } from './components/views/OverviewView';
import { LedgerView } from './components/views/LedgerView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { GoalsView } from './components/views/GoalsView';
import { SettingsView } from './components/views/SettingsView';

import { exportEarningsToCSV, exportDatabaseBackupJSON } from './utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { user, monthlyGoal, currency, loading: authLoading } = useAuth();
  const { success, error, info } = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isNotFound, setIsNotFound] = useState<boolean>(() => {
    const p = window.location.pathname.replace(/\/+$/, '');
    const validPaths = ['', '/', '/overview', '/ledger', '/analytics', '/goals', '/settings'];
    return p !== '' && !validPaths.includes(p);
  });

  // Command Palette & Mobile Drawer
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Primary state
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Active Filters
  const defaultDateRange = getPresetDateRange('this_month');
  const [filters, setFilters] = useState<FilterState>({
    preset: 'this_month',
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    category: 'all',
    paymentMethod: 'all',
    paymentStatus: 'all',
    searchQuery: '',
  });

  // Modals state
  const [isEarningModalOpen, setIsEarningModalOpen] = useState(false);
  const [earningModalMode, setEarningModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [activeEarning, setActiveEarning] = useState<Earning | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [earningToDelete, setEarningToDelete] = useState<Earning | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [earningToView, setEarningToView] = useState<Earning | null>(null);

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background body scroll jitter when mobile drawer or modals are open
  useEffect(() => {
    const hasOpenModal =
      isMobileSidebarOpen ||
      isEarningModalOpen ||
      isDetailModalOpen ||
      isDeleteModalOpen ||
      isClearAllModalOpen ||
      isTourOpen ||
      isCalculatorOpen ||
      isMonthlySummaryOpen ||
      isCommandPaletteOpen;

    if (hasOpenModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    isMobileSidebarOpen,
    isEarningModalOpen,
    isDetailModalOpen,
    isDeleteModalOpen,
    isClearAllModalOpen,
    isTourOpen,
    isCalculatorOpen,
    isMonthlySummaryOpen,
    isCommandPaletteOpen,
  ]);

  // Real-time Firestore synchronization scoped to users/{uid}/earnings
  useEffect(() => {
    if (!user) {
      setEarnings([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const subcollectionPath = `users/${user.uid}/earnings`;
    const earningsRef = collection(db, 'users', user.uid, 'earnings');
    const q = query(earningsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Earning[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: d.userId || user.uid,
            date: d.date || getTodayISO(),
            grossAmount: Number(d.grossAmount) || 0,
            deductions: Number(d.deductions) || 0,
            netAmount: Number(d.netAmount) || 0,
            category: d.category || 'General',
            clientName: d.clientName || undefined,
            paymentMethod: d.paymentMethod || undefined,
            paymentStatus: d.paymentStatus || 'Received',
            referenceId: d.referenceId || undefined,
            notes: d.notes || undefined,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        });
        setEarnings(items);
        setDataLoading(false);
      },
      (err) => {
        console.error('Error fetching earnings:', err);
        handleFirestoreError(err, OperationType.LIST, subcollectionPath);
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Current Month Net Earnings for mini goal widget
  const currentMonthNet = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return earnings
      .filter((e) => e.date.startsWith(prefix))
      .reduce((sum, e) => sum + e.netAmount, 0);
  }, [earnings]);

  // Distinct categories and payment methods for filter dropdowns
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    earnings.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [earnings]);

  const availablePaymentMethods = useMemo(() => {
    const set = new Set<string>();
    earnings.forEach((e) => {
      if (e.paymentMethod) set.add(e.paymentMethod);
    });
    return Array.from(set);
  }, [earnings]);

  // Instant Multi-Attribute Filtering Engine
  const filteredEarnings = useMemo(() => {
    return earnings.filter((e) => {
      if (filters.startDate && e.date < filters.startDate) return false;
      if (filters.endDate && e.date > filters.endDate) return false;
      if (filters.category !== 'all' && e.category !== filters.category) return false;
      if (filters.paymentMethod !== 'all' && e.paymentMethod !== filters.paymentMethod) return false;
      if (filters.paymentStatus !== 'all' && e.paymentStatus !== filters.paymentStatus) return false;

      if (filters.searchQuery.trim()) {
        const queryStr = filters.searchQuery.toLowerCase();
        const client = (e.clientName || '').toLowerCase();
        const refId = (e.referenceId || '').toLowerCase();
        const notes = (e.notes || '').toLowerCase();
        const category = (e.category || '').toLowerCase();

        if (
          !client.includes(queryStr) &&
          !refId.includes(queryStr) &&
          !notes.includes(queryStr) &&
          !category.includes(queryStr)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [earnings, filters]);

  // CRUD Actions
  const handleSaveEarning = async (formData: EarningFormData) => {
    if (!user) throw new Error('You must be signed in to save earnings.');

    const subcollectionPath = `users/${user.uid}/earnings`;
    const nowIso = new Date().toISOString();

    try {
      if (earningModalMode === 'edit' && activeEarning) {
        const docRef = doc(db, 'users', user.uid, 'earnings', activeEarning.id);
        const updatePayload: Record<string, unknown> = {
          date: formData.date,
          grossAmount: formData.grossAmount,
          deductions: formData.deductions,
          netAmount: formData.netAmount,
          category: formData.category,
          paymentStatus: formData.paymentStatus,
          clientName: formData.clientName || '',
          paymentMethod: formData.paymentMethod || 'Bank Transfer',
          referenceId: formData.referenceId || '',
          notes: formData.notes || '',
          updatedAt: nowIso,
        };

        await updateDoc(docRef, updatePayload);
        success('Earning entry updated successfully.');
      } else {
        const createPayload: Record<string, unknown> = {
          userId: user.uid,
          date: formData.date,
          grossAmount: formData.grossAmount,
          deductions: formData.deductions,
          netAmount: formData.netAmount,
          category: formData.category,
          paymentStatus: formData.paymentStatus,
          clientName: formData.clientName || '',
          paymentMethod: formData.paymentMethod || 'Bank Transfer',
          referenceId: formData.referenceId || '',
          notes: formData.notes || '',
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        await addDoc(collection(db, 'users', user.uid, 'earnings'), createPayload);
        success(
          earningModalMode === 'duplicate'
            ? 'Duplicated earning created successfully.'
            : 'New earning recorded successfully.'
        );
      }
    } catch (err: unknown) {
      console.error('Failed to save earning:', err);
      handleFirestoreError(
        err,
        earningModalMode === 'edit' ? OperationType.UPDATE : OperationType.CREATE,
        subcollectionPath
      );
    }
  };

  const handleConfirmDelete = async (id: string) => {
    if (!user) return;
    const subcollectionPath = `users/${user.uid}/earnings/${id}`;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'earnings', id));
      success('Earning record deleted permanently.');
    } catch (err: unknown) {
      console.error('Failed to delete earning:', err);
      handleFirestoreError(err, OperationType.DELETE, subcollectionPath);
    }
  };

  const handleConfirmClearAll = async () => {
    if (!user) return;
    const subcollectionPath = `users/${user.uid}/earnings`;

    try {
      info('Erasing all ledger transactions...');
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'earnings'));
      const batchDeletes = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'users', user.uid, 'earnings', docSnap.id))
      );
      await Promise.all(batchDeletes);
      success('All transactions have been deleted from your ledger.');
      setIsClearAllModalOpen(false);
    } catch (err: unknown) {
      console.error('Failed to clear all earnings:', err);
      handleFirestoreError(err, OperationType.DELETE, subcollectionPath);
    }
  };

  // Bulk Operations
  const handleBulkUpdateStatus = async (ids: string[], newStatus: PaymentStatus) => {
    if (!user || ids.length === 0) return;
    const subcollectionPath = `users/${user.uid}/earnings`;
    try {
      const nowIso = new Date().toISOString();
      await Promise.all(
        ids.map((id) =>
          updateDoc(doc(db, 'users', user.uid, 'earnings', id), {
            paymentStatus: newStatus,
            updatedAt: nowIso,
          })
        )
      );
      success(`Updated ${ids.length} transaction${ids.length > 1 ? 's' : ''} to ${newStatus}.`);
    } catch (err: unknown) {
      console.error('Failed to bulk update status:', err);
      handleFirestoreError(err, OperationType.UPDATE, subcollectionPath);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    const subcollectionPath = `users/${user.uid}/earnings`;
    try {
      await Promise.all(
        ids.map((id) => deleteDoc(doc(db, 'users', user.uid, 'earnings', id)))
      );
      success(`Deleted ${ids.length} transaction${ids.length > 1 ? 's' : ''} successfully.`);
    } catch (err: unknown) {
      console.error('Failed to bulk delete:', err);
      handleFirestoreError(err, OperationType.DELETE, subcollectionPath);
    }
  };

  const handleApplyCalculatedEarning = (data: {
    grossAmount: number;
    deductions: number;
    category: string;
    notes: string;
  }) => {
    setActiveEarning({
      id: '',
      userId: user?.uid || '',
      date: getTodayISO(),
      grossAmount: data.grossAmount,
      deductions: data.deductions,
      netAmount: Math.round((data.grossAmount - data.deductions) * 100) / 100,
      category: data.category,
      paymentStatus: 'Received',
      paymentMethod: 'Bank Transfer',
      notes: data.notes,
    });
    setEarningModalMode('create');
    setIsEarningModalOpen(true);
  };

  // 404 Route Handler
  if (isNotFound) {
    return (
      <NotFoundPage
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setIsNotFound(false);
          setActiveTab('overview');
        }}
      />
    );
  }

  // Auth Loading View
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex flex-col items-center justify-center text-slate-300 gap-6 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />
        
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full"
          />
          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin relative z-10" />
        </div>
        
        <div className="flex flex-col items-center gap-2 relative z-10">
          <p className="text-sm font-bold tracking-[0.2em] text-blue-400 uppercase">ProfitTrack</p>
          <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">Synchronizing Ledger...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated: Show Landing & Google Sign-In Screen
  if (!user) {
    return <LoginScreen />;
  }

return (
  <div className="min-h-screen bg-[var(--app-bg)] text-slate-100 flex flex-col selection:bg-blue-900 selection:text-white relative overflow-x-hidden">
    {/* ProfitTrack Midnight Blue Canvas */}
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[var(--app-bg)] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.16),rgba(8,15,36,0))]">
      {/* Subtle hairline blue top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
    </div>

    {/* 1. Left Fixed Sidebar (Desktop) + Off-Canvas Mobile Drawer */}
    <Sidebar
      currentTab={activeTab}
      onTabChange={setActiveTab}
      onOpenNewEarningModal={() => {
        setActiveEarning(null);
        setEarningModalMode('create');
        setIsEarningModalOpen(true);
      }}
      onOpenTour={() => setIsTourOpen(true)}
      ledgerCount={earnings.length}
      monthlyGoal={monthlyGoal}
      currentMonthNet={currentMonthNet}
      isOpenMobile={isMobileSidebarOpen}
      onCloseMobile={() => setIsMobileSidebarOpen(false)}
      onOpenCalculator={() => setIsCalculatorOpen(true)}
      onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
    />

    {/* 2. Main Content Canvas (Padded Left for Desktop Sidebar) */}
    <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
      {/* Top Header Bar */}
      <TopHeader
        currentTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewEarningModal={() => {
          setActiveEarning(null);
          setEarningModalMode('create');
          setIsEarningModalOpen(true);
        }}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
      />

      {/* View Content Canvas */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12 lg:pb-8 flex-1 space-y-6 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'overview' && (
              <OverviewView
                earnings={earnings}
                filteredEarnings={filteredEarnings}
                filters={filters}
                onNavigateToLedger={() => setActiveTab('ledger')}
                onNavigateToAnalytics={() => setActiveTab('analytics')}
                onNavigateToGoals={() => setActiveTab('goals')}
                onNavigateToSettings={() => setActiveTab('settings')}
                onOpenNewEarningModal={() => {
                  setActiveEarning(null);
                  setEarningModalMode('create');
                  setIsEarningModalOpen(true);
                }}
                onViewEarning={(item) => {
                  setEarningToView(item);
                  setIsDetailModalOpen(true);
                }}
                onEditEarning={(item) => {
                  setActiveEarning(item);
                  setEarningModalMode('edit');
                  setIsEarningModalOpen(true);
                }}
                onDeleteEarning={(item) => {
                  setEarningToDelete(item);
                  setIsDeleteModalOpen(true);
                }}
                onOpenCalculator={() => setIsCalculatorOpen(true)}
                onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
              />
            )}

            {activeTab === 'ledger' && (
              <LedgerView
                earnings={earnings}
                filteredEarnings={filteredEarnings}
                filters={filters}
                onFilterChange={setFilters}
                categories={availableCategories}
                paymentMethods={availablePaymentMethods}
                onView={(item) => {
                  setEarningToView(item);
                  setIsDetailModalOpen(true);
                }}
                onEdit={(item) => {
                  setActiveEarning(item);
                  setEarningModalMode('edit');
                  setIsEarningModalOpen(true);
                }}
                onDuplicate={(item) => {
                  setActiveEarning(item);
                  setEarningModalMode('duplicate');
                  setIsEarningModalOpen(true);
                }}
                onDelete={(item) => {
                  setEarningToDelete(item);
                  setIsDeleteModalOpen(true);
                }}
                onNew={() => {
                  setActiveEarning(null);
                  setEarningModalMode('create');
                  setIsEarningModalOpen(true);
                }}
                onBulkUpdateStatus={handleBulkUpdateStatus}
                onBulkDelete={handleBulkDelete}
                onOpenCalculator={() => setIsCalculatorOpen(true)}
                onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                earnings={earnings}
                filteredEarnings={filteredEarnings}
                filters={filters}
                onFilterChange={setFilters}
                categories={availableCategories}
                paymentMethods={availablePaymentMethods}
              />
            )}

            {activeTab === 'goals' && <GoalsView earnings={earnings} />}

            {activeTab === 'settings' && (
              <SettingsView
                earnings={earnings}
                earningsCount={earnings.length}
                onOpenClearAllModal={() => setIsClearAllModalOpen(true)}
                onOpenTour={() => setIsTourOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quiet Editorial Footer */}
        <footer className="border-t border-blue-500/15 bg-[var(--app-bg)]/95 backdrop-blur-xl py-5 text-xs text-slate-400">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-semibold text-slate-300">rishi Jha · Professional GST and TDS Accountant</span>
            <div className="flex items-center gap-3">
              <span className="text-blue-400">Google OAuth Verified</span>
              <span className="text-blue-500/30">·</span>
              <button
                onClick={() => setIsTourOpen(true)}
                className="hover:text-blue-300 transition-colors cursor-pointer"
              >
                Product Tour
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onOpenNewEarning={() => {
          setActiveEarning(null);
          setEarningModalMode('create');
          setIsEarningModalOpen(true);
        }}
        onExportCSV={() => exportEarningsToCSV(filteredEarnings, currency)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
      />

      <EarningModal
        isOpen={isEarningModalOpen}
        onClose={() => setIsEarningModalOpen(false)}
        onSave={handleSaveEarning}
        onDelete={(item) => {
          setEarningToDelete(item);
          setIsDeleteModalOpen(true);
        }}
        initialData={activeEarning}
        mode={earningModalMode}
        existingCategories={availableCategories}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        earning={earningToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEarningToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        earning={earningToView}
        onClose={() => {
          setIsDetailModalOpen(false);
          setEarningToView(null);
        }}
        onEdit={(item) => {
          setActiveEarning(item);
          setEarningModalMode('edit');
          setIsEarningModalOpen(true);
        }}
        onDelete={(item) => {
          setEarningToDelete(item);
          setIsDeleteModalOpen(true);
        }}
      />

      <ClearAllModal
        isOpen={isClearAllModalOpen}
        count={earnings.length}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        onDownloadBackup={() => {
          exportDatabaseBackupJSON(earnings, user?.email || '', currency);
          success('Backup downloaded before ledger deletion.');
        }}
      />

      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenNewEarningModal={() => {
          setActiveEarning(null);
          setEarningModalMode('create');
          setIsEarningModalOpen(true);
        }}
      />

      <GstTdsCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyToEarning={handleApplyCalculatedEarning}
      />

      <MonthlySummaryModal
        isOpen={isMonthlySummaryOpen}
        onClose={() => setIsMonthlySummaryOpen(false)}
        earnings={earnings}
      />
    </div>
  );
}
