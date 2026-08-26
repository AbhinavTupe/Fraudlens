import { useState } from 'react';
import { SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { workspacePreferences } from '../../data/profile';

/** Workspace preferences: landing page, density, date range, language, timezone, page size. */
export function WorkspacePreferencesPanel() {
  const [preferences, setPreferences] = useState(workspacePreferences);

  return (
    <Card>
      <CardHeader
        title="Workspace preferences"
        description="Tailor FraudLens to the way you work."
        icon={SettingsIcon} />
      
      <CardBody className="space-y-4">
        {preferences.map((preference) =>
        <div
          key={preference.id}
          className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-900">{preference.label}</p>
              <p className="mt-0.5 text-[13px] leading-5 text-gray-500">{preference.detail}</p>
            </div>
            {preference.type === 'toggle' ?
          <Toggle
            checked={Boolean(preference.enabled)}
            caption={preference.enabled ? 'On' : 'Off'}
            label={preference.label}
            className="shrink-0 sm:w-56 sm:justify-end"
            onChange={(next) => {
              setPreferences((current) =>
              current.map((item) =>
              item.id === preference.id ? { ...item, enabled: next, value: next ? 'On' : 'Off' } : item
              )
              );
              toast.success(`${preference.label} ${next ? 'enabled' : 'disabled'}`);
            }} /> :


          <div className="shrink-0 sm:w-56">
                <Select
              name={preference.id}
              value={preference.value}
              onChange={(event) => {
                setPreferences((current) =>
                current.map((item) => item.id === preference.id ? { ...item, value: event.target.value } : item)
                );
                toast.success(`${preference.label} set to ${event.target.value}`);
              }}
              options={(preference.options ?? []).map((option) => ({ value: option, label: option }))} />
            
              </div>
          }
          </div>
        )}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">Preferences apply to your account only and sync across your devices.</p>
      </CardFooter>
    </Card>);

}