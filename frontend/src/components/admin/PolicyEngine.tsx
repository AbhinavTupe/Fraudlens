import { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { cn } from '../../utils/cn';
import { policies as seedPolicies } from '../../data/admin';

type Policy = (typeof seedPolicies)[number];

/** Dedicated policy engine management: priority order, enable/disable and editing. */
export function PolicyEngine() {
  const [policies, setPolicies] = useState<Policy[]>(seedPolicies);
  const [editing, setEditing] = useState<Policy | null>(null);

  function setEnabled(id: string, enabled: boolean) {
    setPolicies((current) => current.map((policy) => policy.id === id ? { ...policy, enabled } : policy));
    const target = policies.find((policy) => policy.id === id);
    toast.success(`${target?.name} ${enabled ? 'enabled' : 'disabled'}`, {
      description: enabled ? 'Live on new transactions immediately.' : 'No longer evaluated on new transactions.'
    });
  }

  function move(id: string, direction: -1 | 1) {
    setPolicies((current) => {
      const index = current.findIndex((policy) => policy.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next.map((policy, position) => ({ ...policy, priority: position + 1 }));
    });
    toast('Priority order updated', { description: 'Policies are evaluated from priority 1 downwards.' });
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Policy engine"
          description="Rules layered on top of model scores, evaluated in priority order."
          icon={ShieldCheckIcon}
          action={
          <Button size="sm" variant="secondary" icon={PlusIcon} onClick={() => toast('New policy draft created')}>
              New policy
            </Button>
          } />
        
        <CardBody className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {policies.map((policy, index) =>
          <article
            key={policy.id}
            className={cn(
              'rounded-xl border p-4 transition-colors',
              policy.enabled ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-200 bg-gray-50/70'
            )}>
            
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-semibold text-gray-600">
                    {policy.priority}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-gray-900">{policy.name}</h3>
                      <Badge tone={policy.status === 'active' ? 'emerald' : 'gray'} dot>
                        {policy.status === 'active' ? 'Active' : 'Draft'}
                      </Badge>
                      <Badge tone="blue">{policy.category}</Badge>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-5 text-gray-600">{policy.description}</p>
                  </div>
                </div>
                <Toggle
                checked={policy.enabled}
                label={`${policy.name} enabled`}
                onChange={(next) => setEnabled(policy.id, next)} />
              
              </div>

              <dl className="mt-3.5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
                {[
              ['Triggered (30d)', policy.triggered],
              ['Owner', policy.owner],
              ['Updated', policy.updated]].
              map(([label, value]) =>
              <div key={label} className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
                    <dd className="tabular mt-0.5 truncate text-[13px] font-medium text-gray-900">{value}</dd>
                  </div>
              )}
              </dl>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button
                  size="sm"
                  variant="ghost"
                  icon={ArrowUpIcon}
                  disabled={index === 0}
                  onClick={() => move(policy.id, -1)}
                  aria-label={`Raise priority of ${policy.name}`}>
                  
                    Raise
                  </Button>
                  <Button
                  size="sm"
                  variant="ghost"
                  icon={ArrowDownIcon}
                  disabled={index === policies.length - 1}
                  onClick={() => move(policy.id, 1)}
                  aria-label={`Lower priority of ${policy.name}`}>
                  
                    Lower
                  </Button>
                </div>
                <Button size="sm" variant="secondary" icon={PencilIcon} onClick={() => setEditing(policy)}>
                  Edit
                </Button>
              </div>
            </article>
          )}
        </CardBody>
        <CardFooter>
          <p className="text-xs text-gray-500">
            {policies.filter((policy) => policy.enabled).length} of {policies.length} policies live · changes are
            versioned and attributed.
          </p>
        </CardFooter>
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit policy · ${editing?.name ?? ''}`}
        description="Policy changes take effect on new transactions once approved."
        footer={
        <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              toast.success('Policy change submitted for approval');
            }}>
            
              Submit change
            </Button>
          </>
        }>
        
        {editing ?
        <div className="space-y-4">
            <Input label="Policy name" name="policy-name" defaultValue={editing.name} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
              label="Category"
              name="policy-category"
              defaultValue={editing.category}
              options={['Scoring', 'Behavioural', 'Segment', 'Control', 'Allowance'].map((option) => ({
                value: option,
                label: option
              }))} />
            
              <Input label="Priority" name="policy-priority" type="number" defaultValue={String(editing.priority)} />
            </div>
            <Input
            label="Outcome"
            name="policy-outcome"
            defaultValue={editing.description}
            hint="Describe in plain language what happens when this policy fires." />
          
          </div> :
        null}
      </Modal>
    </>);

}