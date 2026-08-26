import { cn } from '../../utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  /** Optional visible caption rendered beside the switch. */
  caption?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, caption, className }: ToggleProps) {
  const control =
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2',
      checked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-200 hover:bg-gray-300',
      !caption && className
    )}>
    
      <span
      className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
      style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }} />
    
    </button>;


  if (!caption) return control;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {control}
      <span className={cn('text-xs font-medium', checked ? 'text-gray-700' : 'text-gray-400')}>{caption}</span>
    </span>);

}