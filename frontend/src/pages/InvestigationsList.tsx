import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ShieldAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { getInvestigations, type InvestigationCase } from '../lib/api';

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

export function InvestigationsListPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCases() {
      try {
        const data = await getInvestigations();
        if (!active) return;
        setCases(data);
      } catch (error) {
        if (!active) return;
        toast.error('Failed to load investigations', {
          description: error instanceof Error ? error.message : 'The investigations list could not be fetched.',
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCases();
    return () => {
      active = false;
    };
  }, []);

  const filteredCases = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return cases;

    return cases.filter((item) => {
      const haystack = [item.title, item.description, item.case_number, item.fraud_alert_id, item.id].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(value);
    });
  }, [cases, query]);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">Investigation cases</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">Investigation queue</h1>
        </div>
        <div className="w-full max-w-md">
          <Input
            type="search"
            placeholder="Search investigations"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            icon={SearchIcon}
          />
        </div>
      </header>

      <Card>
        <CardHeader
          title="Live investigations"
          description="Real cases fetched from the backend investigation API."
          icon={ShieldAlertIcon}
          action={<Button variant="secondary" size="sm">Refresh</Button>}
        />

        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading investigations…</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">No investigations found for the current filter.</div>
          ) : (
            <Table minWidth="min-w-[920px]">
              <THead>
                <Tr>
                  <Th>Case</Th>
                  <Th>Alert</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Opened</Th>
                  <Th>Resolution</Th>
                </Tr>
              </THead>
              <TBody>
                {filteredCases.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <div className="space-y-1">
                        <Link to={`/investigations/${item.id}`} className="font-medium text-emerald-700 hover:text-emerald-800">
                          {item.title || 'Untitled investigation'}
                        </Link>
                        <div className="text-xs text-gray-500">{item.case_number || item.id.slice(0, 8)}</div>
                      </div>
                    </Td>
                    <Td>{item.fraud_alert_id}</Td>
                    <Td>
                      <Badge tone={statusTone[item.status] ?? 'gray'}>{statusLabel[item.status] ?? item.status}</Badge>
                    </Td>
                    <Td className="capitalize">{item.priority}</Td>
                    <Td>{item.opened_at ? new Date(item.opened_at).toLocaleString() : '—'}</Td>
                    <Td>{item.resolution || '—'}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
