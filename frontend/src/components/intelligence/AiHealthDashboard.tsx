import { ActivityIcon, CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { aiHealthMetrics } from '../../data/analytics';

/** Operational health of the AI stack, written for business owners rather than engineers. */
export function AiHealthDashboard() {
  const degraded = aiHealthMetrics.filter((metric) => metric.status !== 'operational');

  return (
    <Card>
      <CardHeader
        title="AI health dashboard"
        description="Is the model live, fast and explaining itself right now?"
        icon={ActivityIcon}
        action={
        degraded.length === 0 ?
        <Badge tone="emerald" dot>
              All systems healthy
            </Badge> :

        <Badge tone="amber" dot>
              {degraded.length} dependency degraded
            </Badge>

        } />
      
      <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {aiHealthMetrics.map((metric) => {
          const ok = metric.status === 'operational';
          const Icon = ok ? CircleCheckIcon : TriangleAlertIcon;
          return (
            <div
              key={metric.id}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                ok ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-amber-200 bg-amber-50/50'
              )}>
              
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{metric.label}</p>
                <Icon className={cn('h-3.5 w-3.5 shrink-0', ok ? 'text-emerald-500' : 'text-amber-500')} />
              </div>
              <p className="tabular mt-1.5 text-[17px] font-semibold leading-6 tracking-tight text-gray-900">
                {metric.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">{metric.detail}</p>
            </div>);

        })}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Health is recalculated every minute from live scoring traffic. Next governance validation 15 Sep 2026.
        </p>
      </CardFooter>
    </Card>);

}