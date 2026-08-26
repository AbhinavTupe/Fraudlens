import { cn } from '../../utils/cn';

interface StatListProps {
  items: Array<{label: string;value: string;detail?: string;}>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatList({ items, columns = 2, className }: StatListProps) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-5',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-2 lg:grid-cols-4',
        className
      )}>
      
      {items.map((item) =>
      <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</dt>
          <dd className="tabular mt-1.5 text-[15px] font-semibold leading-5 text-gray-900">{item.value}</dd>
          {item.detail ? <dd className="mt-1 text-xs leading-5 text-gray-500">{item.detail}</dd> : null}
        </div>
      )}
    </dl>);

}