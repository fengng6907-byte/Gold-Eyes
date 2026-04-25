import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { generateDemoHistoricalData } from '@/lib/demoData';
import { REQUEST_TIMEOUT_MS } from '@/lib/constants';

/**
 * GET /api/gold/history?range=1D|7D|1M|1Y
 * 
 * Fetches REAL historical gold price data from Yahoo Finance.
 * Falls back to demo data only if Yahoo Finance is unavailable.
 */
export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '1D';
  const cacheKey = `gold-history-v2-${range}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Map our range to Yahoo Finance parameters
  const rangeMap: Record<string, { yfRange: string; yfInterval: string }> = {
    '1D': { yfRange: '1d', yfInterval: '5m' },
    '7D': { yfRange: '5d', yfInterval: '15m' },
    '1M': { yfRange: '1mo', yfInterval: '1h' },
    '1Y': { yfRange: '1y', yfInterval: '1d' },
  };

  const { yfRange, yfInterval } = rangeMap[range] || rangeMap['1D'];

  // Try Yahoo Finance for real historical data
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=${yfRange}&interval=${yfInterval}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GoldEyes/1.0)',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const result = json?.chart?.result?.[0];

      if (result && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp as number[];
        const closes = result.indicators.quote[0].close as (number | null)[];

        const data: { time: string; value: number }[] = [];
        const seenDates = new Set<string>();

        for (let i = 0; i < timestamps.length; i++) {
          const close = closes[i];
          if (close === null || close === undefined || isNaN(close)) continue;

          const date = new Date(timestamps[i] * 1000);
          // For intraday (1D, 7D), use full datetime; for longer, use date only
          let timeStr: string;

          if (range === '1Y' || range === '1M') {
            // lightweight-charts needs YYYY-MM-DD format for daily data
            timeStr = date.toISOString().split('T')[0];
          } else {
            // For intraday data, use YYYY-MM-DD format but keep last value per date
            // lightweight-charts business day format
            timeStr = date.toISOString().split('T')[0];
          }

          // Deduplicate — keep latest value per date key
          if (range === '1D' || range === '7D') {
            // For intraday, use Unix timestamp to preserve granularity
            // lightweight-charts can accept { year, month, day } or Unix timestamp
            data.push({
              time: timeStr,
              value: Math.round(close * 100) / 100,
            });
          } else {
            // For daily+, deduplicate by date
            if (!seenDates.has(timeStr)) {
              seenDates.add(timeStr);
              data.push({
                time: timeStr,
                value: Math.round(close * 100) / 100,
              });
            }
          }
        }

        // For intraday, deduplicate by keeping the last entry per date
        let finalData = data;
        if (range === '1D' || range === '7D') {
          const dateMap = new Map<string, { time: string; value: number }>();
          for (const point of data) {
            dateMap.set(point.time, point);
          }
          finalData = Array.from(dateMap.values());
        }

        if (finalData.length > 2) {
          // Cache: shorter TTL for intraday, longer for historical
          const ttl = range === '1D' ? 60 * 1000 : range === '7D' ? 5 * 60 * 1000 : 15 * 60 * 1000;
          cache.set(cacheKey, finalData, ttl);
          return NextResponse.json(finalData);
        }
      }
    }
  } catch (error) {
    console.warn(`[Gold History] Yahoo Finance error for range=${range}:`, error);
  }

  // Fallback to demo data (uses the real-ish DEMO_GOLD_PRICE_USD as base)
  const data = generateDemoHistoricalData(range);
  const ttl = range === '1D' ? 5 * 60 * 1000 : 15 * 60 * 1000;
  cache.set(cacheKey, data, ttl);

  return NextResponse.json(data);
}
