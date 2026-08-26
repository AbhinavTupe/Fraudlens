import { LightbulbIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { aiInsights } from '../../data/analytics';

const insightTone = {
  danger: 'border-red-100 bg-red-50/50',
  warning: 'border-amber-100 bg-amber-50/50',
  positive: 'border-emerald-100 bg-emerald-50/50'
};

const insightBadge = { danger: 'red', warning: 'amber', positive: 'emerald' } as const;

/** AI-written business insights, grouped by theme with a recommended action each. */
export function BusinessInsightsPanel({ className }: {className?: string;}) {
  return (
    <Card className={className}>
      <CardHeader
        title="AI-generated business insights"
        description="Patterns the platform found, summarised in executive language with a recommended next step."
        icon={LightbulbIcon}
        action={
        <Button size="sm" variant="secondary" icon={SparklesIcon} onClick={() => toast.success('Insights refreshed')}>
            Refresh
          </Button>
        } />
      
      <CardBody className="space-y-3">
        {aiInsights.map((insight) =>
        <article key={insight.id} className={cn('rounded-xl border p-4', insightTone[insight.tone])}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{insight.theme}</p>
                <h3 className="mt-1 text-[13px] font-semibold text-gray-900">{insight.title}</h3>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={insightBadge[insight.tone]}>{insight.impact}</Badge>
                <span className="tabular text-xs text-gray-500">{insight.confidence}% confidence</span>
              </div>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-gray-700">{insight.body}</p>
            <p className="mt-2.5 rounded-lg bg-white/70 px-3 py-2 text-[13px] leading-5 text-gray-700 ring-1 ring-inset ring-gray-200">
              <span className="font-semibold text-gray-900">Recommended action · </span>
              {insight.action}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast.success('Added to action plan')}>
                Create action
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast('Insight dismissed')}>
                Dismiss
              </Button>
            </div>
          </article>
        )}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Generated from the last 90 days of decisions, outcomes and threshold changes.
        </p>
      </CardFooter>
    </Card>);

}