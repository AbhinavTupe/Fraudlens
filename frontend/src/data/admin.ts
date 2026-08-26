import type { WorkspaceUser } from '../types/fraud';

export const platformOverview = [
{ label: 'Active users', value: '148', detail: '92 analysts · 34 managers · 22 admins' },
{ label: 'Active policies', value: '48', detail: '6 changed in the last 7 days' },
{ label: 'Models in production', value: '2', detail: 'Sentinel v4.2 · Challenger v4.3' },
{ label: 'Audit events (30d)', value: '18,412', detail: 'Immutable and exportable' }];


export const workspaceUsers: WorkspaceUser[] = [
{ id: 'u1', name: 'Priya Raman', email: 'priya.raman@fraudlens.io', role: 'Risk Manager', team: 'Risk strategy', status: 'active', lastActive: '2 min ago', mfa: true },
{ id: 'u2', name: 'Marcus Alvarez', email: 'marcus.alvarez@fraudlens.io', role: 'Senior Analyst', team: 'Fraud ops · NA', status: 'active', lastActive: '6 min ago', mfa: true },
{ id: 'u3', name: 'Dana Whitfield', email: 'dana.whitfield@fraudlens.io', role: 'Analyst', team: 'Fraud ops · EMEA', status: 'active', lastActive: '24 min ago', mfa: true },
{ id: 'u4', name: 'Kenji Watanabe', email: 'kenji.watanabe@fraudlens.io', role: 'Analyst', team: 'Fraud ops · APAC', status: 'active', lastActive: '1 hr ago', mfa: false },
{ id: 'u5', name: 'Sofia Duarte', email: 'sofia.duarte@fraudlens.io', role: 'Compliance Officer', team: 'Compliance', status: 'active', lastActive: '3 hrs ago', mfa: true },
{ id: 'u6', name: 'Omar Haddad', email: 'omar.haddad@fraudlens.io', role: 'Platform Admin', team: 'Platform', status: 'invited', lastActive: 'Never', mfa: false },
{ id: 'u7', name: 'Chen Liu', email: 'chen.liu@fraudlens.io', role: 'Data Scientist', team: 'Model development', status: 'suspended', lastActive: '12 days ago', mfa: true }];


export const roles = [
{ id: 'r1', name: 'Analyst', members: 92, permissions: ['Review queue', 'Decide cases', 'View explanations'], scope: 'Assigned queues' },
{ id: 'r2', name: 'Senior Analyst', members: 26, permissions: ['All analyst rights', 'Escalate', 'Bulk actions'], scope: 'All queues' },
{ id: 'r3', name: 'Risk Manager', members: 12, permissions: ['Tune thresholds', 'Publish policies', 'Full analytics'], scope: 'Portfolio wide' },
{ id: 'r4', name: 'Compliance Officer', members: 8, permissions: ['Audit access', 'SAR filing', 'Export evidence'], scope: 'Read-only + compliance' },
{ id: 'r5', name: 'Platform Admin', members: 10, permissions: ['User management', 'Model deployment', 'Settings'], scope: 'Global' }];


export const thresholds = [
{ id: 'th1', segment: 'E-commerce', approve: 30, review: 70, block: 90, volume: 118_400 },
{ id: 'th2', segment: 'Card present', approve: 45, review: 75, block: 92, volume: 41_200 },
{ id: 'th3', segment: 'Wire & ACH', approve: 20, review: 60, block: 85, volume: 14_900 },
{ id: 'th4', segment: 'Crypto on-ramp', approve: 15, review: 55, block: 80, volume: 9_820 }];


export const policies = [
{ id: 'pol1', name: 'Block score ≥ 90', category: 'Scoring', description: 'Hard block for any transaction the model scores 90 or above.', priority: 1, status: 'active' as const, enabled: true, triggered: '4,424', owner: 'Priya Raman', updated: '4 Aug 2026' },
{ id: 'pol2', name: 'Card testing guard', category: 'Behavioural', description: 'Blocks sessions attempting three or more distinct cards within 15 minutes.', priority: 2, status: 'active' as const, enabled: true, triggered: '812', owner: 'Marcus Alvarez', updated: '3 Aug 2026' },
{ id: 'pol3', name: 'ATO credential-change guard', category: 'Behavioural', description: 'Blocks high-value orders placed within 30 minutes of a credential change.', priority: 3, status: 'active' as const, enabled: true, triggered: '341', owner: 'Marcus Alvarez', updated: '18 Jul 2026' },
{ id: 'pol4', name: 'Crypto on-ramp scrutiny', category: 'Segment', description: 'Routes every first crypto purchase above $5,000 to Tier 2 review.', priority: 4, status: 'active' as const, enabled: true, triggered: '204', owner: 'Priya Raman', updated: '4 Aug 2026' },
{ id: 'pol5', name: 'Wire > $10,000 dual control', category: 'Control', description: 'Requires a second approver before any wire above $10,000 is released.', priority: 5, status: 'active' as const, enabled: true, triggered: '96', owner: 'Sofia Duarte', updated: '21 Jul 2026' },
{ id: 'pol6', name: 'Trusted customer bypass', category: 'Allowance', description: 'Lets long-standing customers clear low-risk friction automatically.', priority: 6, status: 'draft' as const, enabled: false, triggered: '—', owner: 'Dana Whitfield', updated: '2 Aug 2026' }];


export const models = [
{ id: 'm1', name: 'Sentinel v4.2', role: 'Production', traffic: 90, precision: 94.6, recall: 91.2, deployed: '18 Jul 2026', status: 'healthy' as const },
{ id: 'm2', name: 'Sentinel v4.3 challenger', role: 'Shadow', traffic: 10, precision: 95.4, recall: 92.6, deployed: '28 Jul 2026', status: 'evaluating' as const },
{ id: 'm3', name: 'Sentinel v4.1', role: 'Archived', traffic: 0, precision: 93.1, recall: 89.4, deployed: '2 Apr 2026', status: 'retired' as const }];


/** Business-readable summary of the model currently making decisions. */
export const modelOverview = [
{ label: 'Model version', value: 'Sentinel v4.2', detail: 'Production since 18 Jul 2026' },
{ label: 'Training date', value: '18 Jul 2026', detail: 'Retrained every 90 days' },
{ label: 'Dataset version', value: 'ds-2026.06', detail: '412M labelled transactions' },
{ label: 'Average confidence', value: '94.2%', detail: 'Across 184,320 decisions today' },
{ label: 'Deployment status', value: 'Live · 90% traffic', detail: 'Challenger v4.3 on 10% shadow' },
{ label: 'Validation status', value: 'Passed', detail: 'Model Risk Committee, 18 Jul 2026' }];


export const auditEvents = [
{ id: 'ae1', action: 'Threshold changed', target: 'E-commerce block 92 → 90', actor: 'Marcus Alvarez', at: '4 Aug 2026 · 09:38', severity: 'high' as const, category: 'Risk configuration', ip: '72.14.201.8', detail: 'Block threshold lowered after a card-testing spike. Second approver: Priya Raman.' },
{ id: 'ae2', action: 'Policy published', target: 'Crypto on-ramp scrutiny', actor: 'Priya Raman', at: '4 Aug 2026 · 08:54', severity: 'high' as const, category: 'Policy', ip: '72.14.198.2', detail: 'All first crypto purchases above $5,000 now routed to Tier 2 review.' },
{ id: 'ae3', action: 'Bulk export', target: '4,412 transactions', actor: 'Marcus Alvarez', at: '4 Aug 2026 · 09:12', severity: 'medium' as const, category: 'Data access', ip: '72.14.201.8', detail: 'CSV export of high-risk transactions. Link expires after seven days.' },
{ id: 'ae4', action: 'User suspended', target: 'chen.liu@fraudlens.io', actor: 'Omar Haddad', at: '23 Jul 2026 · 14:02', severity: 'high' as const, category: 'Access', ip: '198.51.100.24', detail: 'Access suspended pending completion of the annual security attestation.' },
{ id: 'ae5', action: 'Role permission updated', target: 'Senior Analyst · bulk actions', actor: 'Omar Haddad', at: '19 Jul 2026 · 10:41', severity: 'medium' as const, category: 'Access', ip: '198.51.100.24', detail: 'Bulk decision rights granted to the Senior Analyst role.' },
{ id: 'ae6', action: 'Model deployed', target: 'Sentinel v4.2 to production', actor: 'Chen Liu', at: '18 Jul 2026 · 05:15', severity: 'high' as const, category: 'Model', ip: '10.4.19.7', detail: 'Promotion approved by the Model Risk Committee with full validation evidence.' },
{ id: 'ae7', action: 'Report downloaded', target: 'model_governance_q2.pdf', actor: 'Priya Raman', at: '2 Aug 2026 · 16:48', severity: 'low' as const, category: 'Data access', ip: '72.14.198.2', detail: 'Quarterly governance report retrieved from the reports library.' }];


export const configurationHistory = [
{ id: 'ch1', title: 'Block threshold lowered to 90', detail: 'E-commerce segment · expected +140 blocks/day', at: '4 Aug · 09:38', actor: 'Marcus Alvarez', kind: 'analyst' as const },
{ id: 'ch2', title: 'Crypto scrutiny policy published', detail: 'All first crypto purchases above $5,000 routed to Tier 2', at: '4 Aug · 08:54', actor: 'Priya Raman', kind: 'policy' as const },
{ id: 'ch3', title: 'Challenger traffic raised to 10%', detail: 'Sentinel v4.3 shadow evaluation extended two weeks', at: '28 Jul · 11:20', actor: 'Chen Liu', kind: 'model' as const },
{ id: 'ch4', title: 'Card-present auto-approve ceiling 40 → 45', detail: 'Removed ~1,200 reviews per month', at: '21 Jul · 15:04', actor: 'Priya Raman', kind: 'analyst' as const }];


/** Service-by-service platform health for the Administration workspace. */
export const platformServices = [
{ id: 'sv1', name: 'Backend API', status: 'operational' as const, detail: 'p99 41 ms · 100% uptime 30d', progress: 98 },
{ id: 'sv2', name: 'Database', status: 'operational' as const, detail: 'Replication lag 120 ms', progress: 96 },
{ id: 'sv3', name: 'Inference gateway', status: 'operational' as const, detail: '184,320 predictions today', progress: 94 },
{ id: 'sv4', name: 'Explanation (SHAP) service', status: 'operational' as const, detail: '100% explanation coverage', progress: 97 },
{ id: 'sv5', name: 'Analytics engine', status: 'operational' as const, detail: 'Last aggregation 4 min ago', progress: 92 },
{ id: 'sv6', name: 'Feature store', status: 'degraded' as const, detail: 'Device graph refresh lagging 6 min', progress: 54 }];


export const platformHealth = [
{ label: 'Scoring API p99', value: '41 ms', progress: 82, status: 'healthy' as const },
{ label: 'Uptime (30 days)', value: '99.99%', progress: 99, status: 'healthy' as const },
{ label: 'Feature store freshness', value: '6 min lag', progress: 54, status: 'degraded' as const },
{ label: 'Queue processing capacity', value: '68% used', progress: 68, status: 'healthy' as const }];


export const platformSettings = [
{ id: 'ps1', name: 'Require MFA for all users', detail: 'Enforce hardware key or TOTP at every sign-in.', enabled: true },
{ id: 'ps2', name: 'Auto-expire exports after 7 days', detail: 'Downloaded evidence links expire automatically.', enabled: true },
{ id: 'ps3', name: 'Allow analyst threshold overrides', detail: 'Senior analysts may override a decision once per case.', enabled: false },
{ id: 'ps4', name: 'Send customer reason codes', detail: 'Expose plain-language decline reasons to customers.', enabled: true }];