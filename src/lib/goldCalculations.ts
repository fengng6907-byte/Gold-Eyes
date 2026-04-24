import { GoldPurity, PriceBreakdown, JewelryEstimation } from '@/types';
import { TROY_OUNCE_TO_GRAMS, GOLD_PURITIES } from './constants';

/**
 * Convert XAU/USD spot price to price per gram in any currency
 */
export function spotToGramPrice(spotUSD: number, exchangeRate: number): number {
  return (spotUSD / TROY_OUNCE_TO_GRAMS) * exchangeRate;
}

/**
 * Get price per gram for a specific gold purity
 */
export function purityPrice(pricePerGram: number, purity: GoldPurity): number {
  return pricePerGram * GOLD_PURITIES[purity].factor;
}

/**
 * Calculate full jewelry retail price with breakdown
 */
export function estimateJewelryPrice(
  estimation: JewelryEstimation,
  spotPriceUSD: number,
  exchangeRate: number
): PriceBreakdown {
  const pricePerGramPure = spotToGramPrice(spotPriceUSD, exchangeRate);
  const goldCostPerGram = purityPrice(pricePerGramPure, estimation.purity);
  const totalGoldCost = goldCostPerGram * estimation.weightGrams;

  let craftingFeeAmount: number;
  if (estimation.craftingFee.type === 'percent') {
    craftingFeeAmount = totalGoldCost * (estimation.craftingFee.value / 100);
  } else {
    craftingFeeAmount = estimation.craftingFee.value;
  }

  const subtotal = totalGoldCost + craftingFeeAmount;
  const retailMarkupAmount = subtotal * (estimation.retailMarkup / 100);
  const totalPrice = subtotal + retailMarkupAmount;

  const currencyMap: Record<string, { currency: string; symbol: string }> = {
    MY: { currency: 'MYR', symbol: 'RM' },
    SG: { currency: 'SGD', symbol: 'S$' },
  };

  const curr = currencyMap[estimation.country];

  return {
    goldCostPerGram,
    totalGoldCost,
    craftingFeeAmount,
    retailMarkupAmount,
    totalPrice,
    currency: curr.currency,
    currencySymbol: curr.symbol,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD', decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
