import { NextResponse } from 'next/server';
import { fetchGoldPriceCompat } from '@/lib/goldPriceService';

/**
 * GET /api/gold
 * 
 * Returns the latest gold spot price (XAU/USD) with currency conversions.
 * Uses multi-provider fallback: GoldAPI → Metals-API → Yahoo Finance → Demo
 * 
 * Response format (backward-compatible):
 * {
 *   price: number,           // USD spot price
 *   previousClose: number,   // Previous close
 *   change24h: number,       // Absolute change
 *   changePercent24h: number, // Percentage change
 *   high24h: number,
 *   low24h: number,
 *   timestamp: number,       // Unix timestamp ms
 *   currency: "USD",
 *   myr: number,             // Price in MYR
 *   sgd: number,             // Price in SGD
 *   source: string,          // Provider name
 *   cached: boolean          // Whether served from cache
 * }
 */
export async function GET() {
  try {
    const data = await fetchGoldPriceCompat();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/gold] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold price', message: (error as Error).message },
      { status: 500 }
    );
  }
}
