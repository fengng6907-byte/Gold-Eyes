// ─── Gold Price Types ────────────────────────────────────────────
export interface GoldPriceData {
  price: number;
  previousClose: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
  currency: string;
}

export interface HistoricalDataPoint {
  time: string; // YYYY-MM-DD format for lightweight-charts
  value: number;
}

export type TimeRange = '1D' | '7D' | '1M' | '1Y';

// ─── Exchange Rate Types ─────────────────────────────────────────
export interface ExchangeRates {
  base: string;
  timestamp: number;
  rates: Record<string, number>;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// ─── Gold Calculation Types ──────────────────────────────────────
export type GoldPurity = 999 | 916 | 750;

export interface JewelryEstimation {
  weightGrams: number;
  purity: GoldPurity;
  country: 'MY' | 'SG';
  craftingFee: {
    type: 'percent' | 'fixed';
    value: number;
  };
  retailMarkup: number; // percentage
}

export interface PriceBreakdown {
  goldCostPerGram: number;
  totalGoldCost: number;
  craftingFeeAmount: number;
  retailMarkupAmount: number;
  totalPrice: number;
  currency: string;
  currencySymbol: string;
}

// ─── Market Analysis Types ───────────────────────────────────────
export type TrendDirection = 'bullish' | 'bearish' | 'neutral';

export interface MarketInsight {
  trend: TrendDirection;
  commentary: string;
  confidence: number; // 0-100
}

// ─── Theme Types ─────────────────────────────────────────────────
export type Theme = 'light' | 'dark';
