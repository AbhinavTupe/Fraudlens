import { useState } from 'react';
import { CheckCircle2Icon, ScanSearchIcon, ZapIcon } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { RiskScore } from '../ui/RiskScore';
import { ExplanationCards } from '../transactions/ExplanationCards';
import { transactions } from '../../data/transactions';
import { formatCurrency } from '../../utils/cn';
import { bandMeta, decisionMeta, policyOutcome, riskBand } from '../../utils/labels';

/**
 * Explainability explorer: inspect any prediction, the rules it triggered, the policies
 * applied, the business-language reasons and the final recommendation.
 */
export function ExplainabilityExplorer() {
  const [caseId, setCaseId] = useState(transactions[0].id);
  const selected = transactions.find((transaction) => transaction.id === caseId)!;
  const band = bandMeta[riskBand(selected.riskScore)];
  const outcome = policyOutcome(selected);
  const triggeredRules = selected.policies.filter((policy) => policy.result === 'triggered');

  return (
    <Card>
      <CardHeader
        title="Explainability explorer"
        description="Inspect any prediction end to end — rules, policies, reasons and recommendation."
        icon={ScanSearchIcon}
        action={
        <div className="w-56">
            <Select
            name="case"
            value={caseId}
            onChange={(event) => setCaseId(event.target.value)}
            options={transactions.map((transaction) => ({
              value: transaction.id,
              label: `${transaction.reference} · score ${transaction.riskScore}`
            }))} />
          
          </div>
        } />
      
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900">
              {selected.merchant} · {selected.reference}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {formatCurrency(selected.amount)} · {selected.channel} · {selected.country} · {selected.customer}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={band.tone}>{band.label}</Badge>
            <RiskScore score={selected.riskScore} size="md" showBar={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Rules triggered</h3>
            {triggeredRules.length === 0 ?
            <p className="mt-2 rounded-lg bg-emerald-50/70 px-3 py-2.5 text-[13px] text-emerald-800">
                No rules fired — this decision came from the model score alone.
              </p> :

            <ul className="mt-2 space-y-2">
                {triggeredRules.map((rule) =>
              <li key={rule.id} className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5">
                    <ZapIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-900">{rule.name}</p>
                      <p className="mt-0.5 text-xs leading-5 text-gray-500">{rule.detail}</p>
                    </div>
                  </li>
              )}
              </ul>
            }
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Policies applied</h3>
            <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3.5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={decisionMeta[outcome.aiDecision].tone}>
                  AI: {decisionMeta[outcome.aiDecision].label}
                </Badge>
                <span className="text-xs text-gray-400">→</span>
                <Badge tone={decisionMeta[outcome.finalDecision].tone} dot>
                  Final: {decisionMeta[outcome.finalDecision].label}
                </Badge>
                <Badge tone={outcome.modified ? 'amber' : 'emerald'}>
                  {outcome.modified ? 'Modified by policy' : 'Upheld'}
                </Badge>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-gray-600">{outcome.reason}</p>
            </div>
          </section>
        </div>

        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Why the model decided this
          </h3>
          <ExplanationCards factors={selected.shap} compact />
        </section>

        <section className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Final recommendation</p>
            <p className="mt-1 text-[13px] leading-6 text-emerald-900">{selected.recommendation}</p>
          </div>
        </section>
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Every prediction retains its reasons for seven years, so any decision can be explained to a customer or regulator.
        </p>
        <span className="tabular text-xs text-gray-500">{selected.recommendationConfidence}% model confidence</span>
      </CardFooter>
    </Card>);

}