import { BotIcon, ShieldCheckIcon, ServerIcon, UserIcon, UserRoundCheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { TimelineEvent } from '../../types/fraud';

const kindConfig = {
  system: { icon: ServerIcon, className: 'bg-gray-50 text-gray-500 ring-gray-200' },
  model: { icon: BotIcon, className: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
  analyst: { icon: UserIcon, className: 'bg-blue-50 text-blue-600 ring-blue-200' },
  policy: { icon: ShieldCheckIcon, className: 'bg-violet-50 text-violet-600 ring-violet-200' },
  customer: { icon: UserRoundCheckIcon, className: 'bg-amber-50 text-amber-600 ring-amber-200' }
} as const;

export function Timeline({ events, className }: {events: TimelineEvent[];className?: string;}) {
  return (
    <ol className={cn('relative space-y-5', className)}>
      {events.map((event, index) => {
        const config = kindConfig[event.kind];
        const Icon = config.icon;
        const isLast = index === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3.5">
            {!isLast ?
            <span className="absolute left-[15px] top-9 h-[calc(100%-12px)] w-px bg-gray-200" aria-hidden="true" /> :
            null}
            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
                config.className
              )}>
              
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pb-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-[13px] font-semibold text-gray-900">{event.title}</p>
                <span className="tabular text-xs text-gray-400">{event.timestamp}</span>
              </div>
              <p className="mt-0.5 text-[13px] leading-5 text-gray-600">{event.detail}</p>
              <p className="mt-1 text-xs text-gray-400">{event.actor}</p>
            </div>
          </li>);

      })}
    </ol>);

}