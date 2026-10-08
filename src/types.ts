export type PaymentStatus = 'Received' | 'Pending' | 'Partially Paid';

export type PaymentMethod =
  | 'UPI'
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'PayPal'
  | 'Stripe'
  | 'Wise'
  | 'Crypto'
  | 'Cheque'
  | 'Other';

export interface Earning {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  grossAmount: number;
  deductions: number;
  netAmount: number;
  category: string;
  clientName?: string;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  referenceId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EarningFormData = Omit<Earning, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currency?: string;
  monthlyGoal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all_time'
  | 'custom';

export interface FilterState {
  preset: DatePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  category: string; // 'all' or specific
  paymentMethod: string; // 'all' or specific
  paymentStatus: 'all' | PaymentStatus;
  searchQuery: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (R$)' },
];

export const DEFAULT_CATEGORIES = [
  'Freelance & Consulting',
  'Software & Development',
  'Product Sales & Ecommerce',
  'Affiliate & Commission',
  'Content Creation & Ads',
  'Investments & Dividends',
  'Salary & Wages',
  'Design & Creative',
  'Coaching & Courses',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Cash',
  'PayPal',
  'Stripe',
  'Wise',
  'Crypto',
  'Cheque',
  'Other',
];
