import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  eyebrow,
  footer,
  width = 'max-w-[640px]',
  children
}: DrawerProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px]"
          onClick={onClose} />
        
          <motion.aside
          initial={{ x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 48, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          className={cn('relative flex h-full w-full flex-col bg-white shadow-drawer', width)}>
          
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div className="min-w-0">
                {eyebrow ? <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
                <h2 className="text-lg font-semibold leading-6 tracking-tight text-gray-900">{title}</h2>
                {subtitle ? <p className="mt-1 text-[13px] leading-5 text-gray-500">{subtitle}</p> : null}
              </div>
              <button
              onClick={onClose}
              aria-label="Close panel"
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
              
                <XIcon className="h-4.5 w-4.5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer ? <footer className="border-t border-gray-200 bg-gray-50/70 px-6 py-4">{footer}</footer> : null}
          </motion.aside>
        </div> :
      null}
    </AnimatePresence>);

}