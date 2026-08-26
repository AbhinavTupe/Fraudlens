import { CheckCircle2Icon, ScaleIcon, TriangleAlertIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Table, TBody, Td, Th, THead, Tr } from '../ui/Table';
import { cn } from '../../utils/cn';
import { fairnessMetrics, fairnessSummary } from '../../data/analytics';

/** Fairness and bias monitoring, phrased for business stakeholders. */
export function FairnessMonitor() {
  const watch = fairnessSummary.filter((item) => item.status !== 'pass').length;

  return (
    <Card>
      <CardHeader
        title="Fairness & bias monitor"
        description="Are customers treated consistently, whoever they are?"
        icon={ScaleIcon}
        action={
        <Badge tone={watch === 0 ? 'emerald' : 'amber'} dot>
            {watch === 0 ? 'All checks passing' : `${watch} check on watch`}
          </Badge>
        } />
      
      <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fairnessSummary.map((item) => {
          const pass = item.status === 'pass';
          const Icon = pass ? CheckCircle2Icon : TriangleAlertIcon;
          return (
            <div
              key={item.id}
              className={cn('rounded-xl border p-4', pass ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/50')}>
              
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                <Icon className={cn('h-3.5 w-3.5 shrink-0', pass ? 'text-emerald-500' : 'text-amber-500')} />
              </div>
              <p className="mt-1.5 text-[15px] font-semibold text-gray-900">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">{item.detail}</p>
            </div>);

        })}
      </CardBody>
      <Table minWidth="min-w-0">
        <THead>
          <Tr>
            <Th>Customer group</Th>
            <Th align="right">Reviewed</Th>
            <Th align="right">Approval gap</Th>
            <Th align="right">Status</Th>
          </Tr>
        </THead>
        <TBody>
          {fairnessMetrics.map((metric) =>
          <Tr key={metric.segment}>
              <Td className="font-medium text-gray-900">{metric.segment}</Td>
              <Td align="right" className="tabular">
                {metric.reviewRate}%
              </Td>
              <Td
              align="right"
              className={cn('tabular font-medium', metric.approvalGap > 2 ? 'text-amber-700' : 'text-gray-700')}>
              
                {metric.approvalGap > 0 ? '+' : ''}
                {metric.approvalGap}pt
              </Td>
              <Td align="right">
                <Badge tone={metric.status === 'pass' ? 'emerald' : 'amber'}>
                  {metric.status === 'pass' ? 'Consistent' : 'Watch'}
                </Badge>
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
      <CardFooter>
        <p className="text-xs text-gray-500">
          A group is placed on watch when its approval rate differs from the portfolio by more than 2 points.
        </p>
      </CardFooter>
    </Card>);

}