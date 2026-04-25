'use client';

import { useMemo } from 'react';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useGoldHistory } from '@/hooks/useGoldPrice';
import { spotToGramPrice, purityPrice, formatNumber } from '@/lib/goldCalculations';
import { getMarketInsight } from '@/lib/marketAnalysis';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

export default function MalaysiaInsight() {
  const { data: goldData, isLoading: goldLoading } = useGoldPrice();
  const { rates, isLoading: ratesLoading } = useExchangeRates();
  const { data: historyData } = useGoldHistory('7D');

  const isLoading = goldLoading || ratesLoading;

  const insights = useMemo(() => {
    if (!goldData || !rates.MYR) return null;

    const myrRate = rates.MYR;
    const pricePerGramMYR = spotToGramPrice(goldData.price, myrRate);
    const price999 = purityPrice(pricePerGramMYR, 999);
    const price916 = purityPrice(pricePerGramMYR, 916);

    const marketInsight = historyData
      ? getMarketInsight(historyData, goldData.changePercent24h, goldData.price)
      : { trend: 'neutral' as const, commentary: 'Loading market analysis...', confidence: 50 };

    return {
      myrRate,
      pricePerGramMYR,
      price999,
      price916,
      ...marketInsight,
    };
  }, [goldData, rates, historyData]);

  if (isLoading || !insights) {
    return (
      <div className="glass-card p-6 space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in" id="malaysia-insight">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇲🇾</span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Malaysia Gold
          </h3>
        </div>
        <Badge trend={insights.trend} />
      </div>

      {/* Gold Prices */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-muted rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-medium mb-1">999 Gold</div>
          <div className="text-xl font-bold text-gold-gradient">
            RM {formatNumber(insights.price999)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">per gram</div>
        </div>
        <div className="bg-muted rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-medium mb-1">916 Gold</div>
          <div className="text-xl font-bold text-gold-gradient">
            RM {formatNumber(insights.price916)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">per gram</div>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg mb-4">
        <span className="text-xs text-muted-foreground">USD/MYR:</span>
        <span className="text-xs font-semibold">{formatNumber(insights.myrRate, 4)}</span>
      </div>

      {/* AI Commentary */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gold-500/5 to-gold-600/5 p-4 border border-gold-500/10">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-3.5 h-3.5 text-gold-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">
            Market Insight
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Confidence: {Math.round(insights.confidence)}%
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {insights.commentary}
        </p>
      </div>
    </div>
  );
}
