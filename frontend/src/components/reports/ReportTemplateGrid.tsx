import { LayoutTemplateIcon, PlayIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { reportTemplates } from '../../data/reports';

/** Premium report templates with approved sections, audience and output formats. */
export function ReportTemplateGrid() {
  return (
    <Card>
      <CardHeader
        title="Report templates"
        description="Six standard packs with approved content, formatting and distribution."
        icon={LayoutTemplateIcon} />
      
      <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reportTemplates.map((template) =>
        <article
          key={template.id}
          className={cn(
            'flex flex-col rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft',
            template.tier === 'premium' ? 'border-emerald-200' : 'border-gray-200'
          )}>
          
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-gray-900">{template.name}</h3>
                <p className="mt-1 text-[13px] leading-5 text-gray-600">{template.description}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge tone="blue">{template.cadence}</Badge>
                {template.tier === 'premium' ?
              <Badge tone="emerald" icon={SparklesIcon}>
                    Premium
                  </Badge> :
              null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {template.sections.map((section) =>
            <span
              key={section}
              className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-inset ring-gray-200">
              
                  {section}
                </span>
            )}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3.5">
              <p className="border-t border-gray-100 pt-3 text-xs text-gray-500">
                {template.audience} · {template.format.join(' / ')}
              </p>
              <Button
              size="sm"
              variant="secondary"
              icon={PlayIcon}
              onClick={() =>
              toast.success(`${template.name} queued`, { description: 'You will be notified when it is ready.' })
              }>
              
                Run now
              </Button>
            </div>
          </article>
        )}
      </CardBody>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Templates are version-controlled — changing one creates a new revision for audit.
        </p>
      </CardFooter>
    </Card>);

}