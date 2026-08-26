import type { KpiDatum } from '../types/fraud';

export const analyticsKpis: KpiDatum[] = [
{
  id: 'prevented',
  label: 'Fraud prevented',
  value: '$31.6M',
  delta: 14.2,
  deltaLabel: 'vs last quarter',
  intent: 'positive',
  hint: 'Year to date across all channels',
  trend: [3.9, 4.4, 4.8, 5.2, 5.9, 6.4, 6.9]
},
{
  id: 'loss',
  label: 'Net fraud losses',
  value: '$1.12M',
  delta: -21.5,
  deltaLabel: 'vs last quarter',
  intent: 'positive',
  hint: '0.014% of processed volume',
  trend: [0.28, 0.26, 0.22, 0.2, 0.18, 0.16, 0.15]
},
{
  id: 'approval',
  label: 'Approval rate',
  value: '96.8%',
  delta: 0.9,
  deltaLabel: 'vs last quarter',
  intent: 'positive',
  hint: 'Higher approvals with lower loss',
  trend: [95.4, 95.9, 96.1, 96.4, 96.6, 96.8, 96.9]
},
{
  id: 'chargeback',
  label: 'Chargeback rate',
  value: '0.21%',
  delta: -0.06,
  deltaLabel: 'vs last quarter',
  intent: 'positive',
  hint: 'Well inside scheme thresholds',
  trend: [0.34, 0.32, 0.3, 0.27, 0.25, 0.23, 0.21]
}];


export const monthlyTrends = [
{ month: 'Feb', prevented: 3.9, losses: 0.28, volume: 3.2, approval: 95.4 },
{ month: 'Mar', prevented: 4.4, losses: 0.26, volume: 3.6, approval: 95.9 },
{ month: 'Apr', prevented: 4.8, losses: 0.22, volume: 3.9, approval: 96.1 },
{ month: 'May', prevented: 5.2, losses: 0.2, volume: 4.2, approval: 96.4 },
{ month: 'Jun', prevented: 5.9, losses: 0.18, volume: 4.6, approval: 96.6 },
{ month: 'Jul', prevented: 6.4, losses: 0.16, volume: 4.9, approval: 96.8 },
{ month: 'Aug', prevented: 6.9, losses: 0.15, volume: 5.1, approval: 96.9 }];


export const financialImpact = [
{ category: 'Card not present', prevented: 14.2, losses: 0.52 },
{ category: 'Card present', prevented: 3.1, losses: 0.08 },
{ category: 'Wire & ACH', prevented: 8.4, losses: 0.31 },
{ category: 'Crypto on-ramp', prevented: 4.1, losses: 0.16 },
{ category: 'Open banking', prevented: 1.8, losses: 0.05 }];


/** Executive-facing financial dashboard tiles. */
export const financialDashboard = [
{ id: 'fd1', label: 'Revenue protected', value: '$28.4M', detail: 'Legitimate spend approved that rules alone would have declined', delta: 11.4, good: true },
{ id: 'fd2', label: 'Fraud prevented', value: '$31.6M', detail: 'Confirmed fraud stopped before settlement', delta: 14.2, good: true },
{ id: 'fd3', label: 'Operational savings', value: '$1.92M', detail: 'Automation removed 612 analyst hours per month', delta: 8.1, good: true },
{ id: 'fd4', label: 'Manual review cost', value: '$684K', detail: '11,796 reviews at $58 fully loaded', delta: -12.6, good: true },
{ id: 'fd5', label: 'Net business benefit', value: '$29.8M', detail: 'Prevention plus savings, net of review and platform cost', delta: 13.1, good: true },
{ id: 'fd6', label: 'Return on investment', value: '7.4x', detail: 'Rolling twelve months against total platform cost', delta: 0.6, good: true }];


export const operationalMetrics = [
{ label: 'Average handling time', value: '3m 12s', target: '≤ 4m', status: 'on-track' as const, progress: 78 },
{ label: 'Queue SLA adherence', value: '94.1%', target: '≥ 92%', status: 'on-track' as const, progress: 94 },
{ label: 'Auto-decision coverage', value: '91.2%', target: '≥ 90%', status: 'on-track' as const, progress: 91 },
{ label: 'Escalation rate', value: '4.8%', target: '≤ 4%', status: 'at-risk' as const, progress: 62 },
{ label: 'First-touch resolution', value: '86.3%', target: '≥ 85%', status: 'on-track' as const, progress: 86 },
{ label: 'Analyst utilisation', value: '81.7%', target: '70–85%', status: 'on-track' as const, progress: 82 }];


export const decisionDistribution = [
{ name: 'Auto-approved', value: 91.2, color: '#10b981' },
{ name: 'Manual review', value: 6.4, color: '#f59e0b' },
{ name: 'Blocked', value: 2.4, color: '#ef4444' }];


export const fairnessMetrics = [
{ segment: 'Age 18–24', reviewRate: 7.1, approvalGap: 0.4, status: 'pass' as const },
{ segment: 'Age 55+', reviewRate: 5.8, approvalGap: -0.2, status: 'pass' as const },
{ segment: 'New customers', reviewRate: 11.4, approvalGap: 2.9, status: 'watch' as const },
{ segment: 'Non-domestic cards', reviewRate: 12.8, approvalGap: 3.6, status: 'watch' as const },
{ segment: 'Low-income postcodes', reviewRate: 6.9, approvalGap: 0.7, status: 'pass' as const }];


/** Plain-language fairness summary for non-technical stakeholders. */
export const fairnessSummary = [
{ id: 'fs1', label: 'Decision consistency', value: '98.4%', detail: 'Identical cases receive the same outcome', status: 'pass' as const },
{ id: 'fs2', label: 'Approval distribution', value: 'Even', detail: 'No customer group approved more than 1.2pt off portfolio average', status: 'pass' as const },
{ id: 'fs3', label: 'Review distribution', value: '2 groups uneven', detail: 'New customers and non-domestic cards reviewed more often', status: 'watch' as const },
{ id: 'fs4', label: 'Threshold fairness', value: 'Balanced', detail: 'The same score thresholds apply to every customer group', status: 'pass' as const }];


export const aiInsights = [
{
  id: 'i1',
  title: 'Card-testing ring targeting electronics merchants',
  body: 'A cluster of 41 transactions across three electronics merchants shares one device graph. Blocking the shared fingerprint would prevent an estimated $186K over the next 30 days.',
  impact: '$186K exposure',
  confidence: 93,
  tone: 'danger' as const,
  theme: 'Fraud trend',
  action: 'Block the shared device fingerprint and notify the three merchants.'
},
{
  id: 'i2',
  title: 'Review band can be narrowed for card-present traffic',
  body: 'Chip-and-PIN transactions scoring 45–60 were upheld as legitimate 97.4% of the time. Raising the card-present auto-approve ceiling to 55 would remove roughly 1,900 reviews per month.',
  impact: '1,900 fewer reviews',
  confidence: 88,
  tone: 'positive' as const,
  theme: 'Threshold effectiveness',
  action: 'Simulate a card-present ceiling of 55 and submit for Risk Manager approval.'
},
{
  id: 'i3',
  title: 'Non-domestic card review rate drifting upward',
  body: 'Review rates for non-domestic cards rose 3.6 points above portfolio average this quarter without a matching increase in confirmed fraud. Worth a fairness review before the next model release.',
  impact: 'Fairness watch',
  confidence: 79,
  tone: 'warning' as const,
  theme: 'Operational performance',
  action: 'Commission a fairness review ahead of the v4.3 promotion decision.'
},
{
  id: 'i4',
  title: 'Business impact is compounding quarter over quarter',
  body: 'Net business benefit reached $29.8M with a 7.4x return. Prevention grew 14.2% while review cost fell 12.6%, meaning the platform is absorbing more volume without adding headcount.',
  impact: '$29.8M net benefit',
  confidence: 95,
  tone: 'positive' as const,
  theme: 'Business impact',
  action: 'Include the ROI trend in the board pack for the September review.'
}];


export const featureImportance = [
{ feature: 'Card velocity (10 min)', label: 'How many cards a session tries', weight: 18.4, trend: 2.1, impact: 'Present in 38% of blocked cases', plain: 'When one shopper tries several cards quickly, it is rarely a genuine customer.' },
{ feature: 'Shipping / billing mismatch', label: 'Where goods are going vs who pays', weight: 15.1, trend: 0.8, impact: 'Drives $4.1M of prevented loss', plain: 'Goods heading somewhere unrelated to the cardholder is a classic resale signal.' },
{ feature: 'Device reputation', label: 'History of the device used', weight: 12.8, trend: -0.4, impact: 'Catches repeat offenders across merchants', plain: 'A device already seen on fraud attempts stays risky even with a new card.' },
{ feature: 'Amount vs customer norm', label: 'How unusual the amount is', weight: 11.6, trend: 1.2, impact: 'Key driver in high-value wires', plain: 'Spending far outside a customer’s usual pattern deserves a second look.' },
{ feature: 'Geo velocity', label: 'Impossible travel between sessions', weight: 9.9, trend: -0.9, impact: 'Main signal for account takeover', plain: 'Two logins too far apart to travel between means two different people.' },
{ feature: 'Credential change recency', label: 'Recent account changes', weight: 8.7, trend: 1.6, impact: 'Strongest takeover indicator', plain: 'A password or email changed moments before a big order is a red flag.' },
{ feature: 'Merchant category risk', label: 'Baseline risk of the merchant type', weight: 7.4, trend: 0.2, impact: 'Calibrates crypto and luxury traffic', plain: 'Some categories simply attract more fraud than others.' },
{ feature: 'Account age', label: 'How established the customer is', weight: 6.2, trend: -0.3, impact: 'Protects loyal customers from friction', plain: 'Long-standing customers with clean history earn the benefit of the doubt.' }];


export const modelPerformance = [
{ label: 'Precision', value: 94.6, target: 92 },
{ label: 'Recall', value: 91.2, target: 88 },
{ label: 'F1 score', value: 92.9, target: 90 },
{ label: 'AUC-ROC', value: 98.1, target: 96 }];


export const scoreDistribution = [
{ band: '0–9', count: 62400, fraud: 12 },
{ band: '10–19', count: 41200, fraud: 28 },
{ band: '20–29', count: 28900, fraud: 61 },
{ band: '30–39', count: 18400, fraud: 118 },
{ band: '40–49', count: 11900, fraud: 204 },
{ band: '50–59', count: 7600, fraud: 341 },
{ band: '60–69', count: 5100, fraud: 612 },
{ band: '70–79', count: 3800, fraud: 1420 },
{ band: '80–89', count: 2600, fraud: 1890 },
{ band: '90–100', count: 2420, fraud: 2260 }];


export const modelInfo = [
{ label: 'Model', value: 'FraudLens Sentinel v4.2' },
{ label: 'Architecture', value: 'Gradient-boosted ensemble + sequence encoder' },
{ label: 'Training window', value: 'Jan 2024 – Jun 2026 · 412M transactions' },
{ label: 'Last retrained', value: '18 Jul 2026' },
{ label: 'Features in production', value: '284' },
{ label: 'Median latency', value: '34 ms' },
{ label: 'Governance owner', value: 'Model Risk Committee' },
{ label: 'Next review', value: '15 Sep 2026' }];


/** Operational health of the AI stack, in language a business owner can read. */
export const aiHealthMetrics = [
{ id: 'ah1', label: 'Model status', value: 'Healthy', detail: 'All governance gates passed', status: 'operational' as const },
{ id: 'ah2', label: 'Model version', value: 'Sentinel v4.2', detail: 'Deployed 18 Jul 2026', status: 'operational' as const },
{ id: 'ah3', label: 'Prediction latency', value: '34 ms', detail: 'p99 41 ms · target under 80 ms', status: 'operational' as const },
{ id: 'ah4', label: 'Explanation service', value: 'Online', detail: 'SHAP reasons generated for every decision', status: 'operational' as const },
{ id: 'ah5', label: 'Predictions today', value: '184,320', detail: 'Peak 412 per second at 09:10', status: 'operational' as const },
{ id: 'ah6', label: 'Average confidence', value: '94.2%', detail: 'Across all scored transactions', status: 'operational' as const },
{ id: 'ah7', label: 'Feature pipeline', value: '6 min lag', detail: 'Device graph refresh behind schedule', status: 'degraded' as const },
{ id: 'ah8', label: 'Overall platform health', value: '96 / 100', detail: 'One degraded dependency, no customer impact', status: 'operational' as const }];


export const geographies = [
{ value: 'all', label: 'All geographies' },
{ value: 'na', label: 'North America' },
{ value: 'emea', label: 'Europe & Middle East' },
{ value: 'apac', label: 'Asia Pacific' },
{ value: 'latam', label: 'Latin America' }];


export const merchantFilters = [
{ value: 'all', label: 'All merchants' },
{ value: 'northwind', label: 'Northwind Electronics' },
{ value: 'atlas', label: 'Atlas Luxury Goods' },
{ value: 'halcyon', label: 'Halcyon Travel' },
{ value: 'vertex', label: 'Vertex Crypto Exchange' }];


export const paymentMethodFilters = [
{ value: 'all', label: 'All payment methods' },
{ value: 'card', label: 'Card' },
{ value: 'wire', label: 'Wire & ACH' },
{ value: 'openbanking', label: 'Open banking' },
{ value: 'wallet', label: 'Digital wallet' }];