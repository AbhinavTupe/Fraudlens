import type { LibraryReport, ReportTemplate, ScheduledReport } from '../types/fraud';

export const reportTemplates: ReportTemplate[] = [
{
  id: 'rt1',
  name: 'Fraud summary',
  description: 'Day-to-day view of detected fraud, blocked value and the typologies behind it.',
  cadence: 'Daily',
  audience: 'Fraud operations',
  sections: ['Detected fraud', 'Blocked value', 'Typologies', 'Watchlist'],
  format: ['PDF', 'CSV'],
  tier: 'standard'
},
{
  id: 'rt2',
  name: 'Executive report',
  description: 'Board-ready overview of losses prevented, approval rates and emerging threats.',
  cadence: 'Monthly',
  audience: 'Executive team',
  sections: ['Headline KPIs', 'Loss prevention', 'Threat landscape', 'Recommendations'],
  format: ['PDF', 'XLSX'],
  tier: 'premium'
},
{
  id: 'rt3',
  name: 'Operational report',
  description: 'Queue throughput, SLA adherence, analyst productivity and handling times.',
  cadence: 'Weekly',
  audience: 'Fraud operations',
  sections: ['Queue health', 'SLA', 'Analyst productivity', 'Backlog forecast'],
  format: ['PDF', 'CSV'],
  tier: 'standard'
},
{
  id: 'rt4',
  name: 'Financial impact report',
  description: 'Revenue protected, fraud prevented, operational savings and return on investment.',
  cadence: 'Monthly',
  audience: 'Finance & Risk',
  sections: ['Revenue protected', 'Fraud prevented', 'Cost to serve', 'ROI'],
  format: ['PDF', 'XLSX'],
  tier: 'premium'
},
{
  id: 'rt5',
  name: 'Compliance report',
  description: 'SAR referrals, audit evidence and policy change attestation for regulators.',
  cadence: 'Monthly',
  audience: 'Compliance',
  sections: ['SAR referrals', 'Audit trail', 'Policy attestation', 'Retention'],
  format: ['PDF', 'XLSX'],
  tier: 'premium'
},
{
  id: 'rt6',
  name: 'Model performance report',
  description: 'Model performance, drift, fairness metrics and change history for model risk.',
  cadence: 'Quarterly',
  audience: 'Model Risk Committee',
  sections: ['Performance', 'Drift', 'Fairness', 'Change log'],
  format: ['PDF'],
  tier: 'premium'
}];


export const scheduledReports: ScheduledReport[] = [
{
  id: 'sr1',
  name: 'Monthly executive summary',
  cadence: 'First Monday, 07:00 UTC',
  frequency: 'Monthly',
  nextRun: '7 Sep 2026 · 07:00',
  recipients: 14,
  recipientList: 'board@fraudlens.io + 13 others',
  owner: 'Priya Raman',
  status: 'active'
},
{
  id: 'sr2',
  name: 'Weekly ops performance',
  cadence: 'Every Monday, 06:00 UTC',
  frequency: 'Weekly',
  nextRun: '10 Aug 2026 · 06:00',
  recipients: 22,
  recipientList: 'fraud-ops@fraudlens.io + 21 others',
  owner: 'Marcus Alvarez',
  status: 'active'
},
{
  id: 'sr3',
  name: 'Quarterly model governance',
  cadence: 'Quarter close +3 days',
  frequency: 'Quarterly',
  nextRun: '3 Oct 2026 · 09:00',
  recipients: 9,
  recipientList: 'model-risk@fraudlens.io + 8 others',
  owner: 'Model Risk Committee',
  status: 'active'
},
{
  id: 'sr4',
  name: 'Daily high-risk digest',
  cadence: 'Daily, 18:00 UTC',
  frequency: 'Daily',
  nextRun: 'Paused',
  recipients: 6,
  recipientList: 'tier2-analysts@fraudlens.io',
  owner: 'Dana Whitfield',
  status: 'paused'
}];


export const libraryReports: LibraryReport[] = [
{
  id: 'lr1',
  name: 'Executive fraud summary — July 2026',
  period: 'Jul 2026',
  generated: '1 Aug 2026 · 07:02',
  size: '2.4 MB',
  format: 'PDF',
  author: 'Automated schedule',
  summary:
  'Fraud losses prevented reached $6.4M in July, a 9% increase on June, while the approval rate improved to 96.8%. Card-testing activity against electronics merchants was the dominant threat and is now contained by two new policies.',
  highlights: [
  '$6.4M in fraud prevented, $0.16M net losses',
  'Approval rate up 0.2pts to 96.8% with no loss increase',
  'Card-testing ring blocked across 3 merchants',
  'Review queue backlog down 18% after threshold tuning'],

  sections: ['Headline KPIs', 'Loss prevention', 'Threat landscape', 'Recommendations']
},
{
  id: 'lr2',
  name: 'Operational performance pack — W31',
  period: 'Week 31',
  generated: '3 Aug 2026 · 06:00',
  size: '1.1 MB',
  format: 'XLSX',
  author: 'Automated schedule',
  summary:
  'Queue SLA adherence held at 94.1% with average handling time of 3m 12s. Escalation rate remains 0.8pts above target, driven by wire cases requiring dual control.',
  highlights: ['SLA adherence 94.1%', 'AHT 3m 12s, inside 4m target', 'Escalations 4.8% vs 4% target'],
  sections: ['Queue health', 'SLA', 'Analyst productivity', 'Backlog forecast']
},
{
  id: 'lr3',
  name: 'Model governance report — Q2 2026',
  period: 'Q2 2026',
  generated: '5 Jul 2026 · 09:14',
  size: '3.8 MB',
  format: 'PDF',
  author: 'Priya Raman',
  summary:
  'Sentinel v4.2 met all performance thresholds with precision 94.6% and recall 91.2%. Drift remains within tolerance at 0.03. Two fairness segments are flagged for monitoring.',
  highlights: ['All performance gates passed', 'Drift 0.03 within tolerance', '2 fairness segments on watch'],
  sections: ['Performance', 'Drift', 'Fairness', 'Change log']
},
{
  id: 'lr4',
  name: 'Regulatory compliance file — June 2026',
  period: 'Jun 2026',
  generated: '2 Jul 2026 · 08:30',
  size: '5.2 MB',
  format: 'PDF',
  author: 'Compliance automation',
  summary:
  '41 SAR referrals filed within statutory deadlines. Full audit trail exported for 128,904 decisions with complete reason codes.',
  highlights: ['41 SAR referrals, 100% on time', 'Audit coverage 100% of decisions', 'No control exceptions'],
  sections: ['SAR referrals', 'Audit trail', 'Policy attestation', 'Retention']
}];


export const complianceItems = [
{ id: 'c1', name: 'PSD2 strong customer authentication', status: 'compliant' as const, detail: 'Exemption rates within limits', reviewed: '28 Jul 2026' },
{ id: 'c2', name: 'Model risk documentation (SR 11-7)', status: 'compliant' as const, detail: 'Validation refreshed for v4.2', reviewed: '18 Jul 2026' },
{ id: 'c3', name: 'GDPR automated decision disclosure', status: 'compliant' as const, detail: 'Reason codes exposed to customers', reviewed: '12 Jul 2026' },
{ id: 'c4', name: 'Fair lending / bias monitoring', status: 'action' as const, detail: '2 segments flagged for review', reviewed: '2 Aug 2026' },
{ id: 'c5', name: 'SAR filing timeliness', status: 'compliant' as const, detail: '41 of 41 filed within deadline', reviewed: '1 Aug 2026' }];


/** Headline compliance posture shown at the top of the Compliance Center. */
export const complianceHealth = [
{ id: 'chh1', label: 'Audit readiness', value: '96%', detail: 'Evidence complete for 4 of 5 obligations', tone: 'emerald' as const, progress: 96 },
{ id: 'chh2', label: 'Missing reports', value: '1', detail: 'Fair lending review for July not yet filed', tone: 'amber' as const, progress: 80 },
{ id: 'chh3', label: 'Retention status', value: '7 years', detail: '128,904 decisions retained, none expiring', tone: 'emerald' as const, progress: 100 },
{ id: 'chh4', label: 'Compliance health', value: 'Strong', detail: 'No control exceptions in the last 12 months', tone: 'emerald' as const, progress: 92 }];


export const exportHistory = [
{ id: 'e1', name: 'high_risk_transactions_aug.csv', by: 'Marcus Alvarez', at: '4 Aug 2026 · 09:12', rows: '4,412', status: 'complete' as const },
{ id: 'e2', name: 'model_governance_q2.pdf', by: 'Priya Raman', at: '2 Aug 2026 · 16:48', rows: '—', status: 'complete' as const },
{ id: 'e3', name: 'audit_trail_july.xlsx', by: 'Compliance automation', at: '1 Aug 2026 · 07:05', rows: '128,904', status: 'complete' as const },
{ id: 'e4', name: 'decision_distribution_w31.csv', by: 'Dana Whitfield', at: '31 Jul 2026 · 11:22', rows: '9,140', status: 'expired' as const }];


export const executiveSummary = {
  headline: 'July closed with record loss prevention and the healthiest approval rate on record.',
  points: [
  'FraudLens prevented $6.4M in fraud losses while net losses fell to $0.16M — 0.014% of processed volume.',
  'Approval rate rose to 96.8%. Threshold tuning removed 1,900 unnecessary reviews without increasing loss.',
  'The dominant threat was a card-testing ring across three electronics merchants, now contained by two policies.',
  'Two fairness segments (new customers, non-domestic cards) need review before the next model release.'],

  recommendations: [
  'Raise the card-present auto-approve ceiling to 55 to remove ~1,900 reviews per month.',
  'Commission a fairness review for non-domestic cards before promoting Sentinel v4.3.',
  'Keep Tier 2 staffing elevated between 12:00 and 16:00 UTC where fraud attempts peak.']

};