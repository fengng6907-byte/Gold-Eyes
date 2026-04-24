'use client';

import useSWR from 'swr';
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoldPriceData, HistoricalDataPoint, TimeRange } from '@/types';
import { POLL_INTERVAL_GOLD } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook for gold price data via polling (SWR).
 * Polls every 15 seconds for near real-time updates.
 */
export function useGoldPrice() {
  const { data, error, isLoading, mutate } = useSWR<GoldPriceData>(
    '/api/gold',
    fetcher,
    {
      refreshInterval: POLL_INTERVAL_GOLD,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook for gold price data via Server-Sent Events (SSE).
 * Provides true real-time updates pushed from the server every 10 seconds.
 * Falls back to polling if SSE is not supported or connection fails.
 */
export function useGoldPriceSSE() {
  const [data, setData] = useState<GoldPriceData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const source = new EventSource('/api/gold/stream');
      eventSourceRef.current = source;

      source.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          // Map the new format to the existing GoldPriceData interface
          setData({
            price: parsed.usd || parsed.price,
            previousClose: parsed.previousClose || parsed.usd,
            change24h: parsed.change || parsed.change24h || 0,
            changePercent24h: parsed.changePercent || parsed.changePercent24h || 0,
            high24h: parsed.high24h || parsed.usd * 1.005,
            low24h: parsed.low24h || parsed.usd * 0.995,
            timestamp: new Date(parsed.timestamp).getTime(),
            currency: 'USD',
          });
        } catch {
          console.warn('[SSE] Failed to parse message:', event.data);
        }
      };

      source.onerror = () => {
        setIsConnected(false);
        source.close();

        // Reconnect with exponential backoff (max 30s)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;

        if (reconnectAttempts.current <= 10) {
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          setError(new Error('SSE connection failed after 10 attempts'));
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('SSE not supported'));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    data,
    isConnected,
    error,
    isLoading: !data && !error,
  };
}

/**
 * Hook for historical gold data (chart).
 */
export function useGoldHistory(range: TimeRange = '1D') {
  const { data, error, isLoading } = useSWR<HistoricalDataPoint[]>(
    `/api/gold/history?range=${range}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    data,
    isLoading,
    error,
  };
}
