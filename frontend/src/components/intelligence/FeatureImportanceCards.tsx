import { BrainCircuitIcon, MinusIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../utils/cn';
import { featureImportance } from '../../data/analytics';

/** Feature importance as business cards rather than an ML bar chart. */
export function FeatureImportanceCards() {
  const strongest = Math.max(...featureImportance.map((feature) => feature.weight));

  return (
    <Card>
      <CardHeader
        title="What drives decisions"
        description="The signals that matter most, explained in business language."
        icon={BrainCircuitIcon} />
      
      <CardBody className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {featureImportance.map((feature, index) => {
          const rising = feature.trend > 0;
          const flat = feature.trend === 0;
          const TrendIcon = flat ? MinusIcon : rising ? TrendingUpIcon : TrendingDownIcon;
          return (
            <article
              key={feature.feature}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-card">
              
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    <span className="tabular mr-1.5 text-[11px] font-semibold text-gray-400">#{index + 1}</span>
                    {feature.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{feature.feature}</p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular text-[15px] font-semibold text-gray-900">{feature.weight}%</span>
                  <span
                    className={cn(
                      'tabular inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-semibold',
                      flat ? 'bg-gray-50 text-gray-500' : rising ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    )}>
                    
                    <TrendIcon className="h-2.5 w-2.5" />
                    {Math.abs(feature.trend)}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-gray-600">{feature.plain}</p>
              <div className="mt-3">
                <ProgressBar value={feature.weight / strongest * 100} tone="blue" label={feature.label} />
              </div>
              <p className="mt-2.5 border-t border-gray-100 pt-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Business impact
              </p>
              <p className="mt-0.5 text-xs leading-5 text-gray-600">{feature.impact}</p>
            </article>);

        })}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Weights are portfolio-wide averages over 30 days. Trend shows the change in importance versus last month.
        </p>
      </CardFooter>
    </Card>);

}