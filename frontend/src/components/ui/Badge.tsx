import { cn } from '../../utils/cn';

export type BadgeTone = 'emerald' | 'blue' | 'amber' | 'red' | 'gray' | 'violet';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  icon?: React.ComponentType<{className?: string;}>;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20'
};

const dots: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
  violet: 'bg-violet-500'
};

export function Badge({ tone = 'gray', children, icon: Icon, dot, size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium ring-1 ring-inset whitespace-nowrap leading-5',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]',
        tones[tone],
        className
      )}>
      
      {dot ? <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dots[tone])} /> : null}
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      {children}
    </span>);

}