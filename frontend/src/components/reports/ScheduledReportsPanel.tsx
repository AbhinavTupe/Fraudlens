import { useState } from 'react';
import { CalendarClockIcon, PauseIcon, PlayIcon, SendIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Table, TBody, Td, Th, THead, Tr } from '../ui/Table';
import { scheduledReports } from '../../data/reports';

/** Scheduled report management with frequency, recipients, next run and quick actions. */
export function ScheduledReportsPanel() {
  const [schedules, setSchedules] = useState(scheduledReports);

  function toggle(id: string) {
    setSchedules((current) =>
    current.map((schedule) =>
    schedule.id === id ?
    {
      ...schedule,
      status: schedule.status === 'active' ? 'paused' : 'active',
      nextRun: schedule.status === 'active' ? 'Paused' : 'Tomorrow · 06:00'
    } :
    schedule
    )
    );
    const target = schedules.find((schedule) => schedule.id === id);
    toast.success(`${target?.name} ${target?.status === 'active' ? 'paused' : 'resumed'}`);
  }

  return (
    <Card>
      <CardHeader
        title="Scheduled reports"
        description="Automated delivery to stakeholders, with full control over cadence and recipients."
        icon={CalendarClockIcon}
        action={
        <Badge tone="emerald" dot>
            {schedules.filter((schedule) => schedule.status === 'active').length} active
          </Badge>
        } />
      
      <Table minWidth="min-w-[720px]">
        <THead>
          <Tr>
            <Th>Report</Th>
            <Th>Frequency</Th>
            <Th>Next run</Th>
            <Th>Recipients</Th>
            <Th>Status</Th>
            <Th align="right">Quick actions</Th>
          </Tr>
        </THead>
        <TBody>
          {schedules.map((schedule) =>
          <Tr key={schedule.id}>
              <Td>
                <p className="font-medium text-gray-900">{schedule.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{schedule.owner}</p>
              </Td>
              <Td>
                <Badge tone="blue">{schedule.frequency}</Badge>
                <p className="mt-1 text-xs text-gray-500">{schedule.cadence}</p>
              </Td>
              <Td className="tabular text-gray-600">{schedule.nextRun}</Td>
              <Td>
                <span className="tabular inline-flex items-center gap-1.5 text-gray-700">
                  <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
                  {schedule.recipients}
                </span>
                <p className="mt-0.5 truncate text-xs text-gray-500">{schedule.recipientList}</p>
              </Td>
              <Td>
                <Badge tone={schedule.status === 'active' ? 'emerald' : 'gray'} dot>
                  {schedule.status === 'active' ? 'Active' : 'Paused'}
                </Badge>
              </Td>
              <Td align="right">
                <div className="flex justify-end gap-1.5">
                  <Button
                  size="sm"
                  variant="ghost"
                  icon={SendIcon}
                  onClick={() => toast.success(`${schedule.name} sent now`, { description: `Delivered to ${schedule.recipients} recipients.` })}>
                  
                    Run
                  </Button>
                  <Button
                  size="sm"
                  variant="ghost"
                  icon={schedule.status === 'active' ? PauseIcon : PlayIcon}
                  onClick={() => toggle(schedule.id)}>
                  
                    {schedule.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                </div>
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
      <CardFooter>
        <p className="text-xs text-gray-500">Schedules run in UTC. Failed deliveries retry twice and alert the owner.</p>
      </CardFooter>
    </Card>);

}