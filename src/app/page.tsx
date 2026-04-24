'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SpotPriceCard from '@/components/dashboard/SpotPriceCard';
import TimeRangeSelector from '@/components/dashboard/TimeRangeSelector';
import MalaysiaInsight from '@/components/dashboard/MalaysiaInsight';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { useGoldHistory } from '@/hooks/useGoldPrice';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { spotToGramPrice, purityPrice, formatNumber } from '@/lib/goldCalculations';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { TimeRange } from '@/types';
import Link from 'next/link';

// Dynamic import for chart (no SSR)
const PriceChart = dynamic(() => import('@/components/dashboard/PriceChart'), {
  ssr: false,
  loading: () => <SkeletonChart />,
});

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const { data: historyData, isLoading: historyLoading } = useGoldHistory(timeRange);
  const { data: goldData } = useGoldPrice();
  const { rates } = useExchangeRates();

  // Quick stats for the hero section
  const myrPerGram = goldData && rates.MYR ? spotToGramPrice(goldData.price, rates.MYR) : null;
  const sgdPerGram = goldData && rates.SGD ? spotToGramPrice(goldData.price, rates.SGD) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Hero Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Gold Price{' '}
          <span className="text-gold-gradient">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Real-time gold price analytics with Malaysia & Singapore market focus.
          Track spot prices, analyze trends, and estimate retail costs.
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 stagger-children">
        <div className="glass-card px-4 py-3">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">XAU/USD</div>
          <div className="text-lg font-bold">
            {goldData ? (
              <AnimatedNumber value={goldData.price} prefix="$" />
            ) : (
              <span className="skeleton inline-block w-24 h-5" />
            )}
          </div>
        </div>
        <div className="glass-card px-4 py-3">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">🇲🇾 MYR/g</div>
          <div className="text-lg font-bold text-gold-gradient">
            {myrPerGram ? `RM ${formatNumber(myrPerGram)}` : <span className="skeleton inline-block w-20 h-5" />}
          </div>
        </div>
        <div className="glass-card px-4 py-3">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">🇸🇬 SGD/g</div>
          <div className="text-lg font-bold">
            {sgdPerGram ? `S$ ${formatNumber(sgdPerGram)}` : <span className="skeleton inline-block w-20 h-5" />}
          </div>
        </div>
        <div className="glass-card px-4 py-3">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">24h Change</div>
          <div className={`text-lg font-bold ${goldData && goldData.change24h >= 0 ? 'text-green-accent' : 'text-red-accent'}`}>
            {goldData ? (
              `${goldData.change24h >= 0 ? '+' : ''}${goldData.changePercent24h.toFixed(2)}%`
            ) : (
              <span className="skeleton inline-block w-16 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Card */}
          <div className="glass-card p-6 animate-fade-in" id="chart-section">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Price Chart
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Gold spot price (XAU/USD)
                </p>
              </div>
              <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
            </div>
            {historyLoading || !historyData ? (
              <div className="skeleton h-[350px] rounded-xl" />
            ) : (
              <PriceChart data={historyData} />
            )}
          </div>

          {/* Spot Price Card */}
          <SpotPriceCard />
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Malaysia Insight */}
          <MalaysiaInsight />

          {/* Quick Links */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Tools
            </h3>
            <div className="space-y-2">
              <Link
                href="/estimator"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-gold-500/5 transition-all duration-200 group"
                id="link-estimator"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 group-hover:bg-gold-500/20 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold">Jewelry Estimator</div>
                  <div className="text-[10px] text-muted-foreground">Calculate retail prices</div>
                </div>
                <svg className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-gold-500 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/calculator"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-gold-500/5 transition-all duration-200 group"
                id="link-calculator"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 group-hover:bg-gold-500/20 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold">Currency Calculator</div>
                  <div className="text-[10px] text-muted-foreground">Convert all currencies</div>
                </div>
                <svg className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-gold-500 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
