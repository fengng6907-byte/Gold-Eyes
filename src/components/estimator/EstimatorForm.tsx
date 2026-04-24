'use client';

import { useState, useMemo } from 'react';
import { GoldPurity, JewelryEstimation, PriceBreakdown } from '@/types';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { estimateJewelryPrice, formatNumber } from '@/lib/goldCalculations';
import { GOLD_PURITIES, DEFAULT_CRAFTING_FEE_PERCENT, DEFAULT_RETAIL_MARKUP_PERCENT } from '@/lib/constants';

export default function EstimatorForm() {
  const { data: goldData } = useGoldPrice();
  const { rates } = useExchangeRates();

  const [weight, setWeight] = useState(10);
  const [purity, setPurity] = useState<GoldPurity>(916);
  const [country, setCountry] = useState<'MY' | 'SG'>('MY');
  const [feeType, setFeeType] = useState<'percent' | 'fixed'>('percent');
  const [feeValue, setFeeValue] = useState(DEFAULT_CRAFTING_FEE_PERCENT);
  const [markup, setMarkup] = useState(DEFAULT_RETAIL_MARKUP_PERCENT);

  const breakdown = useMemo<PriceBreakdown | null>(() => {
    if (!goldData || !rates) return null;

    const exchangeRate = country === 'MY' ? rates.MYR : rates.SGD;
    if (!exchangeRate) return null;

    const estimation: JewelryEstimation = {
      weightGrams: weight,
      purity,
      country,
      craftingFee: { type: feeType, value: feeValue },
      retailMarkup: markup,
    };

    return estimateJewelryPrice(estimation, goldData.price, exchangeRate);
  }, [goldData, rates, weight, purity, country, feeType, feeValue, markup]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="glass-card p-6 animate-fade-in" id="estimator-form">
        <h2 className="text-lg font-bold mb-6">Configure Estimation</h2>

        {/* Country */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Country
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'MY', label: '🇲🇾 Malaysia (MYR)', id: 'country-my' },
              { value: 'SG', label: '🇸🇬 Singapore (SGD)', id: 'country-sg' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                id={opt.id}
                onClick={() => setCountry(opt.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  country === opt.value
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
                    : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Gold Weight (grams)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="500"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-gold-500/25"
              id="weight-slider"
            />
            <input
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0.1)}
              className="w-20 px-3 py-2 bg-muted rounded-lg text-sm font-semibold text-center border border-transparent focus:border-gold-500/30 focus:outline-none transition-colors"
              id="weight-input"
            />
          </div>
        </div>

        {/* Purity */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Gold Purity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(GOLD_PURITIES) as [string, { label: string; factor: number; karat: string }][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  onClick={() => setPurity(parseInt(key) as GoldPurity)}
                  className={`px-3 py-3 rounded-xl text-sm transition-all duration-200 border flex flex-col items-center gap-1 ${
                    purity === parseInt(key)
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-500 font-semibold'
                      : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  id={`purity-${key}`}
                >
                  <span className="text-xs font-bold">{info.karat}</span>
                  <span className="text-[10px] opacity-70">{(info.factor * 100).toFixed(1)}% pure</span>
                  {/* Purity bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500"
                      style={{ width: `${info.factor * 100}%` }}
                    />
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* Crafting Fee */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Crafting Fee
          </label>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setFeeType('percent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                feeType === 'percent'
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'bg-muted text-muted-foreground'
              }`}
              id="fee-type-percent"
            >
              Percentage (%)
            </button>
            <button
              onClick={() => setFeeType('fixed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                feeType === 'fixed'
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'bg-muted text-muted-foreground'
              }`}
              id="fee-type-fixed"
            >
              Fixed ({country === 'MY' ? 'RM' : 'S$'})
            </button>
          </div>
          <input
            type="number"
            min="0"
            step="0.5"
            value={feeValue}
            onChange={(e) => setFeeValue(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-muted rounded-xl text-sm font-medium border border-transparent focus:border-gold-500/30 focus:outline-none transition-colors"
            placeholder={feeType === 'percent' ? 'e.g., 8' : 'e.g., 50'}
            id="fee-value-input"
          />
        </div>

        {/* Retail Markup */}
        <div className="mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Retail Markup (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={markup}
              onChange={(e) => setMarkup(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-gold-500/25"
              id="markup-slider"
            />
            <span className="w-14 text-right text-sm font-semibold">{markup}%</span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }} id="price-breakdown">
        <h2 className="text-lg font-bold mb-6">Price Breakdown</h2>

        {!breakdown ? (
          <div className="text-sm text-muted-foreground text-center py-12">
            Loading price data...
          </div>
        ) : (
          <>
            {/* Visual Bar */}
            <div className="mb-6">
              <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                <div
                  className="bg-gold-500 transition-all duration-500"
                  style={{
                    width: `${(breakdown.totalGoldCost / breakdown.totalPrice) * 100}%`,
                  }}
                  title="Gold Cost"
                />
                <div
                  className="bg-gold-300 transition-all duration-500"
                  style={{
                    width: `${(breakdown.craftingFeeAmount / breakdown.totalPrice) * 100}%`,
                  }}
                  title="Crafting Fee"
                />
                <div
                  className="bg-gold-700 transition-all duration-500"
                  style={{
                    width: `${(breakdown.retailMarkupAmount / breakdown.totalPrice) * 100}%`,
                  }}
                  title="Retail Markup"
                />
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gold-500" /> Gold
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gold-300" /> Crafting
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gold-700" /> Markup
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Gold Cost per Gram</span>
                <span className="text-sm font-semibold">
                  {breakdown.currencySymbol} {formatNumber(breakdown.goldCostPerGram)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Total Gold Cost ({weight}g × {GOLD_PURITIES[purity].karat})
                </span>
                <span className="text-sm font-semibold">
                  {breakdown.currencySymbol} {formatNumber(breakdown.totalGoldCost)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Crafting Fee {feeType === 'percent' ? `(${feeValue}%)` : '(fixed)'}
                </span>
                <span className="text-sm font-semibold">
                  {breakdown.currencySymbol} {formatNumber(breakdown.craftingFeeAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Retail Markup ({markup}%)
                </span>
                <span className="text-sm font-semibold">
                  {breakdown.currencySymbol} {formatNumber(breakdown.retailMarkupAmount)}
                </span>
              </div>

              <div className="border-t border-card-border pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Estimated Retail Price</span>
                  <span className="text-2xl font-bold text-gold-gradient">
                    {breakdown.currencySymbol} {formatNumber(breakdown.totalPrice)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 text-right">
                  in {breakdown.currency}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
