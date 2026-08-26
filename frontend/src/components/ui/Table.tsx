import { cn } from '../../utils/cn';

export function Table({
  children,
  className,
  minWidth = 'min-w-[720px]'




}: {children: React.ReactNode;className?: string;minWidth?: string;}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left', minWidth, className)}>{children}</table>
    </div>);

}

export function THead({ children }: {children: React.ReactNode;}) {
  return <thead className="bg-gray-50/80">{children}</thead>;
}

export function TBody({ children }: {children: React.ReactNode;}) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

interface ThProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function Th({ children, className, align = 'left' }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap border-b border-gray-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}>
      
      {children}
    </th>);

}

export function Tr({
  children,
  className,
  onClick,
  selected





}: {children: React.ReactNode;className?: string;onClick?: () => void;selected?: boolean;}) {
  return (
    <tr
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
      onClick ?
      (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } :
      undefined
      }
      className={cn(
        'transition-colors duration-100 focus:outline-none',
        onClick &&
        'cursor-pointer hover:bg-gray-50 focus-visible:bg-emerald-50/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40',
        selected && 'bg-emerald-50/60 hover:bg-emerald-50',
        className
      )}>
      
      {children}
    </tr>);

}

export function Td({
  children,
  className,
  align = 'left',
  colSpan





}: {children?: React.ReactNode;className?: string;align?: 'left' | 'right' | 'center';colSpan?: number;}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        'px-4 py-3.5 align-middle text-sm text-gray-700',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}>
      
      {children}
    </td>);

}