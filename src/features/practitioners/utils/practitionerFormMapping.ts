import type { z } from 'zod';
import { practitionerFormSchema, type Practitioner } from '../types';

/** What react-hook-form holds: numbers arrive from text inputs as strings. */
export type PractitionerFormInput = z.input<typeof practitionerFormSchema>;

/**
 * The only currency the product operates in today — not asked for, since the
 * server still requires it. Matches the clinical catalogue's fixed currency.
 */
export const DEFAULT_CURRENCY = 'PKR';

export const INITIAL_PRACTITIONER_FORM_VALUES: PractitionerFormInput = {
  fullName: '',
  title: '',
  designation: '',
  registrationNumber: '',
  gender: '',
  yearsExperience: '',
  consultationFee: '',
  bio: '',
  photoUrl: null,
  specialties: [],
  qualifications: [],
  languages: [],
  currency: DEFAULT_CURRENCY,
  clinicalServiceIds: [],
  clinicLocationIds: [],
  schedule: null,
  visibility: null,
  isActive: true,
  displayOrder: 0,
};

const text = (value: string | null): string => value ?? '';
const numeric = (value: number | null): string =>
  value == null ? '' : String(value);

export function toPractitionerFormValues(
  practitioner: Practitioner,
): PractitionerFormInput {
  return {
    fullName: practitioner.fullName,
    title: text(practitioner.title),
    designation: text(practitioner.designation),
    registrationNumber: text(practitioner.registrationNumber),
    gender: text(practitioner.gender),
    yearsExperience: numeric(practitioner.yearsExperience),
    consultationFee: numeric(practitioner.consultationFee),
    bio: text(practitioner.bio),
    photoUrl: practitioner.photoUrl,
    specialties: practitioner.specialties,
    qualifications: practitioner.qualifications,
    languages: practitioner.languages,
    currency: DEFAULT_CURRENCY,
    clinicalServiceIds: practitioner.clinicalServiceIds,
    clinicLocationIds: practitioner.clinicLocationIds,
    schedule: practitioner.schedule,
    visibility: practitioner.visibility,
    isActive: practitioner.isActive,
    displayOrder: practitioner.displayOrder,
  };
}
