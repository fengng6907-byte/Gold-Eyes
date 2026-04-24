import { NextResponse } from 'next/server';
import { fetchGoldPrice } from '@/lib/goldPriceService';

/**
 * GET /api/gold/price
 * 
 * Returns clean, unified gold price JSON as specified in requirements:
 * {
 *   "usd": 2320.50,
 *   "myr": 11000.20,
 *   "sgd": 3150.75,
 *   "change": -5.30,
 *   "changePercent": -0.23,
 *   "high24h": 2335.00,
 *   "low24h": 2310.00,
 *   "previousClose": 2325.80,
 *   "timestamp": "2026-04-25T01:22:00.000Z",
 *   "source": "GoldAPI",
 *   "cached": false
 * }
 */
export async function GET() {
  try {
    const data = await fetchGoldPrice();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[/api/gold/price] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold price', message: (error as Error).message },
      { status: 500 }
    );
  }
}
