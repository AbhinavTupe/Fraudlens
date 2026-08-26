import { CheckCircle2Icon, DownloadIcon, FileTextIcon, MailIcon, TableIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatList } from '../ui/StatList';
import type { LibraryReport } from '../../types/fraud';

interface ReportPreviewDrawerProps {
  report: LibraryReport | null;
  onClose: () => void;
}

/** Preview a report — summary, sections, metadata and export options — before downloading. */
export function ReportPreviewDrawer({ report, onClose }: ReportPreviewDrawerProps) {
  return (
    <Drawer
      open={Boolean(report)}
      onClose={onClose}
      title={report?.name ?? ''}
      subtitle={report ? `${report.period} · generated ${report.generated}` : undefined}
      eyebrow={
      report ?
      <>
            <Badge tone="blue">{report.format}</Badge>
            <Badge tone="gray">{report.size}</Badge>
            <Badge tone="emerald" dot>
              Retained until Aug 2033
            </Badge>
          </> :
      null
      }
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">Exports are logged in the audit trail with your identity.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={MailIcon} onClick={() => toast.success('Shared with 14 recipients')}>
              Share
            </Button>
            <Button size="sm" variant="secondary" icon={TableIcon} onClick={() => toast.success('XLSX export started')}>
              Export XLSX
            </Button>
            <Button size="sm" variant="primary" icon={DownloadIcon} onClick={() => toast.success('Download started')}>
              Download {report?.format ?? 'PDF'}
            </Button>
          </div>
        </div>
      }>
      
      {report ?
      <div className="space-y-6">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Executive summary</h3>
            <p className="mt-2 text-[13px] leading-6 text-gray-700">{report.summary}</p>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Highlights</h3>
            <ul className="mt-2.5 space-y-2">
              {report.highlights.map((highlight) =>
            <li key={highlight} className="flex gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5">
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[13px] leading-5 text-gray-700">{highlight}</p>
                </li>
            )}
            </ul>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Included sections</h3>
            <ol className="mt-2.5 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
              {report.sections.map((section, index) =>
            <li key={section} className="flex items-center gap-3 bg-white px-4 py-2.5">
                  <span className="tabular flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
                    {index + 1}
                  </span>
                  <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <p className="text-[13px] text-gray-700">{section}</p>
                </li>
            )}
            </ol>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Metadata</h3>
            <div className="mt-2.5 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
              <StatList
              columns={2}
              items={[
              { label: 'Author', value: report.author },
              { label: 'Format', value: report.format },
              { label: 'Period', value: report.period },
              { label: 'File size', value: report.size },
              { label: 'Generated', value: report.generated },
              { label: 'Retention', value: '7 years' }]
              } />
            
            </div>
          </section>
        </div> :
      null}
    </Drawer>);

}