import { Earning, SUPPORTED_CURRENCIES } from '../types';

export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  try {
    const locale = currency.code === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if specific currency is not standard in browser
    return `${currency.symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatCompactCurrency(amount: number, currencyCode: string = 'INR'): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  if (currency.code === 'INR') {
    if (Math.abs(amount) >= 10_000_000) {
      return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100_000) {
      return `₹${(amount / 100_000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `₹${(amount / 1_000).toFixed(1)}k`;
    }
    return formatCurrency(amount, 'INR');
  }

  if (Math.abs(amount) >= 1_000_000) {
    return `${currency.symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${currency.symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount, currencyCode);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Clean CSV export for financial & accounting reports
 */
export function exportEarningsToCSV(earnings: Earning[], currencyCode: string = 'INR'): void {
  if (earnings.length === 0) return;

  const headers = [
    'Date',
    'Reference ID',
    'Client / Payer',
    'Category',
    `Gross Amount (${currencyCode})`,
    `Deductions / Tax (${currencyCode})`,
    `Net Earnings (${currencyCode})`,
    'Payment Method',
    'Payment Status',
    'Notes / Description',
  ];

  const rows = earnings.map((e) => [
    e.date,
    `"${(e.referenceId || '').replace(/"/g, '""')}"`,
    `"${(e.clientName || 'N/A').replace(/"/g, '""')}"`,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    e.grossAmount.toFixed(2),
    e.deductions.toFixed(2),
    e.netAmount.toFixed(2),
    `"${(e.paymentMethod || 'N/A').replace(/"/g, '""')}"`,
    `"${e.paymentStatus}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Rishi_Jha_GST_TDS_Report_${currencyCode}_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Complete JSON backup export for Firebase Firestore database
 */
export function exportDatabaseBackupJSON(
  earnings: Earning[],
  userEmail: string = '',
  currencyCode: string = 'INR'
): void {
  const backupPayload = {
    app: 'rishi Jha',
    slogan: 'Professional GST and TDS Accountant',
    format: 'RishiJhaAccountingBackup',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userEmail,
    currency: currencyCode,
    totalRecords: earnings.length,
    records: earnings.map((e) => ({
      date: e.date,
      grossAmount: e.grossAmount,
      deductions: e.deductions,
      netAmount: e.netAmount,
      category: e.category,
      clientName: e.clientName || '',
      paymentMethod: e.paymentMethod || 'Bank Transfer',
      paymentStatus: e.paymentStatus,
      referenceId: e.referenceId || '',
      notes: e.notes || '',
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().slice(0, 10);
  const safeEmail = (userEmail || 'account').split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
  link.setAttribute('download', `RishiJha-Backup-${safeEmail}-${now}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

