import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SlidersHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { MetricTile } from '../ui/MetricTile';
import { scoreDistribution } from '../../data/analytics';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/cn';
import { simulateThresholds } from '../../utils/simulation';

interface ThresholdSimulatorProps {
  reviewThreshold: number;
  blockThreshold: number;
  onReviewChange: (next: number) => void;
  onBlockChange: (next: number) => void;
}

/** Interactive threshold simulator: every metric updates the instant a slider moves. */
export function ThresholdSimulator({
  reviewThreshold,
  blockThreshold,
  onReviewChange,
  onBlockChange
}: ThresholdSimulatorProps) {
  const simulation = simulateThresholds(reviewThreshold, blockThreshold);
  const changed = reviewThreshold !== 70 || blockThreshold !== 90;

  return (
    <Card>
      <CardHeader
        title="Threshold simulator"
        description="Move the thresholds to preview the outcome on 30 days of scored traffic before anything reaches production."
        icon={SlidersHorizontalIcon}
        action={
        <>
            <Button
            size="sm"
            variant="ghost"
            disabled={!changed}
            onClick={() => {
              onBlockChange(90);
              onReviewChange(70);
            }}>
            
              Reset to production
            </Button>
            <Button
            size="sm"
            variant="secondary"
            onClick={() =>
            toast.success('Threshold proposal submitted', {
              description: `Review ${reviewThreshold} · block ${blockThreshold} sent to Risk Manager for approval.`
            })
            }>
            
              Submit proposal
            </Button>
          </>
        } />
      
      <CardBody className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Slider
            id="review-threshold"
            label="Manual review threshold"
            tone="amber"
            min={30}
            max={blockThreshold - 5}
            value={reviewThreshold}
            onChange={onReviewChange}
            displayValue={String(reviewThreshold)}
            hint="Anything at or above this score is sent to an analyst." />
          
          <Slider
            id="block-threshold"
            label="Automatic decline threshold"
            tone="red"
            min={reviewThreshold + 5}
            max={99}
            value={blockThreshold}
            onChange={onBlockChange}
            displayValue={String(blockThreshold)}
            hint="Transactions at or above this score are declined without review." />
          

          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
            <MetricTile label="Approval rate" value={formatPercent(simulation.approvalRate)} tone="emerald" detail="Auto-approved without friction" />
            <MetricTile label="Manual review rate" value={formatPercent(simulation.reviewRate)} tone="amber" detail="Sent to an analyst" />
            <MetricTile label="Decline rate" value={formatPercent(simulation.declineRate)} tone="red" detail="Blocked automatically" />
            <MetricTile label="Customer friction" value={formatPercent(simulation.customerFriction)} detail="Customers who feel a delay" />
            <MetricTile label="False positives" value={formatNumber(simulation.falsePositives)} tone="amber" detail="Good customers stopped" />
            <MetricTile label="False negatives" value={formatNumber(simulation.falseNegatives)} tone="red" detail="Fraud that slips through" />
            <MetricTile label="Review queue size" value={`${formatNumber(simulation.reviewQueuePerDay)}/day`} detail="Cases entering the queue" />
            <MetricTile
              label="Estimated money saved"
              value={formatCurrency(simulation.moneySaved, true)}
              tone="emerald"
              detail={`${formatPercent(simulation.detectionRate)} of fraud caught`} />
            
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="mb-3 text-[13px] font-medium text-gray-700">Score distribution and where your thresholds land</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={4} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(value: number) => formatNumber(value, true)} />
                
                <Tooltip
                  cursor={{ fill: 'rgba(16,24,40,0.04)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 6px 20px -6px rgba(16,24,40,0.12)',
                    fontSize: 12,
                    padding: '8px 12px'
                  }}
                  formatter={(value: number, name) => [
                  formatNumber(value),
                  name === 'count' ? 'Transactions' : 'Confirmed fraud']
                  } />
                
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((bucket) => {
                    const midpoint = Number(bucket.band.split('–')[0]) + 5;
                    const color = midpoint >= blockThreshold ? '#ef4444' : midpoint >= reviewThreshold ? '#f59e0b' : '#10b981';
                    return <Cell key={bucket.band} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Auto-approved ({formatNumber(simulation.approved, true)})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-500" /> Manual review ({formatNumber(simulation.reviewed, true)})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-red-500" /> Declined ({formatNumber(simulation.blocked, true)})
            </span>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Simulated on the last 30 days of scored traffic. Proposals require Risk Manager approval before production.
        </p>
        {changed ?
        <span className="text-xs font-medium text-amber-700">Unsaved simulation — production is still 70 / 90</span> :

        <span className="text-xs text-gray-500">Matching production thresholds</span>
        }
      </CardFooter>
    </Card>);

}