import { CheckCircle2Icon, ScaleIcon, TriangleAlertIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../utils/cn';
import { complianceHealth, complianceItems } from '../../data/reports';

/** Compliance posture: audit readiness, gaps, retention and overall health. */
export function ComplianceCenter() {
  const needsAction = complianceItems.filter((item) => item.status !== 'compliant').length;

  return (
    <Card>
      <CardHeader
        title="Compliance center"
        description="Regulatory obligations, evidence coverage and where a gap remains."
        icon={ScaleIcon}
        action={
        <Badge tone={needsAction === 0 ? 'emerald' : 'amber'} dot>
            {needsAction === 0 ? 'Fully compliant' : `${needsAction} item needs action`}
          </Badge>
        } />
      
      <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {complianceHealth.map((item) =>
        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
            <p
            className={cn(
              'tabular mt-1.5 text-[17px] font-semibold leading-6 tracking-tight',
              item.tone === 'amber' ? 'text-amber-700' : 'text-gray-900'
            )}>
            
              {item.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">{item.detail}</p>
            <div className="mt-3">
              <ProgressBar value={item.progress} tone={item.tone} label={item.label} />
            </div>
          </div>
        )}
      </CardBody>
      <CardBody className="space-y-3.5 border-t border-gray-100">
        {complianceItems.map((item) =>
        <div key={item.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-900">{item.name}</p>
              <p className="mt-0.5 text-xs leading-5 text-gray-500">
                {item.detail} · reviewed {item.reviewed}
              </p>
            </div>
            <Badge
            tone={item.status === 'compliant' ? 'emerald' : 'amber'}
            icon={item.status === 'compliant' ? CheckCircle2Icon : TriangleAlertIcon}>
            
              {item.status === 'compliant' ? 'Compliant' : 'Action needed'}
            </Badge>
          </div>
        )}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">Evidence is retained for seven years and exportable on demand.</p>
      </CardFooter>
    </Card>);

}