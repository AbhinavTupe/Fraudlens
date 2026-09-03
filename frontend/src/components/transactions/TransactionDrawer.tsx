import { useEffect, useState } from 'react';
import {
  BanknoteIcon,
  BotIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  FlagIcon,
  GavelIcon,
  MessageSquareTextIcon,
  RouteIcon,
  ScaleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  XCircleIcon } from
'lucide-react';
import { toast } from 'sonner';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RiskScore } from '../ui/RiskScore';
import { ProgressBar } from '../ui/ProgressBar';
import { DecisionTimeline } from './DecisionTimeline';
import { ExplanationCards } from './ExplanationCards';
import { PolicyEvaluationPanel } from './PolicyEvaluationPanel';
import { cn, formatCurrency } from '../../utils/cn';
import { bandMeta, decisionMeta, riskBand } from '../../utils/labels';
import type { Transaction } from '../../types/fraud';
import { evaluateTransaction, type TransactionEvaluation, updateTransactionStatus, type TransactionStatusValue, getFraudAlerts, updateFraudAlertStatus, openInvestigation, type FraudAlertItem, getTransactionExplanation, type TransactionExplanation } from '../../lib/api';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

const severityTone = { info: 'blue', warning: 'amber', danger: 'red' } as const;

export function TransactionDrawer({ transaction, open, onClose }: TransactionDrawerProps) {
  const [note, setNote] = useState('');
  const [decided, setDecided] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [evaluation, setEvaluation] = useState<TransactionEvaluation | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<TransactionExplanation | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [persistedStatus, setPersistedStatus] = useState<string>(transaction?.status ?? 'pending');
  const [fraudAlert, setFraudAlert] = useState<FraudAlertItem | null>(null);
  const [updatingAlert, setUpdatingAlert] = useState(false);

  useEffect(() => {
    if (transaction) {
      setPersistedStatus(transaction.status);
    }
  }, [transaction]);

  useEffect(() => {
    let active = true;
    setFraudAlert(null);

    if (!transaction) return;

    getFraudAlerts()
      .then((alerts) => {
        if (!active) return;
        const match = alerts.find((a) => a.transaction_id === transaction.id);
        setFraudAlert(match ?? null);
      })
      .catch(() => {
        if (!active) return;
        setFraudAlert(null);
      });

    return () => { active = false; };
  }, [transaction]);

  useEffect(() => {
    let active = true;
    setExplanation(null);
    setExplanationError(null);
    setExplanationLoading(Boolean(transaction));

    if (!transaction) return () => { active = false; };

    getTransactionExplanation(transaction.id)
      .then((result) => {
        if (active) setExplanation(result);
      })
      .catch((error) => {
        if (!active) return;
        setExplanationError(error instanceof Error ? error.message : 'Could not load model explanation');
      })
      .finally(() => {
        if (active) setExplanationLoading(false);
      });

    return () => { active = false; };
  }, [transaction]);

  if (!transaction) return null;

  const activeTransaction = transaction;
  const activeRiskScore = evaluation && typeof evaluation.fraud_probability === 'number'
    ? Math.max(0, Math.min(100, Math.round(Number(evaluation.fraud_probability) * 100)))
    : activeTransaction.riskScore;
  const band = bandMeta[riskBand(activeRiskScore)];

  async function handleEvaluate() {
    setEvaluating(true);
    setEvaluationError(null);

    try {
      const result = await evaluateTransaction(activeTransaction.id);
      setEvaluation(result);
      const score = typeof result.fraud_probability === 'number'
        ? Math.max(0, Math.min(100, Math.round(Number(result.fraud_probability) * 100)))
        : activeTransaction.riskScore;
      const decision = score >= 90 ? 'block' : score >= 70 ? 'review' : 'approve';
      const label = result.predicted_label ? result.predicted_label.toLowerCase() : decision;
      setDecided(`Evaluation complete · ${label}`);
      toast.success(`Fraud evaluation complete · ${activeTransaction.reference}`, {
        description: `Score ${score}/100 · ${label === 'fraud' ? 'fraud' : 'legit'} decision from the live backend response.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fraud evaluation failed';
      setEvaluationError(message);
      toast.error('Fraud evaluation failed', { description: message });
    } finally {
      setEvaluating(false);
    }
  }

  async function handleStatusUpdate(action: 'approve' | 'confirm_fraud' | 'escalate') {
    const mapping: Record<typeof action, TransactionStatusValue> = {
      approve: 'approved',
      confirm_fraud: 'declined',
      escalate: 'requires_review',
    };

    const labelMap: Record<typeof action, string> = {
      approve: 'Approved and cleared',
      confirm_fraud: 'Confirmed fraud and blocked',
      escalate: 'Escalated to Tier 3',
    };

    const nextStatus = mapping[action];
    setUpdatingStatus(true);
    setEvaluationError(null);

    try {
      const result = await updateTransactionStatus(activeTransaction.id, nextStatus);
      setPersistedStatus(result.status);
      setDecided(`${labelMap[action]} · persisted status: ${result.status}`);
      toast.success(`${labelMap[action]} · ${activeTransaction.reference}`, {
        description: `Persisted status: ${result.status}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Decision update failed';
      toast.error(`${labelMap[action]} failed`, { description: message });
    } finally {
      setUpdatingStatus(false);
    }
  }

  function decide(label: string, tone: 'success' | 'error' | 'default') {
    setDecided(label);
    const description = note ? `Note saved: “${note}”` : 'Decision written to the audit trail.';
    if (tone === 'success') toast.success(`${label} · ${activeTransaction.reference}`, { description });else
    if (tone === 'error') toast.error(`${label} · ${activeTransaction.reference}`, { description });else
    toast(`${label} · ${activeTransaction.reference}`, { description });
  }

  const backendStatusMeta: Record<string, { label: string; tone: 'blue' | 'amber' | 'red' | 'emerald' | 'violet' }> = {
    pending: { label: 'Pending action', tone: 'amber' },
    approved: { label: 'Approved', tone: 'emerald' },
    declined: { label: 'Declined', tone: 'red' },
    requires_review: { label: 'Requires review', tone: 'violet' },
  };

  const statusLabel = backendStatusMeta[persistedStatus]?.label ?? persistedStatus;
  const statusTone = backendStatusMeta[persistedStatus]?.tone ?? 'blue';
  const actionDisabled = evaluating || updatingStatus;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="max-w-[680px]"
      title={`${transaction.reference} · ${formatCurrency(transaction.amount)}`}
      subtitle={`${transaction.merchant} · ${transaction.customer} · ${transaction.channel}`}
      eyebrow={
      <>
          <Badge tone={decisionMeta[transaction.decision].tone} dot>
            {decisionMeta[transaction.decision].label}
          </Badge>
          <Badge tone={statusTone}>{statusLabel}</Badge>
          <Badge tone={band.tone}>{band.label}</Badge>
        </>
      }
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {decided ?
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <CheckCircle2Icon className="h-3.5 w-3.5" /> {decided} — recorded
              </span> :

          'Every decision is logged with the model reasons shown here.'
          }
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={BotIcon} onClick={handleEvaluate} disabled={evaluating}>
              {evaluating ? 'Evaluating...' : 'Run Fraud Evaluation'}
            </Button>
            <Button variant="secondary" size="sm" icon={ScaleIcon} onClick={() => handleStatusUpdate('escalate')} disabled={actionDisabled || updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Escalate'}
            </Button>
            <Button variant="danger" size="sm" icon={XCircleIcon} onClick={() => handleStatusUpdate('confirm_fraud')} disabled={actionDisabled || updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Confirm fraud'}
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle2Icon} onClick={() => handleStatusUpdate('approve')} disabled={actionDisabled || updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Approve'}
            </Button>
          </div>
        </div>
      }>
      
      <div className="space-y-7">
        <Section title="Transaction summary" icon={BanknoteIcon}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:grid-cols-3">
            {[
            ['Amount', formatCurrency(transaction.amount)],
            ['Merchant', transaction.merchant],
            ['Category', transaction.merchantCategory],
            ['Customer', `${transaction.customer} · ${transaction.customerId}`],
            ['Channel', transaction.channel],
            ['Country', transaction.country],
            ['Device', transaction.device],
            ['Received', `${new Date(transaction.timestamp).toUTCString().slice(5, 22)} UTC`],
            ['Assignee', transaction.assignee ?? 'Unassigned']].
            map(([label, value]) =>
            <div key={label} className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
                <dd className="tabular mt-1 text-[13px] font-medium text-gray-900">{value}</dd>
              </div>
            )}
          </dl>
        </Section>

        {fraudAlert ? (
          <Section title="Fraud alert" icon={ShieldAlertIcon} description="Backend alert linked to this transaction.">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Severity · {fraudAlert.severity}</p>
                  <p className="text-xs text-gray-500">Status · {fraudAlert.status}</p>
                  <p className="mt-2 text-xs text-gray-400">Alert {String(fraudAlert.id).slice(0,8)} · created {new Date(fraudAlert.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {fraudAlert.status === 'open' ? (
                    <button
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700"
                      disabled={updatingAlert}
                      onClick={async () => {
                        setUpdatingAlert(true);
                        try {
                          const updated = await updateFraudAlertStatus(fraudAlert.id, 'acknowledged');
                          setFraudAlert(updated);
                        } catch (e) {
                          /* swallow, toast handled elsewhere */
                        } finally {
                          setUpdatingAlert(false);
                        }
                      }}>
                      {updatingAlert ? 'Updating...' : 'Acknowledge'}
                    </button>
                  ) : null}

                  {fraudAlert.investigation_case == null ? (
                    <button
                      className="ml-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
                      disabled={updatingAlert}
                      onClick={async () => {
                        setUpdatingAlert(true);
                        try {
                          const newCase = await openInvestigation({ fraud_alert_id: fraudAlert.id, title: `Investigation ${String(fraudAlert.id).slice(0,8)}`, status: 'open', priority: 'medium' });
                          setFraudAlert({ ...fraudAlert, investigation_case: newCase } as FraudAlertItem);
                        } catch (e) {
                          /* swallow */
                        } finally {
                          setUpdatingAlert(false);
                        }
                      }}>
                      Open case
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        <Section
          title="Decision timeline"
          icon={RouteIcon}
          description="Every step this payment travelled, from gateway to final decision.">
          
          <DecisionTimeline transaction={transaction} />
        </Section>

        <Section title="AI assessment" icon={BotIcon} description="What the model concluded and how confident it is.">
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Fraud score</p>
                <RiskScore score={activeRiskScore} size="lg" showBar={false} />
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Model confidence</p>
                <p className="tabular mt-1 text-lg font-semibold text-gray-900">{Math.max(50, Math.min(99, activeRiskScore))}%</p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={activeRiskScore}
                tone={activeRiskScore >= 90 ? 'red' : activeRiskScore >= 70 ? 'amber' : 'emerald'}
                label="Fraud score" />
              
              <div className="mt-2 flex justify-between text-[11px] text-gray-400">
                <span>0 · Trusted</span>
                <span>70 · Review band</span>
                <span>100 · Certain fraud</span>
              </div>
            </div>
            {evaluation ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-[13px] text-blue-900">
                <p><span className="font-semibold">Backend evaluation:</span> {evaluation.predicted_label ?? 'unknown'} · {activeRiskScore}/100</p>
                {typeof evaluation.fraud_probability === 'number' ? (
                  <p className="mt-1">Fraud probability: {Number(evaluation.fraud_probability).toFixed(4)}</p>
                ) : null}
                {evaluation.model_version ? <p className="mt-1">Model: {evaluation.model_version}</p> : null}
                {evaluation.threshold_used != null ? <p className="mt-1">Threshold: {Number(evaluation.threshold_used).toFixed(4)}</p> : null}
              </div>
            ) : null}
            {evaluationError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{evaluationError}</div>
            ) : null}
            {explanationLoading ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-500">Loading model explanation...</div>
            ) : explanationError ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">{explanationError}</div>
            ) : explanation ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                  <span>Model-rule explanation · raw score {explanation.raw_score.toFixed(2)}</span>
                  <span>Threshold {explanation.threshold.toFixed(2)} · {explanation.decision}</span>
                </div>
                <p className="mt-2 text-[13px] text-gray-700">
                  Current fraud probability: <span className="font-semibold">{(explanation.fraud_probability * 100).toFixed(2)}%</span>
                </p>
                {explanation.contributions.length === 0 ? (
                  <p className="mt-2 text-[13px] text-gray-600">No scoring rules contributed to this result.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {explanation.contributions.map((contribution) => (
                      <li key={`${contribution.feature}-${contribution.reason}`} className="flex items-start justify-between gap-3 text-[13px]">
                        <span className="text-gray-700">{contribution.reason}</span>
                        <span className={cn('shrink-0 font-semibold', contribution.contribution > 0 ? 'text-red-600' : 'text-emerald-600')}>
                          {contribution.contribution > 0 ? '+' : ''}{contribution.contribution.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            <p className="mt-4 border-t border-gray-200 pt-3 text-[13px] leading-6 text-gray-700">
              Sentinel v4.2 scored this transaction <span className="font-semibold">{activeRiskScore}/100</span>,
              placing it in the <span className="font-semibold">{band.label.toLowerCase()}</span> band. The reasons below
              are ranked by how much each one moved the score.
            </p>
          </div>
        </Section>

        <Section title="Risk flags" icon={FlagIcon} description="Signals that fired on this transaction.">
          {transaction.flags.length === 0 ?
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-[13px] leading-5 text-emerald-800">
                No risk flags fired. This transaction matches the customer’s normal behaviour.
              </p>
            </div> :

          <ul className="space-y-2">
              {transaction.flags.map((flag) =>
            <li key={flag.id} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <ShieldAlertIcon
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  flag.severity === 'danger' ?
                  'text-red-500' :
                  flag.severity === 'warning' ?
                  'text-amber-500' :
                  'text-blue-500'
                )} />
              
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-gray-900">{flag.label}</p>
                      <Badge tone={severityTone[flag.severity]}>{flag.severity}</Badge>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-5 text-gray-600">{flag.description}</p>
                  </div>
                </li>
            )}
            </ul>
          }
        </Section>

        <Section
          title="Why this was flagged"
          icon={MessageSquareTextIcon}
          description="Plain-language reasons, ranked by how much each one moved the score.">
          
          <ExplanationCards factors={transaction.shap} />
        </Section>

        <Section
          title="Policy evaluation"
          icon={GavelIcon}
          description="Business policies versus the AI recommendation, and what changed.">
          
          <PolicyEvaluationPanel transaction={transaction} />
        </Section>

        <Section title="Recommended action" icon={ShieldCheckIcon}>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                FraudLens recommendation
              </p>
              <Badge tone="emerald">{transaction.recommendationConfidence}% confidence</Badge>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-emerald-900">{transaction.recommendation}</p>
          </div>
        </Section>

        <Section title="Analyst decision" icon={ClipboardListIcon} description="Add context for auditors and future reviews.">
          <label htmlFor="analyst-note" className="mb-1.5 block text-[13px] font-medium text-gray-700">
            Case note
          </label>
          <textarea
            id="analyst-note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What did you verify, and what did the customer say?"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="subtle" onClick={() => decide('Requested customer verification', 'default')}>
              Request verification
            </Button>
            <Button size="sm" variant="subtle" onClick={() => decide('Marked as false positive', 'success')}>
              Mark false positive
            </Button>
          </div>
        </Section>
      </div>
    </Drawer>);

}

function Section({
  title,
  description,
  icon: Icon,
  children





}: {title: string;description?: string;icon: React.ComponentType<{className?: string;}>;children: React.ReactNode;}) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
          {description ? <p className="mt-0.5 text-[13px] leading-5 text-gray-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>);

}