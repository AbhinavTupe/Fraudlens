import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{className?: string;}>;
  label?: string;
  hint?: string;
  suffix?: React.ReactNode;
}

export function Input({ icon: Icon, label, hint, suffix, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label?.replace(/\s+/g, '-').toLowerCase();
  const hintId = hint ? `${inputId}-hint` : undefined;
  return (
    <div className="w-full">
      {label ?
      <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-gray-700">
          {label}
        </label> :
      null}
      <div className="relative">
        {Icon ?
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /> :
        null}
        <input
          id={inputId}
          aria-describedby={hintId}
          className={cn(
            'h-9 w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
            Icon ? 'pl-9' : 'pl-3',
            suffix ? 'pr-16' : 'pr-3',
            className
          )}
          {...props} />
        
        {suffix ?
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
            {suffix}
          </span> :
        null}
      </div>
      {hint ?
      <p id={hintId} className="mt-1.5 text-xs leading-5 text-gray-500">
          {hint}
        </p> :
      null}
    </div>);

}