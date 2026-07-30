import * as zod from 'zod';
import { CALENDAR_DATE_FORMAT } from '@photonhealth/components';
import { differenceInHours, isToday, parse } from 'date-fns';

export const NOTES_MAX_LENGTH = 210;

const isNotInThePast = (value: string) => {
  const parsed = parse(value, CALENDAR_DATE_FORMAT, new Date());
  return differenceInHours(parsed, new Date()) >= 0 || isToday(parsed);
};

export const initialPrescriptionInputSchema = zod.object({
  externalId: zod.string({ invalid_type_error: 'externalId must be a string' }).optional(),
  treatmentId: zod
    .string({
      required_error: 'treatmentId is required',
      invalid_type_error: 'treatmentId must be a string'
    })
    .min(1, 'treatmentId is required'),
  dispenseQuantity: zod
    .number({
      required_error: 'dispenseQuantity is required',
      invalid_type_error: 'dispenseQuantity must be a number'
    })
    .positive('dispenseQuantity must be greater than 0'),
  dispenseUnit: zod
    .string({
      required_error: 'dispenseUnit is required',
      invalid_type_error: 'dispenseUnit must be a string'
    })
    .min(1, 'dispenseUnit is required'),
  dispenseAsWritten: zod
    .boolean({ invalid_type_error: 'dispenseAsWritten must be a boolean' })
    .optional(),
  fillsAllowed: zod
    .number({
      required_error: 'fillsAllowed is required',
      invalid_type_error: 'fillsAllowed must be a number'
    })
    .min(1, 'fillsAllowed must be 1 or greater')
    .max(11, 'fillsAllowed must be 11 or fewer'),
  daysSupply: zod
    .number({
      required_error: 'daysSupply is required',
      invalid_type_error: 'daysSupply must be a number'
    })
    .min(1, 'daysSupply must be 1 or greater'),
  instructions: zod
    .string({
      required_error: 'instructions is required',
      invalid_type_error: 'instructions must be a string'
    })
    // Check that value isn't just whitespace
    .refine((value) => value.trim().length > 0, 'instructions is required'),
  notes: zod
    .string({ invalid_type_error: 'notes must be a string' })
    .max(NOTES_MAX_LENGTH, `notes must be ${NOTES_MAX_LENGTH} characters or fewer`)
    .optional(),
  doNotFillBeforeDate: zod
    .string({ invalid_type_error: 'doNotFillBeforeDate must be a string' })
    .optional()
    .refine(
      (value) => !value || isNotInThePast(value),
      `doNotFillBeforeDate must be today or a future date in ${CALENDAR_DATE_FORMAT} format`
    )
});

export type InitialPrescriptionInput = zod.infer<typeof initialPrescriptionInputSchema>;
