import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellIcon,
  ChevronRightIcon,
  CommandIcon,
  FileTextIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UploadIcon,
  UserIcon,
  ZapIcon } from
'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';
import { navItems } from '../../data/navigation';
import { clearSession, getStoredUser } from '../../lib/auth';
import { getFraudAlerts, updateFraudAlertStatus, openInvestigation, type FraudAlertItem } from '../../lib/api';
import { Badge } from '../ui/Badge';

interface TopBarProps {
  onOpenMobileNav: () => void;
  sidebarWidth: number;
}

const toneRing = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500'
};

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'quick' | 'profile' | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertItem[]>([]);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentUser = getStoredUser();

  const active = navItems.find((item) =>
  item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );
  const unread = fraudAlerts.filter((alert) => alert.status === 'open').length;

  useEffect(() => {
    let activeRequest = true;

    getFraudAlerts()
      .then((alerts) => {
        if (activeRequest) {
          setFraudAlerts(alerts);
        }
      })
      .catch(() => {
        if (activeRequest) {
          setFraudAlerts([]);
        }
      });

    return () => {
      activeRequest = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => setOpenMenu(null), [location.pathname]);

  async function handleAcknowledgeAlert(alertId: string) {
    setUpdatingAlertId(alertId);

    try {
      const updatedAlert = await updateFraudAlertStatus(alertId, 'acknowledged');
      setFraudAlerts((current) => current.map((alert) => alert.id === alertId ? updatedAlert : alert));
      toast.success('Fraud alert acknowledged', { description: `Alert ${alertId.slice(0, 8)} updated to ${updatedAlert.status}.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Alert update failed';
      toast.error('Acknowledge alert failed', { description: message });
    } finally {
      setUpdatingAlertId(null);
    }
  }

  const quickActions = [
  { id: 'qa1', label: 'Analyze a transaction', icon: ZapIcon, run: () => navigate('/transactions') },
  {
    id: 'qa2',
    label: 'Upload CSV batch',
    icon: UploadIcon,
    run: () => {
      if (location.pathname !== '/') {
        navigate('/');
      }
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('fraudlens:open-upload-csv'));
      }, 0);
    }
  },
  { id: 'qa3', label: 'Generate report', icon: FileTextIcon, run: () => navigate('/reports') },
  { id: 'qa4', label: 'Create policy', icon: PlusIcon, run: () => navigate('/administration') }];


  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur">
      <div ref={containerRef} className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 lg:hidden"
          aria-label="Open navigation">
          
          <MenuIcon className="h-4.5 w-4.5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
          <Link to="/" className="text-gray-400 transition-colors hover:text-gray-700">
            FraudLens
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />
          <span className="text-gray-400">{active?.group ?? 'Operate'}</span>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />
          <span className="truncate font-medium text-gray-900">{active?.label ?? 'Operations Dashboard'}</span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search transactions, customers, cases…"
              aria-label="Search FraudLens"
              className="h-9 w-56 rounded-lg border border-gray-300 bg-white pl-9 pr-14 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all hover:border-gray-400 focus:w-72 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 lg:w-72 lg:focus:w-96" />
            
            <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
              <CommandIcon className="h-2.5 w-2.5" />K
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'quick' ? null : 'quick')}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'quick'}>
              
              <ZapIcon className="h-4 w-4 text-emerald-600" />
              <span className="hidden md:inline">Quick actions</span>
            </button>
            <AnimatePresence>
              {openMenu === 'quick' ?
              <Dropdown>
                  <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Quick actions
                  </p>
                  {quickActions.map((action) =>
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    action.run();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-gray-700 transition-colors hover:bg-gray-50">
                  
                      <action.icon className="h-4 w-4 text-gray-400" />
                      {action.label}
                    </button>
                )}
                </Dropdown> :
              null}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              aria-label={`Notifications, ${unread} unread`}
              aria-expanded={openMenu === 'notifications'}>
              
              <BellIcon className="h-4.5 w-4.5" />
              {unread > 0 ?
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> :
              null}
            </button>
            <AnimatePresence>
              {openMenu === 'notifications' ?
              <Dropdown width="w-[360px]">
                  <div className="flex items-center justify-between px-3 pb-2 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notifications</p>
                    <Badge tone="red">{unread} unread</Badge>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {fraudAlerts.length > 0 ? fraudAlerts.map((item) => {
                      const tone = item.severity === 'critical' || item.severity === 'high' ? 'red' : item.severity === 'medium' ? 'amber' : 'emerald';
                      const title = item.status === 'open' ? 'Fraud alert requires review' : `Fraud alert · ${item.status}`;
                      const isUpdating = updatingAlertId === item.id;

                      return (
                        <li key={item.id}>
                          <div className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50">
                            <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', toneRing[tone])} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-medium text-gray-900">{title}</span>
                              <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                                Alert {item.id.slice(0, 8)} · tx {item.transaction_id.slice(0, 8)} · {item.severity} · {item.status}
                              </span>
                              <span className="mt-1 block text-[11px] text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
                            </span>
                            {item.status === 'open' ? (
                              <button
                                type="button"
                              onClick={() => handleAcknowledgeAlert(item.id)}
                                disabled={isUpdating}
                                className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60">
                                {isUpdating ? 'Updating...' : 'Acknowledge'}
                              </button>
                                  ) : null}
                                  {item.investigation_case == null ? (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setUpdatingAlertId(item.id);
                                        try {
                                        const newCase = await openInvestigation({ fraud_alert_id: item.id, title: `Investigation ${item.id.slice(0,8)}`, status: 'open', priority: 'medium' });
                                          setFraudAlerts((current) => current.map((a) => a.id === item.id ? { ...a, investigation_case: newCase } : a));
                                          toast.success('Investigation opened', { description: `Case ${newCase.id.slice(0,8)} created.` });
                                        } catch (e) {
                                          const message = e instanceof Error ? e.message : 'Open case failed';
                                          toast.error('Open case failed', { description: message });
                                        } finally {
                                          setUpdatingAlertId(null);
                                        }
                                      }}
                                      disabled={isUpdating}
                                      className="ml-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                                      Open case
                                    </button>
                                  ) : null}
                          </div>
                        </li>
                      );
                    }) : (
                      <li className="px-3 py-3 text-[13px] text-gray-500">No fraud alerts to display.</li>
                    )}
                  </ul>
                  <div className="mt-1 border-t border-gray-100 px-3 py-2">
                    <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      toast.success('All notifications marked as read');
                    }}
                    className="text-[12px] font-medium text-emerald-700 transition-colors hover:text-emerald-800">
                    
                      Mark all as read
                    </button>
                  </div>
                </Dropdown> :
              null}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              aria-label="Account menu"
              aria-expanded={openMenu === 'profile'}>
              
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
                {currentUser?.full_name?.split(' ').map((part) => part[0]).slice(0,2).join('') ?? 'U'}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-[13px] font-medium leading-tight text-gray-900">{currentUser?.full_name ?? 'User'}</span>
                <span className="block text-[11px] leading-tight text-gray-500">{currentUser?.role ?? 'User'}</span>
              </span>
            </button>
            <AnimatePresence>
              {openMenu === 'profile' ?
              <Dropdown>
                  <div className="border-b border-gray-100 px-3 pb-3 pt-1">
                    <p className="text-[13px] font-semibold text-gray-900">{currentUser?.full_name ?? 'User'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email ?? 'user@fraudlens.local'}</p>
                  </div>
                  <div className="pt-1">
                    <Link
                    to="/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-gray-700 transition-colors hover:bg-gray-50">
                    
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                    to="/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-gray-700 transition-colors hover:bg-gray-50">
                    
                      <SettingsIcon className="h-4 w-4 text-gray-400" />
                      Preferences
                    </Link>
                    <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      clearSession();
                      navigate('/login', { replace: true });
                      toast('Signed out of this device');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-gray-700 transition-colors hover:bg-gray-50">
                    
                      <LogOutIcon className="h-4 w-4 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                </Dropdown> :
              null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>);

}

function Dropdown({ children, width = 'w-64' }: {children: React.ReactNode;width?: string;}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.14 }}
      role="menu"
      className={cn(
        'absolute right-0 top-[calc(100%+8px)] z-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-soft',
        width
      )}>
      
      {children}
    </motion.div>);

}
