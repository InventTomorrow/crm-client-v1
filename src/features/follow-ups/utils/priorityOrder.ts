import type { FollowUpLeadStatus } from '../types';

export function moveStatusInPriority(
  priority: readonly FollowUpLeadStatus[],
  status: FollowUpLeadStatus,
  direction: -1 | 1,
): FollowUpLeadStatus[] {
  const fromIndex = priority.indexOf(status);
  const toIndex = fromIndex + direction;
  if (fromIndex === -1 || toIndex < 0 || toIndex >= priority.length) return [...priority];

  const reordered = [...priority];
  [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex]!, reordered[fromIndex]!];
  return reordered;
}

// A newly included status goes last, so turning one on never reshuffles the rest.
export function toggleStatusInPriority(
  priority: readonly FollowUpLeadStatus[],
  status: FollowUpLeadStatus,
): FollowUpLeadStatus[] {
  return priority.includes(status)
    ? priority.filter((includedStatus) => includedStatus !== status)
    : [...priority, status];
}
