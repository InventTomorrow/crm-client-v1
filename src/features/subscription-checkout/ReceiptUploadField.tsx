"use client";
import { FileUpload } from "@/shared/ui/FileUpload";
import { usePublicReceiptUpload } from "./hooks";

interface ReceiptUploadFieldProps {
  token: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

/**
 * Payment-proof uploader for the public checkout page. Posts multipart to the
 * unauthenticated /subscribe/:token/receipt endpoint (not the tenant-scoped
 * presign flow) and hands the returned URL back to the form.
 */
export function ReceiptUploadField({
  token,
  value,
  onChange,
  disabled,
}: ReceiptUploadFieldProps) {
  const { upload, isPending, progress } = usePublicReceiptUpload(token);

  return (
    <FileUpload
      value={value || null}
      onChange={(url) => onChange(url ?? "")}
      onUpload={upload}
      isUploading={isPending}
      progress={progress}
      disabled={disabled}
      accept="image/jpeg,image/png,image/webp,application/pdf"
      maxSize={10 * 1024 * 1024}
      compact
      compactHeight="h-[120px]"
      title="Upload payment receipt"
      description="Screenshot or PDF of your transfer"
      hint="JPG, PNG, WEBP or PDF • Max 10MB"
    />
  );
}
