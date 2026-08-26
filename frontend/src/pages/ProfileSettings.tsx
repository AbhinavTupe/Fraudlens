import { BoxIcon, ClockIcon, InfoIcon, LogOutIcon, ScanEyeIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatList } from '../components/ui/StatList';
import { Timeline } from '../components/ui/Timeline';
import { SecurityCenter } from '../components/settings/SecurityCenter';
import { ActiveSessionsPanel } from '../components/settings/ActiveSessionsPanel';
import { NotificationPreferencesPanel } from '../components/settings/NotificationPreferencesPanel';
import { WorkspacePreferencesPanel } from '../components/settings/WorkspacePreferencesPanel';
import { aboutFraudLens, currentUser, profileActivity, supportOptions } from '../data/profile';

export function ProfileSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Settings"
        description="Your account, security posture and the way FraudLens behaves for you."
        meta={
        <>
            <Badge tone="emerald" dot>
              Hardware key active
            </Badge>
            <Badge tone="amber">2 recovery codes left</Badge>
            <span className="text-xs text-gray-400">Signed in from Austin, TX</span>
          </>
        }
        actions={
        <>
            <Button variant="secondary" icon={LogOutIcon} onClick={() => toast('Signed out of all other devices')}>
              Sign out everywhere
            </Button>
            <Button variant="primary" onClick={() => toast.success('Preferences saved')}>
              Save changes
            </Button>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Profile" description="How you appear across the workspace." icon={UserIcon} />
            <CardBody>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
                  {currentUser.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-[13px] text-gray-500">{currentUser.role}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{currentUser.email}</p>
                </div>
              </div>
              <div className="mt-5 border-t border-gray-100 pt-5">
                <StatList
                  columns={2}
                  items={[
                  { label: 'Team', value: currentUser.team },
                  { label: 'Manager', value: currentUser.manager },
                  { label: 'Location', value: currentUser.location },
                  { label: 'Member since', value: currentUser.joined }]
                  } />
                
              </div>
            </CardBody>
            <CardFooter>
              <p className="text-xs text-gray-500">
                {currentUser.casesThisMonth.toLocaleString()} cases this month · {currentUser.accuracy}% accuracy ·{' '}
                {currentUser.avgHandling} average
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="Your activity" description="Recent actions on your account." icon={ClockIcon} />
            <CardBody>
              <Timeline events={profileActivity} />
            </CardBody>
          </Card>
        </div>

        <SecurityCenter />

        <ActiveSessionsPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <NotificationPreferencesPanel />
        <WorkspacePreferencesPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="About FraudLens" description="Version, region and compliance posture." icon={ScanEyeIcon} />
          <CardBody>
            <StatList columns={2} items={aboutFraudLens} />
          </CardBody>
          <CardFooter>
            <p className="text-xs text-gray-500">© 2026 FraudLens · Decision Intelligence Platform</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <InfoIcon className="h-3.5 w-3.5" /> Release notes
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title="Help & support"
            description="Enterprise support with a 15 minute response target."
            icon={BoxIcon} />
          
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {supportOptions.map((option) =>
            <article
              key={option.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-card">
              
                <h3 className="text-[13px] font-semibold text-gray-900">{option.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-gray-500">{option.detail}</p>
                <Button size="sm" variant="secondary" className="mt-3 self-start" onClick={() => toast(option.action)}>
                  {option.action}
                </Button>
              </article>
            )}
          </CardBody>
        </Card>
      </div>
    </div>);

}