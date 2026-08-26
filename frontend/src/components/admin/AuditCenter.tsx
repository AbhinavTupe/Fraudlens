import { useMemo, useState } from 'react';
import { ActivityIcon, DownloadIcon, FileClockIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Drawer } from '../ui/Drawer';
import { EmptyState } from '../ui/EmptyState';
import { StatList } from '../ui/StatList';
import { Table, TBody, Td, Th, THead, Tr } from '../ui/Table';
import { Timeline } from '../ui/Timeline';
import { auditEvents, configurationHistory } from '../../data/admin';

type AuditEvent = (typeof auditEvents)[number];

const severityTone = { high: 'red', medium: 'amber', low: 'gray' } as const;

/** Enterprise audit center: searchable log, filters, change timeline and a detail drawer. */
export function AuditCenter() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(auditEvents.map((event) => event.category)))],
    []
  );

  const filtered = useMemo(
    () =>
    auditEvents.filter((event) => {
      if (severity !== 'all' && event.severity !== severity) return false;
      if (category !== 'all' && event.category !== category) return false;
      if (query) {
        const haystack = `${event.action} ${event.target} ${event.actor} ${event.category} ${event.ip}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    }),
    [query, severity, category]
  );

  return (
    <>
      <Card>
        <CardHeader
          title="Audit center"
          description="Immutable record of every privileged action, searchable and exportable."
          icon={ActivityIcon}
          action={
          <Button size="sm" variant="secondary" icon={DownloadIcon} onClick={() => toast.success('Audit log exported')}>
              Export log
            </Button>
          } />
        
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 lg:flex-row lg:items-end">
          <div className="lg:w-80">
            <Input
              icon={SearchIcon}
              label="Search audit log"
              name="audit-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Action, target, actor or IP…" />
            
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Severity"
              name="severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              options={[
              { value: 'all', label: 'All severities' },
              { value: 'high', label: 'High only' },
              { value: 'medium', label: 'Medium only' },
              { value: 'low', label: 'Low only' }]
              } />
            
            <Select
              label="Category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={categories.map((value) => ({ value, label: value === 'all' ? 'All categories' : value }))} />
            
          </div>
        </div>

        {filtered.length === 0 ?
        <EmptyState
          icon={SearchIcon}
          title="No audit events match these filters"
          description="Try a broader search term, or widen the severity and category filters."
          action={
          <Button
            variant="secondary"
            onClick={() => {
              setQuery('');
              setSeverity('all');
              setCategory('all');
            }}>
            
                Clear filters
              </Button>
          } /> :


        <Table>
            <THead>
              <Tr>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>Actor</Th>
                <Th>Category</Th>
                <Th>When</Th>
                <Th align="right">Severity</Th>
              </Tr>
            </THead>
            <TBody>
              {filtered.map((event) =>
            <Tr key={event.id} onClick={() => setSelected(event)}>
                  <Td className="font-medium text-gray-900">{event.action}</Td>
                  <Td className="text-gray-600">{event.target}</Td>
                  <Td className="text-gray-600">{event.actor}</Td>
                  <Td>
                    <Badge tone="blue">{event.category}</Badge>
                  </Td>
                  <Td className="tabular text-gray-600">{event.at}</Td>
                  <Td align="right">
                    <Badge tone={severityTone[event.severity]}>{event.severity}</Badge>
                  </Td>
                </Tr>
            )}
            </TBody>
          </Table>
        }
        <CardFooter>
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {auditEvents.length} recent events · 18,412 retained for the last 30 days.
          </p>
          <span className="text-xs text-gray-500">Select any row for the full record</span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          title="Configuration timeline"
          description="Every risk change, with rationale and owner."
          icon={FileClockIcon} />
        
        <CardBody>
          <Timeline
            events={configurationHistory.map((item) => ({
              id: item.id,
              title: item.title,
              detail: item.detail,
              timestamp: item.at,
              actor: item.actor,
              kind: item.kind
            }))} />
          
        </CardBody>
      </Card>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.action ?? ''}
        subtitle={selected ? `${selected.target} · ${selected.at}` : undefined}
        eyebrow={
        selected ?
        <>
              <Badge tone={severityTone[selected.severity]} dot>
                {selected.severity} severity
              </Badge>
              <Badge tone="blue">{selected.category}</Badge>
            </> :
        null
        }
        footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">This record is immutable and retained for seven years.</p>
            <Button size="sm" variant="secondary" icon={DownloadIcon} onClick={() => toast.success('Evidence exported')}>
              Export evidence
            </Button>
          </div>
        }>
        
        {selected ?
        <div className="space-y-6">
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">What happened</h3>
              <p className="mt-2 text-[13px] leading-6 text-gray-700">{selected.detail}</p>
            </section>
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Record</h3>
              <div className="mt-2.5 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <StatList
                columns={2}
                items={[
                { label: 'Actor', value: selected.actor },
                { label: 'Category', value: selected.category },
                { label: 'Target', value: selected.target },
                { label: 'Timestamp', value: selected.at },
                { label: 'Source IP', value: selected.ip },
                { label: 'Event id', value: selected.id.toUpperCase() }]
                } />
              
              </div>
            </section>
          </div> :
        null}
      </Drawer>
    </>);

}