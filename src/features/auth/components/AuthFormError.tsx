import { AlertCircle } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils";

/** Inline auth error banner shown directly above the form fields. */
export function AuthFormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 px-3 py-2.5 text-[12.5px] font-medium text-[var(--destructive)]"
    >
      <AlertCircle size={15} className="mt-px flex-shrink-0" />
      <span>{extractErrorMessage(error)}</span>
    </div>
  );
}
