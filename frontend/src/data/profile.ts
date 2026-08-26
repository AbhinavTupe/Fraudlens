import type { TimelineEvent } from '../types/fraud';

export const currentUser = {
  name: 'Marcus Alvarez',
  initials: 'MA',
  email: 'marcus.alvarez@fraudlens.io',
  role: 'Senior Fraud Analyst',
  team: 'Fraud operations · North America',
  location: 'Austin, TX · UTC−5',
  joined: 'March 2024',
  manager: 'Priya Raman',
  casesThisMonth: 1_284,
  accuracy: 97.2,
  avgHandling: '3m 04s',
  /** Governs destructive bulk actions such as Delete. */
  isAdmin: true
};

export const securityItems = [
{ id: 'sec1', name: 'Password', detail: 'Last changed 42 days ago', status: 'ok' as const, action: 'Change' },
{ id: 'sec2', name: 'Two-factor authentication', detail: 'Hardware key · YubiKey 5C', status: 'ok' as const, action: 'Manage' },
{ id: 'sec3', name: 'Recovery codes', detail: '2 of 10 codes remaining', status: 'warn' as const, action: 'Regenerate' },
{ id: 'sec4', name: 'Recovery email', detail: 'm.alvarez.personal@outlook.com · verified', status: 'ok' as const, action: 'Update' },
{ id: 'sec5', name: 'API tokens', detail: '1 active token · read-only', status: 'ok' as const, action: 'Review' }];


export const securityPosture = {
  score: 86,
  band: 'Strong' as const,
  mfaReadiness: 'Hardware key + TOTP backup registered',
  passwordAge: '42 days',
  recoveryEmail: 'm.alvarez.personal@outlook.com',
  nextReview: '15 Sep 2026',
  improvements: [
  'Regenerate recovery codes — only 2 of 10 remain.',
  'Register a second hardware key so you are never locked out.']

};

export const securityActivity = [
{ id: 'sa1', event: 'Signed in', detail: 'MacBook Pro · Chrome 141 · Austin, TX', at: 'Today · 07:58', tone: 'emerald' as const },
{ id: 'sa2', event: 'Hardware key used', detail: 'YubiKey 5C verified at sign-in', at: 'Today · 07:58', tone: 'emerald' as const },
{ id: 'sa3', event: 'New device approved', detail: 'iPhone 17 · FraudLens Mobile', at: '2 Aug 2026 · 19:14', tone: 'blue' as const },
{ id: 'sa4', event: 'Failed sign-in attempt', detail: 'Unrecognised IP 203.0.113.44 · blocked', at: '28 Jul 2026 · 03:02', tone: 'amber' as const }];


export const activeSessions = [
{ id: 'ss1', browser: 'Chrome 141', device: 'MacBook Pro · macOS 16', location: 'Austin, TX · US', ip: '72.14.201.8', lastActive: 'Current session', current: true },
{ id: 'ss2', browser: 'FraudLens Mobile 6.4', device: 'iPhone 17 · iOS 19', location: 'Austin, TX · US', ip: '72.14.201.9', lastActive: '18 min ago', current: false },
{ id: 'ss3', browser: 'Edge 138', device: 'Windows 11 desktop', location: 'Dallas, TX · US', ip: '198.51.100.24', lastActive: '2 days ago', current: false }];


export interface NotificationPreference {
  id: string;
  name: string;
  detail: string;
  group: 'Fraud alerts' | 'Reports' | 'Platform updates' | 'Security';
  inApp: boolean;
  email: boolean;
}

export const notificationPreferences: NotificationPreference[] = [
{ id: 'np1', name: 'High-risk case assigned to me', detail: 'The moment a case lands in your queue.', group: 'Fraud alerts', inApp: true, email: true },
{ id: 'np2', name: 'Queue SLA breach warning', detail: 'Five minutes before a case breaches SLA.', group: 'Fraud alerts', inApp: true, email: false },
{ id: 'np3', name: 'Confirmed fraud on a case you decided', detail: 'Feedback loop on your own decisions.', group: 'Fraud alerts', inApp: true, email: false },
{ id: 'np4', name: 'Scheduled report delivered', detail: 'When one of your reports is generated and sent.', group: 'Reports', inApp: false, email: true },
{ id: 'np5', name: 'Weekly performance digest', detail: 'Your accuracy, volume and handling time.', group: 'Reports', inApp: false, email: false },
{ id: 'np6', name: 'Threshold or policy changes', detail: 'When risk configuration changes in production.', group: 'Platform updates', inApp: true, email: true },
{ id: 'np7', name: 'Model deployment announcements', detail: 'New model versions and challenger results.', group: 'Platform updates', inApp: true, email: false },
{ id: 'np8', name: 'New sign-in to your account', detail: 'Every sign-in from an unrecognised device.', group: 'Security', inApp: true, email: true },
{ id: 'np9', name: 'Recovery code and MFA changes', detail: 'Any change to how you authenticate.', group: 'Security', inApp: true, email: true }];


export const notificationGroups: Array<NotificationPreference['group']> = [
'Fraud alerts',
'Reports',
'Platform updates',
'Security'];


export interface WorkspacePreference {
  id: string;
  label: string;
  detail: string;
  type: 'select' | 'toggle';
  value: string;
  enabled?: boolean;
  options?: string[];
}

export const workspacePreferences: WorkspacePreference[] = [
{
  id: 'wp1',
  label: 'Landing page',
  detail: 'Where FraudLens opens when you sign in.',
  type: 'select',
  value: 'Transaction Workspace',
  options: ['Operations Dashboard', 'Transaction Workspace', 'Decision Intelligence', 'Business Analytics']
},
{
  id: 'wp2',
  label: 'Compact table mode',
  detail: 'Tighter rows so more cases fit on screen.',
  type: 'toggle',
  value: 'Off',
  enabled: false
},
{
  id: 'wp3',
  label: 'Default date range',
  detail: 'Applied to every workspace filter and export.',
  type: 'select',
  value: 'Last 24 hours',
  options: ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Quarter to date']
},
{
  id: 'wp4',
  label: 'Language',
  detail: 'Interface language for menus and labels.',
  type: 'select',
  value: 'English (US)',
  options: ['English (US)', 'English (UK)', 'Deutsch', 'Français', 'Español']
},
{
  id: 'wp5',
  label: 'Timezone',
  detail: 'All timestamps are displayed in this zone.',
  type: 'select',
  value: 'UTC−5 · Central',
  options: ['UTC', 'UTC−5 · Central', 'UTC−8 · Pacific', 'UTC+1 · CET', 'UTC+8 · SGT']
},
{
  id: 'wp6',
  label: 'Items per page',
  detail: 'Rows loaded per page in every table.',
  type: 'select',
  value: '50',
  options: ['25', '50', '100', '200']
}];


export const profileActivity: TimelineEvent[] = [
{ id: 'pa1', title: 'Decided 14 cases', detail: 'Tier 2 high-value queue · 100% within SLA', timestamp: 'Today · 09:40', actor: 'You', kind: 'analyst' },
{ id: 'pa2', title: 'Lowered e-commerce block threshold', detail: '92 → 90 after card-testing spike', timestamp: 'Today · 09:38', actor: 'You', kind: 'policy' },
{ id: 'pa3', title: 'Exported high-risk transactions', detail: '4,412 rows · CSV', timestamp: 'Today · 09:12', actor: 'You', kind: 'system' },
{ id: 'pa4', title: 'Escalated TXN-9F2B41', detail: 'Assigned to Priya Raman for cardholder outreach', timestamp: 'Today · 08:51', actor: 'You', kind: 'analyst' },
{ id: 'pa5', title: 'Signed in', detail: 'MacBook Pro · Austin, TX', timestamp: 'Today · 07:58', actor: 'You', kind: 'system' }];


export const aboutFraudLens = [
{ label: 'Product version', value: 'FraudLens 6.4.1' },
{ label: 'Model in production', value: 'Sentinel v4.2' },
{ label: 'Region', value: 'us-east · Multi-AZ' },
{ label: 'Data residency', value: 'United States' },
{ label: 'Compliance', value: 'SOC 2 Type II · ISO 27001 · PCI DSS 4.0' },
{ label: 'Support plan', value: 'Enterprise · 15 min response' }];


export const supportOptions = [
{ id: 'so1', title: 'Documentation', detail: 'Guides for scoring, policies and explainability.', action: 'Open docs' },
{ id: 'so2', title: 'Contact enterprise support', detail: '24/7 response within 15 minutes.', action: 'Start a ticket' },
{ id: 'so3', title: 'Analyst training library', detail: '38 short courses on fraud typologies.', action: 'Browse courses' },
{ id: 'so4', title: 'Keyboard shortcuts', detail: 'Speed up triage with 24 shortcuts.', action: 'View shortcuts' }];