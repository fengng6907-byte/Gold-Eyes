import { TrendDirection, MarketInsight, HistoricalDataPoint } from '@/types';

/**
 * Analyze price trend using simple moving average comparison
 */
export function analyzeTrend(data: HistoricalDataPoint[]): TrendDirection {
  if (data.length < 5) return 'neutral';

  const prices = data.map((d) => d.value);
  const recentPrices = prices.slice(-5);
  const olderPrices = prices.slice(-10, -5);

  if (olderPrices.length === 0) return 'neutral';

  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (changePercent > 0.5) return 'bullish';
  if (changePercent < -0.5) return 'bearish';
  return 'neutral';
}

/**
 * Calculate momentum (rate of change)
 */
function calculateMomentum(prices: number[]): number {
  if (prices.length < 2) return 0;
  const first = prices[0];
  const last = prices[prices.length - 1];
  return ((last - first) / first) * 100;
}

/**
 * Generate market commentary based on trend analysis
 */
export function generateCommentary(
  trend: TrendDirection,
  change24h: number,
  spotPrice: number,
  historicalData?: HistoricalDataPoint[]
): string {
  const absChange = Math.abs(change24h).toFixed(2);
  const momentum = historicalData ? calculateMomentum(historicalData.map((d) => d.value)) : 0;
  const absMomentum = Math.abs(momentum).toFixed(1);

  const commentaries: Record<TrendDirection, string[]> = {
    bullish: [
      `Gold is showing strong bullish momentum, up ${absChange}% in the last 24 hours. The current price of $${spotPrice.toFixed(2)}/oz reflects sustained buying pressure. Short-term indicators suggest continued upward movement with ${absMomentum}% momentum.`,
      `Markets are favoring gold as a safe haven, with prices climbing ${absChange}% today. At $${spotPrice.toFixed(2)}/oz, the precious metal is maintaining its uptrend. Technical indicators show ${absMomentum}% positive momentum, suggesting further gains.`,
      `Bullish sentiment dominates the gold market with a ${absChange}% gain today. Trading at $${spotPrice.toFixed(2)}/oz, gold benefits from global uncertainty and inflation hedging. The ${absMomentum}% momentum indicator supports continued strength.`,
    ],
    bearish: [
      `Gold is under selling pressure, declining ${absChange}% in the past 24 hours. At $${spotPrice.toFixed(2)}/oz, the market shows signs of profit-taking. Momentum sits at -${absMomentum}%, indicating potential further weakness.`,
      `The gold market is experiencing a pullback of ${absChange}% as traders lock in profits. Currently at $${spotPrice.toFixed(2)}/oz, technical indicators show -${absMomentum}% momentum. Watch for support levels before re-entry.`,
      `Bearish pressure weighs on gold, down ${absChange}% today to $${spotPrice.toFixed(2)}/oz. Stronger USD and rising yields contribute to the sell-off. The -${absMomentum}% momentum suggests caution in the short term.`,
    ],
    neutral: [
      `Gold is trading sideways at $${spotPrice.toFixed(2)}/oz with minimal movement of ${absChange}% today. The market awaits key economic data for direction. Current momentum is flat at ${absMomentum}%, suggesting consolidation.`,
      `Consolidation continues in the gold market at $${spotPrice.toFixed(2)}/oz. With just ${absChange}% change today, traders are holding positions ahead of upcoming catalysts. The neutral ${absMomentum}% momentum reflects indecision.`,
      `Gold remains range-bound at $${spotPrice.toFixed(2)}/oz, barely moving ${absChange}% today. The market is in a wait-and-see mode, with momentum at ${absMomentum}%. Look for a breakout above or below current levels.`,
    ],
  };

  const options = commentaries[trend];
  // Use the spotPrice as a deterministic seed to pick a commentary
  const index = Math.floor(spotPrice * 100) % options.length;
  return options[index];
}

/**
 * Generate full market insight
 */
export function getMarketInsight(
  data: HistoricalDataPoint[],
  change24h: number,
  spotPrice: number
): MarketInsight {
  const trend = analyzeTrend(data);
  const commentary = generateCommentary(trend, change24h, spotPrice, data);

  // Confidence based on trend consistency
  const prices = data.map((d) => d.value);
  const momentum = Math.abs(calculateMomentum(prices));
  const confidence = Math.min(95, Math.max(30, 50 + momentum * 2));

  return { trend, commentary, confidence };
}
