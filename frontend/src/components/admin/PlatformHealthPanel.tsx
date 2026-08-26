import { CircleCheckIcon, ServerIcon, TriangleAlertIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../utils/cn';
import { platformServices } from '../../data/admin';

/** Service-level platform health across the whole FraudLens stack. */
export function PlatformHealthPanel() {
  const degraded = platformServices.filter((service) => service.status !== 'operational');
  const overall = Math.round(
    platformServices.reduce((sum, service) => sum + service.progress, 0) / platformServices.length
  );

  return (
    <Card>
      <CardHeader
        title="Platform health"
        description="Every service behind real-time scoring, with its current state."
        icon={ServerIcon}
        action={
        <Badge tone={degraded.length === 0 ? 'emerald' : 'amber'} dot>
            Overall health {overall}%
          </Badge>
        } />
      
      <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platformServices.map((service) => {
          const ok = service.status === 'operational';
          const Icon = ok ? CircleCheckIcon : TriangleAlertIcon;
          return (
            <div
              key={service.id}
              className={cn(
                'rounded-xl border p-4',
                ok ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/50'
              )}>
              
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-gray-900">{service.name}</p>
                <Icon className={cn('h-4 w-4 shrink-0', ok ? 'text-emerald-500' : 'text-amber-500')} />
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-500">{service.detail}</p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar
                  value={service.progress}
                  tone={ok ? 'emerald' : 'amber'}
                  label={`${service.name} health`}
                  className="flex-1" />
                
                <span className="tabular w-8 shrink-0 text-right text-[11px] font-semibold text-gray-500">
                  {service.progress}%
                </span>
              </div>
            </div>);

        })}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          {degraded.length === 0 ?
          'All services operating within their service-level objectives.' :
          `${degraded.map((service) => service.name).join(', ')} degraded — no customer impact, platform team engaged.`}
        </p>
      </CardFooter>
    </Card>);

}