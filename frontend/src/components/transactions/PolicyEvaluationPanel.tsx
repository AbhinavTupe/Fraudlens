import { ArrowRightIcon, BotIcon, CheckCircle2Icon, CircleSlashIcon, GavelIcon, ZapIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { decisionMeta, policyOutcome } from '../../utils/labels';
import type { PolicyEvaluation, Transaction } from '../../types/fraud';

const resultMeta = {
  triggered: { label: 'Applied', tone: 'red' as const, icon: ZapIcon },
  passed: { label: 'Not applicable', tone: 'emerald' as const, icon: CheckCircle2Icon },
  skipped: { label: 'Skipped', tone: 'gray' as const, icon: CircleSlashIcon }
};

/**
 * Separates the AI recommendation from the business policy layer, then states plainly
 * whether the policies changed the outcome and why.
 */
export function PolicyEvaluationPanel({ transaction, className }: {transaction: Transaction;className?: string;}) {
  const outcome = policyOutcome(transaction);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <BotIcon className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">AI recommendation</p>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={decisionMeta[outcome.aiDecision].tone} size="md" dot>
              {decisionMeta[outcome.aiDecision].label}
            </Badge>
            <span className="tabular text-xs text-gray-500">
              score {transaction.riskScore} · {transaction.recommendationConfidence}% confidence
            </span>
          </p>
        </div>

        <div className="flex items-center justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
              outcome.modified ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            )}>
            
            {outcome.modified ? 'Modified by policy' : 'Upheld'}
            <ArrowRightIcon className="h-3 w-3" />
          </span>
        </div>

        <div
          className={cn(
            'rounded-xl border p-4',
            outcome.modified ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/50'
          )}>
          
          <div className="flex items-center gap-2">
            <GavelIcon className={cn('h-3.5 w-3.5', outcome.modified ? 'text-amber-600' : 'text-emerald-600')} />
            <p
              className={cn(
                'text-[11px] font-semibold uppercase tracking-wider',
                outcome.modified ? 'text-amber-700' : 'text-emerald-700'
              )}>
              
              Final decision
            </p>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={decisionMeta[outcome.finalDecision].tone} size="md" dot>
              {decisionMeta[outcome.finalDecision].label}
            </Badge>
            <span className="text-xs text-gray-600">after {outcome.businessPolicies.length} business policies</span>
          </p>
        </div>
      </div>

      <p className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-[13px] leading-5 text-gray-700">{outcome.reason}</p>

      <PolicyGroup
        title="Business policies"
        description="Rules your team authored, evaluated in priority order."
        policies={outcome.businessPolicies} />
      
      <PolicyGroup
        title="Model score thresholds"
        description="The AI bands that decide when a case is approved, reviewed or blocked."
        policies={outcome.scorePolicies} />
      
    </div>);

}

function PolicyGroup({
  title,
  description,
  policies




}: {title: string;description: string;policies: PolicyEvaluation[];}) {
  if (policies.length === 0) return null;
  return (
    <section>
      <div className="mb-2">
        <h4 className="text-[13px] font-semibold text-gray-900">{title}</h4>
        <p className="text-xs leading-5 text-gray-500">{description}</p>
      </div>
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
        {policies.map((policy, index) => {
          const meta = resultMeta[policy.result];
          const Icon = meta.icon;
          return (
            <li key={policy.id} className="flex items-start justify-between gap-4 bg-white px-4 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">{policy.name}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-gray-600">{policy.detail}</p>
                </div>
              </div>
              <Badge tone={meta.tone} icon={Icon}>
                {meta.label}
              </Badge>
            </li>);

        })}
      </ul>
    </section>);

}