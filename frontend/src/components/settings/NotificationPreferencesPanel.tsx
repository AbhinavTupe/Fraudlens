import { useState } from 'react';
import { BellIcon, FileTextIcon, MailIcon, ServerIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { notificationGroups, notificationPreferences, type NotificationPreference } from '../../data/profile';

const groupIcon: Record<NotificationPreference['group'], React.ComponentType<{className?: string;}>> = {
  'Fraud alerts': BellIcon,
  Reports: FileTextIcon,
  'Platform updates': ServerIcon,
  Security: ShieldCheckIcon
};

/** Notification preferences grouped by theme, with separate in-app and email switches. */
export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState(notificationPreferences);

  function update(id: string, channel: 'inApp' | 'email', next: boolean) {
    setPreferences((current) =>
    current.map((preference) => preference.id === id ? { ...preference, [channel]: next } : preference)
    );
    const target = preferences.find((preference) => preference.id === id);
    toast.success(`${target?.name} · ${channel === 'email' ? 'Email' : 'In-app'} ${next ? 'on' : 'off'}`);
  }

  return (
    <Card>
      <CardHeader
        title="Notification preferences"
        description="Choose what interrupts you, and where it arrives."
        icon={BellIcon} />
      
      <CardBody className="space-y-6">
        {notificationGroups.map((group) => {
          const Icon = groupIcon[group];
          const items = preferences.filter((preference) => preference.group === group);
          return (
            <section key={group}>
              <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold text-gray-900">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  {group}
                </h3>
                <div className="flex items-center gap-6 pr-0.5">
                  <span className="w-14 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    In-app
                  </span>
                  <span className="w-14 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Email
                  </span>
                </div>
              </div>
              <ul className="space-y-3">
                {items.map((preference) =>
                <li key={preference.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-900">{preference.name}</p>
                      <p className="mt-0.5 text-[13px] leading-5 text-gray-500">{preference.detail}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-6">
                      <span className="flex w-14 justify-end">
                        <Toggle
                        checked={preference.inApp}
                        label={`${preference.name} in-app`}
                        onChange={(next) => update(preference.id, 'inApp', next)} />
                      
                      </span>
                      <span className="flex w-14 justify-end">
                        <Toggle
                        checked={preference.email}
                        label={`${preference.name} email`}
                        onChange={(next) => update(preference.id, 'email', next)} />
                      
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </section>);

        })}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Security notifications cannot be fully disabled — at least one channel stays on.
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <MailIcon className="h-3.5 w-3.5" /> Email goes to your work address
        </span>
      </CardFooter>
    </Card>);

}