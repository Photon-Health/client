import * as zod from 'zod';
import { CALENDAR_DATE_FORMAT } from '@photonhealth/components';
import { differenceInHours, isToday, parse } from 'date-fns';

export const NOTES_MAX_LENGTH = 210;

const isNotInThePast = (value: string) => {
  const parsed = parse(value, CALENDAR_DATE_FORMAT, new Date());
  return differenceInHours(parsed, new Date()) >= 0 || isToday(parsed);
};

export const initialPrescriptionInputSchema = zod.object({
  externalId: zod.string().optional(),
  patientId: zod.string().min(1),
  treatmentId: zod.string().min(1),
  dispenseQuantity: zod.number().positive(),
  dispenseUnit: zod.string().min(1),
  dispenseAsWritten: zod.boolean().optional(),
  fillsAllowed: zod.number().min(0).max(11),
  daysSupply: zod.number().min(0),
  instructions: zod
    .string()
    // Check that value isn't just whitespace
    .refine((value) => value.trim().length > 0),
  notes: zod.string().max(NOTES_MAX_LENGTH).optional(),
  doNotFillBeforeDate: zod
    .string()
    .optional()
    .refine((value) => !value || isNotInThePast(value))
});

export type InitialPrescriptionInput = zod.infer<typeof initialPrescriptionInputSchema>;
