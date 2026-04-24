import { TrendDirection } from '@/types';

interface BadgeProps {
  trend: TrendDirection;
  className?: string;
}

const trendConfig: Record<TrendDirection, { label: string; icon: string; colors: string }> = {
  bullish: {
    label: 'Bullish',
    icon: '↑',
    colors: 'bg-green-accent/10 text-green-accent border-green-accent/20',
  },
  bearish: {
    label: 'Bearish',
    icon: '↓',
    colors: 'bg-red-accent/10 text-red-accent border-red-accent/20',
  },
  neutral: {
    label: 'Neutral',
    icon: '→',
    colors: 'bg-gold-500/10 text-gold-500 border-gold-500/20',
  },
};

export default function Badge({ trend, className = '' }: BadgeProps) {
  const config = trendConfig[trend];
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.colors} ${className}`}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}

interface ChangeBadgeProps {
  value: number;
  percent: number;
  className?: string;
}

export function ChangeBadge({ value, percent, className = '' }: ChangeBadgeProps) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${
        isPositive
          ? 'bg-green-accent/10 text-green-accent'
          : 'bg-red-accent/10 text-red-accent'
      } ${className}`}
    >
      <span>{isPositive ? '▲' : '▼'}</span>
      <span>{isPositive ? '+' : ''}{value.toFixed(2)}</span>
      <span className="opacity-70">({isPositive ? '+' : ''}{percent.toFixed(2)}%)</span>
    </span>
  );
}
