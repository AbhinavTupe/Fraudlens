import { cn } from '../../utils/cn';

export function Skeleton({ className }: {className?: string;}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-shimmer rounded-md bg-[linear-gradient(90deg,#f3f4f6_25%,#e9ebef_37%,#f3f4f6_63%)] bg-[length:400%_100%]',
        className
      )} />);


}

export function SkeletonTable({ rows = 5, columns = 5 }: {rows?: number;columns?: number;}) {
  return (
    <div aria-busy="true" aria-label="Loading data">
      <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50/80 px-4 py-2.5">
        {Array.from({ length: columns }).map((_, index) =>
        <Skeleton key={index} className={cn('h-2.5', index === 0 ? 'w-24' : index === columns - 1 ? 'ml-auto w-12' : 'w-16')} />
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) =>
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((__, colIndex) =>
          <div key={colIndex} className={cn(colIndex === 0 ? 'w-40' : colIndex === columns - 1 ? 'ml-auto w-16' : 'w-24')}>
                <Skeleton className="h-3" />
                {colIndex === 0 ? <Skeleton className="mt-2 h-2.5 w-24" /> : null}
              </div>
          )}
          </div>
        )}
      </div>
    </div>);

}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card" aria-busy="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-32" />
      <Skeleton className="mt-4 h-8 w-full" />
      <Skeleton className="mt-4 h-3 w-40" />
    </div>);

}

export function SkeletonList({ rows = 4 }: {rows?: number;}) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) =>
      <div key={index} className="flex items-start justify-between gap-4">
          <div className="w-full">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-2 h-2.5 w-24" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
      )}
    </div>);

}