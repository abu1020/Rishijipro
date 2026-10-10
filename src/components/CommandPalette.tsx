import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Target,
  Settings,
  Download,
  HelpCircle,
  Printer,
  Calculator,
  Vibrate,
} from 'lucide-react';
import { DashboardTab } from './Navbar';
import { hapticSelect, hapticPress, hapticTap, triggerHaptic } from '../utils/haptics';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenNewEarning: () => void;
  onExportCSV: () => void;
  onOpenTour: () => void;
  onOpenCalculator?: () => void;
  onOpenMonthlySummary?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenNewEarning,
  onExportCSV,
  onOpenTour,
  onOpenCalculator,
  onOpenMonthlySummary,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'new-earning',
      title: 'Record New Earning / Invoice',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      action: () => {
        hapticPress();
        onClose();
        onOpenNewEarning();
      },
      shortcut: 'N',
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary Statement & Tax PDF',
      category: 'Actions',
      icon: <Printer className="w-4 h-4 text-sky-400" />,
      action: () => {
        hapticPress();
        onClose();
        if (onOpenMonthlySummary) onOpenMonthlySummary();
      },
      shortcut: 'P',
    },
    {
      id: 'calculator',
      title: 'Open GST & TDS Tax Calculator',
      category: 'Tools',
      icon: <Calculator className="w-4 h-4 text-amber-400" />,
      action: () => {
        hapticPress();
        onClose();
        if (onOpenCalculator) onOpenCalculator();
      },
      shortcut: 'C',
    },
    {
      id: 'test-haptics',
      title: 'Test Haptic Feedback Sensation',
      category: 'Feedback',
      icon: <Vibrate className="w-4 h-4 text-emerald-400" />,
      action: () => {
        triggerHaptic('success');
      },
      shortcut: 'H',
    },
    {
      id: 'export-csv',
      title: 'Export Ledger to CSV Spreadsheet',
      category: 'Actions',
      icon: <Download className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onExportCSV();
      },
      shortcut: 'E',
    },
    {
      id: 'nav-overview',
      title: 'Go to Financial Overview',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onSelectTab('overview');
      },
      shortcut: '1',
    },
    {
      id: 'nav-ledger',
      title: 'Go to Transactions Ledger',
      category: 'Navigation',
      icon: <FileSpreadsheet className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onSelectTab('ledger');
      },
      shortcut: '2',
    },
    {
      id: 'nav-analytics',
      title: 'Go to Reports & Analytics',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onSelectTab('analytics');
      },
      shortcut: '3',
    },
    {
      id: 'nav-goals',
      title: 'Go to Financial Goals',
      category: 'Navigation',
      icon: <Target className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onSelectTab('goals');
      },
      shortcut: '4',
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onSelectTab('settings');
      },
      shortcut: '5',
    },
    {
      id: 'tour',
      title: 'Open Product Tour & Documentation',
      category: 'Help',
      icon: <HelpCircle className="w-4 h-4 text-zinc-400" />,
      action: () => {
        hapticPress();
        onClose();
        onOpenTour();
      },
      shortcut: '?',
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        hapticSelect();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        hapticSelect();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          hapticTap();
          onClose();
        }}
      />

      {/* Palette Dialog */}
      <div className="relative border border-blue-500/25 rounded-xl shadow-2xl max-w-xl w-full z-10 overflow-hidden flex flex-col animate-fadeIn bg-[#0d1836] text-slate-100 shadow-blue-950/60">
        {/* Input Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-500/20 bg-[#091126]">
          <Search className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to view... (Esc to close)"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                hapticTap();
                setQuery('');
              }}
              className="text-xs text-slate-400 hover:text-white p-0.5 cursor-pointer tactile-btn"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded border bg-[#101c3d] text-slate-300 border-blue-500/20">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-all tactile-btn ${
                    isSelected
                      ? 'bg-white text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-blue-900/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">{cmd.icon}</div>
                    <span className="truncate">{cmd.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-slate-700 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                          isSelected
                            ? 'bg-slate-200 text-slate-950 border-slate-300 font-bold'
                            : 'bg-[#101c3d] text-slate-300 border-blue-500/20'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-blue-500/15 bg-[#091126] text-slate-400 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span className="text-blue-400/80">Command Palette · ⌘K</span>
        </div>
      </div>
    </div>
  );
};
