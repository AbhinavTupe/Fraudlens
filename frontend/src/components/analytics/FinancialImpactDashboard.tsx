import { WalletIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { MetricTile } from '../ui/MetricTile';
import { financialDashboard } from '../../data/analytics';

/** Executive financial scoreboard: what the platform returned in money terms. */
export function FinancialImpactDashboard() {
  return (
    <Card>
      <CardHeader
        title="Financial impact"
        description="The money story behind fraud decisions, quarter to date."
        icon={WalletIcon} />
      
      <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {financialDashboard.map((item) =>
        <MetricTile
          key={item.id}
          label={item.label}
          value={item.value}
          detail={item.detail}
          delta={item.delta}
          deltaGood={item.good}
          tone={item.id === 'fd4' ? 'amber' : item.id === 'fd6' ? 'blue' : 'emerald'} />

        )}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Figures come from confirmed outcomes and finance-approved unit costs, not model estimates.
        </p>
      </CardFooter>
    </Card>);

}