'use client';

import { TimeRange } from '@/types';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const ranges: TimeRange[] = ['1D', '7D', '1M', '1Y'];

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-xl" id="time-range-selector">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selected === range
              ? 'bg-gold-500 text-white shadow-sm shadow-gold-500/25'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
