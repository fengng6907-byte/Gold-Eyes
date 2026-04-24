import type { Metadata } from 'next';
import CurrencyCalculator from '@/components/calculator/CurrencyCalculator';

export const metadata: Metadata = {
  title: 'Currency Calculator',
  description:
    'Convert between all world currencies with live exchange rates. Supports MYR, SGD, USD, EUR, GBP, JPY, and 50+ other currencies.',
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Currency{' '}
          <span className="text-gold-gradient">Calculator</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Convert between all major world currencies using live exchange rates.
          Quick and accurate conversions for global gold trading.
        </p>
      </div>

      {/* Calculator */}
      <CurrencyCalculator />
    </div>
  );
}
