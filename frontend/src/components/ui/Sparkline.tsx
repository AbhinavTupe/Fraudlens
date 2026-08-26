import { useId } from 'react';
import { cn } from '../../utils/cn';

interface SparklineProps {
  data: number[];
  tone?: 'emerald' | 'blue' | 'amber' | 'red' | 'gray';
  className?: string;
  height?: number;
  ariaLabel?: string;
}

const strokes = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  red: '#ef4444',
  gray: '#9ca3af'
};

/** Compact trend line used inside KPI cards. Purely decorative — labelled for screen readers. */
export function Sparkline({ data, tone = 'emerald', className, height = 32, ariaLabel }: SparklineProps) {
  const gradientId = useId();
  if (data.length < 2) return null;

  const width = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - (value - min) / span * (height - 4) - 2;
    return `${x},${y}`;
  });

  const line = `M ${points.join(' L ')}`;
  const area = `${line} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
      role="img"
      aria-label={ariaLabel ?? 'Trend over the recent period'}>
      
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokes[tone]} stopOpacity={0.18} />
          <stop offset="100%" stopColor={strokes[tone]} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={strokes[tone]}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" />
      
    </svg>);

}