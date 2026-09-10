import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  DownloadIcon,
  FilterIcon,
  InboxIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { RiskScore } from '../components/ui/RiskScore';
import { EmptyState } from '../components/ui/EmptyState';
import { MetricTile } from '../components/ui/MetricTile';
import { TransactionDrawer } from '../components/transactions/TransactionDrawer';
import { BulkActionBar } from '../components/transactions/BulkActionBar';
import { currentUser } from '../data/profile';
import {
  getTransactionDetail,
  getTransactionWorkspace,
  updateTransactionStatus,
  type TransactionDetail,
  type TransactionStatusValue,
  type TransactionWorkspaceItem,
} from '../lib/api';
import { formatCurrency } from '../utils/cn';
import { decisionMeta, statusMeta } from '../utils/labels';
import type { CaseStatus, Decision, Transaction } from '../types/fraud';

const tabs = [
{ id: 'all', label: 'All transactions', count: 0 },
{ id: 'review', label: 'Needs review', count: 0 },
{ id: 'block', label: 'Blocked', count: 0 },
{ id: 'approve', label: 'Approved', count: 0 }];

function mapBackendStatus(status: string): CaseStatus {
  switch (status) {
    case 'requires_review':
      return 'pending';
    case 'approved':
      return 'cleared';
    case 'declined':
      return 'confirmed_fraud';
    default:
      return 'open';
  }
}

function mapDecision(score: number): Decision {
  if (score >= 90) return 'block';
  if (score >= 70) return 'review';
  return 'approve';
}

function mapWorkspaceItem(item: TransactionWorkspaceItem): Transaction {
  const riskScore = item.risk_score ?? 0;
  const decision = item.decision ? (item.decision === 'block' || item.decision === 'review' || item.decision === 'approve' ? item.decision : mapDecision(riskScore)) : mapDecision(riskScore);

  return {
    id: item.id,
    reference: item.transaction_reference,
    timestamp: item.transaction_timestamp ?? '',
    amount: Number(item.amount),
    merchant: item.merchant ?? 'Unknown merchant',
    merchantCategory: item.merchant_category ?? 'General',
    customer: item.customer_name ?? item.customer_id ?? 'Unknown customer',
    customerId: item.customer_id ?? 'N/A',
    channel: item.transaction_type === 'wire' ? 'Wire' : item.transaction_type === 'card_present' ? 'Card present' : item.transaction_type === 'purchase' ? 'E-commerce' : 'E-commerce',
    country: item.location ?? 'Unknown',
    device: item.payment_method ?? 'Unknown channel',
    riskScore,
    decision,
    status: mapBackendStatus(item.status),
    assignee: null,
    flags: [],
    shap: [],
    policies: [],
    recommendation: riskScore >= 90 ? 'Block this payment and confirm with the customer before release.' : riskScore >= 70 ? 'Escalate for manual review and verify the customer before approval.' : 'Approve and continue without analyst intervention.',
    recommendationConfidence: Math.max(50, Math.min(99, riskScore)),
    timeline: [{
      id: item.id,
      title: 'Transaction loaded from workspace',
      detail: `Workspace row for ${item.transaction_reference}`,
      timestamp: item.transaction_timestamp ?? '',
      actor: 'FraudLens API',
      kind: 'system'
    }]
  };
}

function mapTransactionDetail(item: TransactionDetail): Transaction {
  const riskScore = (() => {
    const probability = item.prediction?.fraud_probability ?? null;
    if (probability == null) return 0;
    return Math.max(0, Math.min(100, Math.round(Number(probability) * 100)));
  })();

  return {
    id: item.id,
    reference: item.transaction_reference,
    timestamp: item.transaction_timestamp ?? '',
    amount: Number(item.amount),
    merchant: item.merchant ?? 'Unknown merchant',
    merchantCategory: item.merchant_category ?? 'General',
    customer: item.customer_id ?? 'Unknown customer',
    customerId: item.customer_id ?? 'N/A',
    channel: item.transaction_type === 'wire' ? 'Wire' : item.transaction_type === 'card_present' ? 'Card present' : item.transaction_type === 'purchase' ? 'E-commerce' : 'E-commerce',
    country: item.location ?? 'Unknown',
    device: item.payment_method ?? 'Unknown channel',
    riskScore,
    decision: mapDecision(riskScore),
    status: mapBackendStatus(item.status),
    assignee: null,
    flags: [],
    shap: [],
    policies: [],
    recommendation: riskScore >= 90 ? 'Block this payment and confirm with the customer before release.' : riskScore >= 70 ? 'Escalate for manual review and verify the customer before approval.' : 'Approve and continue without analyst intervention.',
    recommendationConfidence: Math.max(50, Math.min(99, riskScore)),
    timeline: [{
      id: item.id,
      title: 'Transaction detail loaded',
      detail: `Endpoint response for ${item.transaction_reference}`,
      timestamp: item.transaction_timestamp ?? '',
      actor: 'FraudLens API',
      kind: 'system'
    }]
  };
}

export function TransactionWorkspace() {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');
  const [band, setBand] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openTransaction, setOpenTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      try {
        const response = await getTransactionWorkspace();
        if (!active) return;
        setTransactions(response.items.map(mapWorkspaceItem));
      } catch (loadError) {
        if (!active) return;
        toast.error('Failed to load transactions', { description: loadError instanceof Error ? loadError.message : 'The workspace could not fetch live data.' });
      }
    }

    const handleRefresh = () => {
      void loadTransactions();
    };

    void loadTransactions();
    window.addEventListener('fraudlens:workspace-refresh', handleRefresh);

    return () => {
      active = false;
      window.removeEventListener('fraudlens:workspace-refresh', handleRefresh);
    };
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      if (tab !== 'all' && transaction.decision !== tab) return false;
      if (channel !== 'all' && transaction.channel !== channel) return false;
      if (band === 'high' && transaction.riskScore < 70) return false;
      if (band === 'medium' && (transaction.riskScore < 40 || transaction.riskScore >= 70)) return false;
      if (band === 'low' && transaction.riskScore >= 40) return false;
      if (query) {
        const haystack = `${transaction.reference} ${transaction.merchant} ${transaction.customer} ${transaction.customerId} ${transaction.country}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [tab, channel, band, query, transactions]);

  const summary = useMemo(() => {
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const exposure = filtered.filter((t) => t.riskScore >= 70).reduce((sum, t) => sum + t.amount, 0);
    const avgScore = filtered.length ? filtered.reduce((sum, t) => sum + t.riskScore, 0) / filtered.length : 0;
    return {
      count: filtered.length,
      total,
      exposure,
      avgScore,
      awaiting: filtered.filter((t) => t.status === 'open' || t.status === 'pending').length
    };
  }, [filtered]);

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const filtersActive = query !== '' || channel !== 'all' || band !== 'all';

  function toggleAll() {
    setSelectedIds(allSelected ? [] : filtered.map((t) => t.id));
  }

  function toggleOne(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function bulk(action: string, tone: 'success' | 'error' | 'default', description: string) {
    const count = selectedIds.length;
    setSelectedIds([]);
    const message = `${action} · ${count} transaction${count === 1 ? '' : 's'}`;
    if (tone === 'success') toast.success(message, { description });else
    if (tone === 'error') toast.error(message, { description });else
    toast(message, { description });
  }

  async function bulkUpdateStatus(nextStatus: TransactionStatusValue, action: string) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const results = await Promise.allSettled(ids.map((id) => updateTransactionStatus(id, nextStatus)));
    const successful = results.filter((result) => result.status === 'fulfilled').length;
    const failed = ids.length - successful;

    try {
      const response = await getTransactionWorkspace();
      setTransactions(response.items.map(mapWorkspaceItem));
    } catch (loadError) {
      toast.error('Failed to refresh transactions', {
        description: loadError instanceof Error ? loadError.message : 'The workspace could not fetch live data.',
      });
    }

    setSelectedIds([]);

    if (failed === 0) {
      toast.success(`${action} · ${successful} transaction${successful === 1 ? '' : 's'}`, {
        description: 'All selected transactions were persisted to the backend.',
      });
      return;
    }

    if (successful > 0) {
      toast(`${action} · ${successful} transaction${successful === 1 ? '' : 's'}`, {
        description: `${failed} transaction${failed === 1 ? '' : 's'} failed to update.`,
      });
      return;
    }

    toast.error(`${action} failed`, {
      description: 'No selected transactions were updated.',
    });
  }

  function resetFilters() {
    setQuery('');
    setChannel('all');
    setBand('all');
  }

  async function openTransactionRow(transaction: Transaction) {
    try {
      const detail = await getTransactionDetail(transaction.id);
      setOpenTransaction(mapTransactionDetail(detail));
    } catch (detailError) {
      toast.error('Transaction detail failed', { description: detailError instanceof Error ? detailError.message : 'Unable to load transaction details.' });
      setOpenTransaction(transaction);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Transaction Workspace"
        description="Search, triage and decide fraud cases. Open any row to see the model’s reasoning, policy evaluation and recommended action."
        meta={
        <>
            <Badge tone="amber" dot>
              87 cases in queue
            </Badge>
            <Badge tone="blue">Median handling 3m 12s</Badge>
            <span className="text-xs text-gray-400">Auto-refreshing every 30 seconds</span>
          </>
        }
        actions={
        <>
            <Button
            variant="secondary"
            icon={DownloadIcon}
            onClick={() => toast.success('Export ready', { description: `${filtered.length} rows exported as CSV.` })}>
            
              Export
            </Button>
            <Button variant="primary" icon={InboxIcon} onClick={() => setOpenTransaction(filtered[0] ?? null)}>
              Take next case
            </Button>
          </>
        } />
      

      <section aria-label="Smart summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile
          label="Cases in view"
          value={summary.count.toString()}
          detail={filtersActive ? 'Filtered result' : 'All transactions'} />
        
        <MetricTile label="Total value" value={formatCurrency(summary.total, true)} detail="Across visible cases" />
        <MetricTile
          label="High-risk exposure"
          value={formatCurrency(summary.exposure, true)}
          detail="Score 70 and above"
          tone="amber" />
        
        <MetricTile
          label="Awaiting decision"
          value={summary.awaiting.toString()}
          detail={`Average score ${summary.avgScore.toFixed(1)}`} />
        
      </section>

      <Card>
        <CardHeader
          title="Case list"
          description="Filters apply to the summary above and to exports."
          icon={SlidersHorizontalIcon}
          action={
          filtersActive ?
          <Button size="sm" variant="ghost" icon={RotateCcwIcon} onClick={resetFilters}>
                Reset filters
              </Button> :
          null
          } />
        

        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 lg:flex-row lg:items-end">
          <div className="lg:w-80">
            <Input
              icon={SearchIcon}
              label="Search"
              name="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reference, customer, merchant, country…" />
            
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label="Channel"
              name="channel"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              options={[
              { value: 'all', label: 'All channels' },
              { value: 'E-commerce', label: 'E-commerce' },
              { value: 'Card present', label: 'Card present' },
              { value: 'Mobile app', label: 'Mobile app' },
              { value: 'Open banking', label: 'Open banking' },
              { value: 'Wire', label: 'Wire' }]
              } />
            
            <Select
              label="Risk band"
              name="band"
              value={band}
              onChange={(event) => setBand(event.target.value)}
              options={[
              { value: 'all', label: 'All risk bands' },
              { value: 'high', label: 'High (70+)' },
              { value: 'medium', label: 'Medium (40–69)' },
              { value: 'low', label: 'Low (0–39)' }]
              } />
            
            <Select
              label="Time range"
              name="range"
              options={[
              { value: '24h', label: 'Last 24 hours' },
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' }]
              } />
            
          </div>
        </div>

        <div className="px-6">
          <Tabs tabs={tabs} active={tab} onChange={setTab} layoutId="workspace-tabs" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FilterIcon}
            title="No transactions match these filters"
            description="Try widening the risk band or clearing the search term. Your queue may also simply be clear."
            action={
              <Button variant="secondary" icon={RotateCcwIcon} onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <>
            <Table minWidth="min-w-[1080px]">
              <THead>
                <Tr>
                  <Th className="w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all transactions"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </Th>
                  <Th>Transaction</Th>
                  <Th>Customer</Th>
                  <Th>Channel</Th>
                  <Th align="right">Amount</Th>
                  <Th>Fraud score</Th>
                  <Th>Decision</Th>
                  <Th>Status</Th>
                  <Th>Assignee</Th>
                  <Th align="right">Received</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((transaction) => (
                  <Tr
                    key={transaction.id}
                    selected={selectedIds.includes(transaction.id)}
                    onClick={() => void openTransactionRow(transaction)}
                  >
                    <Td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(transaction.id)}
                        onChange={() => toggleOne(transaction.id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select ${transaction.reference}`}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </Td>
                    <Td>
                      <p className="font-medium text-gray-900">{transaction.reference}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{transaction.merchant}</p>
                    </Td>
                    <Td>
                      <p className="text-gray-900">{transaction.customer}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{transaction.country}</p>
                    </Td>
                    <Td className="text-gray-600">{transaction.channel}</Td>
                    <Td align="right" className="tabular font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </Td>
                    <Td>
                      <RiskScore score={transaction.riskScore} />
                    </Td>
                    <Td>
                      <Badge tone={decisionMeta[transaction.decision].tone} dot>
                        {decisionMeta[transaction.decision].label}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={statusMeta[transaction.status].tone}>{statusMeta[transaction.status].label}</Badge>
                    </Td>
                    <Td className="text-gray-600">{transaction.assignee ?? '—'}</Td>
                    <Td align="right" className="tabular text-xs text-gray-500">
                      {transaction.timestamp ? `${new Date(transaction.timestamp).toISOString().slice(11, 16)} UTC` : 'Unavailable'}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-500">
                Showing <span className="tabular font-medium text-gray-900">{filtered.length}</span> of{' '}
                <span className="tabular font-medium text-gray-900">{transactions.length}</span> transactions
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled>
                  Previous
                </Button>
                <Button size="sm" variant="secondary" iconRight={ArrowRightIcon}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
          <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-[13px] leading-5 text-blue-900">
            Cases scoring 90 or above are blocked automatically. Your review confirms or overturns that block — both
            outcomes feed back into model training.
          </p>
        </div>

        <BulkActionBar
          count={selectedIds.length}
          isAdmin={currentUser.isAdmin}
          onClear={() => setSelectedIds([])}
          onApprove={() => void bulkUpdateStatus('approved', 'Approved')}
          onReview={() => void bulkUpdateStatus('requires_review', 'Sent to manual review')}
          onExport={() => bulk('Exported', 'success', 'CSV ready in Reports Center · link expires in 7 days.')}
          onAssign={() => bulk('Assigned to you', 'default', 'Cases now appear in your personal queue.')}
          onDelete={() => bulk('Deleted', 'error', 'Removal recorded in the audit log with your admin identity.')}
        />

        <TransactionDrawer
          transaction={openTransaction}
          open={Boolean(openTransaction)}
          onClose={() => setOpenTransaction(null)}
        />
      </Card>
    </div>
  );
}
