import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type MetricTone = 'default' | 'emerald' | 'amber' | 'red' | 'blue';

interface MetricTileProps {
  label: string;
  value: string;
  detail?: string;
  tone?: MetricTone;
  delta?: number;
  deltaGood?: boolean;
  icon?: React.ComponentType<{className?: string;}>;
  className?: string;
}

const valueTone: Record<MetricTone, string> = {
  default: 'text-gray-900',
  emerald: 'text-emerald-700',
  amber: 'text-amber-700',
  red: 'text-red-700',
  blue: 'text-blue-700'
};

/**
 * Shared compact metric tile. Used by simulators, financial dashboards and
 * summary strips so every "number in a box" looks identical platform-wide.
 */
export function MetricTile({
  label,
  value,
  detail,
  tone = 'default',
  delta,
  deltaGood = true,
  icon: Icon,
  className
}: MetricTileProps) {
  const DeltaIcon = (delta ?? 0) >= 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-card transition-colors hover:border-gray-300',
        className
      )}>
      
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-gray-300" /> : null}
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
        <p className={cn('tabular text-[17px] font-semibold leading-6 tracking-tight', valueTone[tone])}>{value}</p>
        {typeof delta === 'number' ?
        <span
          className={cn(
            'tabular inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-semibold',
            deltaGood ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}>
          
            <DeltaIcon className="h-2.5 w-2.5" />
            {Math.abs(delta)}%
          </span> :
        null}
      </div>
      {detail ? <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p> : null}
    </div>);

}