/**
 * API Performance Logger
 * 
 * Tracks response times, errors, and provider health for gold price APIs.
 * Logs are kept in-memory with a circular buffer for the last N entries.
 */

export interface LogEntry {
  timestamp: string;
  provider: string;
  endpoint: string;
  status: 'success' | 'error' | 'timeout' | 'rate_limited';
  responseTimeMs: number;
  statusCode?: number;
  errorMessage?: string;
  attempt: number;
}

interface ProviderHealth {
  name: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  timeoutCount: number;
  rateLimitCount: number;
  avgResponseTimeMs: number;
  lastResponseTimeMs: number;
  lastSuccess: string | null;
  lastError: string | null;
  successRate: string;
  isHealthy: boolean;
}

const MAX_LOG_ENTRIES = 200;

class ApiLogger {
  private logs: LogEntry[] = [];
  private providerStats = new Map<string, {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    timeoutCount: number;
    rateLimitCount: number;
    totalResponseTimeMs: number;
    lastResponseTimeMs: number;
    lastSuccess: string | null;
    lastError: string | null;
  }>();

  /**
   * Log an API request result.
   */
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Add to circular buffer
    this.logs.push(fullEntry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs.shift();
    }

    // Update provider stats
    let stats = this.providerStats.get(entry.provider);
    if (!stats) {
      stats = {
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        timeoutCount: 0,
        rateLimitCount: 0,
        totalResponseTimeMs: 0,
        lastResponseTimeMs: 0,
        lastSuccess: null,
        lastError: null,
      };
      this.providerStats.set(entry.provider, stats);
    }

    stats.totalRequests++;
    stats.totalResponseTimeMs += entry.responseTimeMs;
    stats.lastResponseTimeMs = entry.responseTimeMs;

    switch (entry.status) {
      case 'success':
        stats.successCount++;
        stats.lastSuccess = fullEntry.timestamp;
        break;
      case 'error':
        stats.errorCount++;
        stats.lastError = entry.errorMessage || fullEntry.timestamp;
        break;
      case 'timeout':
        stats.timeoutCount++;
        stats.lastError = `Timeout at ${fullEntry.timestamp}`;
        break;
      case 'rate_limited':
        stats.rateLimitCount++;
        stats.lastError = `Rate limited at ${fullEntry.timestamp}`;
        break;
    }

    // Console log for server-side visibility
    const icon = entry.status === 'success' ? '✓' : '✗';
    const msg = `[GoldPrice] ${icon} ${entry.provider} | ${entry.status} | ${entry.responseTimeMs}ms | attempt ${entry.attempt}`;
    if (entry.status === 'success') {
      console.log(msg);
    } else {
      console.warn(msg, entry.errorMessage || '');
    }
  }

  /**
   * Get health status for all providers.
   */
  getProviderHealth(): ProviderHealth[] {
    const health: ProviderHealth[] = [];

    for (const [name, stats] of this.providerStats) {
      const successRate = stats.totalRequests > 0
        ? ((stats.successCount / stats.totalRequests) * 100).toFixed(1) + '%'
        : '0%';
      const avgResponseTimeMs = stats.totalRequests > 0
        ? Math.round(stats.totalResponseTimeMs / stats.totalRequests)
        : 0;

      health.push({
        name,
        totalRequests: stats.totalRequests,
        successCount: stats.successCount,
        errorCount: stats.errorCount,
        timeoutCount: stats.timeoutCount,
        rateLimitCount: stats.rateLimitCount,
        avgResponseTimeMs,
        lastResponseTimeMs: stats.lastResponseTimeMs,
        lastSuccess: stats.lastSuccess,
        lastError: stats.lastError,
        successRate,
        // Healthy if success rate > 50% or no requests yet
        isHealthy: stats.totalRequests === 0 || (stats.successCount / stats.totalRequests) > 0.5,
      });
    }

    return health;
  }

  /**
   * Get recent log entries.
   */
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get all logs.
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs and stats.
   */
  clear(): void {
    this.logs = [];
    this.providerStats.clear();
  }
}

// Singleton
export const apiLogger = new ApiLogger();
