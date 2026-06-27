'use client';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red styling + warning icon for destructive actions (default true). */
  destructive?: boolean;
  /** Shows a spinner and disables actions while the confirm action runs. */
  loading?: boolean;
  /** Optional second action (e.g. "Delete for everyone") shown beside confirm. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * Reusable confirmation dialog. Use for any "are you sure?" action
 * (delete, archive, disconnect, etc.) instead of window.confirm.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  secondaryLabel,
  onSecondary,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[420px] overflow-hidden" showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-3 px-5 py-4">
          <span
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
              destructive ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[var(--accent-soft)] text-[var(--accent)]',
            )}
          >
            <AlertTriangle size={18} />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-[15.5px] font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-[12.5px] mt-1 text-[var(--ink-mute)] leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-[var(--line)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          {secondaryLabel && onSecondary && (
            <Button
              type="button"
              onClick={onSecondary}
              disabled={loading}
              variant={destructive ? 'outline' : 'outline'}
              className={cn(
                destructive && 'text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2]',
              )}
            >
              {secondaryLabel}
            </Button>
          )}
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            variant={destructive ? 'destructive' : 'default'}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
