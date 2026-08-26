import { useState } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardFooter, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Slider } from '../ui/Slider';
import { MetricTile } from '../ui/MetricTile';
import { Table, TBody, Td, Th, THead, Tr } from '../ui/Table';
import { thresholds as productionThresholds } from '../../data/admin';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/cn';
import { simulateThresholds } from '../../utils/simulation';

type ThresholdRow = (typeof productionThresholds)[number];

/** Threshold management with a live business-impact preview before anything is saved. */
export function ThresholdManager() {
  const [rows, setRows] = useState(productionThresholds);
  const [editing, setEditing] = useState<ThresholdRow | null>(null);
  const [draft, setDraft] = useState({ approve: 30, review: 70, block: 90 });

  function openEditor(row: ThresholdRow) {
    setEditing(row);
    setDraft({ approve: row.approve, review: row.review, block: row.block });
  }

  const current = editing ? simulateThresholds(editing.review, editing.block) : null;
  const proposed = editing ? simulateThresholds(draft.review, draft.block) : null;
  const changed = editing ?
  draft.approve !== editing.approve || draft.review !== editing.review || draft.block !== editing.block :
  false;

  function save() {
    if (!editing) return;
    setRows((current) => current.map((row) => row.id === editing.id ? { ...row, ...draft } : row));
    toast.success('Change submitted for approval', {
      description: `${editing.segment} · review ${draft.review} · block ${draft.block} awaiting a second approver.`
    });
    setEditing(null);
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Decision threshold management"
          description="Production thresholds by segment. Every change previews its business impact and needs a second approver."
          icon={SlidersHorizontalIcon}
          action={
          <Badge tone="blue" dot>
              Dual approval enforced
            </Badge>
          } />
        
        <Table minWidth="min-w-[720px]">
          <THead>
            <Tr>
              <Th>Segment</Th>
              <Th align="right">Monthly volume</Th>
              <Th align="right">Auto-approve ≤</Th>
              <Th align="right">Review ≥</Th>
              <Th align="right">Decline ≥</Th>
              <Th align="right">Action</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map((row) =>
            <Tr key={row.id}>
                <Td className="font-medium text-gray-900">{row.segment}</Td>
                <Td align="right" className="tabular text-gray-600">
                  {formatNumber(row.volume)}
                </Td>
                <Td align="right" className="tabular font-medium text-emerald-700">
                  {row.approve}
                </Td>
                <Td align="right" className="tabular font-medium text-amber-700">
                  {row.review}
                </Td>
                <Td align="right" className="tabular font-medium text-red-700">
                  {row.block}
                </Td>
                <Td align="right">
                  <Button size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
        <CardFooter>
          <p className="text-xs text-gray-500">
            Last change: e-commerce decline 92 → 90 by Marcus Alvarez on 4 Aug 2026.
          </p>
        </CardFooter>
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        width="max-w-2xl"
        title={`Edit thresholds · ${editing?.segment ?? ''}`}
        description="Move the sliders to preview the impact. Nothing changes until a second approver signs off."
        footer={
        <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!changed} onClick={save}>
              Submit for approval
            </Button>
          </>
        }>
        
        {editing && current && proposed ?
        <div className="space-y-6">
            <div className="space-y-5">
              <Slider
              id="admin-approve"
              label="Auto-approve ceiling"
              tone="emerald"
              min={5}
              max={draft.review - 5}
              value={draft.approve}
              onChange={(next) => setDraft((state) => ({ ...state, approve: next }))}
              displayValue={String(draft.approve)}
              hint="Scores at or below this value clear without any friction." />
            
              <Slider
              id="admin-review"
              label="Manual review threshold"
              tone="amber"
              min={draft.approve + 5}
              max={draft.block - 5}
              value={draft.review}
              onChange={(next) => setDraft((state) => ({ ...state, review: next }))}
              displayValue={String(draft.review)}
              hint="Scores at or above this value are routed to an analyst." />
            
              <Slider
              id="admin-block"
              label="Automatic decline threshold"
              tone="red"
              min={draft.review + 5}
              max={99}
              value={draft.block}
              onChange={(next) => setDraft((state) => ({ ...state, block: next }))}
              displayValue={String(draft.block)}
              hint="Scores at or above this value are declined without review." />
            
            </div>

            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Business impact preview
              </h3>
              <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MetricTile
                label="Approval rate"
                value={formatPercent(proposed.approvalRate)}
                tone="emerald"
                detail={`Now ${formatPercent(current.approvalRate)}`} />
              
                <MetricTile
                label="Manual review rate"
                value={formatPercent(proposed.reviewRate)}
                tone="amber"
                detail={`Now ${formatPercent(current.reviewRate)}`} />
              
                <MetricTile
                label="Decline rate"
                value={formatPercent(proposed.declineRate)}
                tone="red"
                detail={`Now ${formatPercent(current.declineRate)}`} />
              
                <MetricTile
                label="False positives"
                value={formatNumber(proposed.falsePositives)}
                detail={`Now ${formatNumber(current.falsePositives)}`} />
              
                <MetricTile
                label="Review queue"
                value={`${formatNumber(proposed.reviewQueuePerDay)}/day`}
                detail={`Now ${formatNumber(current.reviewQueuePerDay)}/day`} />
              
                <MetricTile
                label="Money saved"
                value={formatCurrency(proposed.moneySaved, true)}
                tone="emerald"
                detail={`Now ${formatCurrency(current.moneySaved, true)}`} />
              
              </div>
              <p className="mt-3 rounded-lg bg-blue-50/70 px-3.5 py-2.5 text-[13px] leading-5 text-blue-900">
                {changed ?
              `This change moves ${formatNumber(Math.abs(proposed.reviewQueuePerDay - current.reviewQueuePerDay))} cases per day into or out of the review queue and shifts fraud caught by ${formatCurrency(Math.abs(proposed.moneySaved - current.moneySaved), true)} per month.` :
              'Move a slider to preview the impact of a change.'}
              </p>
            </section>
          </div> :
        null}
      </Modal>
    </>);

}