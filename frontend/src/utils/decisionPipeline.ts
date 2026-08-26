import { decisionMeta, policyOutcome, riskBand, bandMeta } from './labels';
import type { Transaction } from '../types/fraud';

export type StageState = 'complete' | 'active' | 'pending';

export type StageKind = 'system' | 'feature' | 'rules' | 'model' | 'explain' | 'policy' | 'analyst' | 'final';

export interface DecisionStage {
  id: string;
  kind: StageKind;
  title: string;
  detail: string;
  meta: string;
  state: StageState;
}

/**
 * Derives the eight-step decision pipeline for a transaction so every case shows the
 * same story: how the payment travelled from gateway to final decision.
 */
export function decisionStages(transaction: Transaction): DecisionStage[] {
  const outcome = policyOutcome(transaction);
  const band = bandMeta[riskBand(transaction.riskScore)];
  const received = transaction.timeline[0]?.timestamp ?? '—';
  const triggered = transaction.policies.filter((policy) => policy.result === 'triggered');
  const topDriver = [...transaction.shap].sort((a, b) => b.impact - a.impact)[0];
  const analystDone = transaction.status !== 'open';
  const finalised =
  transaction.status === 'cleared' || transaction.status === 'confirmed_fraud' || transaction.status === 'escalated';

  return [
  {
    id: 'created',
    kind: 'system',
    title: 'Transaction created',
    detail: `${transaction.channel} payment received from ${transaction.merchant}.`,
    meta: received,
    state: 'complete'
  },
  {
    id: 'features',
    kind: 'feature',
    title: 'Feature engineering',
    detail: '284 behavioural, device and history features built from the customer profile.',
    meta: '9 ms',
    state: 'complete'
  },
  {
    id: 'rules',
    kind: 'rules',
    title: 'Rule evaluation',
    detail: `${transaction.policies.length} rules evaluated · ${triggered.length} triggered.`,
    meta: '4 ms',
    state: 'complete'
  },
  {
    id: 'prediction',
    kind: 'model',
    title: 'AI prediction',
    detail: `Sentinel v4.2 scored ${transaction.riskScore}/100 — ${band.label.toLowerCase()} — at ${transaction.recommendationConfidence}% confidence.`,
    meta: '34 ms',
    state: 'complete'
  },
  {
    id: 'explanation',
    kind: 'explain',
    title: 'Explanation generated',
    detail: topDriver ?
    `Top contributor: ${topDriver.label.toLowerCase()}.` :
    'No individual contributor stood out on this transaction.',
    meta: `${transaction.shap.length} contributors`,
    state: 'complete'
  },
  {
    id: 'policy',
    kind: 'policy',
    title: 'Policy evaluation',
    detail: outcome.modified ?
    `Business policies changed the outcome from ${decisionMeta[outcome.aiDecision].label.toLowerCase()} to ${decisionMeta[outcome.finalDecision].label.toLowerCase()}.` :
    `Business policies upheld the AI recommendation to ${decisionMeta[outcome.finalDecision].label.toLowerCase()}.`,
    meta: `${outcome.businessPolicies.length} business ${outcome.businessPolicies.length === 1 ? 'policy' : 'policies'}`,
    state: 'complete'
  },
  {
    id: 'analyst',
    kind: 'analyst',
    title: 'Analyst decision',
    detail: analystDone ?
    `${transaction.assignee ?? 'Automated queue'} reviewed the case and recorded an outcome.` :
    'Waiting for an analyst to pick this case up from the queue.',
    meta: transaction.assignee ?? 'Unassigned',
    state: analystDone ? 'complete' : 'active'
  },
  {
    id: 'final',
    kind: 'final',
    title: 'Final decision',
    detail: finalised ?
    `${decisionMeta[transaction.decision].label} — written to the audit trail with full reasoning.` :
    `Provisional outcome: ${decisionMeta[transaction.decision].label.toLowerCase()}. Confirmed once the analyst closes the case.`,
    meta: decisionMeta[transaction.decision].label,
    state: finalised ? 'complete' : 'pending'
  }];

}