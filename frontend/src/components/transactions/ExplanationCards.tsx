import {
  ClockIcon,
  CreditCardIcon,
  GlobeIcon,
  KeyRoundIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserRoundIcon,
  WalletIcon } from
'lucide-react';
import { cn } from '../../utils/cn';
import { ProgressBar } from '../ui/ProgressBar';
import type { ShapFactor } from '../../types/fraud';

/** Maps model features onto a human concept so analysts see meaning, not feature names. */
function factorIcon(feature: string): React.ComponentType<{className?: string;}> {
  if (/card|bin|chip|payment_method/.test(feature)) return CreditCardIcon;
  if (/geo|country|travel/.test(feature)) return GlobeIcon;
  if (/ship|address|reshipper/.test(feature)) return MapPinIcon;
  if (/device|terminal|proxy/.test(feature)) return SmartphoneIcon;
  if (/credential|kyc|approver|email/.test(feature)) return KeyRoundIcon;
  if (/amount|resale|quantity|scam|crypto/.test(feature)) return WalletIcon;
  if (/account_age|merchant_history|recurring|prior/.test(feature)) return UserRoundIcon;
  if (/session|velocity|duration/.test(feature)) return ClockIcon;
  return ShieldCheckIcon;
}

interface ExplanationCardsProps {
  factors: ShapFactor[];
  className?: string;
  /** Compact mode drops the strength bar for tighter panels. */
  compact?: boolean;
}

export function ExplanationCards({ factors, className, compact = false }: ExplanationCardsProps) {
  const ranked = [...factors].sort((a, b) => b.impact - a.impact);
  const strongest = ranked[0]?.impact ?? 1;
  const raising = ranked.filter((factor) => factor.direction === 'increase').length;
  const lowering = ranked.length - raising;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-red-500" aria-hidden="true" />
          {raising} {raising === 1 ? 'reason' : 'reasons'} this looks risky
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" aria-hidden="true" />
          {lowering} reassuring {lowering === 1 ? 'signal' : 'signals'}
        </span>
      </div>

      <ol className="space-y-2.5">
        {ranked.map((factor, index) => {
          const up = factor.direction === 'increase';
          const Icon = factorIcon(factor.feature);
          const share = Math.round(factor.impact / strongest * 100);
          return (
            <li
              key={factor.feature}
              className={cn(
                'rounded-xl border bg-white p-4 transition-shadow hover:shadow-card',
                up ? 'border-red-100' : 'border-emerald-100'
              )}>
              
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
                    up ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                  )}>
                  
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <p className="text-[13px] font-semibold text-gray-900">
                      <span className="tabular mr-1.5 text-[11px] font-semibold text-gray-400">#{index + 1}</span>
                      {factor.label}
                    </p>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold',
                        up ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      )}>
                      
                      {up ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                      {up ? 'Increases risk' : 'Lowers risk'}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-5 text-gray-600">{factor.explanation}</p>
                  {!compact ?
                  <div className="mt-3 flex items-center gap-3">
                      <ProgressBar
                      value={share}
                      tone={up ? 'red' : 'emerald'}
                      label={`${factor.label} contribution`}
                      className="flex-1" />
                    
                      <span className="tabular w-24 shrink-0 text-right text-[11px] font-medium text-gray-400">
                        {share}% of top driver
                      </span>
                    </div> :
                  null}
                </div>
              </div>
            </li>);

        })}
      </ol>
    </div>);

}