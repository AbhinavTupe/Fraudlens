import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  tone?: 'emerald' | 'blue' | 'amber' | 'red' | 'gray' | 'violet';
  className?: string;
  label?: string;
}

const tones = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
  violet: 'bg-violet-500'
};

export function ProgressBar({ value, tone = 'emerald', className, label }: ProgressBarProps) {
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-gray-100', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}>
      
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      
    </div>);

}