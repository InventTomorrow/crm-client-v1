'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/Sheet';
import { CoverageLegend } from './CoverageLegend';

interface CoverageHelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SETUP_STEPS = [
  {
    title: 'Add your locations',
    detail:
      'Each city or area becomes a column. Leave the area blank to cover a whole city.',
  },
  {
    title: 'Add your clinical services',
    detail: 'Active services become the rows. The grid needs both to appear.',
  },
  {
    title: 'Set each cell',
    detail:
      'Changes save as you pick them — there is no separate save button. Use Import for a large grid.',
  },
];

/**
 * The context that used to sit permanently at the top of the page. It is read
 * once and then in the way, so it lives behind the header's help button and
 * opens from the bottom, where it can be dismissed without losing the grid.
 */
export function CoverageHelpSheet({ open, onOpenChange }: CoverageHelpSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="gap-0 overflow-hidden rounded-t-2xl p-0 data-[side=bottom]:max-h-[85vh]"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>How coverage works</SheetTitle>
          <SheetDescription>A one-minute read before you fill the grid.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-6">
          <div className="rounded-lg border border-info/30 bg-info/4 p-4">
            <p className="text-sm leading-relaxed">
              Coverage says the clinic <strong>operates</strong> somewhere. It is
              never a promise that staff are free.
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              The assistant always says a coordinator will confirm, and anything
              other than &ldquo;Available&rdquo; is handed to a human.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Setting it up</p>
            <ol className="mt-3 space-y-3">
              {SETUP_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="bg-muted mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">
                    <span className="font-medium">{step.title}</span>
                    <span className="text-muted-foreground block text-xs">
                      {step.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <CoverageLegend />
        </div>
      </SheetContent>
    </Sheet>
  );
}
