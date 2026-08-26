import type { BadgeTone } from '../components/ui/Badge';
import type { CaseStatus, Decision, PolicyEvaluation, RiskBand, Transaction } from '../types/fraud';

export const decisionMeta: Record<Decision, {label: string;tone: BadgeTone;}> = {
  approve: { label: 'Approved', tone: 'emerald' },
  review: { label: 'Manual review', tone: 'amber' },
  block: { label: 'Blocked', tone: 'red' }
};

export const statusMeta: Record<CaseStatus, {label: string;tone: BadgeTone;}> = {
  open: { label: 'Open', tone: 'blue' },
  pending: { label: 'Pending action', tone: 'amber' },
  confirmed_fraud: { label: 'Confirmed fraud', tone: 'red' },
  cleared: { label: 'Cleared', tone: 'emerald' },
  escalated: { label: 'Escalated', tone: 'violet' }
};

export function riskBand(score: number): RiskBand {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export const bandMeta: Record<RiskBand, {label: string;tone: BadgeTone;bar: string;text: string;}> = {
  low: { label: 'Low risk', tone: 'emerald', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  medium: { label: 'Medium risk', tone: 'blue', bar: 'bg-blue-500', text: 'text-blue-700' },
  high: { label: 'High risk', tone: 'amber', bar: 'bg-amber-500', text: 'text-amber-700' },
  critical: { label: 'Critical risk', tone: 'red', bar: 'bg-red-500', text: 'text-red-700' }
};

/**
 * Business policies are analyst-authored rules. Score-band policies are the model's
 * own thresholds, so they belong to the AI recommendation, not the policy layer.
 */
export function isScorePolicy(policy: PolicyEvaluation): boolean {
  return /score|band/i.test(policy.name);
}

/** The recommendation the score alone would produce, before business policies. */
export function aiSuggestedDecision(score: number): Decision {
  if (score >= 90) return 'block';
  if (score >= 70) return 'review';
  return 'approve';
}

export interface PolicyOutcome {
  aiDecision: Decision;
  finalDecision: Decision;
  modified: boolean;
  businessPolicies: PolicyEvaluation[];
  scorePolicies: PolicyEvaluation[];
  reason: string;
}

export function policyOutcome(transaction: Transaction): PolicyOutcome {
  const aiDecision = aiSuggestedDecision(transaction.riskScore);
  const businessPolicies = transaction.policies.filter((policy) => !isScorePolicy(policy));
  const scorePolicies = transaction.policies.filter(isScorePolicy);
  const modified = aiDecision !== transaction.decision;
  const trigger = businessPolicies.find((policy) => policy.result === 'triggered');
  const reason = modified ?
  trigger ?
  `“${trigger.name}” overrode the score-based outcome: ${trigger.detail}` :
  'A business policy overrode the score-based outcome.' :
  trigger ?
  `Business policies agreed with the AI recommendation and added controls via “${trigger.name}”.` :
  'No business policy changed the AI recommendation.';

  return { aiDecision, finalDecision: transaction.decision, modified, businessPolicies, scorePolicies, reason };
}