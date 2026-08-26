import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  /** Unique id so multiple tab strips can animate independently on one page. */
  layoutId?: string;
}

export function Tabs({ tabs, active, onChange, className, layoutId = 'tab-underline' }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex items-center gap-1 overflow-x-auto border-b border-gray-200', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-2.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              isActive ? 'text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            )}>
            
            {tab.label}
            {typeof tab.count === 'number' ?
            <span
              className={cn(
                'tabular rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              )}>
              
                {tab.count}
              </span> :
            null}
            {isActive ?
            <motion.span
              layoutId={layoutId}
              className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-emerald-600"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }} /> :

            null}
          </button>);

      })}
    </div>);

}