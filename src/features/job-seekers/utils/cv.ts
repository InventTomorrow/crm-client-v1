import { getImageUrl } from "@/lib/utils";
import type { JobSeekerCv } from "../types";

type CvFileInfo = Pick<JobSeekerCv, "fileName" | "mimeType">;

/** "PDF" when the file is one, otherwise a neutral "File" — a CV can also arrive as a photo. */
export const cvKindLabel = (cv: CvFileInfo): string =>
  cv.mimeType === "application/pdf" ||
  cv.fileName?.toLowerCase().endsWith(".pdf")
    ? "PDF"
    : "File";

/** Same session-authenticated URL the previews use, so private files open too. */
export const getCvViewUrl = (cvUrl: string): string =>
  getImageUrl(cvUrl) ?? cvUrl;

/** A cross-origin `<a download>` is ignored by browsers, so the file is fetched and saved from a blob. */
export async function downloadCv(
  cvUrl: string,
  fileName: string,
): Promise<void> {
  const response = await fetch(getCvViewUrl(cvUrl), { credentials: "include" });
  if (!response.ok) throw new Error("Could not fetch the CV");

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
