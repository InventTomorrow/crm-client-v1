'use client';
import { useCallback, useRef, useState } from 'react';
import type { DuplicatePhoneMatch } from '../types';
import { localPhoneDigits } from '../utils/phone';
import { useCheckDuplicatePhones } from './useLeads';

export interface PhoneConflict {
  message: string;
  /** Blocking conflicts stop the save; non-blocking ones are warnings only. */
  blocking: boolean;
}

/** An archived match is restored by the upsert, so it warns rather than blocks. */
export const describeConflict = (match: DuplicatePhoneMatch): PhoneConflict =>
  match.archived
    ? { message: `Matches archived lead ${match.name ?? match.phone} — it will be restored`, blocking: false }
    : { message: `Already exists as ${match.name ?? match.phone}`, blocking: true };

/**
 * Tracks which phone numbers already belong to a lead, checked against the whole
 * tenant rather than the loaded page. Verdicts are cached by local digits, not by
 * row index, so editing or reordering rows re-maps them without another round trip.
 */
export function useLeadPhoneConflicts() {
  const [matchesByDigits, setMatchesByDigits] = useState<Record<string, DuplicatePhoneMatch | null>>({});
  const checkDuplicates = useCheckDuplicatePhones();

  // Written alongside the state above, but readable immediately — two checks fired
  // back to back (blur then submit) must not both miss the first one's results.
  const cacheRef = useRef<Record<string, DuplicatePhoneMatch | null>>({});

  /** Resolves every phone to its match, querying only the ones not seen before. */
  const resolveMatches = useCallback(
    async (phones: string[]): Promise<Record<string, DuplicatePhoneMatch | null>> => {
      const unresolvedByDigits = new Map<string, string>();
      for (const phone of phones) {
        const digits = localPhoneDigits(phone);
        if (digits && !(digits in cacheRef.current)) unresolvedByDigits.set(digits, phone);
      }
      if (unresolvedByDigits.size === 0) return cacheRef.current;

      const duplicates = await checkDuplicates.mutateAsync([...unresolvedByDigits.values()]);
      const duplicateByDigits = new Map(
        duplicates.map((duplicate) => [localPhoneDigits(duplicate.phone), duplicate]),
      );

      const resolved = { ...cacheRef.current };
      for (const digits of unresolvedByDigits.keys()) {
        resolved[digits] = duplicateByDigits.get(digits) ?? null;
      }
      cacheRef.current = resolved;
      setMatchesByDigits(resolved);
      return resolved;
    },
    [checkDuplicates],
  );

  /** Verifies a batch. Returns false when any phone hits an existing active lead. */
  const verifyPhones = useCallback(
    async (phones: string[]): Promise<boolean> => {
      const resolved = await resolveMatches(phones);
      return !phones.some((phone) => resolved[localPhoneDigits(phone)]?.archived === false);
    },
    [resolveMatches],
  );

  /** Single-phone lookup that returns the match itself — used by the one-lead form. */
  const findMatch = useCallback(
    async (phone: string): Promise<DuplicatePhoneMatch | null> => {
      const digits = localPhoneDigits(phone);
      if (!digits) return null;
      const resolved = await resolveMatches([phone]);
      return resolved[digits] ?? null;
    },
    [resolveMatches],
  );

  /**
   * Verdicts for a whole batch, keyed by row index. Adds the one check the server
   * cannot make: two rows in the same batch sharing a phone.
   */
  const conflictsByIndex = useCallback(
    (phones: (string | undefined)[]): Record<number, PhoneConflict> => {
      const conflicts: Record<number, PhoneConflict> = {};
      const seenDigits = new Set<string>();

      phones.forEach((phone, index) => {
        const digits = phone ? localPhoneDigits(phone) : '';
        if (!digits) return;

        if (seenDigits.has(digits)) {
          conflicts[index] = { message: 'Duplicate phone in this import', blocking: true };
          return;
        }
        seenDigits.add(digits);

        const match = matchesByDigits[digits];
        if (match) conflicts[index] = describeConflict(match);
      });

      return conflicts;
    },
    [matchesByDigits],
  );

  const resetConflicts = useCallback(() => {
    cacheRef.current = {};
    setMatchesByDigits({});
  }, []);

  return {
    verifyPhones,
    findMatch,
    conflictsByIndex,
    resetConflicts,
    isVerifying: checkDuplicates.isPending,
  };
}
