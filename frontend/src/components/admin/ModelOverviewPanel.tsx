import { CpuIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { modelOverview } from '../../data/admin';

/** Plain-language overview of the model currently making decisions. */
export function ModelOverviewPanel() {
  return (
    <Card>
      <CardHeader
        title="AI model overview"
        description="What is deployed, when it was trained and whether it passed validation."
        icon={CpuIcon}
        action={
        <Badge tone="emerald" dot>
            Validation passed
          </Badge>
        } />
      
      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modelOverview.map((item) =>
        <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
            <p className="tabular mt-1.5 text-[15px] font-semibold leading-5 text-gray-900">{item.value}</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">{item.detail}</p>
          </div>
        )}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Owned by the Model Risk Committee. Promotion of challenger v4.3 is due 15 Sep 2026.
        </p>
      </CardFooter>
    </Card>);

}