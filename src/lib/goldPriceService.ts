/**
 * Gold Price Service — Multi-API Fallback System
 * 
 * Fetches accurate, near real-time gold market data (XAU/USD) from multiple
 * providers with automatic failover, retry logic, and performance tracking.
 * 
 * Provider chain: GoldAPI → Metals-API → Yahoo Finance → Demo Data
 * 
 * Features:
 * - Multi-provider fallback with automatic switching
 * - Configurable retry count (max 2) with exponential backoff
 * - Request timeout control (5 seconds)
 * - In-memory cache with stale-while-revalidate
 * - Integrated currency conversion (MYR, SGD)
 * - API performance logging
 * - Clean JSON output
 */

import { cache } from './cache';
import { apiLogger } from './logger';
import {
  GOLD_API_BASE,
  METALS_API_BASE,
  YAHOO_FINANCE_BASE,
  EXCHANGE_API_BASE,
  CACHE_TTL_GOLD_PRICE,
  CACHE_TTL_EXCHANGE,
  DEMO_GOLD_PRICE_USD,
  DEMO_EXCHANGE_RATES,
  REQUEST_TIMEOUT_MS,
  MAX_RETRIES,
} from './constants';

// ─── Types ───────────────────────────────────────────────────────

export interface GoldPriceResult {
  usd: number;
  myr: number;
  sgd: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  previousClose: number;
  timestamp: string; // ISO8601
  source: string;
  cached: boolean;
}

export interface RawGoldData {
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  previousClose: number;
  timestamp: number;
  source: string;
}

interface ExchangeRateData {
  MYR: number;
  SGD: number;
  [key: string]: number;
}

type ProviderFetcher = () => Promise<RawGoldData>;

// ─── Cache Keys ──────────────────────────────────────────────────

const CK_GOLD_PRICE = 'gold-price-v2';
const CK_EXCHANGE_RATES = 'exchange-rates-v2';

// ─── Fetch with Timeout & Abort ──────────────────────────────────

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Retry Wrapper ───────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  provider: string,
  endpoint: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const startTime = performance.now();

    try {
      const result = await fn();
      const responseTimeMs = Math.round(performance.now() - startTime);

      apiLogger.log({
        provider,
        endpoint,
        status: 'success',
        responseTimeMs,
        attempt,
      });

      return result;
    } catch (error: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      lastError = error instanceof Error ? error : new Error(String(error));

      const isTimeout = lastError.name === 'AbortError' || lastError.message.includes('abort');
      const isRateLimit = lastError.message.includes('429') || lastError.message.includes('rate');

      apiLogger.log({
        provider,
        endpoint,
        status: isTimeout ? 'timeout' : isRateLimit ? 'rate_limited' : 'error',
        responseTimeMs,
        errorMessage: lastError.message,
        attempt,
      });

      // Don't retry on rate limits
      if (isRateLimit) break;

      // Wait before retry (exponential backoff: 500ms, 1500ms)
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError || new Error(`${provider} failed after ${maxRetries + 1} attempts`);
}

// ─── Provider 1: GoldAPI ─────────────────────────────────────────

function createGoldAPIFetcher(): ProviderFetcher | null {
  const apiKey = process.env.GOLD_API_KEY;
  if (!apiKey) return null;

  return async (): Promise<RawGoldData> => {
    const response = await fetchWithTimeout(`${GOLD_API_BASE}/XAU/USD`, {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) throw new Error('429: Rate limit exceeded');
      throw new Error(`GoldAPI HTTP ${status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.price || typeof data.price !== 'number') {
      throw new Error('GoldAPI: Invalid response - missing price field');
    }

    return {
      price: data.price,
      change: data.ch || 0,
      changePercent: data.chp || 0,
      high24h: data.high_price || data.price * 1.005,
      low24h: data.low_price || data.price * 0.995,
      previousClose: data.prev_close_price || data.price - (data.ch || 0),
      timestamp: Date.now(),
      source: 'GoldAPI',
    };
  };
}

// ─── Provider 2: Metals-API ──────────────────────────────────────

function createMetalsAPIFetcher(): ProviderFetcher | null {
  const apiKey = process.env.METALS_API_KEY;
  if (!apiKey) return null;

  return async (): Promise<RawGoldData> => {
    const response = await fetchWithTimeout(
      `${METALS_API_BASE}/latest?access_key=${apiKey}&base=XAU&currencies=USD`
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) throw new Error('429: Rate limit exceeded');
      throw new Error(`Metals-API HTTP ${status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Metals-API error: ${data.error?.info || 'Unknown error'}`);
    }

    // Metals-API returns XAU as base, rate is how many USD per 1 XAU
    const priceUSD = data.rates?.USD || data.rates?.USDXAU;
    if (!priceUSD || typeof priceUSD !== 'number') {
      throw new Error('Metals-API: Invalid response - missing USD rate');
    }

    return {
      price: priceUSD,
      change: 0, // Metals-API doesn't provide change data on free tier
      changePercent: 0,
      high24h: priceUSD * 1.005,
      low24h: priceUSD * 0.995,
      previousClose: priceUSD,
      timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(),
      source: 'Metals-API',
    };
  };
}

// ─── Provider 3: Yahoo Finance (Unofficial) ──────────────────────

function createYahooFinanceFetcher(): ProviderFetcher {
  return async (): Promise<RawGoldData> => {
    const response = await fetchWithTimeout(
      `${YAHOO_FINANCE_BASE}/v8/finance/chart/GC=F?interval=1d&range=2d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GoldEyes/1.0)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      throw new Error('Yahoo Finance: Invalid response structure');
    }

    const meta = result.meta;
    const price = meta?.regularMarketPrice;

    if (!price || typeof price !== 'number') {
      throw new Error('Yahoo Finance: Missing regularMarketPrice');
    }

    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const change = price - prevClose;
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePct * 100) / 100,
      high24h: meta.regularMarketDayHigh || price * 1.005,
      low24h: meta.regularMarketDayLow || price * 0.995,
      previousClose: prevClose,
      timestamp: Date.now(),
      source: 'Yahoo Finance',
    };
  };
}

// ─── Demo Data Provider ──────────────────────────────────────────

function createDemoFetcher(): ProviderFetcher {
  return async (): Promise<RawGoldData> => {
    // Simulate realistic price movements
    const now = Date.now();
    const seed = Math.sin(now / 10000) * 43758.5453;
    const noise = (seed - Math.floor(seed)) * 2 - 1;
    const fluctuation = noise * DEMO_GOLD_PRICE_USD * 0.002;
    const price = DEMO_GOLD_PRICE_USD + fluctuation;

    const prevClose = DEMO_GOLD_PRICE_USD - DEMO_GOLD_PRICE_USD * 0.003;
    const change = price - prevClose;
    const changePct = (change / prevClose) * 100;

    return {
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePct * 100) / 100,
      high24h: Math.round((DEMO_GOLD_PRICE_USD + DEMO_GOLD_PRICE_USD * 0.005) * 100) / 100,
      low24h: Math.round((DEMO_GOLD_PRICE_USD - DEMO_GOLD_PRICE_USD * 0.008) * 100) / 100,
      previousClose: Math.round(prevClose * 100) / 100,
      timestamp: now,
      source: 'Demo',
    };
  };
}

// ─── Exchange Rate Fetcher ───────────────────────────────────────

async function fetchExchangeRates(): Promise<ExchangeRateData> {
  // Check cache first
  const cached = cache.get<ExchangeRateData>(CK_EXCHANGE_RATES);
  if (cached) return cached;

  // Try stale data while fetching
  const stale = cache.getStale<ExchangeRateData>(CK_EXCHANGE_RATES);

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (apiKey) {
    try {
      const response = await fetchWithTimeout(
        `${EXCHANGE_API_BASE}/${apiKey}/latest/USD`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.result === 'success' && data.conversion_rates) {
          const rates: ExchangeRateData = {
            MYR: data.conversion_rates.MYR,
            SGD: data.conversion_rates.SGD,
            ...data.conversion_rates,
          };
          cache.set(CK_EXCHANGE_RATES, rates, CACHE_TTL_EXCHANGE);
          return rates;
        }
      }
    } catch (error) {
      console.warn('[ExchangeRate] API error, using fallback:', error);
    }
  }

  // Return stale data if available
  if (stale) {
    return stale.value;
  }

  // Fallback to demo rates
  const demoRates: ExchangeRateData = {
    MYR: DEMO_EXCHANGE_RATES.MYR,
    SGD: DEMO_EXCHANGE_RATES.SGD,
    ...DEMO_EXCHANGE_RATES,
  };
  cache.set(CK_EXCHANGE_RATES, demoRates, 5 * 60 * 1000);
  return demoRates;
}

// ─── Main Service: Fetch Gold Price ──────────────────────────────

/**
 * Fetch the latest gold price with multi-API fallback.
 * 
 * Provider priority:
 * 1. GoldAPI (primary) - if GOLD_API_KEY is set
 * 2. Metals-API (secondary) - if METALS_API_KEY is set
 * 3. Yahoo Finance (tertiary) - no key required, unofficial
 * 4. Demo data (final fallback) - always available
 * 
 * Features:
 * - Returns cached data if within TTL (10-30s configurable)
 * - Serves stale data while fetching fresh data on error
 * - Retries up to MAX_RETRIES times with exponential backoff
 * - Each request has a REQUEST_TIMEOUT_MS timeout
 * - All attempts are logged with performance metrics
 */
export async function fetchGoldPrice(): Promise<GoldPriceResult> {
  // 1. Check cache (fresh data)
  const cached = cache.get<GoldPriceResult>(CK_GOLD_PRICE);
  if (cached) {
    return { ...cached, cached: true };
  }

  // 2. Build provider chain
  const providers: Array<{ name: string; fetcher: ProviderFetcher; endpoint: string }> = [];

  const goldAPI = createGoldAPIFetcher();
  if (goldAPI) {
    providers.push({ name: 'GoldAPI', fetcher: goldAPI, endpoint: `${GOLD_API_BASE}/XAU/USD` });
  }

  const metalsAPI = createMetalsAPIFetcher();
  if (metalsAPI) {
    providers.push({ name: 'Metals-API', fetcher: metalsAPI, endpoint: `${METALS_API_BASE}/latest` });
  }

  // Yahoo Finance - always available as fallback (no key needed)
  const yahooFetcher = createYahooFinanceFetcher();
  providers.push({ name: 'Yahoo Finance', fetcher: yahooFetcher, endpoint: `${YAHOO_FINANCE_BASE}/chart/GC=F` });

  // 3. Try each provider with retries
  let rawData: RawGoldData | null = null;
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      rawData = await withRetry(
        provider.fetcher,
        provider.name,
        provider.endpoint,
        MAX_RETRIES
      );
      break; // Success — stop trying other providers
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${provider.name}: ${msg}`);
      // Continue to next provider
    }
  }

  // 4. If all providers failed, try demo data
  if (!rawData) {
    console.warn('[GoldPrice] All providers failed. Errors:', errors);

    // Serve stale cached data if available
    const stale = cache.getStale<GoldPriceResult>(CK_GOLD_PRICE);
    if (stale) {
      console.log('[GoldPrice] Serving stale cached data');
      return { ...stale.value, cached: true, source: `${stale.value.source} (stale)` };
    }

    // Final fallback: demo data
    const demoFetcher = createDemoFetcher();
    rawData = await demoFetcher();
  }

  // 5. Fetch exchange rates and compute converted prices
  const rates = await fetchExchangeRates();

  const result: GoldPriceResult = {
    usd: rawData.price,
    myr: Math.round(rawData.price * rates.MYR * 100) / 100,
    sgd: Math.round(rawData.price * rates.SGD * 100) / 100,
    change: rawData.change,
    changePercent: rawData.changePercent,
    high24h: rawData.high24h,
    low24h: rawData.low24h,
    previousClose: rawData.previousClose,
    timestamp: new Date(rawData.timestamp).toISOString(),
    source: rawData.source,
    cached: false,
  };

  // 6. Cache the result
  cache.set(CK_GOLD_PRICE, result, CACHE_TTL_GOLD_PRICE);

  return result;
}

// ─── Backward-Compatible Wrapper ─────────────────────────────────

/**
 * Returns gold price data in the format expected by existing frontend components.
 * This preserves backward compatibility with SpotPriceCard, MalaysiaInsight, etc.
 */
export async function fetchGoldPriceCompat() {
  const data = await fetchGoldPrice();

  return {
    price: data.usd,
    previousClose: data.previousClose,
    change24h: data.change,
    changePercent24h: data.changePercent,
    high24h: data.high24h,
    low24h: data.low24h,
    timestamp: new Date(data.timestamp).getTime(),
    currency: 'USD',
    // Extra fields from the new service
    myr: data.myr,
    sgd: data.sgd,
    source: data.source,
    cached: data.cached,
  };
}

// ─── Service Health Check ────────────────────────────────────────

/**
 * Get the health status of all gold price providers and the cache.
 */
export function getServiceHealth() {
  return {
    providers: apiLogger.getProviderHealth(),
    cache: cache.getStats(),
    recentLogs: apiLogger.getRecentLogs(10),
  };
}
