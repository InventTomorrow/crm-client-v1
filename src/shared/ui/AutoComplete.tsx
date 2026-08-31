"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/shared/ui/ScrollArea";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";

const inputVariants = cva(
  "outline-none flex w-full min-w-0 text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 [[readonly]]:bg-muted/80 [[readonly]]:cursor-not-allowed border border-input focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg bg-transparent dark:bg-input/30 dark:disabled:bg-input/80 text-base md:text-sm transition-colors focus-visible:ring-ring/50 focus-visible:ring-3 aria-invalid:ring-3",
  {
    variants: {
      size: {
        sm: "h-8 px-2 [&~[data-slot=autocomplete-clear]]:end-1.5 [&~[data-slot=autocomplete-trigger]]:end-1.5",
        default:
          "h-10 px-2.5 py-1 [&~[data-slot=autocomplete-clear]]:end-1.75 [&~[data-slot=autocomplete-trigger]]:end-1.75",
        lg: "h-11 px-3 [&~[data-slot=autocomplete-clear]]:end-2 [&~[data-slot=autocomplete-trigger]]:end-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const Autocomplete = AutocompletePrimitive.Root;

function AutocompleteValue({ ...props }: AutocompletePrimitive.Value.Props) {
  return (
    <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
  );
}

function AutocompleteInput({
  className,
  size = "default",
  showClear = false,
  showTrigger = false,
  ...props
}: Omit<AutocompletePrimitive.Input.Props, "size"> &
  VariantProps<typeof inputVariants> & {
    showClear?: boolean;
    showTrigger?: boolean;
  }) {
  return (
    <div className="relative w-full">
      <AutocompletePrimitive.Input
        data-slot="autocomplete-input"
        data-size={size}
        className={cn(inputVariants({ size }), className)}
        {...props}
      />
      {showTrigger && <AutocompleteTrigger />}
      {showClear && <AutocompleteClear />}
    </div>
  );
}

function AutocompleteStatus({
  className,
  ...props
}: AutocompletePrimitive.Status.Props) {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-sm empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompletePortal({ ...props }: AutocompletePrimitive.Portal.Props) {
  return (
    <AutocompletePrimitive.Portal data-slot="autocomplete-portal" {...props} />
  );
}

function AutocompleteBackdrop({
  ...props
}: AutocompletePrimitive.Backdrop.Props) {
  return (
    <AutocompletePrimitive.Backdrop
      data-slot="autocomplete-backdrop"
      {...props}
    />
  );
}

function AutocompletePositioner({
  className,
  ...props
}: AutocompletePrimitive.Positioner.Props) {
  return (
    <AutocompletePrimitive.Positioner
      data-slot="autocomplete-positioner"
      // Above the dialog layer, not level with it. The popup portals to body as
      // a SIBLING of a dialog, so at a shared z-50 the modal overlay takes the
      // pointer events and the list paints on top while being unclickable.
      className={cn("z-[60] outline-none", className)}
      {...props}
    />
  );
}

function AutocompleteList({
  className,
  scrollAreaClassName,
  ...props
}: AutocompletePrimitive.List.Props & {
  scrollAreaClassName?: string;
  scrollFade?: boolean;
  scrollbarGutter?: boolean;
}) {
  return (
    <ScrollArea
      className={cn(
        "size-full min-h-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain",
        scrollAreaClassName,
      )}
    >
      <AutocompletePrimitive.List
        data-slot="autocomplete-list"
        className={cn(
          "not-empty:px-1 not-empty:py-1 not-empty:scroll-py-1 in-data-has-overflow-y:me-3",
          className,
        )}
        {...props}
      />
    </ScrollArea>
  );
}

function AutocompleteCollection({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Collection>) {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

function AutocompleteRow({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Row>) {
  return (
    <AutocompletePrimitive.Row
      data-slot="autocomplete-row"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function AutocompleteItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "text-foreground data-highlighted:text-foreground data-highlighted:before:bg-accent-soft gap-1.5",
        "rounded-md",
        "data-highlighted:before:rounded-md",
        "px-1.5 py-1 text-sm ([class*='size-'])]:size-4 ([class*='size-'])]:size-4 [&_svg:not([class*='size-'])]:size-4 ([class*='size-'])]:size-4 ([class*='size-'])]:size-3.5 ([class*='size-'])]:size-4 ([class*='size-'])]:size-3.5 relative flex cursor-default items-center outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:relative data-highlighted:z-0 data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([role=img]):not([class*=text-])]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export interface AutocompleteContentProps extends React.ComponentProps<
  typeof AutocompletePrimitive.Popup
> {
  align?: AutocompletePrimitive.Positioner.Props["align"];
  sideOffset?: AutocompletePrimitive.Positioner.Props["sideOffset"];
  alignOffset?: AutocompletePrimitive.Positioner.Props["alignOffset"];
  side?: AutocompletePrimitive.Positioner.Props["side"];
  anchor?: AutocompletePrimitive.Positioner.Props["anchor"];
  showBackdrop?: boolean;
}

/** Modal layers a popup must portal *into* rather than alongside — see below. */
const MODAL_CONTENT_SELECTOR =
  "[data-slot=dialog-content],[data-slot=alert-dialog-content],[data-slot=sheet-content],[data-slot=drawer-content]";

/**
 * The modal ancestor to portal into, or null when there is none.
 *
 * Radix's modal layers set `pointer-events: none` on <body> and re-enable it only
 * inside their own subtree, so a popup portalled to the body paints above the
 * dialog while taking no pointer events at all — the cursor falls straight
 * through to whatever sits underneath. A click there also reads as an
 * interact-outside and closes the dialog. Portalling into the layer's own content
 * node avoids both, and Base UI's positioner still places the popup against the
 * viewport.
 */
function useModalPortalContainer() {
  const probeRef = React.useRef<HTMLSpanElement>(null);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setContainer(
      probeRef.current?.closest<HTMLElement>(MODAL_CONTENT_SELECTOR) ?? null,
    );
  }, []);

  return { probeRef, container };
}

function AutocompleteContent({
  className,
  children,
  showBackdrop = false,
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  side = "bottom",
  anchor,
  ...props
}: AutocompleteContentProps) {
  const { probeRef, container } = useModalPortalContainer();

  return (
    <>
      <span ref={probeRef} hidden aria-hidden />
      <AutocompletePortal container={container ?? undefined}>
        {showBackdrop && <AutocompleteBackdrop />}
        <AutocompletePositioner
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          side={side}
          anchor={anchor}
        >
          <div className="relative flex max-h-full">
            <AutocompletePrimitive.Popup
              data-slot="autocomplete-popup"
              className={cn(
                "bg-popover text-popover-foreground rounded-lg shadow-md ring-foreground/10 flex max-h-[min(var(--available-height),24rem)] w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) scroll-pt-2 scroll-pb-2 flex-col overscroll-contain py-0.5 ring-1 transition-[scale,opacity] has-data-starting-style:scale-98 has-data-starting-style:opacity-0 has-data-[side=none]:scale-100 has-data-[side=none]:transition-none",
                className,
              )}
              {...props}
            >
              {children}
            </AutocompletePrimitive.Popup>
          </div>
        </AutocompletePositioner>
      </AutocompletePortal>
    </>
  );
}

function AutocompleteGroup({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Group>) {
  return (
    <AutocompletePrimitive.Group data-slot="autocomplete-group" {...props} />
  );
}

function AutocompleteGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.GroupLabel>) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-group-label"
      className={cn(
        "text-muted-foreground px-1.5 py-1 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-sm text-center empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteClear({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Clear>) {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
      className={cn(
        "ring-offset-background focus:ring-ring absolute top-1/2 -translate-y-1/2 cursor-pointer opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      <XIcon className="size-4" />
    </AutocompletePrimitive.Clear>
  );
}

function AutocompleteTrigger({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Trigger>) {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        "focus:ring-ring ring-offset-background absolute top-1/2 -translate-y-1/2 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none has-[+[data-slot=autocomplete-clear]]:hidden data-disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      <ChevronsUpDownIcon className="size-4 opacity-70" />
    </AutocompletePrimitive.Trigger>
  );
}

function AutocompleteArrow({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Arrow>) {
  return (
    <AutocompletePrimitive.Arrow data-slot="autocomplete-arrow" {...props} />
  );
}

function AutocompleteSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) {
  return (
    <AutocompletePrimitive.Separator
      data-slot="autocomplete-separator"
      className={cn("bg-border my-1.5 h-px", className)}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteArrow,
  AutocompleteBackdrop,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRow,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
  AutocompleteValue,
};
