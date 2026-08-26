import { KeyRoundIcon, LockIcon, MailIcon, ShieldCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../utils/cn';
import { securityActivity, securityItems, securityPosture } from '../../data/profile';

const activityTone = { emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500' };

/** Security center: score, credentials, recovery, MFA readiness and recent activity. */
export function SecurityCenter() {
  return (
    <Card>
      <CardHeader
        title="Security center"
        description="Protect access to fraud decisions — your account is the last control."
        icon={ShieldCheckIcon}
        action={
        <Badge tone="emerald" dot>
            {securityPosture.band} posture
          </Badge>
        } />
      
      <CardBody className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Security score</p>
              <p className="tabular mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                {securityPosture.score}
                <span className="ml-1 text-base font-medium text-gray-400">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">MFA readiness</p>
              <p className="mt-1 text-[13px] font-medium text-gray-900">{securityPosture.mfaReadiness}</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={securityPosture.score} tone="emerald" label="Security score" />
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-200 pt-3 sm:grid-cols-3">
            {[
            ['Password age', securityPosture.passwordAge, LockIcon],
            ['Recovery email', securityPosture.recoveryEmail, MailIcon],
            ['Next review', securityPosture.nextReview, KeyRoundIcon]].
            map(([label, value, Icon]) => {
              const IconComponent = Icon as React.ComponentType<{className?: string;}>;
              return (
                <div key={label as string} className="min-w-0">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <IconComponent className="h-3 w-3" />
                    {label as string}
                  </dt>
                  <dd className="mt-1 truncate text-[13px] font-medium text-gray-900">{value as string}</dd>
                </div>);

            })}
          </dl>
          <ul className="mt-3 space-y-1.5">
            {securityPosture.improvements.map((item) =>
            <li key={item} className="flex items-start gap-2 text-[13px] leading-5 text-amber-800">
                <TriangleAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {item}
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-4">
          {securityItems.map((item) =>
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-gray-900">{item.name}</p>
                  {item.status === 'warn' ?
                <Badge tone="amber" icon={TriangleAlertIcon}>
                      Attention
                    </Badge> :

                <Badge tone="emerald">Healthy</Badge>
                }
                </div>
                <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => toast(`${item.action} · ${item.name}`)}>
                {item.action}
              </Button>
            </div>
          )}
        </div>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Recent security activity</h3>
          <ul className="mt-2.5 space-y-2.5">
            {securityActivity.map((event) =>
            <li key={event.id} className="flex items-start gap-2.5">
                <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', activityTone[event.tone])} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-[13px] font-medium text-gray-900">{event.event}</p>
                    <span className="tabular text-xs text-gray-400">{event.at}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-gray-500">{event.detail}</p>
                </div>
              </li>
            )}
          </ul>
        </section>
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">Security events are retained for two years and visible to your admin.</p>
      </CardFooter>
    </Card>);

}