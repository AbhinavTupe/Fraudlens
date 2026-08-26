import { CircleDollarSignIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { MetricTile } from '../ui/MetricTile';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../utils/cn';
import { projectBusinessImpact, simulateThresholds } from '../../utils/simulation';

interface BusinessImpactSimulatorProps {
  reviewThreshold: number;
  blockThreshold: number;
  capacity: number;
  onCapacityChange: (next: number) => void;
}

/** Translates the simulated thresholds into operational and financial consequence. */
export function BusinessImpactSimulator({
  reviewThreshold,
  blockThreshold,
  capacity,
  onCapacityChange
}: BusinessImpactSimulatorProps) {
  const simulation = simulateThresholds(reviewThreshold, blockThreshold);
  const impact = projectBusinessImpact(simulation, capacity);

  return (
    <Card>
      <CardHeader
        title="Business impact simulator"
        description="What the simulated thresholds would mean for money, workload and return on investment."
        icon={CircleDollarSignIcon}
        action={
        <Badge tone={impact.backlog > 0 ? 'amber' : 'emerald'} dot>
            {impact.backlog > 0 ? `${formatNumber(impact.backlog)} cases/day backlog` : 'Workload fully absorbed'}
          </Badge>
        } />
      
      <CardBody className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-5">
          <Slider
            id="analyst-capacity"
            label="Analyst capacity per day"
            tone="blue"
            min={40}
            max={600}
            step={10}
            value={capacity}
            onChange={onCapacityChange}
            displayValue={`${capacity} cases`}
            hint={`Based on ${formatNumber(simulation.reviewQueuePerDay)} cases entering review each day at review ${reviewThreshold} / decline ${blockThreshold}.`} />
          
          <dl className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            {[
            ['Cases cleared per day', formatNumber(impact.clearedPerDay)],
            ['Analyst hours per day', `${impact.analystHours} hrs`],
            ['Manual review cost', formatCurrency(impact.reviewCost, true)]].
            map(([label, value]) =>
            <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="text-[13px] text-gray-600">{label}</dt>
                <dd className="tabular text-[13px] font-semibold text-gray-900">{value}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricTile
              label="Fraud prevented"
              value={formatCurrency(impact.fraudPrevented, true)}
              tone="emerald"
              detail="Confirmed fraud stopped before settlement" />
            
            <MetricTile
              label="Revenue protected"
              value={formatCurrency(impact.revenueProtected, true)}
              tone="emerald"
              detail="Good customers approved without friction" />
            
            <MetricTile
              label="Review workload"
              value={`${formatNumber(impact.reviewWorkload)}/day`}
              tone="amber"
              detail="Cases needing a human decision" />
            
            <MetricTile
              label="Operational savings"
              value={formatCurrency(impact.operationalSavings, true)}
              tone="emerald"
              detail="Versus deciding every case manually" />
            
            <MetricTile
              label="Net business benefit"
              value={formatCurrency(impact.netBenefit, true)}
              detail="Prevention plus savings, net of cost" />
            
            <MetricTile
              label="Return on investment"
              value={`${impact.roi.toFixed(1)}x`}
              tone="blue"
              detail="Against monthly platform cost" />
            
          </div>
          <p className="mt-4 rounded-lg bg-blue-50/70 px-3.5 py-2.5 text-[13px] leading-5 text-blue-900">
            {impact.backlog > 0 ?
            `At ${capacity} cases per day the queue grows by ${formatNumber(impact.backlog)} cases daily. Either add capacity or raise the review threshold.` :
            `Current capacity absorbs the full review queue with ${formatNumber(capacity - impact.clearedPerDay)} cases of headroom per day.`}
          </p>
        </div>
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Modelled at $58 per manual review, 3.2 minutes handling time and an average fraud value of $1,180.
        </p>
      </CardFooter>
    </Card>);

}