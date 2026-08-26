import type { KpiDatum, TimelineEvent } from '../types/fraud';

export const operationsKpis: KpiDatum[] = [
{
  id: 'volume',
  label: 'Transactions today',
  value: '184,320',
  delta: 6.4,
  deltaLabel: 'vs yesterday',
  intent: 'neutral',
  hint: 'Peak throughput 412 txn/s at 09:10',
  trend: [142, 151, 149, 158, 166, 172, 178, 184]
},
{
  id: 'fraud',
  label: 'Fraud detected',
  value: '1,142',
  delta: 12.1,
  deltaLabel: 'vs yesterday',
  intent: 'negative',
  hint: 'Card testing is driving the increase',
  trend: [820, 842, 910, 878, 940, 1020, 1018, 1142]
},
{
  id: 'queue',
  label: 'Manual review queue',
  value: '87',
  delta: -18.3,
  deltaLabel: 'vs yesterday',
  intent: 'positive',
  hint: '12 breaching SLA in under 30 min',
  trend: [132, 128, 141, 124, 118, 106, 98, 87]
},
{
  id: 'protected',
  label: 'Money protected',
  value: '$4.28M',
  delta: 9.7,
  deltaLabel: 'vs yesterday',
  intent: 'positive',
  hint: 'Blocked value net of reversals',
  trend: [3.1, 3.3, 3.2, 3.6, 3.8, 3.9, 4.0, 4.28]
},
{
  id: 'score',
  label: 'Average fraud score',
  value: '28.4',
  delta: 2.2,
  deltaLabel: 'vs 7-day avg',
  intent: 'neutral',
  hint: 'Distribution skewing slightly higher',
  trend: [26.1, 26.4, 27.0, 26.8, 27.4, 27.9, 28.1, 28.4]
},
{
  id: 'fpr',
  label: 'False positive rate',
  value: '1.9%',
  delta: -0.4,
  deltaLabel: 'vs last week',
  intent: 'positive',
  hint: 'Best result in 6 weeks',
  trend: [2.8, 2.7, 2.6, 2.4, 2.3, 2.1, 2.0, 1.9]
}];


export const fraudTrend = [
{ hour: '00:00', transactions: 4120, fraud: 21, score: 24 },
{ hour: '02:00', transactions: 3260, fraud: 18, score: 26 },
{ hour: '04:00', transactions: 3980, fraud: 26, score: 27 },
{ hour: '06:00', transactions: 8640, fraud: 44, score: 25 },
{ hour: '08:00', transactions: 15820, fraud: 96, score: 29 },
{ hour: '10:00', transactions: 21440, fraud: 148, score: 31 },
{ hour: '12:00', transactions: 24180, fraud: 171, score: 30 },
{ hour: '14:00', transactions: 25960, fraud: 189, score: 32 },
{ hour: '16:00', transactions: 23110, fraud: 164, score: 29 },
{ hour: '18:00', transactions: 19740, fraud: 132, score: 28 },
{ hour: '20:00', transactions: 14980, fraud: 88, score: 27 },
{ hour: '22:00', transactions: 9090, fraud: 45, score: 25 }];


export const decisionSummary = [
{ label: 'Auto-approved', value: 91.2, count: 168_100, tone: 'emerald' as const },
{ label: 'Manual review', value: 6.4, count: 11_796, tone: 'amber' as const },
{ label: 'Blocked', value: 2.4, count: 4_424, tone: 'red' as const }];


export const reviewQueue = [
{ id: 'q1', tier: 'Tier 1 · Standard', open: 42, sla: '28 min', breaching: 3, oldest: '19 min' },
{ id: 'q2', tier: 'Tier 2 · High value', open: 24, sla: '15 min', breaching: 6, oldest: '22 min' },
{ id: 'q3', tier: 'Tier 3 · Escalations', open: 11, sla: '60 min', breaching: 2, oldest: '41 min' },
{ id: 'q4', tier: 'Compliance referrals', open: 10, sla: '4 hrs', breaching: 1, oldest: '2 hrs' }];


export const platformStatus = [
{ id: 's1', name: 'Scoring API', status: 'operational' as const, detail: 'p99 41ms · 100% uptime 30d' },
{ id: 's2', name: 'Sentinel v4.2 model', status: 'operational' as const, detail: 'Drift 0.03 · within tolerance' },
{ id: 's3', name: 'Policy engine', status: 'operational' as const, detail: '48 active policies' },
{ id: 's4', name: 'Feature store', status: 'degraded' as const, detail: 'Device graph refresh lagging 6 min' },
{ id: 's5', name: 'Reporting pipeline', status: 'operational' as const, detail: 'Last sync 4 min ago' }];


export const businessImpact = [
{ label: 'Fraud losses prevented', value: '$4.28M', detail: 'Month to date · $31.6M YTD' },
{ label: 'Revenue preserved', value: '$1.84M', detail: 'False positives avoided after tuning' },
{ label: 'Analyst hours saved', value: '612 hrs', detail: 'Automation vs manual baseline' },
{ label: 'Net platform ROI', value: '7.4x', detail: 'Rolling 12-month calculation' }];


export const recentActivity: TimelineEvent[] = [
{ id: 'a1', title: 'Threshold updated', detail: 'Block threshold moved 92 → 90 for e-commerce.', timestamp: '09:38', actor: 'Marcus Alvarez', kind: 'analyst' },
{ id: 'a2', title: 'Card-testing ring flagged', detail: '14 linked transactions blocked across 3 merchants.', timestamp: '09:22', actor: 'Sentinel v4.2', kind: 'model' },
{ id: 'a3', title: 'Policy published', detail: '“Crypto on-ramp scrutiny” live in production.', timestamp: '08:54', actor: 'Priya Raman', kind: 'policy' },
{ id: 'a4', title: 'Case escalated', detail: 'TXN-9F2B41 escalated to Tier 2 with cardholder outreach.', timestamp: '08:51', actor: 'Marcus Alvarez', kind: 'analyst' },
{ id: 'a5', title: 'Feature store alert', detail: 'Device graph refresh lag exceeded 5 minutes.', timestamp: '08:31', actor: 'Platform monitor', kind: 'system' },
{ id: 'a6', title: 'Shift handover', detail: 'EMEA queue handed to North America team.', timestamp: '08:00', actor: 'Dana Whitfield', kind: 'analyst' }];


export const decisionIntelligenceSummary = [
{ label: 'Model confidence', value: '94.2%', detail: 'Average across scored transactions' },
{ label: 'Explanations delivered', value: '184,320', detail: 'Every decision has a reason code' },
{ label: 'Top driver today', value: 'Card velocity', detail: 'Present in 38% of blocked cases' },
{ label: 'Analyst agreement', value: '91.6%', detail: 'Analysts upheld the model recommendation' }];