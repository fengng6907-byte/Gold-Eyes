import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { generateDemoGoldPrice } from '@/lib/demoData';
import { GOLD_API_BASE, CACHE_TTL_GOLD } from '@/lib/constants';

const CACHE_KEY = 'gold-price-latest';

export async function GET() {
  // Check cache first
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached);
  }

  const apiKey = process.env.GOLD_API_KEY;

  // Try live API if key is available
  if (apiKey) {
    try {
      const response = await fetch(`${GOLD_API_BASE}/XAU/USD`, {
        headers: {
          'x-access-token': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const result = {
          price: data.price,
          previousClose: data.prev_close_price || data.price * 0.997,
          change24h: data.ch || 0,
          changePercent24h: data.chp || 0,
          high24h: data.high_price || data.price * 1.005,
          low24h: data.low_price || data.price * 0.995,
          timestamp: Date.now(),
          currency: 'USD',
        };
        cache.set(CACHE_KEY, result, CACHE_TTL_GOLD);
        return NextResponse.json(result);
      }
    } catch (error) {
      console.error('Gold API error:', error);
    }
  }

  // Fallback to demo data
  const demoData = generateDemoGoldPrice();
  cache.set(CACHE_KEY, demoData, 30000); // Cache demo data for 30 seconds
  return NextResponse.json(demoData);
}
