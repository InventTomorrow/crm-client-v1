"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { StaggerItem, StaggerList } from "@/shared/ui/Motion";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  FileJson,
  FileSpreadsheet,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import {
  useProductImport,
  type ImportFormat,
} from "../hooks/useProductImport";
import { ImportItemCard, isImportItemValid } from "./ImportItemCard";
import { ImportItemEditor } from "./ImportItemEditor";

const FORMATS: {
  id: ImportFormat;
  title: string;
  sub: string;
  accept: string;
  Icon: typeof FileSpreadsheet;
}[] = [
  {
    id: "csv",
    title: "CSV file",
    sub: "Exported from Excel, Sheets or another shop",
    accept: ".csv,text/csv",
    Icon: FileSpreadsheet,
  },
  {
    id: "json",
    title: "JSON file",
    sub: "An export from an API or another system",
    accept: ".json,application/json",
    Icon: FileJson,
  },
];

/** Each stage the progress bar walks through, as a share of the run. */
const STAGES = [
  { at: 0, label: "Reading your file…" },
  { at: 45, label: "Checking the rows…" },
  { at: 80, label: "Preparing the preview…" },
] as const;

/**
 * The whole import, on one page: pick a format, watch the file come in, then
 * check the rows before they are saved.
 *
 * Nothing is written to the catalogue until "Save" — and nothing survives
 * leaving the page, which is why every exit offers the picker again rather than
 * warning about lost work.
 */
export function ImportProductsView() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    phase,
    progress,
    items,
    fileName,
    selectedIndex,
    setSelectedIndex,
    formatRef,
    runImport,
    updateItem,
    removeItem,
    reset,
    saveAll,
    isSaving,
  } = useProductImport();

  const pickFile = (format: ImportFormat) => {
    formatRef.current = format;
    const input = fileRef.current;
    if (!input) return;
    input.accept = FORMATS.find((entry) => entry.id === format)!.accept;
    input.click();
  };

  const allValid = items.length > 0 && items.every(isImportItemValid);
  const invalidCount = items.filter((item) => !isImportItemValid(item)).length;
  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory")}
            disabled={isSaving}
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {phase === "review"
                ? `Review ${items.length} imported product${items.length === 1 ? "" : "s"}`
                : "Import products"}
            </h1>
            <p className="truncate text-[12px] text-[var(--ink-mute)]">
              {phase === "review" && fileName ? `From ${fileName} · ` : ""}
              Nothing is saved until you confirm
            </p>
          </div>
        </div>

        {phase === "choose" && <FormatPicker onPick={pickFile} />}
        {phase === "importing" && <ImportProgress value={progress} />}

        {phase === "review" && (
          <>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <div className="card p-4">
                <StaggerList className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
                  {items.map((item, index) => (
                    <StaggerItem key={`${item.sku || item.name}-${index}`}>
                      <ImportItemCard
                        item={item}
                        index={index}
                        active={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                        onRemove={() => removeItem(index)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </div>

              <div className="card flex flex-col p-5">
                {selectedItem && selectedIndex !== null ? (
                  <ImportItemEditor
                    key={selectedIndex}
                    item={selectedItem}
                    onSave={(item) => updateItem(selectedIndex, item)}
                    onDelete={() => removeItem(selectedIndex)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-6 text-center text-[var(--ink-mute)]">
                    <ImageIcon size={28} className="opacity-30" />
                    <span className="text-[12.5px]">
                      Select a product to edit it
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-[var(--ink-soft)]">
                {allValid ? (
                  <span className="flex items-center gap-1.5">
                    <Check size={12} className="text-[#15803D]" />
                    All {items.length} ready to save
                  </span>
                ) : (
                  <span className="text-[#B45309]">
                    {invalidCount} product{invalidCount === 1 ? "" : "s"} still
                    need a name, price and stock — the ones marked in red
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} disabled={isSaving}>
                  Import another file
                </Button>
                <Button onClick={saveAll} disabled={!allValid || isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save {items.length} product
                      {items.length === 1 ? "" : "s"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void runImport(file, formatRef.current);
          }}
        />
      </div>
    </div>
  );
}

function FormatPicker({
  onPick,
}: Readonly<{ onPick: (format: ImportFormat) => void }>) {
  return (
    <div className="card mx-auto flex w-full max-w-[720px] flex-col gap-3 p-6">
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">
          What kind of file do you have?
        </h2>
        <p className="text-[12px] text-[var(--ink-mute)]">
          Pick one and choose the file — you can fix anything before saving.
        </p>
      </div>

      {FORMATS.map((entry, index) => (
        <motion.button
          key={entry.id}
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + index * 0.07, duration: 0.25 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => onPick(entry.id)}
          className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-4 text-left transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <entry.Icon size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium text-[var(--ink)]">
              {entry.title}
            </span>
            <span className="block text-[11.5px] text-[var(--ink-mute)]">
              {entry.sub}
            </span>
          </span>
        </motion.button>
      ))}

      <p className="text-[11px] text-[var(--ink-mute)]">
        Columns we read: name, sku, price, discountPercentage, stock, category,
        gender, color, sizes, description, image_urls
      </p>
    </div>
  );
}

function ImportProgress({ value }: Readonly<{ value: number }>) {
  const stage = [...STAGES].reverse().find((entry) => value >= entry.at)!;
  const isDone = value >= 100;

  return (
    <div className="card mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 p-8">
      <motion.span
        animate={
          isDone
            ? { scale: 1, opacity: 1 }
            : { scale: [1, 1.06, 1], opacity: 1 }
        }
        transition={
          isDone
            ? { type: "spring", stiffness: 260, damping: 18 }
            : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
      >
        {isDone ? <Check size={22} /> : <Loader2 size={20} className="animate-spin" />}
      </motion.span>

      <div className="h-1.5 w-full max-w-[380px] overflow-hidden rounded-full bg-[var(--surface-2)]">
        <motion.div
          className="h-full rounded-full bg-[var(--accent)]"
          animate={{ width: `${value}%` }}
          transition={{ ease: "easeOut", duration: 0.25 }}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[13px] font-medium text-[var(--ink-soft)]">
          {isDone ? "Ready — showing your products" : stage.label}
        </span>
        <span className="font-[var(--font-mono)] text-[11px] text-[var(--ink-mute)]">
          {value}%
        </span>
      </div>

      <div className="flex gap-1.5">
        {STAGES.map((entry) => (
          <span
            key={entry.label}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              value >= entry.at ? "bg-[var(--accent)]" : "bg-[var(--line)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
