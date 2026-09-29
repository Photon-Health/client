import { networkApi, REQUEST_METADATA } from './client';
import { Treatment } from '../conditions/types';

const DRAFT_PRESCRIPTION = `
mutation IntakeDraftPrescription($prescription: PrescriptionInput, $metadata: RequestMetadata!) {
  prescription(prescription: $prescription, metadata: $metadata) {
    __typename
    ... on PrescriptionPayload {
      prescription { id }
      unappliedChanges {
        key
        label
        status
        severity
        reason
        options {
          displayName
          argument
          value
          match { matchType confidence }
        }
      }
    }
    ... on AmbiguousPrescriptionMatch { reason }
    ... on UnauthorizedError { message }
    ... on UpstreamServiceError { message service }
  }
}`;

type ChangeOption = {
  displayName: string;
  argument?: string | null;
  value?: string | null;
  match?: { matchType?: string | null; confidence?: string | null } | null;
};

type Change = {
  key: string;
  status: string;
  reason?: string | null;
  options?: ChangeOption[] | null;
};

type DraftResponse = {
  prescription: {
    __typename: string;
    prescription?: { id: string } | null;
    unappliedChanges?: Change[];
    reason?: string;
    message?: string;
  };
};

type TreatmentReference = { ndc: string } | { name: string } | { id: string };

const treatmentReference = (treatment: Treatment): TreatmentReference =>
  treatment.ndc ? { ndc: treatment.ndc } : { name: treatment.name };

/**
 * The sole HIGH-confidence candidate the API offers for an ambiguous
 * treatment. Anything less certain stays an error — silently picking one of
 * several drugs is not a call this flow gets to make.
 */
const resolvableTreatmentId = (changes: Change[] | undefined): string | undefined => {
  const ambiguous = changes?.find(
    (change) => change.key === 'treatment' && change.status === 'AMBIGUOUS'
  );
  const candidates = (ambiguous?.options ?? []).filter(
    (option) => option.argument === 'treatment.id' && option.value
  );
  if (candidates.length === 1) {
    return candidates[0].value ?? undefined;
  }
  const confident = candidates.filter((option) => option.match?.confidence === 'HIGH');
  return confident.length === 1 ? confident[0].value ?? undefined : undefined;
};

/**
 * Drafts the condition's fixed prescription. No prescriber and no signature —
 * both require a CLINICAL caller, and a draft needs neither.
 */
export async function draftPrescription(input: {
  patientId: string;
  treatment: Treatment;
}): Promise<string> {
  const send = async (treatment: TreatmentReference) => {
    const data = await networkApi<DraftResponse>(DRAFT_PRESCRIPTION, {
      prescription: {
        patient: { id: input.patientId },
        treatment,
        instructions: input.treatment.instructions,
        dispense: {
          quantity: input.treatment.quantity,
          unit: input.treatment.unit,
          refillsAllowed: input.treatment.refillsAllowed
        }
      },
      metadata: REQUEST_METADATA
    });
    return data.prescription;
  };

  let result = await send(treatmentReference(input.treatment));

  if (!result.prescription?.id) {
    const treatmentId = resolvableTreatmentId(result.unappliedChanges);
    if (treatmentId) {
      result = await send({ id: treatmentId });
    }
  }

  const id = result.prescription?.id;
  if (!id) {
    throw new Error(
      result.message ??
        result.reason ??
        result.unappliedChanges?.[0]?.reason ??
        'Could not draft the prescription.'
    );
  }
  return id;
}
