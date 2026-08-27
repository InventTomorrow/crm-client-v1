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
import { Label } from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';
import type { ClinicalService } from '@/features/clinical-services/types';
import { AlertTriangle, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useBulkUpsertCoverage } from '../hooks/useClinicCoverage';
import {
  COVERAGE_CSV_TEMPLATE,
  parseCoverageCsv,
  type CsvParseResult,
} from '../utils/parseCoverageCsv';

interface CoverageCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ClinicalService[];
}

/**
 * Bulk coverage entry. A clinic with 8 services across 20 areas is 160 cells —
 * clicking each one is not a realistic way to set this up.
 */
export function CoverageCsvImportDialog({
  open,
  onOpenChange,
  services,
}: CoverageCsvImportDialogProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<CsvParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkUpsert = useBulkUpsertCoverage();

  const handleParse = (nextText: string) => {
    setText(nextText);
    setPreview(nextText.trim() ? parseCoverageCsv(nextText, services) : null);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    handleParse(await file.text());
  };

  const handleImport = async () => {
    if (!preview?.rows.length) return;
    await bulkUpsert.mutateAsync(preview.rows);
    setText('');
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import coverage</DialogTitle>
          <DialogDescription>
            One row per service and area. Service names must match your
            catalogue exactly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Choose CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleParse(COVERAGE_CSV_TEMPLATE)}
            >
              Use the example
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="csv">Or paste rows</Label>
            <Textarea
              id="csv"
              rows={8}
              className="font-mono text-xs"
              placeholder={COVERAGE_CSV_TEMPLATE}
              value={text}
              onChange={(event) => handleParse(event.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Columns: service, city, area, coverage, priceMin, priceMax,
              leadTimeNote. Leave the area blank for a whole-city row. Coverage
              is AVAILABLE, LIMITED or UNAVAILABLE.
            </p>
          </div>

          {preview && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm">
                <span className="font-medium">{preview.rows.length}</span> row
                {preview.rows.length === 1 ? '' : 's'} ready
                {preview.errors.length > 0 && (
                  <span className="text-destructive">
                    {' '}
                    · {preview.errors.length} skipped
                  </span>
                )}
              </p>

              {preview.errors.length > 0 && (
                <ul className="space-y-1">
                  {preview.errors.slice(0, 6).map((error) => (
                    <li
                      key={`${error.line}-${error.message}`}
                      className="text-muted-foreground flex items-start gap-1.5 text-xs"
                    >
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                      <span>
                        Line {error.line}: {error.message}
                      </span>
                    </li>
                  ))}
                  {preview.errors.length > 6 && (
                    <li className="text-muted-foreground text-xs">
                      …and {preview.errors.length - 6} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!preview?.rows.length || bulkUpsert.isPending}
          >
            Import {preview?.rows.length ? `${preview.rows.length} rows` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
