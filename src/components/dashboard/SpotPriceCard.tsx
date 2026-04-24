'use client';

import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { ChangeBadge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useGoldPrice } from '@/hooks/useGoldPrice';

export default function SpotPriceCard() {
  const { data, isLoading } = useGoldPrice();

  if (isLoading || !data) return <SkeletonCard />;

  const rangePercent =
    data.high24h !== data.low24h
      ? ((data.price - data.low24h) / (data.high24h - data.low24h)) * 100
      : 50;

  return (
    <div className="glass-card p-6 animate-fade-in relative overflow-hidden" id="spot-price-card">
      {/* Subtle gold glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            XAU / USD
          </span>
          <span className="w-2 h-2 rounded-full bg-green-accent animate-pulse" title="Live" />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-3">
          <AnimatedNumber
            value={data.price}
            decimals={2}
            prefix="$"
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          />
          <span className="text-sm text-muted-foreground font-medium">/oz</span>
        </div>

        {/* Change Badge */}
        <ChangeBadge value={data.change24h} percent={data.changePercent24h} className="mb-5" />

        {/* 24h Range */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>24h Low</span>
            <span>24h Range</span>
            <span>24h High</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-accent/60 via-gold-500 to-green-accent/60 rounded-full transition-all duration-700"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-foreground rounded-full shadow-lg border-2 border-gold-500 transition-all duration-700"
              style={{ left: `${Math.min(Math.max(rangePercent, 5), 95)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-medium mt-1.5">
            <span className="text-red-accent">${data.low24h.toFixed(2)}</span>
            <span className="text-green-accent">${data.high24h.toFixed(2)}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-4 text-[10px] text-muted-foreground">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
