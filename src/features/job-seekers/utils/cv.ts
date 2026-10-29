import type { JobSeekerCv } from "../types";

/** "PDF" when the file is one, otherwise a neutral "File" — a CV can also arrive as a photo. */
export const cvKindLabel = (cv: JobSeekerCv): string =>
  cv.mimeType === "application/pdf" ||
  cv.fileName?.toLowerCase().endsWith(".pdf")
    ? "PDF"
    : "File";
