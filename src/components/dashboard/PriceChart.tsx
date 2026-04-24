'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createChart, AreaSeries, IChartApi, ISeriesApi, ColorType } from 'lightweight-charts';
import { HistoricalDataPoint } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface PriceChartProps {
  data: HistoricalDataPoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const { isDark } = useTheme();

  const getChartOptions = useCallback(() => {
    const container = chartContainerRef.current;
    if (!container) return null;

    return {
      width: container.clientWidth,
      height: 350,
      layout: {
        background: { type: ColorType.Solid as const, color: 'transparent' },
        textColor: isDark ? '#A3A3A3' : '#737373',
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
        horzLines: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
      },
      crosshair: {
        vertLine: {
          color: isDark ? 'rgba(240,199,94,0.3)' : 'rgba(212,168,67,0.3)',
          labelBackgroundColor: isDark ? '#F0C75E' : '#D4A843',
        },
        horzLine: {
          color: isDark ? 'rgba(240,199,94,0.3)' : 'rgba(212,168,67,0.3)',
          labelBackgroundColor: isDark ? '#F0C75E' : '#D4A843',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        timeVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    };
  }, [isDark]);

  // Initialize chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const options = getChartOptions();
    if (!options) return;

    const chart = createChart(container, options);
    chartRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: isDark ? '#F0C75E' : '#D4A843',
      topColor: isDark ? 'rgba(240,199,94,0.3)' : 'rgba(212,168,67,0.4)',
      bottomColor: isDark ? 'rgba(240,199,94,0.01)' : 'rgba(212,168,67,0.02)',
      lineWidth: 2,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: isDark ? '#F0C75E' : '#D4A843',
      crosshairMarkerBackgroundColor: isDark ? '#141415' : '#FFFFFF',
    });
    seriesRef.current = series;

    if (data && data.length > 0) {
      series.setData(data);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  // Update data
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className="chart-container" id="price-chart">
      <div ref={chartContainerRef} />
    </div>
  );
}
