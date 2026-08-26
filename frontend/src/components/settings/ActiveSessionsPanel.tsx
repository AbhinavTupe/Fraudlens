import { useState } from 'react';
import { LaptopIcon, LogOutIcon, MonitorSmartphoneIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { activeSessions } from '../../data/profile';

/** Active session management with browser, device, IP, location and sign-out control. */
export function ActiveSessionsPanel() {
  const [sessions, setSessions] = useState(activeSessions);
  const others = sessions.filter((session) => !session.current);

  function revoke(id: string) {
    const target = sessions.find((session) => session.id === id);
    setSessions((current) => current.filter((session) => session.id !== id));
    toast.success('Session signed out', { description: `${target?.device} no longer has access.` });
  }

  return (
    <Card>
      <CardHeader
        title="Active sessions"
        description="Everywhere your account is currently signed in."
        icon={LaptopIcon}
        action={
        others.length > 0 ?
        <Button
          size="sm"
          variant="secondary"
          icon={LogOutIcon}
          onClick={() => {
            setSessions((current) => current.filter((session) => session.current));
            toast.success('Signed out of all other devices');
          }}>
          
              Sign out others
            </Button> :
        null
        } />
      
      {sessions.length === 0 ?
      <EmptyState
        icon={MonitorSmartphoneIcon}
        title="No active sessions"
        description="You will see devices here the next time you sign in." /> :


      <CardBody className="space-y-4">
          {sessions.map((session) =>
        <div
          key={session.id}
          className="flex flex-col gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
          
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200">
                  <MonitorSmartphoneIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-gray-900">{session.browser}</p>
                    {session.current ? <Badge tone="emerald">This device</Badge> : null}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{session.device}</p>
                  <p className="tabular mt-0.5 text-xs text-gray-500">
                    {session.location} · {session.ip}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{session.lastActive}</p>
                </div>
              </div>
              {!session.current ?
          <Button size="sm" variant="ghost" icon={LogOutIcon} onClick={() => revoke(session.id)}>
                  Sign out
                </Button> :
          null}
            </div>
        )}
        </CardBody>
      }
      <CardFooter>
        <p className="text-xs text-gray-500">
          Sessions expire automatically after 12 hours of inactivity, or immediately on password change.
        </p>
      </CardFooter>
    </Card>);

}