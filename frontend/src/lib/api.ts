import { getAuthHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const tokenHeaders = getAuthHeaders();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = new Headers(options.headers ?? {});

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  Object.entries(tokenHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export function loginUser(email: string, password: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string; full_name: string; role: string; status: string } }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export type TransactionWorkspaceItem = {
  id: string;
  transaction_reference: string;
  amount: number | string;
  currency: string;
  merchant: string | null;
  merchant_category: string | null;
  customer_id: string | null;
  customer_name: string | null;
  transaction_type: string | null;
  transaction_timestamp: string;
  location: string | null;
  payment_method: string | null;
  status: string;
  risk_score: number | null;
  decision: string | null;
};

export function getTransactionWorkspace() {
  return apiFetch<{ items: TransactionWorkspaceItem[]; total: number }>('/api/transactions/workspace');
}

export function uploadTransactionsCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<{ total_rows: number; successfully_imported: number; failed_rows: number; validation_errors: Array<{ row_number: number; field: string; error: string }>; imported_ids: string[] }>('/api/transactions/batch-upload', {
    method: 'POST',
    body: formData,
  });
}

export type TransactionDetail = {
  id: string;
  transaction_reference: string;
  amount: number | string;
  currency: string;
  merchant: string | null;
  merchant_category: string | null;
  customer_id: string | null;
  transaction_type: string | null;
  transaction_timestamp: string;
  location: string | null;
  payment_method: string | null;
  status: string;
  prediction?: {
    fraud_probability?: number | null;
    predicted_label?: string | null;
    model_version?: string | null;
  } | null;
};

export type TransactionEvaluation = {
  id: string;
  transaction_id: string;
  fraud_probability: number | null;
  predicted_label: string | null;
  model_version?: string | null;
  inference_time_ms?: number | null;
  threshold_used?: number | null;
  created_at: string;
  updated_at: string;
};

export function getTransactionDetail(transactionId: string) {
  return apiFetch<TransactionDetail>(`/api/transactions/${transactionId}`);
}

export function evaluateTransaction(transactionId: string) {
  return apiFetch<TransactionEvaluation>(`/api/transactions/${transactionId}/evaluate`, {
    method: 'POST',
  });
}

export type TransactionStatusValue = 'pending' | 'approved' | 'declined' | 'requires_review';

export function updateTransactionStatus(transactionId: string, status: TransactionStatusValue) {
  return apiFetch<TransactionDetail>(`/api/transactions/${transactionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export type FraudAlertItem = {
  id: string;
  transaction_id: string;
  prediction_id: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'closed';
  assigned_to: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  investigation_case: unknown | null;
};

export function getFraudAlerts() {
  return apiFetch<FraudAlertItem[]>('/api/fraud-alerts');
}

export type FraudAlertStatusValue = 'open' | 'acknowledged' | 'resolved' | 'closed';

export function updateFraudAlertStatus(alertId: string, status: FraudAlertStatusValue) {
  return apiFetch<FraudAlertItem>(`/api/fraud-alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Dashboard summary from backend: returns a simple key->number mapping
export function getDashboardSummary() {
  return apiFetch<Record<string, number>>('/api/dashboard');
}

// Investigation case types and API
export type InvestigationCase = {
  id: string;
  fraud_alert_id: string;
  case_number?: string | null;
  title?: string | null;
  description?: string | null;
  status: string;
  priority: string;
  assigned_to?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  resolution?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function getInvestigations() {
  return apiFetch<InvestigationCase[]>('/api/investigations');
}

export function getInvestigation(caseId: string) {
  return apiFetch<InvestigationCase>(`/api/investigations/${caseId}`);
}

export function openInvestigation(payload: { fraud_alert_id: string; title?: string | null; description?: string | null; priority?: string; status?: string }) {
  return apiFetch<InvestigationCase>('/api/investigations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function transitionInvestigation(caseId: string, payload: string | { status?: string; resolution?: string }) {
  const requestBody = typeof payload === 'string' ? { status: payload } : payload;

  return apiFetch<InvestigationCase>(`/api/investigations/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify(requestBody),
  });
}
