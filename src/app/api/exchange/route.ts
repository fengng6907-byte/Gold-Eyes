import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { EXCHANGE_API_BASE, CACHE_TTL_EXCHANGE, DEMO_EXCHANGE_RATES } from '@/lib/constants';

const CACHE_KEY = 'exchange-rates-latest';

export async function GET() {
  // Check cache first
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached);
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(`${EXCHANGE_API_BASE}/${apiKey}/latest/USD`);

      if (response.ok) {
        const data = await response.json();
        if (data.result === 'success') {
          const result = {
            base: 'USD',
            timestamp: Date.now(),
            rates: data.conversion_rates,
          };
          cache.set(CACHE_KEY, result, CACHE_TTL_EXCHANGE);
          return NextResponse.json(result);
        }
      }
    } catch (error) {
      console.error('Exchange Rate API error:', error);
    }
  }

  // Fallback to demo rates (all major world currencies)
  const demoResult = {
    base: 'USD',
    timestamp: Date.now(),
    rates: DEMO_EXCHANGE_RATES,
  };
  cache.set(CACHE_KEY, demoResult, 5 * 60 * 1000);
  return NextResponse.json(demoResult);
}
