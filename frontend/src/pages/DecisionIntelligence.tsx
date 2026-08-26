import { useState } from 'react';
import { ActivitySquareIcon, CpuIcon, ScanSearchIcon, SlidersHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatList } from '../components/ui/StatList';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AiHealthDashboard } from '../components/intelligence/AiHealthDashboard';
import { ThresholdSimulator } from '../components/intelligence/ThresholdSimulator';
import { FeatureImportanceCards } from '../components/intelligence/FeatureImportanceCards';
import { ExplainabilityExplorer } from '../components/intelligence/ExplainabilityExplorer';
import { BusinessImpactSimulator } from '../components/intelligence/BusinessImpactSimulator';
import { modelInfo, modelPerformance } from '../data/analytics';

export function DecisionIntelligence() {
  const [blockThreshold, setBlockThreshold] = useState(90);
  const [reviewThreshold, setReviewThreshold] = useState(70);
  const [capacity, setCapacity] = useState(120);

  function handleReviewChange(next: number) {
    setReviewThreshold(Math.min(next, blockThreshold - 5));
  }

  function handleBlockChange(next: number) {
    setBlockThreshold(Math.max(next, reviewThreshold + 5));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Intelligence"
        description="Understand how Sentinel v4.2 makes decisions, test threshold changes before they reach production, and see the business consequence of each choice."
        meta={
        <>
            <Badge tone="emerald" dot>
              Sentinel v4.2 in production
            </Badge>
            <Badge tone="blue">Challenger v4.3 at 10% shadow traffic</Badge>
            <span className="text-xs text-gray-400">Last retrained 18 Jul 2026</span>
          </>
        }
        actions={
        <>
            <Button
            variant="secondary"
            icon={ScanSearchIcon}
            onClick={() => toast('Opened model card', { description: 'Governance documentation for Sentinel v4.2.' })}>
            
              Model card
            </Button>
            <Button
            variant="primary"
            icon={SlidersHorizontalIcon}
            onClick={() =>
            toast.success('Threshold proposal submitted', {
              description: `Review ${reviewThreshold} · decline ${blockThreshold} sent to Risk Manager for approval.`
            })
            }>
            
              Propose thresholds
            </Button>
          </>
        } />
      

      <AiHealthDashboard />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Model performance"
            description="Against committee-approved minimums."
            icon={ActivitySquareIcon} />
          
          <CardBody className="space-y-4">
            {modelPerformance.map((metric) =>
            <div key={metric.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <p className="text-[13px] font-medium text-gray-700">{metric.label}</p>
                  <p className="tabular text-[13px] text-gray-500">
                    <span className="font-semibold text-gray-900">{metric.value}%</span> · min {metric.target}%
                  </p>
                </div>
                <ProgressBar
                value={metric.value}
                tone={metric.value >= metric.target ? 'emerald' : 'amber'}
                label={metric.label} />
              
              </div>
            )}
          </CardBody>
          <CardFooter>
            <Badge tone="emerald">All gates passed</Badge>
            <p className="text-xs text-gray-500">Measured on 412K labelled outcomes</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Model information" description="Governance and lineage." icon={CpuIcon} />
          <CardBody>
            <StatList items={modelInfo.map((item) => ({ label: item.label, value: item.value }))} columns={2} />
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">Owned by the Model Risk Committee · next review 15 Sep 2026.</p>
          </CardFooter>
        </Card>
      </div>

      <ThresholdSimulator
        reviewThreshold={reviewThreshold}
        blockThreshold={blockThreshold}
        onReviewChange={handleReviewChange}
        onBlockChange={handleBlockChange} />
      

      <BusinessImpactSimulator
        reviewThreshold={reviewThreshold}
        blockThreshold={blockThreshold}
        capacity={capacity}
        onCapacityChange={setCapacity} />
      

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FeatureImportanceCards />
        <ExplainabilityExplorer />
      </div>
    </div>);

}