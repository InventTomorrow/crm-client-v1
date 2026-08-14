'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { Pencil } from 'lucide-react';
import type { ServicePlanFormData } from '../types';
import { PlanPreviewCard } from './PlanPreviewCard';

interface PlanPreviewDialogProps {
  /** The plan being previewed, or null when the dialog is closed. */
  plan: ServicePlanFormData | null;
  index: number;
  currency: string;
  disabled?: boolean;
  onEdit: () => void;
  onClose: () => void;
}

/** Read-only look at a single tier, the way a lead would hear it. Editing is a deliberate step
 * out of here rather than something that happens by clicking a field. */
export function PlanPreviewDialog({
  plan,
  index,
  currency,
  disabled = false,
  onEdit,
  onClose,
}: PlanPreviewDialogProps) {
  return (
    <Dialog open={!!plan} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Plan preview</DialogTitle>
          <DialogDescription>How this tier reads when the bot quotes it.</DialogDescription>
        </DialogHeader>

        {plan && <PlanPreviewCard plan={plan} index={index} currency={currency} />}

        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" disabled={disabled} onClick={onEdit}>
            <Pencil size={14} className="mr-1.5" /> Edit plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
