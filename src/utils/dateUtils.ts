/**
 * Date utility functions for financial reports and filtering
 */

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayISO(): string {
  return formatDateToISO(new Date());
}

export function getPresetDateRange(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = formatDateToISO(now);

  switch (preset) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr };

    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yStr = formatDateToISO(yesterday);
      return { startDate: yStr, endDate: yStr };
    }

    case 'this_week': {
      // Monday as first day of week
      const current = new Date(now);
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(current.setDate(diff));
      return { startDate: formatDateToISO(monday), endDate: todayStr };
    }

    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatDateToISO(firstDay), endDate: todayStr };
    }

    case 'last_month': {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: formatDateToISO(firstDayLastMonth),
        endDate: formatDateToISO(lastDayLastMonth),
      };
    }

    case 'this_year': {
      const firstDayYear = new Date(now.getFullYear(), 0, 1);
      return { startDate: formatDateToISO(firstDayYear), endDate: todayStr };
    }

    case 'all_time':
    default:
      return { startDate: '', endDate: '' };
  }
}

export function formatHumanDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseISODate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseISODate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysCountBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = parseISODate(startDateStr);
  const end = parseISODate(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}
