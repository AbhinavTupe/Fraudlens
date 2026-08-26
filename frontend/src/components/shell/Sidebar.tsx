import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PanelLeftCloseIcon, PanelLeftOpenIcon, ScanEyeIcon, SparklesIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { navItems } from '../../data/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const groups: Array<NonNullable<(typeof navItems)[number]['group']>> = ['Operate', 'Analyze', 'Govern'];

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {mobileOpen ?
      <div className="fixed inset-0 z-40 bg-gray-900/25 lg:hidden" onClick={onCloseMobile} aria-hidden="true" /> :
      null}
      <motion.aside
        animate={{ width: collapsed ? 76 : 264 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-200 lg:translate-x-0'
        )}>
        
        <div
          className={cn('flex h-16 items-center border-b border-gray-100', collapsed ? 'justify-center px-3' : 'gap-2.5 px-5')}>
          
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <ScanEyeIcon className="h-4.5 w-4.5" />
          </span>
          {!collapsed ?
          <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-gray-900">FraudLens</p>
              <p className="truncate text-[11px] text-gray-500">Decision Intelligence</p>
            </div> :
          null}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
          {groups.map((group) =>
          <div key={group} className="mb-5 last:mb-0">
              {!collapsed ?
            <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group}</p> :

            <div className="mx-auto mb-2 h-px w-6 bg-gray-100" aria-hidden="true" />
            }
              <ul className="space-y-0.5">
                {navItems.
              filter((item) => item.group === group).
              map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                        <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                      cn(
                        'group relative flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
                        collapsed ? 'h-10 justify-center' : 'h-9 gap-2.5 px-2.5',
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )
                      }>
                      
                          {({ isActive }) =>
                      <>
                              {isActive && !collapsed ?
                        <span
                          className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-emerald-600"
                          aria-hidden="true" /> :

                        null}
                              <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                          )} />
                        
                              {!collapsed ? <span className="flex-1 truncate">{item.shortLabel}</span> : null}
                              {!collapsed && item.badge ?
                        <span className="tabular rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                  {item.badge}
                                </span> :
                        null}
                            </>
                      }
                        </NavLink>
                      </li>);

              })}
              </ul>
            </div>
          )}
        </nav>

        {!collapsed ?
        <div className="mx-3 mb-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-[12px] font-semibold text-emerald-800">Sentinel v4.2 healthy</p>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-emerald-700/80">Drift 0.03 · p99 41ms · 284 features live</p>
          </div> :
        null}

        <div className={cn('border-t border-gray-100 p-3', collapsed && 'flex justify-center')}>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'flex h-9 items-center rounded-lg text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              collapsed ? 'w-9 justify-center' : 'w-full gap-2.5 px-2.5'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            
            {collapsed ? <PanelLeftOpenIcon className="h-4 w-4" /> : <PanelLeftCloseIcon className="h-4 w-4" />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        </div>
      </motion.aside>
    </>);

}