import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ActivityIcon,
  ArrowRightIcon,
  BanknoteIcon,
  CircleDollarSignIcon,
  ClockIcon,
  FileTextIcon,
  GaugeIcon,
  InboxIcon,
  LayersIcon,
  ScanEyeIcon,
  ServerIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
  TargetIcon,
  UploadIcon,
  ZapIcon } from
'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { RiskScore } from '../components/ui/RiskScore';
import { Timeline } from '../components/ui/Timeline';
import { StatList } from '../components/ui/StatList';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { SkeletonTable } from '../components/ui/Skeleton';
import { TransactionDrawer } from '../components/transactions/TransactionDrawer';
import {
  businessImpact,
  decisionIntelligenceSummary,
  decisionSummary,
  fraudTrend,
  operationsKpis,
  platformStatus,
  recentActivity,
  reviewQueue } from
'../data/dashboard';
import {
  getDashboardSummary,
  getTransactionDetail,
  getTransactionWorkspace,
  uploadTransactionsCsv,
  type TransactionDetail,
  type TransactionWorkspaceItem,
} from '../lib/api';
import { formatCurrency, formatNumber } from '../utils/cn';
import { decisionMeta } from '../utils/labels';
import type { Transaction } from '../types/fraud';

const kpiIcons = [LayersIcon, ShieldAlertIcon, InboxIcon, CircleDollarSignIcon, GaugeIcon, TargetIcon];

const trendTabs = [
{ id: 'fraud', label: 'Fraud detected' },
{ id: 'transactions', label: 'Volume' },
{ id: 'score', label: 'Average score' }];

function mapBackendStatus(status: string): Transaction['status'] {
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

function mapDecision(score: number): Transaction['decision'] {
  if (score >= 90) return 'block';
  if (score >= 70) return 'review';
  return 'approve';
}

function mapWorkspaceItem(item: TransactionWorkspaceItem): Transaction {
  const riskScore = item.risk_score ?? 0;
  const decision = item.decision && (item.decision === 'block' || item.decision === 'review' || item.decision === 'approve')
    ? item.decision
    : mapDecision(riskScore);

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


export function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [trendMetric, setTrendMetric] = useState('fraud');
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [highRiskRows, setHighRiskRows] = useState<Transaction[]>([]);
  const [highRiskLoading, setHighRiskLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [, setDashboardError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    setDashboardLoading(true);
    getDashboardSummary()
      .then((d) => {
        if (!mounted) return;
        setDashboard(d || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setDashboardError(String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setDashboardLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHighRiskRows() {
      setHighRiskLoading(true);
      try {
        const response = await getTransactionWorkspace();
        if (!active) return;
        const rows = response.items
          .map(mapWorkspaceItem)
          .filter((item) => item.riskScore >= 70)
          .sort((a, b) => b.riskScore - a.riskScore);
        setHighRiskRows(rows);
      } catch (error) {
        if (!active) return;
        setHighRiskRows([]);
        toast.error('Failed to load high risk transactions', {
          description: error instanceof Error ? error.message : 'Could not load the dashboard queue.',
        });
      } finally {
        if (active) setHighRiskLoading(false);
      }
    }

    void loadHighRiskRows();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOpenUpload() {
      setUploadOpen(true);
    }

    window.addEventListener('fraudlens:open-upload-csv', handleOpenUpload);
    return () => {
      window.removeEventListener('fraudlens:open-upload-csv', handleOpenUpload);
    };
  }, []);

  async function openHighRiskTransaction(transaction: Transaction) {
    try {
      const detail = await getTransactionDetail(transaction.id);
      setSelected(mapTransactionDetail(detail));
    } catch {
      setSelected(transaction);
    }
  }

  const activeMetric = useMemo(() => trendTabs.find((tab) => tab.id === trendMetric)!, [trendMetric]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        description="Live fraud posture across the portfolio — what happened today, why the model reacted, and where analysts should look next."
        meta={
        <>
            <Badge tone="emerald" dot>
              All scoring services operational
            </Badge>
            <Badge tone="amber" dot>
              12 cases near SLA breach
            </Badge>
            <span className="text-xs text-gray-400">Updated 34 seconds ago</span>
          </>
        }
        actions={
        <>
            <Button variant="secondary" icon={UploadIcon} onClick={() => setUploadOpen(true)}>
              Upload CSV
            </Button>
            <Button
            variant="secondary"
            icon={FileTextIcon}
            onClick={() =>
            toast.success('Report queued', { description: 'Executive summary will appear in Reports Center.' })
            }>
            
              Generate report
            </Button>
            <Button variant="primary" icon={ZapIcon} onClick={() => setAnalyzeOpen(true)}>
              Analyze transaction
            </Button>
          </>
        } />
      

      <section aria-label="Executive KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {operationsKpis.map((datum, index) => {
        // map backend fields where available: transaction_count, fraud_alert_count, investigation_count, user_count
        const live = { ...datum };
        if (dashboard && !dashboardLoading) {
          if (datum.id === 'volume' && typeof dashboard.transaction_count === 'number') {
            live.value = formatNumber(dashboard.transaction_count);
          }
          if (datum.id === 'fraud' && typeof dashboard.fraud_alert_count === 'number') {
            live.value = formatNumber(dashboard.fraud_alert_count);
          }
          if (datum.id === 'queue' && typeof dashboard.investigation_count === 'number') {
            live.value = String(dashboard.investigation_count);
          }
        }
        return <KpiCard key={datum.id} datum={live} icon={kpiIcons[index]} />;
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Fraud trend · last 24 hours"
            description={`${activeMetric.label} in two-hour buckets, compared with transaction volume.`}
            icon={ActivityIcon}
            action={
            <Tabs tabs={trendTabs} active={trendMetric} onChange={setTrendMetric} className="border-b-0" layoutId="ops-trend" />
            } />
          
          <CardBody className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fraudTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fraudArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={4} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(value: number) => formatNumber(value, true)} />
                  
                  <Tooltip
                    cursor={{ stroke: '#d1d5db', strokeDasharray: '3 3' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 6px 20px -6px rgba(16,24,40,0.12)',
                      fontSize: 12,
                      padding: '8px 12px'
                    }}
                    formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === trendMetric ? activeMetric.label : name]
                    } />
                  
                  <Area
                    type="monotone"
                    dataKey={trendMetric}
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#fraudArea)"
                    activeDot={{ r: 4, strokeWidth: 2 }} />
                  
                  {trendMetric !== 'transactions' ?
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" /> :
                  null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">
              Fraud attempts peak between 12:00 and 16:00 UTC — consider staffing Tier 2 more heavily in that window.
            </p>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800">
              
              Full analytics <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title="Decision intelligence"
            description="How the model performed and where analysts agreed."
            icon={ScanEyeIcon} />
          
          <CardBody className="space-y-5">
            <StatList items={decisionIntelligenceSummary} columns={2} />
            <div className="space-y-3.5 border-t border-gray-100 pt-4">
              {decisionSummary.map((row) =>
              <div key={row.label}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="text-[13px] font-medium text-gray-700">{row.label}</p>
                    <p className="tabular text-[13px] text-gray-500">
                      <span className="font-semibold text-gray-900">{row.value}%</span> · {formatNumber(row.count, true)}
                    </p>
                  </div>
                  <ProgressBar value={row.value} tone={row.tone} label={row.label} />
                </div>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">Every decision ships with a plain-language reason.</p>
            <Link
              to="/decision-intelligence"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800">
              
              Explore <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader
            title="Review queue"
            description="87 open cases across four queues."
            icon={InboxIcon}
            action={
            <Link to="/transactions">
                <Button size="sm" variant="secondary">
                  Open workspace
                </Button>
              </Link>
            } />
          
          <CardBody className="space-y-4">
            {reviewQueue.map((queue) =>
            <div key={queue.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-gray-900">{queue.tier}</p>
                  <p className="tabular mt-0.5 text-xs text-gray-500">
                    SLA {queue.sla} · oldest {queue.oldest}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {queue.breaching > 0 ?
                <Badge tone="red">{queue.breaching} at risk</Badge> :

                <Badge tone="emerald">On track</Badge>
                }
                  <span className="tabular w-8 text-right text-sm font-semibold text-gray-900">{queue.open}</span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Platform status" description="Scoring, models and data pipelines." icon={ServerIcon} />
          <CardBody className="space-y-4">
            {platformStatus.map((service) =>
            <div key={service.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-gray-900">{service.name}</p>
                  <p className="mt-0.5 text-xs leading-5 text-gray-500">{service.detail}</p>
                </div>
                <Badge tone={service.status === 'operational' ? 'emerald' : 'amber'} dot>
                  {service.status === 'operational' ? 'Operational' : 'Degraded'}
                </Badge>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">Feature store lag is being investigated by the platform team.</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Business impact" description="Month-to-date value delivered." icon={BanknoteIcon} />
          <CardBody>
            <StatList items={businessImpact} columns={2} />
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">Calculated from confirmed outcomes, not model estimates.</p>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800">
              
              Breakdown <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="High risk transactions"
            description="Highest scoring cases awaiting a decision right now."
            icon={ShieldAlertIcon}
            action={
            <Link to="/transactions">
                <Button size="sm" variant="secondary" iconRight={ArrowRightIcon}>
                  View all
                </Button>
              </Link>
            } />
          
          {loading || highRiskLoading ?
          <SkeletonTable rows={5} columns={6} /> :

          highRiskRows.length === 0 ?
          <div className="p-6 text-sm text-gray-500">No high-risk backend transactions are currently available.</div> :

          <Table>
              <THead>
                <Tr>
                  <Th>Transaction</Th>
                  <Th>Customer</Th>
                  <Th align="right">Amount</Th>
                  <Th>Score</Th>
                  <Th>Decision</Th>
                  <Th align="right">Action</Th>
                </Tr>
              </THead>
              <TBody>
                {highRiskRows.slice(0, 6).map((transaction) =>
              <Tr key={transaction.id} onClick={() => void openHighRiskTransaction(transaction)}>
                    <Td>
                      <p className="font-medium text-gray-900">{transaction.reference}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{transaction.merchant}</p>
                    </Td>
                    <Td>
                      <p className="text-gray-900">{transaction.customer}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{transaction.channel}</p>
                    </Td>
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
                    <Td align="right">
                      <Button size="sm" variant="ghost" iconRight={ArrowRightIcon}>
                        Review
                      </Button>
                    </Td>
                  </Tr>
              )}
              </TBody>
            </Table>
          }
        </Card>

        <Card>
          <CardHeader title="Recent activity" description="Decisions, tuning and platform events." icon={ClockIcon} />
          <CardBody>
            <Timeline events={recentActivity} />
          </CardBody>
        </Card>
      </div>

      <Modal
        open={analyzeOpen}
        onClose={() => setAnalyzeOpen(false)}
        title="Analyze a transaction"
        description="Score an ad-hoc transaction against the production model and active policies."
        footer={
        <>
            <Button variant="secondary" onClick={() => setAnalyzeOpen(false)}>
              Cancel
            </Button>
            <Button
            variant="primary"
            icon={ZapIcon}
            onClick={() => {
              setAnalyzeOpen(false);
              toast.success('Scored in 38ms', { description: 'Score 71 · manual review recommended.' });
            }}>
            
              Score transaction
            </Button>
          </>
        }>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Amount" name="amount" placeholder="1,250.00" icon={CircleDollarSignIcon} suffix="USD" />
          <Input label="Merchant" name="merchant" placeholder="Northwind Electronics" />
          <Input label="Customer ID" name="customer" placeholder="CUS-40192" />
          <Select
            label="Channel"
            name="channel"
            options={[
            { value: 'ecom', label: 'E-commerce' },
            { value: 'card', label: 'Card present' },
            { value: 'mobile', label: 'Mobile app' },
            { value: 'wire', label: 'Wire' }]
            } />
          
        </div>
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={() => {
          setSelectedCsvFile(null);
          setUploadOpen(false);
        }}
        title="Upload transaction CSV"
        description="Batch score up to 50,000 transactions. Results land in the Transaction Workspace."
        footer={
        <>
            <Button variant="secondary" onClick={() => {
              setSelectedCsvFile(null);
              setUploadOpen(false);
            }}>
              Cancel
            </Button>
            <Button
            variant="primary"
            icon={UploadIcon}
            disabled={uploading || !selectedCsvFile}
            onClick={async () => {
              if (!selectedCsvFile) {
                toast.error('No CSV selected', { description: 'Choose a CSV file before starting the upload.' });
                return;
              }

              try {
                setUploading(true);
                const response = await uploadTransactionsCsv(selectedCsvFile);
                if (response.failed_rows > 0) {
                  const detail = response.validation_errors?.slice(0, 3).map((error) => `${error.field}: ${error.error}`).join(' · ') ?? 'Validation failed';
                  toast.error('CSV validation failed', { description: detail });
                  setUploading(false);
                  return;
                }

                toast.success('Batch upload complete', { description: `${response.successfully_imported} rows imported.` });
                setSelectedCsvFile(null);
                setUploadOpen(false);
                window.dispatchEvent(new CustomEvent('fraudlens:workspace-refresh'));
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Upload failed';
                toast.error('Batch upload failed', { description: message });
              } finally {
                setUploading(false);
              }
            }}>
            
              {uploading ? 'Uploading…' : 'Start upload'}
            </Button>
          </>
        }>
        
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedCsvFile(file);
            }} />
          <UploadIcon className="mx-auto h-5 w-5 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-900">{selectedCsvFile ? selectedCsvFile.name : 'Drop your CSV here'}</p>
          <p className="mt-1 text-[13px] text-gray-500">
            Required columns: transaction_reference, amount, currency, merchant, merchant_category, customer_id, transaction_type, transaction_timestamp, location, payment_method, status
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}>
            Browse files
          </Button>
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-blue-50/70 px-3 py-2.5">
          <SlidersHorizontalIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-[13px] leading-5 text-blue-900">
            Batch scoring uses the same thresholds as live traffic. Change them in Administration before uploading if you
            are backtesting.
          </p>
        </div>
      </Modal>

      <TransactionDrawer transaction={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>);

}