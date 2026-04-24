import type { Metadata } from 'next';
import EstimatorForm from '@/components/estimator/EstimatorForm';

export const metadata: Metadata = {
  title: 'Jewelry Price Estimator',
  description:
    'Estimate retail jewelry prices in Malaysia (MYR) and Singapore (SGD). Calculate based on gold weight, purity (999, 916, 750), crafting fees, and retail markup.',
};

export default function EstimatorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Jewelry{' '}
          <span className="text-gold-gradient">Estimator</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Calculate retail jewelry prices based on live gold rates.
          Supports Malaysia (MYR) and Singapore (SGD) with customizable
          purity, crafting fees, and retail markup.
        </p>
      </div>

      {/* Estimator */}
      <EstimatorForm />
    </div>
  );
}
