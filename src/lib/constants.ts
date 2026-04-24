import { CurrencyInfo, GoldPurity } from '@/types';

// ─── Gold Constants ──────────────────────────────────────────────
export const TROY_OUNCE_TO_GRAMS = 31.1035;

export const GOLD_PURITIES: Record<GoldPurity, { label: string; factor: number; karat: string }> = {
  999: { label: '999 (24K)', factor: 0.999, karat: '24K' },
  916: { label: '916 (22K)', factor: 0.916, karat: '22K' },
  750: { label: '750 (18K)', factor: 0.750, karat: '18K' },
};

// ─── All World Currencies ────────────────────────────────────────
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', flag: '🇵🇪' },
];

// ─── Default Settings ────────────────────────────────────────────
export const DEFAULT_CRAFTING_FEE_PERCENT = 8;
export const DEFAULT_RETAIL_MARKUP_PERCENT = 15;

// ─── Demo Data ───────────────────────────────────────────────────
export const DEMO_GOLD_PRICE_USD = 3318.45;
export const DEMO_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  MYR: 4.425,
  SGD: 1.335,
  EUR: 0.882,
  GBP: 0.756,
  JPY: 143.50,
  CNY: 7.245,
  KRW: 1365.0,
  INR: 84.25,
  IDR: 15850.0,
  THB: 33.85,
  PHP: 56.45,
  VND: 25350.0,
  AUD: 1.545,
  NZD: 1.685,
  CAD: 1.375,
  CHF: 0.865,
  HKD: 7.785,
  TWD: 32.15,
  AED: 3.673,
  SAR: 3.751,
  QAR: 3.641,
  KWD: 0.308,
  BHD: 0.377,
  OMR: 0.385,
  TRY: 38.45,
  ZAR: 18.25,
  BRL: 5.125,
  MXN: 17.15,
  RUB: 92.50,
  SEK: 10.35,
  NOK: 10.75,
  DKK: 6.585,
  PLN: 3.925,
  CZK: 22.45,
  HUF: 355.0,
  RON: 4.425,
  BGN: 1.725,
  HRK: 6.685,
  ILS: 3.625,
  EGP: 48.75,
  NGN: 1580.0,
  KES: 129.50,
  GHS: 15.85,
  PKR: 278.50,
  BDT: 121.50,
  LKR: 298.50,
  MMK: 2100.0,
  KHR: 4050.0,
  LAK: 21500.0,
  BND: 1.335,
  ARS: 875.0,
  CLP: 925.0,
  COP: 3950.0,
  PEN: 3.725,
};

// ─── API Configuration ──────────────────────────────────────────

// Provider endpoints
export const GOLD_API_BASE = 'https://www.goldapi.io/api';
export const METALS_API_BASE = 'https://metals-api.com/api';
export const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com';
export const EXCHANGE_API_BASE = 'https://v6.exchangerate-api.com/v6';

// Cache TTLs
export const CACHE_TTL_GOLD = 5 * 60 * 1000; // 5 min — legacy (used by history route)
export const CACHE_TTL_GOLD_PRICE = 15 * 1000; // 15 seconds — new gold price service
export const CACHE_TTL_EXCHANGE = 60 * 60 * 1000; // 1 hour

// Frontend polling intervals
export const POLL_INTERVAL_GOLD = 15 * 1000; // 15 seconds — near real-time
export const POLL_INTERVAL_EXCHANGE = 30 * 60 * 1000; // 30 minutes

// Request configuration
export const REQUEST_TIMEOUT_MS = 5000; // 5 second timeout per request
export const MAX_RETRIES = 2; // Max 2 retries per provider

// SSE configuration
export const SSE_INTERVAL_MS = 10 * 1000; // Push update every 10 seconds

