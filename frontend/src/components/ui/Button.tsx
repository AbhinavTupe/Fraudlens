import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentType<{className?: string;}>;
  iconRight?: React.ComponentType<{className?: string;}>;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
  'bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 active:bg-emerald-800 shadow-sm focus-visible:ring-emerald-500',
  secondary:
  'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 active:bg-gray-100 shadow-sm focus-visible:ring-gray-400',
  ghost:
  'bg-transparent text-gray-600 border border-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus-visible:ring-gray-400',
  danger:
  'bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-500',
  subtle: 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-400'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl'
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  fullWidth,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}>
      
      {Icon ? <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} /> : null}
      {children}
      {IconRight ? <IconRight className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} /> : null}
    </button>);

}