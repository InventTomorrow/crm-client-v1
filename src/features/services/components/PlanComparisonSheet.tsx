'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/Carousel';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/Sheet';
import type { ServicePlanFormData } from '../types';
import { PlanPreviewCard } from './PlanPreviewCard';

interface PlanComparisonSheetProps {
  plans: ServicePlanFormData[];
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Every tier side by side, read-only — this is for checking the ladder makes sense, so nothing
 * here writes back to the form. Editing stays on the individual plan. */
export function PlanComparisonSheet({
  plans,
  currency,
  open,
  onOpenChange,
}: PlanComparisonSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* The side variant sets its own inset and height, so overrides have to be variant-qualified
          too. Sitting off the edges keeps it reading as a panel rather than a second page. */}
      <SheetContent
        side="bottom"
        className="gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] data-[side=bottom]:inset-x-3 data-[side=bottom]:bottom-3 data-[side=bottom]:h-[88vh] data-[state=closed]:duration-250 data-[state=closed]:ease-in md:data-[side=bottom]:inset-x-6 md:data-[side=bottom]:bottom-5"
      >
        <SheetHeader className="border-b border-[var(--line)] px-5 py-4">
          <SheetTitle>Compare plans</SheetTitle>
          <SheetDescription>
            {plans.length} tier{plans.length === 1 ? '' : 's'} in the order the bot leads with them.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 px-5 py-5 md:px-12">
          <Carousel opts={{ align: 'start' }} className="h-full">
            {/* Slides need a definite height, otherwise a long feature list stretches the card
                past the sheet instead of scrolling inside it. */}
            <CarouselContent className="items-stretch">
              {plans.map((plan, index) => (
                <CarouselItem
                  key={plan.key}
                  className="h-[calc(88vh-9.5rem)] basis-full sm:basis-1/2 xl:basis-1/3"
                >
                  <PlanPreviewCard plan={plan} index={index} currency={currency} fillHeight />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Arrows sit in the desktop gutter; narrow screens swipe instead of covering a card */}
            <CarouselPrevious className="hidden -left-9 md:inline-flex" />
            <CarouselNext className="hidden -right-9 md:inline-flex" />
          </Carousel>
        </div>
      </SheetContent>
    </Sheet>
  );
}
