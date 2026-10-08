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
  Database,
  ArrowRight,
  X,
  Command,
  Printer,
} from 'lucide-react';
import { DashboardTab } from './Navbar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenNewEarning: () => void;
  onExportCSV: () => void;
  onOpenTour: () => void;
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
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'new-earning',
      title: 'Record New Daily Earning Entry',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onClose();
        onOpenNewEarning();
      },
      shortcut: 'N',
    },
    {
      id: 'print-page',
      title: 'Print Current View / Financial Statement',
      category: 'Actions',
      icon: <Printer className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onClose();
        setTimeout(() => window.print(), 100);
      },
      shortcut: 'P',
    },
    {
      id: 'export-csv',
      title: 'Export Filtered Ledger to CSV',
      category: 'Actions',
      icon: <Download className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onClose();
        onExportCSV();
      },
    },
    {
      id: 'nav-overview',
      title: 'Go to Financial Overview & Executive Summary',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-slate-300" />,
      action: () => {
        onClose();
        onSelectTab('overview');
      },
      shortcut: '1',
    },
    {
      id: 'nav-ledger',
      title: 'Go to Transactions Ledger',
      category: 'Navigation',
      icon: <FileSpreadsheet className="w-4 h-4 text-slate-300" />,
      action: () => {
        onClose();
        onSelectTab('ledger');
      },
      shortcut: '2',
    },
    {
      id: 'nav-analytics',
      title: 'Go to Reports & Visual Analytics',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-slate-300" />,
      action: () => {
        onClose();
        onSelectTab('analytics');
      },
      shortcut: '3',
    },
    {
      id: 'nav-goals',
      title: 'Go to Monthly Financial Goals & Run Rate',
      category: 'Navigation',
      icon: <Target className="w-4 h-4 text-slate-300" />,
      action: () => {
        onClose();
        onSelectTab('goals');
      },
      shortcut: '4',
    },
    {
      id: 'nav-settings',
      title: 'Go to Account Settings & Currency Preferences',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      action: () => {
        onClose();
        onSelectTab('settings');
      },
      shortcut: '5',
    },
    {
      id: 'tour',
      title: 'Relaunch Interactive Product Tour',
      category: 'Help',
      icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
      action: () => {
        onClose();
        onOpenTour();
      },
      shortcut: '?',
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Dialog */}
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full z-10 overflow-hidden flex flex-col">
        {/* Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, jump to view, or search... (Esc to close)"
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-500 hover:text-slate-300 p-1"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 text-white'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{cmd.icon}</div>
                    <span className="font-medium truncate">{cmd.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded">
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
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ProfitTrack Command Center</span>
        </div>
      </div>
    </div>
  );
};
