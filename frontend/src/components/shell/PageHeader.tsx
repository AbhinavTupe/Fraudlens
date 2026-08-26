import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, meta, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-gray-900 sm:text-2xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>);

}