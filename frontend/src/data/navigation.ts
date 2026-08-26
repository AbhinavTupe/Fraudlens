import type { ComponentType } from 'react';
import {
  BarChart3Icon,
  BrainCircuitIcon,
  ClockIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TableIcon } from
'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  icon: ComponentType<{className?: string;}>;
  description: string;
  badge?: string;
  group: 'Operate' | 'Analyze' | 'Govern';
}

export const navItems: NavItem[] = [
{
  id: 'dashboard',
  label: 'Operations Dashboard',
  shortLabel: 'Operations',
  path: '/',
  icon: LayoutDashboardIcon,
  description: 'Live fraud posture across the portfolio',
  group: 'Operate'
},
{
  id: 'workspace',
  label: 'Transaction Workspace',
  shortLabel: 'Transactions',
  path: '/transactions',
  icon: TableIcon,
  description: 'Review, decide and document cases',
  badge: '87',
  group: 'Operate'
},
{
  id: 'investigations',
  label: 'Investigations',
  shortLabel: 'Investigations',
  path: '/investigations',
  icon: ShieldCheckIcon,
  description: 'Open fraud investigations and case status updates',
  group: 'Operate'
},
{
  id: 'intelligence',
  label: 'Decision Intelligence',
  shortLabel: 'Intelligence',
  path: '/decision-intelligence',
  icon: BrainCircuitIcon,
  description: 'Model health, thresholds and explainability',
  group: 'Analyze'
},
{
  id: 'evaluation-history',
  label: 'Evaluation History',
  shortLabel: 'History',
  path: '/evaluation-history',
  icon: ClockIcon,
  description: 'Historical records of all fraud evaluations',
  group: 'Analyze'
},
{
  id: 'analytics',
  label: 'Business Analytics',
  shortLabel: 'Analytics',
  path: '/analytics',
  icon: BarChart3Icon,
  description: 'Financial impact and operational performance',
  group: 'Analyze'
},
{
  id: 'reports',
  label: 'Reports Center',
  shortLabel: 'Reports',
  path: '/reports',
  icon: FileTextIcon,
  description: 'Templates, schedules and compliance evidence',
  group: 'Analyze'
},
{
  id: 'admin',
  label: 'Administration',
  shortLabel: 'Admin',
  path: '/administration',
  icon: ShieldCheckIcon,
  description: 'Users, policies, models and audit',
  group: 'Govern'
},
{
  id: 'profile',
  label: 'Profile & Settings',
  shortLabel: 'Settings',
  path: '/settings',
  icon: SettingsIcon,
  description: 'Your account, security and preferences',
  group: 'Govern'
}];


export const notifications = [
{
  id: 'n1',
  title: '6 Tier 2 cases breaching SLA',
  detail: 'High-value queue needs attention within 15 minutes.',
  time: '2 min ago',
  tone: 'red' as const,
  unread: true
},
{
  id: 'n2',
  title: 'Card-testing ring detected',
  detail: '14 linked transactions blocked across 3 merchants.',
  time: '18 min ago',
  tone: 'amber' as const,
  unread: true
},
{
  id: 'n3',
  title: 'Feature store refresh lagging',
  detail: 'Device graph 6 minutes behind. Platform team notified.',
  time: '1 hr ago',
  tone: 'amber' as const,
  unread: true
},
{
  id: 'n4',
  title: 'Monthly executive summary ready',
  detail: 'July report generated and sent to 14 recipients.',
  time: '3 hrs ago',
  tone: 'emerald' as const,
  unread: false
}];