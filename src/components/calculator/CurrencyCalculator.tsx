'use client';

import { useState, useMemo, useCallback } from 'react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { CURRENCIES } from '@/lib/constants';
import { formatNumber } from '@/lib/goldCalculations';

interface CurrencyCalculatorProps {
  compact?: boolean; // When true, renders without outer glass-card wrapper (for modal use)
}

export default function CurrencyCalculator({ compact = false }: CurrencyCalculatorProps) {
  const { rates, isLoading } = useExchangeRates();
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MYR');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const convert = useCallback(
    (value: number, from: string, to: string): number => {
      if (!rates[from] || !rates[to]) return 0;
      const usdAmount = value / rates[from];
      return usdAmount * rates[to];
    },
    [rates]
  );

  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    return convert(numAmount, fromCurrency, toCurrency);
  }, [amount, fromCurrency, toCurrency, convert]);

  const exchangeRate = useMemo(() => {
    return convert(1, fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency, convert]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(convertedAmount.toFixed(2));
  };

  const filteredFrom = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchFrom.toLowerCase()) ||
      c.name.toLowerCase().includes(searchFrom.toLowerCase())
  );

  const filteredTo = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTo.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTo.toLowerCase())
  );

  const getFlag = (code: string) => CURRENCIES.find((c) => c.code === code)?.flag || '💱';
  const getSymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || '';

  const quickPicks = ['USD', 'MYR', 'SGD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD'];

  if (isLoading) {
    return (
      <div className={`${compact ? 'p-4' : 'glass-card p-6'} space-y-4`}>
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="skeleton h-16 w-full rounded-xl" />
      </div>
    );
  }

  const content = (
    <>
      {/* Quick Picks */}
      <div className="mb-4">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Popular Currencies
        </label>
        <div className="flex flex-wrap gap-1.5">
          {quickPicks.map((code) => (
            <button
              key={code}
              onClick={() => {
                if (fromCurrency !== code) setToCurrency(code);
                else setFromCurrency(code);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                fromCurrency === code || toCurrency === code
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {getFlag(code)} {code}
            </button>
          ))}
        </div>
      </div>

      {/* From */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          From
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-3 bg-muted rounded-xl text-sm font-semibold min-w-[110px] hover:bg-gold-500/5 transition-colors"
              id="from-currency-btn"
            >
              <span>{getFlag(fromCurrency)}</span>
              <span>{fromCurrency}</span>
              <svg className="w-3 h-3 ml-auto text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showFromDropdown && (
              <div className="absolute top-full left-0 mt-1 w-60 max-h-56 bg-card border border-card-border rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down">
                <div className="p-2 border-b border-card-border">
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-40">
                  {filteredFrom.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setFromCurrency(c.code);
                        setShowFromDropdown(false);
                        setSearchFrom('');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors ${
                        fromCurrency === c.code ? 'bg-gold-500/5 text-gold-500' : ''
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="font-semibold">{c.code}</span>
                      <span className="text-muted-foreground truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-4 py-3 bg-muted rounded-xl text-lg font-bold border border-transparent focus:border-gold-500/30 focus:outline-none transition-colors text-right"
            placeholder="Enter amount"
            id="from-amount"
          />
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex items-center justify-center my-2">
        <button
          onClick={swap}
          className="w-10 h-10 rounded-full bg-muted hover:bg-gold-500/10 flex items-center justify-center transition-all duration-300 group hover:rotate-180"
          id="swap-currencies"
          aria-label="Swap currencies"
        >
          <svg
            className="w-4 h-4 text-muted-foreground group-hover:text-gold-500 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* To */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          To
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-3 bg-muted rounded-xl text-sm font-semibold min-w-[110px] hover:bg-gold-500/5 transition-colors"
              id="to-currency-btn"
            >
              <span>{getFlag(toCurrency)}</span>
              <span>{toCurrency}</span>
              <svg className="w-3 h-3 ml-auto text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showToDropdown && (
              <div className="absolute top-full left-0 mt-1 w-60 max-h-56 bg-card border border-card-border rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down">
                <div className="p-2 border-b border-card-border">
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-40">
                  {filteredTo.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setToCurrency(c.code);
                        setShowToDropdown(false);
                        setSearchTo('');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors ${
                        toCurrency === c.code ? 'bg-gold-500/5 text-gold-500' : ''
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="font-semibold">{c.code}</span>
                      <span className="text-muted-foreground truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 px-4 py-3 bg-gold-500/5 border border-gold-500/10 rounded-xl text-lg font-bold text-right text-gold-gradient">
            {getSymbol(toCurrency)} {formatNumber(convertedAmount)}
          </div>
        </div>
      </div>

      {/* Exchange Rate Info */}
      <div className="bg-muted rounded-xl p-3 text-center">
        <div className="text-xs text-muted-foreground mb-0.5">Exchange Rate</div>
        <div className="text-sm font-semibold">
          1 {fromCurrency} = {formatNumber(exchangeRate, 4)} {toCurrency}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showFromDropdown || showToDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFromDropdown(false);
            setShowToDropdown(false);
          }}
        />
      )}
    </>
  );

  if (compact) {
    return <div className="p-4">{content}</div>;
  }

  return (
    <div className="glass-card p-6 animate-fade-in" id="currency-calculator">
      <h2 className="text-lg font-bold mb-6">Currency Converter</h2>
      {content}
    </div>
  );
}
