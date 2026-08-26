import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, footer, width = 'max-w-lg', children }: ModalProps) {
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={title}>
        
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px]"
          onClick={onClose} />
        
          <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className={cn(
            'relative max-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft',
            width
          )}>
          
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">{title}</h2>
                {description ? <p className="mt-1 text-[13px] leading-5 text-gray-500">{description}</p> : null}
              </div>
              <button
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
              
                <XIcon className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer ?
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                {footer}
              </footer> :
          null}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}