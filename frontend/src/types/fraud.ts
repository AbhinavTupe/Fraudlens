export type Decision = 'approve' | 'review' | 'block';

export type CaseStatus = 'open' | 'pending' | 'confirmed_fraud' | 'cleared' | 'escalated';

export type RiskBand = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFlag {
  id: string;
  label: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface ShapFactor {
  feature: string;
  label: string;
  impact: number;
  direction: 'increase' | 'decrease';
  explanation: string;
}

export interface PolicyEvaluation {
  id: string;
  name: string;
  result: 'triggered' | 'passed' | 'skipped';
  detail: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  actor: string;
  kind: 'system' | 'model' | 'analyst' | 'policy' | 'customer';
}

export interface Transaction {
  id: string;
  reference: string;
  timestamp: string;
  amount: number;
  merchant: string;
  merchantCategory: string;
  customer: string;
  customerId: string;
  channel: 'Card present' | 'E-commerce' | 'Mobile app' | 'Open banking' | 'Wire';
  country: string;
  device: string;
  riskScore: number;
  decision: Decision;
  status: CaseStatus;
  assignee: string | null;
  flags: RiskFlag[];
  shap: ShapFactor[];
  policies: PolicyEvaluation[];
  recommendation: string;
  recommendationConfidence: number;
  timeline: TimelineEvent[];
}

export interface KpiDatum {
  id: string;
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  intent: 'positive' | 'negative' | 'neutral';
  hint: string;
  /** Optional sparkline series, oldest value first. */
  trend?: number[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  cadence: string;
  audience: string;
  sections: string[];
  format: string[];
  tier: 'standard' | 'premium';
}

export interface ScheduledReport {
  id: string;
  name: string;
  cadence: string;
  frequency: string;
  nextRun: string;
  recipients: number;
  recipientList: string;
  owner: string;
  status: 'active' | 'paused';
}

export interface LibraryReport {
  id: string;
  name: string;
  period: string;
  generated: string;
  size: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  author: string;
  summary: string;
  highlights: string[];
  sections: string[];
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
  mfa: boolean;
}

export type HealthStatus = 'operational' | 'degraded' | 'down';