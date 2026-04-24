import { HistoricalDataPoint } from '@/types';
import { DEMO_GOLD_PRICE_USD } from './constants';

/**
 * Generate realistic historical gold price data for demo mode
 */
export function generateDemoHistoricalData(
  range: string,
  basePrice: number = DEMO_GOLD_PRICE_USD
): HistoricalDataPoint[] {
  const now = new Date();
  const data: HistoricalDataPoint[] = [];

  let points: number;
  let intervalMs: number;

  switch (range) {
    case '1D':
      points = 96; // every 15 minutes
      intervalMs = 15 * 60 * 1000;
      break;
    case '7D':
      points = 168; // every hour
      intervalMs = 60 * 60 * 1000;
      break;
    case '1M':
      points = 120; // every 6 hours
      intervalMs = 6 * 60 * 60 * 1000;
      break;
    case '1Y':
      points = 365; // daily
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    default:
      points = 96;
      intervalMs = 15 * 60 * 1000;
  }

  // Start from the past
  const startTime = new Date(now.getTime() - points * intervalMs);
  
  // Use a seeded random walk for consistency
  let price = basePrice * 0.92; // Start lower for 1Y to show growth
  if (range === '1D') price = basePrice * 0.998;
  if (range === '7D') price = basePrice * 0.99;
  if (range === '1M') price = basePrice * 0.97;

  const volatility: Record<string, number> = {
    '1D': 0.001,
    '7D': 0.003,
    '1M': 0.005,
    '1Y': 0.008,
  };

  const vol = volatility[range] || 0.003;
  const upwardBias = 0.0002; // Slight upward trend

  for (let i = 0; i < points; i++) {
    const date = new Date(startTime.getTime() + i * intervalMs);
    // Deterministic pseudo-random based on date
    const seed = date.getTime() / 1000;
    const random = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    const noise = (random - Math.floor(random)) * 2 - 1; // -1 to 1

    price = price * (1 + noise * vol + upwardBias);
    // Clamp to reasonable range
    price = Math.max(basePrice * 0.85, Math.min(basePrice * 1.05, price));

    const dateStr = date.toISOString().split('T')[0];

    data.push({
      time: dateStr,
      value: Math.round(price * 100) / 100,
    });
  }

  // Deduplicate by date (keep last entry per date)
  const seen = new Map<string, HistoricalDataPoint>();
  for (const point of data) {
    seen.set(point.time, point);
  }

  // Ensure the last point is close to the current price
  const entries = Array.from(seen.values());
  if (entries.length > 0) {
    entries[entries.length - 1].value = basePrice;
  }

  return entries;
}

/**
 * Generate a fluctuating demo gold price (simulates real-time movement)
 */
export function generateDemoGoldPrice(basePrice: number = DEMO_GOLD_PRICE_USD) {
  const now = Date.now();
  const seed = Math.sin(now / 10000) * 43758.5453;
  const noise = (seed - Math.floor(seed)) * 2 - 1;
  const fluctuation = noise * basePrice * 0.002;
  const price = basePrice + fluctuation;

  const prevClose = basePrice - basePrice * 0.003;
  const change = price - prevClose;
  const changePercent = (change / prevClose) * 100;

  return {
    price: Math.round(price * 100) / 100,
    previousClose: Math.round(prevClose * 100) / 100,
    change24h: Math.round(change * 100) / 100,
    changePercent24h: Math.round(changePercent * 100) / 100,
    high24h: Math.round((basePrice + basePrice * 0.005) * 100) / 100,
    low24h: Math.round((basePrice - basePrice * 0.008) * 100) / 100,
    timestamp: now,
    currency: 'USD',
  };
}
