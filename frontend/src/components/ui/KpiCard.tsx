import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Sparkline } from './Sparkline';
import type { KpiDatum } from '../../types/fraud';

interface KpiCardProps {
  datum: KpiDatum;
  icon?: React.ComponentType<{className?: string;}>;
  className?: string;
}

export function KpiCard({ datum, icon: Icon, className }: KpiCardProps) {
  const rising = datum.delta > 0;
  const flat = datum.delta === 0;
  const good = datum.intent === 'neutral' ? null : datum.intent === 'positive';
  const DeltaIcon = flat ? MinusIcon : rising ? ArrowUpRightIcon : ArrowDownRightIcon;

  return (
    <article
      className={cn(
        'group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-soft',
        className
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-gray-500">{datum.label}</p>
        {Icon ?
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 ring-1 ring-inset ring-gray-200 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:ring-emerald-200">
            <Icon className="h-3.5 w-3.5" />
          </span> :
        null}
      </div>

      <p className="tabular mt-3 text-[26px] font-semibold leading-none tracking-tight text-gray-900">{datum.value}</p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            'tabular inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold',
            good === null ? 'bg-gray-50 text-gray-600' : good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}>
          
          <DeltaIcon className="h-3 w-3" />
          {Math.abs(datum.delta)}%
        </span>
        <span className="truncate text-xs text-gray-400">{datum.deltaLabel}</span>
      </div>

      {datum.trend && datum.trend.length > 1 ?
      <div className="mt-4">
          <Sparkline
          data={datum.trend}
          tone={good === false ? 'red' : good === null ? 'blue' : 'emerald'}
          ariaLabel={`${datum.label} trend`} />
        
        </div> :
      null}

      <p className="mt-auto pt-4 text-xs leading-5 text-gray-500">
        <span className="block border-t border-gray-100 pt-3">{datum.hint}</span>
      </p>
    </article>);

}