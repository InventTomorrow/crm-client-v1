import type { Lead, LeadStatusMeta } from "../types";
import { STATUS_META } from "../types";

const CHANNEL_LABEL: Record<string, string> = {
  wa: "WhatsApp",
  ig: "Instagram",
  fb: "Facebook",
  tk: "TikTok",
};

function toCsv(
  rows: Lead[],
  statusMeta: Record<string, LeadStatusMeta>,
): string {
  const headers = ["Name", "Phone", "Email", "City", "Channel", "Status"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const l of rows) {
    lines.push(
      [
        l.name,
        l.phone ?? "",
        l.email ?? "",
        l.city,
        CHANNEL_LABEL[l.channel] ?? l.channel,
        statusMeta[l.status]?.label ?? l.status,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}

/** Builds a CSV from the given leads and triggers a browser download. Status
 * labels come from the caller so a clinic exports its own vocabulary. */
export function downloadLeadsCsv(
  rows: Lead[],
  filename?: string,
  statusMeta: Record<string, LeadStatusMeta> = STATUS_META,
) {
  const csv = toCsv(rows, statusMeta);
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename?.trim() || `leads_export_${new Date().toISOString().split("T")[0]}`}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
