import { useState } from 'react';
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  HistoryIcon,
  LibraryIcon,
  PlusIcon,
  SparklesIcon } from
'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TBody, Td, Th, THead, Tr } from '../components/ui/Table';
import { MetricTile } from '../components/ui/MetricTile';
import { ComplianceCenter } from '../components/reports/ComplianceCenter';
import { ScheduledReportsPanel } from '../components/reports/ScheduledReportsPanel';
import { ReportTemplateGrid } from '../components/reports/ReportTemplateGrid';
import { ReportPreviewDrawer } from '../components/reports/ReportPreviewDrawer';
import { executiveSummary, exportHistory, libraryReports, reportTemplates } from '../data/reports';
import type { LibraryReport } from '../types/fraud';

const summaryCards = [
{ label: 'Reports generated (30d)', value: '42', detail: '38 scheduled · 4 ad-hoc' },
{ label: 'Active schedules', value: '3', detail: '1 paused' },
{ label: 'Recipients reached', value: '51', detail: 'Across 9 distribution lists' },
{ label: 'Compliance items', value: '5', detail: '4 compliant · 1 needs action' }];


export function ReportsCenter() {
  const [preview, setPreview] = useState<LibraryReport | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Center"
        description="Generate, schedule and distribute the evidence your executives, auditors and regulators expect — from one place."
        meta={
        <>
            <Badge tone="emerald" dot>
              All schedules healthy
            </Badge>
            <Badge tone="amber">1 compliance item needs action</Badge>
            <span className="text-xs text-gray-400">Next run 10 Aug 2026 · 06:00 UTC</span>
          </>
        }
        actions={
        <>
            <Button
            variant="secondary"
            icon={DownloadIcon}
            onClick={() => toast.success('Bundle exported', { description: 'All July reports zipped and ready.' })}>
            
              Export bundle
            </Button>
            <Button variant="primary" icon={PlusIcon} onClick={() => setCreateOpen(true)}>
              New report
            </Button>
          </>
        } />
      

      <section aria-label="Reporting summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) =>
        <MetricTile key={card.label} label={card.label} value={card.value} detail={card.detail} />
        )}
      </section>

      <Card>
        <CardHeader
          title="AI-generated executive summary"
          description="Drafted from July results — review and edit before sending to the board."
          icon={SparklesIcon}
          action={
          <Button size="sm" variant="secondary" onClick={() => toast.success('Summary copied to clipboard')}>
              Copy summary
            </Button>
          } />
        
        <CardBody className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-[15px] font-medium leading-7 text-gray-900">{executiveSummary.headline}</p>
            <ul className="mt-4 space-y-2.5">
              {executiveSummary.points.map((point) =>
              <li key={point} className="flex gap-2.5">
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[13px] leading-6 text-gray-700">{point}</p>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Recommendations</p>
            <ol className="mt-2.5 space-y-2.5">
              {executiveSummary.recommendations.map((recommendation, index) =>
              <li key={recommendation} className="flex gap-2.5">
                  <span className="tabular flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    {index + 1}
                  </span>
                  <p className="text-[13px] leading-5 text-emerald-900">{recommendation}</p>
                </li>
              )}
            </ol>
          </div>
        </CardBody>
        <CardFooter>
          <p className="text-xs text-gray-500">Generated 1 Aug 2026 · reviewed by Priya Raman</p>
          <Button size="sm" variant="primary" onClick={() => toast.success('Summary attached to August report')}>
            Use in report
          </Button>
        </CardFooter>
      </Card>

      <ReportTemplateGrid />

      <ScheduledReportsPanel />

      <ComplianceCenter />

      <Card>
        <CardHeader
          title="Reports library"
          description="Every generated report, retained for seven years. Select a row to preview before downloading."
          icon={LibraryIcon}
          action={
          <div className="w-44">
              <Select
              name="library-filter"
              options={[
              { value: 'all', label: 'All periods' },
              { value: '2026', label: '2026' },
              { value: 'q2', label: 'Q2 2026' }]
              } />
            
            </div>
          } />
        
        <Table>
          <THead>
            <Tr>
              <Th>Report</Th>
              <Th>Period</Th>
              <Th>Generated</Th>
              <Th>Author</Th>
              <Th align="right">Size</Th>
              <Th align="right">Action</Th>
            </Tr>
          </THead>
          <TBody>
            {libraryReports.map((report) =>
            <Tr key={report.id} onClick={() => setPreview(report)}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <FileTextIcon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-900">{report.name}</span>
                  </div>
                </Td>
                <Td className="text-gray-600">{report.period}</Td>
                <Td className="tabular text-gray-600">{report.generated}</Td>
                <Td className="text-gray-600">{report.author}</Td>
                <Td align="right" className="tabular text-gray-600">
                  {report.size}
                </Td>
                <Td align="right">
                  <Button size="sm" variant="ghost">
                    Preview
                  </Button>
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Export history" description="Who exported what, for audit purposes." icon={HistoryIcon} />
        <Table minWidth="min-w-0">
          <THead>
            <Tr>
              <Th>File</Th>
              <Th>Exported by</Th>
              <Th>When</Th>
              <Th align="right">Rows</Th>
              <Th align="right">Status</Th>
            </Tr>
          </THead>
          <TBody>
            {exportHistory.map((entry) =>
            <Tr key={entry.id}>
                <Td className="font-mono text-[13px] text-gray-900">{entry.name}</Td>
                <Td className="text-gray-600">{entry.by}</Td>
                <Td className="tabular text-gray-600">{entry.at}</Td>
                <Td align="right" className="tabular text-gray-600">
                  {entry.rows}
                </Td>
                <Td align="right">
                  <Badge tone={entry.status === 'complete' ? 'emerald' : 'gray'}>
                    {entry.status === 'complete' ? 'Available' : 'Expired'}
                  </Badge>
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
        <CardFooter>
          <p className="text-xs text-gray-500">Export links expire after seven days under platform policy.</p>
        </CardFooter>
      </Card>

      <ReportPreviewDrawer report={preview} onClose={() => setPreview(null)} />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a report"
        description="Pick a template and period. Scheduling is optional."
        footer={
        <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
            variant="primary"
            onClick={() => {
              setCreateOpen(false);
              toast.success('Report queued', { description: 'It will appear in the library shortly.' });
            }}>
            
              Generate
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Select
            label="Template"
            name="template"
            options={reportTemplates.map((template) => ({ value: template.id, label: template.name }))} />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Period"
              name="period"
              options={[
              { value: 'jul', label: 'July 2026' },
              { value: 'q2', label: 'Q2 2026' },
              { value: 'ytd', label: 'Year to date' }]
              } />
            
            <Select
              label="Format"
              name="format"
              options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'xlsx', label: 'XLSX' }]
              } />
            
          </div>
          <Input
            label="Recipients"
            name="recipients"
            placeholder="risk-committee@fraudlens.io"
            hint="Comma separated. Leave blank to keep it private." />
          
        </div>
      </Modal>
    </div>);

}