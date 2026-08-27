'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  useAddTimeOff,
  usePractitionerTimeOff,
  useRemoveTimeOff,
} from '../hooks/usePractitioners';
import {
  practitionerDisplayName,
  timeOffFormSchema,
  type Practitioner,
} from '../types';

interface PractitionerTimeOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practitioner: Practitioner | null;
}

const formatRange = (startsAt: string, endsAt: string): string => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
  const time = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

  return date.format(start) === date.format(end)
    ? `${date.format(start)}, ${time.format(start)} – ${time.format(end)}`
    : `${date.format(start)} – ${date.format(end)}`;
};

/** Leave and blocked windows. Anything listed here is subtracted from this
 *  practitioner's offerable slots. */
export function PractitionerTimeOffDialog({
  open,
  onOpenChange,
  practitioner,
}: PractitionerTimeOffDialogProps) {
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const timeOffQuery = usePractitionerTimeOff(practitioner?.id);
  const addTimeOff = useAddTimeOff(practitioner?.id ?? '');
  const removeTimeOff = useRemoveTimeOff(practitioner?.id ?? '');

  const handleAdd = async () => {
    const parsed = timeOffFormSchema.safeParse({ startsAt, endsAt, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the dates');
      return;
    }

    await addTimeOff.mutateAsync({
      startsAt: new Date(parsed.data.startsAt).toISOString(),
      endsAt: new Date(parsed.data.endsAt).toISOString(),
      ...(parsed.data.reason ? { reason: parsed.data.reason } : {}),
    });

    setStartsAt('');
    setEndsAt('');
    setReason('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Time off
            {practitioner ? ` — ${practitionerDisplayName(practitioner)}` : ''}
          </DialogTitle>
          <DialogDescription>
            Leave, conferences or blocked afternoons. These times stop being
            offered to patients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startsAt">From</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endsAt">To</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="Annual leave"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            onClick={handleAdd}
            disabled={addTimeOff.isPending}
            className="w-full"
          >
            <Plus className="size-4" />
            Add time off
          </Button>

          <div className="space-y-2">
            {timeOffQuery.isLoading && <Skeleton className="h-10 w-full" />}

            {timeOffQuery.data?.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No time off booked.
              </p>
            )}

            {timeOffQuery.data?.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {formatRange(block.startsAt, block.endsAt)}
                  </p>
                  {block.reason && (
                    <p className="text-muted-foreground truncate text-xs">
                      {block.reason}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive shrink-0"
                  disabled={removeTimeOff.isPending}
                  onClick={() => removeTimeOff.mutate(block.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
