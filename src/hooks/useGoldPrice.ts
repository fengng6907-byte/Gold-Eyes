'use client';

import useSWR from 'swr';
import { GoldPriceData, HistoricalDataPoint, TimeRange } from '@/types';
import { POLL_INTERVAL_GOLD } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGoldPrice() {
  const { data, error, isLoading, mutate } = useSWR<GoldPriceData>(
    '/api/gold',
    fetcher,
    {
      refreshInterval: POLL_INTERVAL_GOLD,
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  return {
    data,
    isLoading,
    error,
    refresh: mutate,
  };
}

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
