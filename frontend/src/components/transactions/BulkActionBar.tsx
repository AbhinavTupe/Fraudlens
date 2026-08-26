import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  DownloadIcon,
  ShieldAlertIcon,
  Trash2Icon,
  UserPlusIcon,
  XIcon,
  ClipboardListIcon } from
'lucide-react';
import { Button } from '../ui/Button';

interface BulkActionBarProps {
  count: number;
  isAdmin: boolean;
  onClear: () => void;
  onApprove: () => void;
  onReview: () => void;
  onExport: () => void;
  onAssign: () => void;
  onDelete: () => void;
}

/**
 * Sticky bulk action bar. Appears when rows are selected so the actions stay reachable
 * no matter how far the analyst has scrolled.
 */
export function BulkActionBar({
  count,
  isAdmin,
  onClear,
  onApprove,
  onReview,
  onExport,
  onAssign,
  onDelete
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 ?
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5 sm:px-6"
        role="region"
        aria-label="Bulk actions">
        
          <div className="pointer-events-auto flex w-full max-w-4xl flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-bar">
            <div className="flex items-center gap-2.5">
              <span className="tabular flex h-7 min-w-7 items-center justify-center rounded-lg bg-emerald-600 px-2 text-[13px] font-semibold text-white">
                {count}
              </span>
              <p className="text-[13px] font-medium text-gray-900">
                {count === 1 ? 'case selected' : 'cases selected'}
              </p>
              <button
              type="button"
              onClick={onClear}
              className="ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
              
                <XIcon className="h-3 w-3" /> Clear
              </button>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" icon={UserPlusIcon} onClick={onAssign}>
                Assign analyst
              </Button>
              <Button size="sm" variant="secondary" icon={DownloadIcon} onClick={onExport}>
                Export
              </Button>
              <Button size="sm" variant="secondary" icon={ClipboardListIcon} onClick={onReview}>
                Manual review
              </Button>
              <Button size="sm" variant="primary" icon={CheckCircle2Icon} onClick={onApprove}>
                Approve
              </Button>
              {isAdmin ?
            <Button size="sm" variant="danger" icon={Trash2Icon} onClick={onDelete}>
                  Delete
                </Button> :

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] font-medium text-gray-400">
                  <ShieldAlertIcon className="h-3 w-3" /> Delete is admin only
                </span>
            }
            </div>
          </div>
        </motion.div> :
      null}
    </AnimatePresence>);

}