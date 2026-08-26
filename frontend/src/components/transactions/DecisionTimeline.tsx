import {
  BotIcon,
  CheckIcon,
  GavelIcon,
  LayersIcon,
  LoaderIcon,
  MessageSquareTextIcon,
  ScaleIcon,
  ServerIcon,
  UserIcon } from
'lucide-react';
import { cn } from '../../utils/cn';
import { decisionStages, type DecisionStage, type StageKind } from '../../utils/decisionPipeline';
import type { Transaction } from '../../types/fraud';

const stageIcon: Record<StageKind, React.ComponentType<{className?: string;}>> = {
  system: ServerIcon,
  feature: LayersIcon,
  rules: ScaleIcon,
  model: BotIcon,
  explain: MessageSquareTextIcon,
  policy: GavelIcon,
  analyst: UserIcon,
  final: CheckIcon
};

const stateStyles: Record<DecisionStage['state'], {node: string;line: string;meta: string;}> = {
  complete: { node: 'bg-emerald-50 text-emerald-600 ring-emerald-200', line: 'bg-emerald-200', meta: 'text-gray-400' },
  active: { node: 'bg-amber-50 text-amber-600 ring-amber-200', line: 'bg-gray-200', meta: 'text-amber-700' },
  pending: { node: 'bg-gray-50 text-gray-400 ring-gray-200', line: 'bg-gray-200', meta: 'text-gray-400' }
};

export function DecisionTimeline({ transaction, className }: {transaction: Transaction;className?: string;}) {
  const stages = decisionStages(transaction);
  const completed = stages.filter((stage) => stage.state === 'complete').length;

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3.5 py-2.5">
        <p className="text-[13px] text-gray-600">
          <span className="font-semibold text-gray-900">
            {completed} of {stages.length}
          </span>{' '}
          steps complete
        </p>
        <div className="flex items-center gap-1" aria-hidden="true">
          {stages.map((stage) =>
          <span
            key={stage.id}
            className={cn(
              'h-1.5 w-6 rounded-full',
              stage.state === 'complete' ? 'bg-emerald-500' : stage.state === 'active' ? 'bg-amber-400' : 'bg-gray-200'
            )} />

          )}
        </div>
      </div>

      <ol className="relative">
        {stages.map((stage, index) => {
          const Icon = stage.state === 'active' ? LoaderIcon : stageIcon[stage.kind];
          const styles = stateStyles[stage.state];
          const isLast = index === stages.length - 1;
          return (
            <li key={stage.id} className="relative flex gap-3.5 pb-5 last:pb-0">
              {!isLast ?
              <span
                className={cn('absolute left-[15px] top-9 h-[calc(100%-24px)] w-px', styles.line)}
                aria-hidden="true" /> :

              null}
              <span
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
                  styles.node
                )}>
                
                <Icon className={cn('h-4 w-4', stage.state === 'active' && 'animate-spin')} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p
                    className={cn(
                      'text-[13px] font-semibold',
                      stage.state === 'pending' ? 'text-gray-500' : 'text-gray-900'
                    )}>
                    
                    <span className="tabular mr-1.5 text-[11px] font-semibold text-gray-400">{index + 1}</span>
                    {stage.title}
                  </p>
                  <span className={cn('tabular text-xs', styles.meta)}>{stage.meta}</span>
                </div>
                <p className="mt-0.5 text-[13px] leading-5 text-gray-600">{stage.detail}</p>
              </div>
            </li>);

        })}
      </ol>
    </div>);

}