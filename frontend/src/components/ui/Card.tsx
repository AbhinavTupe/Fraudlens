import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card', className)}>
      {children}
    </section>);

}

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{className?: string;}>;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, icon: Icon, action, className }: CardHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
        className
      )}>
      
      <div className="flex min-w-0 items-start gap-3">
        {Icon ?
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200">
            <Icon className="h-4 w-4" />
          </span> :
        null}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] leading-5 text-gray-500">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>);

}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-3',
        className
      )}>
      
      {children}
    </footer>);

}