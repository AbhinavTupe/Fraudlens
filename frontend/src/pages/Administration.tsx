import { useState } from 'react';
import { CpuIcon, FileClockIcon, KeyRoundIcon, PlusIcon, SearchIcon, SettingsIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Toggle } from '../components/ui/Toggle';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { MetricTile } from '../components/ui/MetricTile';
import { ThresholdManager } from '../components/admin/ThresholdManager';
import { PolicyEngine } from '../components/admin/PolicyEngine';
import { PlatformHealthPanel } from '../components/admin/PlatformHealthPanel';
import { ModelOverviewPanel } from '../components/admin/ModelOverviewPanel';
import { AuditCenter } from '../components/admin/AuditCenter';
import { models, platformOverview, platformSettings, roles, workspaceUsers } from '../data/admin';

const tabs = [
{ id: 'users', label: 'Users & access' },
{ id: 'risk', label: 'Risk configuration' },
{ id: 'models', label: 'AI models' },
{ id: 'audit', label: 'Audit & settings' }];


const statusTone = { active: 'emerald', invited: 'blue', suspended: 'red' } as const;

export function Administration() {
  const [tab, setTab] = useState('users');
  const [userQuery, setUserQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [settings, setSettings] = useState(platformSettings);

  const filteredUsers = workspaceUsers.filter((user) =>
  `${user.name} ${user.email} ${user.role} ${user.team}`.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Govern who can act, how the platform decides, and prove both to auditors. Every change here is versioned and attributed."
        meta={
        <>
            <Badge tone="emerald" dot>
              Platform healthy
            </Badge>
            <Badge tone="amber">1 user without MFA</Badge>
            <span className="text-xs text-gray-400">18,412 audit events in the last 30 days</span>
          </>
        }
        actions={
        <>
            <Button variant="secondary" icon={FileClockIcon} onClick={() => toast.success('Audit log exported')}>
              Export audit log
            </Button>
            <Button variant="primary" icon={PlusIcon} onClick={() => setInviteOpen(true)}>
              Invite user
            </Button>
          </>
        } />
      

      <section aria-label="Platform overview" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {platformOverview.map((item) =>
        <MetricTile key={item.label} label={item.label} value={item.value} detail={item.detail} />
        )}
      </section>

      <Tabs tabs={tabs} active={tab} onChange={setTab} layoutId="admin-tabs" />

      {tab === 'users' ?
      <div className="space-y-6">
          <Card>
            <CardHeader
            title="User management"
            description="148 users across analyst, manager, compliance and admin roles."
            icon={UsersIcon}
            action={
            <div className="w-64">
                  <Input
                icon={SearchIcon}
                name="user-search"
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
                placeholder="Search users…" />
              
                </div>
            } />
          
            {filteredUsers.length === 0 ?
          <EmptyState
            icon={UsersIcon}
            title="No users match that search"
            description="Check the spelling, or invite this person if they are not on the platform yet."
            action={
            <Button variant="primary" icon={PlusIcon} onClick={() => setInviteOpen(true)}>
                    Invite user
                  </Button>
            } /> :


          <Table>
                <THead>
                  <Tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Team</Th>
                    <Th>MFA</Th>
                    <Th>Last active</Th>
                    <Th align="right">Status</Th>
                  </Tr>
                </THead>
                <TBody>
                  {filteredUsers.map((user) =>
              <Tr key={user.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700">
                            {user.name.
                      split(' ').
                      map((part) => part[0]).
                      join('')}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-gray-600">{user.role}</Td>
                      <Td className="text-gray-600">{user.team}</Td>
                      <Td>
                        <Badge tone={user.mfa ? 'emerald' : 'amber'}>{user.mfa ? 'Enabled' : 'Missing'}</Badge>
                      </Td>
                      <Td className="text-gray-600">{user.lastActive}</Td>
                      <Td align="right">
                        <Badge tone={statusTone[user.status]} dot>
                          {user.status}
                        </Badge>
                      </Td>
                    </Tr>
              )}
                </TBody>
              </Table>
          }
            <CardFooter>
              <p className="text-xs text-gray-500">
                Showing {filteredUsers.length} of {workspaceUsers.length} users in this view.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
            title="Role-based access control"
            description="What each role can do, and how many people hold it."
            icon={KeyRoundIcon} />
          
            <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) =>
            <article
              key={role.id}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-card">
              
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-semibold text-gray-900">{role.name}</h3>
                    <Badge tone="blue">{role.members} members</Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Scope: {role.scope}</p>
                  <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                    {role.permissions.map((permission) =>
                <li key={permission} className="flex items-center gap-2 text-[13px] text-gray-700">
                        <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {permission}
                      </li>
                )}
                  </ul>
                </article>
            )}
            </CardBody>
          </Card>
        </div> :
      null}

      {tab === 'risk' ?
      <div className="space-y-6">
          <ThresholdManager />
          <PolicyEngine />
        </div> :
      null}

      {tab === 'models' ?
      <div className="space-y-6">
          <ModelOverviewPanel />

          <Card>
            <CardHeader
            title="AI model management"
            description="Production, challenger and archived models."
            icon={CpuIcon}
            action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast('Deployment requires Model Risk Committee approval')}>
              
                  Deploy model
                </Button>
            } />
          
            <Table>
              <THead>
                <Tr>
                  <Th>Model</Th>
                  <Th>Role</Th>
                  <Th align="right">Traffic</Th>
                  <Th align="right">Precision</Th>
                  <Th align="right">Recall</Th>
                  <Th>Deployed</Th>
                  <Th align="right">Status</Th>
                </Tr>
              </THead>
              <TBody>
                {models.map((model) =>
              <Tr key={model.id}>
                    <Td className="font-medium text-gray-900">{model.name}</Td>
                    <Td className="text-gray-600">{model.role}</Td>
                    <Td align="right" className="tabular text-gray-600">
                      {model.traffic}%
                    </Td>
                    <Td align="right" className="tabular text-gray-600">
                      {model.precision}%
                    </Td>
                    <Td align="right" className="tabular text-gray-600">
                      {model.recall}%
                    </Td>
                    <Td className="tabular text-gray-600">{model.deployed}</Td>
                    <Td align="right">
                      <Badge
                    tone={model.status === 'healthy' ? 'emerald' : model.status === 'evaluating' ? 'blue' : 'gray'}
                    dot>
                    
                        {model.status}
                      </Badge>
                    </Td>
                  </Tr>
              )}
              </TBody>
            </Table>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Challenger v4.3 is outperforming production on both metrics. Promotion decision due 15 Sep 2026.
              </p>
            </CardFooter>
          </Card>

          <PlatformHealthPanel />
        </div> :
      null}

      {tab === 'audit' ?
      <div className="space-y-6">
          <AuditCenter />

          <Card>
            <CardHeader
            title="Platform settings"
            description="Global controls that apply to every workspace user."
            icon={SettingsIcon} />
          
            <CardBody className="space-y-4">
              {settings.map((setting) =>
            <div
              key={setting.id}
              className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-gray-900">{setting.name}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-gray-500">{setting.detail}</p>
                  </div>
                  <Toggle
                checked={setting.enabled}
                label={setting.name}
                onChange={(next) => {
                  setSettings((current) =>
                  current.map((item) => item.id === setting.id ? { ...item, enabled: next } : item)
                  );
                  toast.success(`${setting.name} ${next ? 'enabled' : 'disabled'}`);
                }} />
              
                </div>
            )}
            </CardBody>
          </Card>
        </div> :
      null}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a user"
        description="They will receive an email to set up credentials and MFA."
        footer={
        <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
            variant="primary"
            onClick={() => {
              setInviteOpen(false);
              toast.success('Invitation sent');
            }}>
            
              Send invite
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input label="Work email" name="email" type="email" placeholder="name@fraudlens.io" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Role" name="role" options={roles.map((role) => ({ value: role.id, label: role.name }))} />
            <Select
              label="Team"
              name="team"
              options={[
              { value: 'na', label: 'Fraud ops · NA' },
              { value: 'emea', label: 'Fraud ops · EMEA' },
              { value: 'apac', label: 'Fraud ops · APAC' },
              { value: 'risk', label: 'Risk strategy' }]
              } />
            
          </div>
        </div>
      </Modal>
    </div>);

}