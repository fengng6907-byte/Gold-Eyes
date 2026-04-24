import { NextResponse } from 'next/server';
import { getServiceHealth } from '@/lib/goldPriceService';

/**
 * GET /api/gold/health
 * 
 * Returns health status of all gold price providers, cache statistics,
 * and recent API call logs. Useful for monitoring and debugging.
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "providers": [
 *     {
 *       "name": "GoldAPI",
 *       "totalRequests": 42,
 *       "successCount": 40,
 *       "errorCount": 2,
 *       "avgResponseTimeMs": 320,
 *       "successRate": "95.2%",
 *       "isHealthy": true
 *     },
 *     ...
 *   ],
 *   "cache": { "hits": 100, "misses": 20, "hitRate": "83.3%", "size": 5 },
 *   "recentLogs": [...]
 * }
 */
export async function GET() {
  try {
    const health = getServiceHealth();

    const allHealthy = health.providers.length === 0 ||
      health.providers.some((p) => p.isHealthy);

    return NextResponse.json({
      status: allHealthy ? 'ok' : 'degraded',
      uptime: process.uptime ? Math.round(process.uptime()) : null,
      ...health,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
