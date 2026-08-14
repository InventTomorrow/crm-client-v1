import type { ResourceConditions, TenantResource } from '../types';

/** Human file size — resources are documents, so KB/MB is the useful range. */
export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes <= 0) return 'Unknown size';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Short file-kind label from a mime type, e.g. "PDF" — the full type is noise in a list. */
export function describeFileKind(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Slides';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Sheet';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Doc';
  return 'File';
}

export function countConditions(conditions: ResourceConditions | null): number {
  return conditions ? Object.keys(conditions).length : 0;
}

/** One readable line per condition, e.g. "budget is 50k-1lac or 1lac+". */
export function describeConditions(conditions: ResourceConditions | null): string[] {
  if (!conditions) return [];
  return Object.entries(conditions).map(
    ([fieldName, allowedValues]) => `${fieldName} is ${allowedValues.join(' or ')}`,
  );
}

/** A resource with no conditions goes to every lead — worth calling out in the UI. */
export function isUnconditional(resource: TenantResource): boolean {
  return countConditions(resource.conditions) === 0;
}
