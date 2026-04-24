'use client';

import useSWR from 'swr';
import { ExchangeRates } from '@/types';
import { POLL_INTERVAL_EXCHANGE } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useExchangeRates() {
  const { data, error, isLoading } = useSWR<ExchangeRates>(
    '/api/exchange',
    fetcher,
    {
      refreshInterval: POLL_INTERVAL_EXCHANGE,
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    rates: data?.rates || {},
    timestamp: data?.timestamp,
    isLoading,
    error,
  };
}
