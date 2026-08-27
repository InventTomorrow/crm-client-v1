import { VISIBILITY_META, type PractitionerFormValues } from '../types';
import {
  DEFAULT_CURRENCY,
  type PractitionerFormInput,
} from './practitionerFormMapping';

/** Shown on a collapsed trigger when a section has nothing worth reporting yet. */
export const NOTHING_FILLED_IN = 'Not filled in yet';

export type PractitionerSectionId =
  | 'identity'
  | 'expertise'
  | 'profile'
  | 'visibility'
  | 'schedule';

/**
 * Which fields each section owns — used to reopen a collapsed section that
 * failed validation, since a required field behind a closed trigger would
 * otherwise reject the save with nothing on screen to explain it.
 */
export const SECTION_FIELDS: Record<
  PractitionerSectionId,
  readonly (keyof PractitionerFormValues)[]
> = {
  identity: [
    'title',
    'fullName',
    'designation',
    'registrationNumber',
    'gender',
    'photoUrl',
  ],
  expertise: ['specialties', 'qualifications', 'languages', 'yearsExperience'],
  profile: ['bio', 'consultationFee'],
  visibility: ['visibility', 'isActive'],
  schedule: ['schedule'],
};

const filled = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim().length > 0;

const count = (values: unknown[] | undefined): number => values?.length ?? 0;

const joinParts = (parts: (string | null)[]): string =>
  parts.filter((part): part is string => Boolean(part)).join(' · ');

const plural = (n: number, singular: string, pluralWord = `${singular}s`) =>
  `${n} ${n === 1 ? singular : pluralWord}`;

function summariseIdentity(values: PractitionerFormInput): string {
  const name = filled(values.fullName)
    ? [values.title, values.fullName].filter(Boolean).join(' ').trim()
    : null;

  return (
    joinParts([
      name,
      filled(values.designation) ? String(values.designation) : null,
      filled(values.photoUrl) ? 'Photo added' : null,
    ]) || NOTHING_FILLED_IN
  );
}

function summariseExpertise(values: PractitionerFormInput): string {
  const specialties = count(values.specialties);
  const qualifications = count(values.qualifications);
  const languages = count(values.languages);

  return (
    joinParts([
      specialties > 0 ? plural(specialties, 'specialty', 'specialties') : null,
      qualifications > 0 ? plural(qualifications, 'qualification') : null,
      languages > 0 ? plural(languages, 'language') : null,
      filled(values.yearsExperience)
        ? `${values.yearsExperience} yrs experience`
        : null,
    ]) || NOTHING_FILLED_IN
  );
}

function summariseProfile(values: PractitionerFormInput): string {
  return (
    joinParts([
      filled(values.bio) ? 'Profile written' : null,
      filled(values.consultationFee)
        ? `${DEFAULT_CURRENCY} ${Number(values.consultationFee).toLocaleString()}`
        : null,
    ]) || NOTHING_FILLED_IN
  );
}

/** Always reports something — "inherits the clinic setting" is itself a state. */
function summariseVisibility(values: PractitionerFormInput): string {
  return joinParts([
    values.visibility
      ? VISIBILITY_META[values.visibility].label
      : 'Clinic default',
    values.isActive ? 'Active' : 'Inactive',
  ]);
}

function summariseSchedule(values: PractitionerFormInput): string {
  const schedule = values.schedule;
  if (!schedule) return 'Clinic hours';

  const days = count(schedule.availableDays);
  const windows = count(schedule.workingHours);
  if (days === 0 && windows === 0) return 'Clinic hours';

  return joinParts([
    days > 0 ? plural(days, 'day') : null,
    windows > 0 ? plural(windows, 'time window') : null,
  ]);
}

const SUMMARISERS: Record<
  PractitionerSectionId,
  (values: PractitionerFormInput) => string
> = {
  identity: summariseIdentity,
  expertise: summariseExpertise,
  profile: summariseProfile,
  visibility: summariseVisibility,
  schedule: summariseSchedule,
};

/** The one-line recap shown on a section's accordion trigger. */
export function summariseSection(
  sectionId: PractitionerSectionId,
  values: PractitionerFormInput,
): string {
  return SUMMARISERS[sectionId](values);
}

/** Sections holding at least one field that failed validation. */
export function sectionsWithErrors(
  erroredFields: string[],
): PractitionerSectionId[] {
  const failed = new Set(erroredFields);

  return (Object.keys(SECTION_FIELDS) as PractitionerSectionId[]).filter(
    (sectionId) =>
      SECTION_FIELDS[sectionId].some((field) => failed.has(field)),
  );
}
