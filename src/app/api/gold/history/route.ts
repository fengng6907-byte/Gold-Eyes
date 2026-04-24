import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { generateDemoHistoricalData } from '@/lib/demoData';

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '1D';
  const cacheKey = `gold-history-${range}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // For historical data, we primarily use demo data since free APIs
  // have very limited historical access. In production, you'd integrate
  // with a paid historical data provider.
  const apiKey = process.env.GOLD_API_KEY;

  if (apiKey && range === '1D') {
    // GoldAPI only has limited historical on free tier
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '');

      const response = await fetch(`https://www.goldapi.io/api/XAU/USD/${dateStr}`, {
        headers: {
          'x-access-token': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Even with API, build chart from available data
        // For now, supplement with demo data
      }
    } catch (error) {
      console.error('Gold History API error:', error);
    }
  }

  // Generate realistic demo historical data
  const data = generateDemoHistoricalData(range);
  const ttl = range === '1D' ? 5 * 60 * 1000 : 15 * 60 * 1000;
  cache.set(cacheKey, data, ttl);

  return NextResponse.json(data);
}
