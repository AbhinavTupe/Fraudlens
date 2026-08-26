import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: Array<{value: string;label: string;}>;
}

export function Select({ label, hint, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? props.name ?? label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className="w-full">
      {label ?
      <label htmlFor={selectId} className="mb-1.5 block text-[13px] font-medium text-gray-700">
          {label}
        </label> :
      null}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'h-9 w-full appearance-none truncate rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
            className
          )}
          {...props}>
          
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {hint ? <p className="mt-1.5 text-xs leading-5 text-gray-500">{hint}</p> : null}
    </div>);

}