import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ShieldAlertIcon, RefreshCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { getInvestigation, transitionInvestigation, type InvestigationCase } from '../lib/api';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'under_investigation', label: 'Under investigation' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
];

const statusTone: Record<string, 'blue' | 'amber' | 'violet' | 'emerald' | 'red' | 'gray'> = {
  open: 'blue',
  under_investigation: 'amber',
  escalated: 'violet',
  resolved: 'emerald',
};

const statusLabel: Record<string, string> = {
  open: 'Open',
  under_investigation: 'Under investigation',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

export function InvestigationDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCase = async () => {
    if (!caseId) return;

    try {
      const item = await getInvestigation(caseId);
      setCaseData(item);
    } catch (error) {
      toast.error('Failed to load investigation', {
        description: error instanceof Error ? error.message : 'The investigation detail could not be fetched.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCase();
  }, [caseId]);

  const selectedStatus = useMemo(() => caseData?.status ?? 'open', [caseData]);

  async function updateStatus(nextStatus: string) {
    if (!caseData || !caseId) return;

    try {
      setSaving(true);
      await transitionInvestigation(caseId, { status: nextStatus });
      await loadCase();
      toast.success('Investigation status updated', { description: `Status set to ${statusLabel[nextStatus] ?? nextStatus}.` });
    } catch (error) {
      toast.error('Status update failed', {
        description: error instanceof Error ? error.message : 'The backend rejected this status change.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading investigation…</div>;
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <Button variant="secondary" icon={ArrowLeftIcon} onClick={() => navigate('/investigations')}>
          Back to investigations
        </Button>
        <p className="mt-4 text-sm text-gray-500">Investigation not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" icon={ArrowLeftIcon} onClick={() => navigate('/investigations')}>
            Back
          </Button>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">Investigation detail</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{caseData.title || 'Untitled investigation'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={RefreshCcwIcon} onClick={() => void loadCase()}>
            Reload
          </Button>
          <Badge tone={statusTone[caseData.status] ?? 'gray'}>{statusLabel[caseData.status] ?? caseData.status}</Badge>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Case overview" description="Loaded from the backend investigation API." icon={ShieldAlertIcon} />
          <CardBody className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Case ID</p>
                <p className="mt-1 break-all text-sm text-gray-900">{caseData.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Fraud alert ID</p>
                <p className="mt-1 break-all text-sm text-gray-900">{caseData.fraud_alert_id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Priority</p>
                <p className="mt-1 text-sm capitalize text-gray-900">{caseData.priority}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Opened</p>
                <p className="mt-1 text-sm text-gray-900">{caseData.opened_at ? new Date(caseData.opened_at).toLocaleString() : '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{caseData.description || 'No description provided.'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Resolution</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{caseData.resolution || 'No resolution recorded yet.'}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Status" description="Backend-backed status transitions." />
          <CardBody className="space-y-4">
            <Select
              label="Current status"
              value={selectedStatus}
              onChange={(event) => {
                const nextStatus = event.target.value;
                if (nextStatus !== caseData.status) {
                  void updateStatus(nextStatus);
                }
              }}
              options={statusOptions}
            />

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              {saving ? 'Saving…' : 'Status changes persist through the existing investigation PATCH API.'}
            </div>

            <Link to="/investigations" className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all investigations
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
