"use client";
import { Button } from "@/shared/ui/Button";
import { FileUpload, type FileUploadProps } from "@/shared/ui/FileUpload";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MAX_CV_FILE_SIZE_BYTES, type JobSeekerFormValues } from "../types";
import { cvKindLabel, downloadCv, getCvViewUrl } from "../utils/cv";

type JobSeekerCvFieldProps = Pick<
  FileUploadProps,
  "onUpload" | "isUploading" | "progress" | "uploadPhase" | "disabled"
> & {
  cv: JobSeekerFormValues["cv"];
  onRemove: () => void;
};

/** Square drop zone that doubles as the preview, with the file name and view/download below it. */
export function JobSeekerCvField({
  cv,
  onRemove,
  disabled,
  ...uploadProps
}: JobSeekerCvFieldProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = async () => {
    if (!cv) return;
    setIsDownloading(true);
    try {
      await downloadCv(cv.url, cv.fileName ?? cv.url.split("/").pop() ?? "cv");
    } catch {
      toast.error("Could not download the CV. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex w-full max-w-64 flex-col gap-3">
      <FileUpload
        {...uploadProps}
        value={cv?.url ?? null}
        onChange={(url) => {
          if (!url) onRemove();
        }}
        accept="application/pdf,image/*"
        maxSize={MAX_CV_FILE_SIZE_BYTES}
        title="Upload CV"
        description="Drop the CV here"
        hint="PDF or photo · up to 10 MB"
        disabled={disabled}
      />

      {cv && (
        <>
          <div className="flex items-start gap-2.5">
            <FileText
              size={18}
              className="mt-0.5 shrink-0 text-[var(--accent)]"
            />
            <div className="min-w-0">
              <p
                className="truncate text-[13px] text-[var(--ink)]"
                title={cv.fileName ?? undefined}
              >
                {cv.fileName ?? "CV"}
              </p>
              <p className="text-[11.5px] text-[var(--ink-mute)]">
                {cvKindLabel(cv)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <a
                href={getCvViewUrl(cv.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" /> View
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={disabled || isDownloading}
              onClick={downloadFile}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
