import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: React.ComponentType<{className?: string;}>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 ring-1 ring-inset ring-gray-200">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-gray-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>);

}