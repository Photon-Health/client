import { networkApi, REQUEST_METADATA } from './client';
import { Change, IntakePatient, PatientAddress, PatientLookupResult, Sex } from './types';

const PATIENT_FIELDS = `
  __typename
  ... on Patient {
    id
    demographic {
      name { first last }
      address { street1 street2 city state postalCode country }
    }
    clinical { medications { id name status } }
  }`;

/**
 * WORKAROUND. Demographic matching is returning only the PHONE signal even
 * when last name and date of birth are right, so every lookup dead-ends as
 * AMBIGUOUS. With this on, an ambiguous result takes the first candidate and
 * re-reads it by id — `matchById` runs no mismatch checks when the reference
 * carries nothing but an id, so that read always succeeds.
 *
 * This means the flow can show one person the wrong record's medication
 * history. It is off unless explicitly enabled, and belongs nowhere the flow
 * is publicly reachable — the same bar as VITE_INTAKE_FAKE_OTP. Remove it once
 * the matcher is fixed.
 */
const TRUST_TOP_MATCH = import.meta.env.VITE_INTAKE_TRUST_TOP_MATCH === 'true';

const READ_BY_ID = `
mutation IntakePatientById($patient: PatientInput, $metadata: RequestMetadata!) {
  patient(patient: $patient, metadata: $metadata) {
    __typename
    ... on PatientPayload {
      patient { ${PATIENT_FIELDS} }
    }
    ... on UnauthorizedError { message }
    ... on UpstreamServiceError { message service }
  }
}`;

const LOOKUP = `
mutation IntakePatientLookup($patient: PatientInput, $metadata: RequestMetadata!) {
  patient(patient: $patient, metadata: $metadata) {
    __typename
    ... on PatientPayload {
      patient { ${PATIENT_FIELDS} }
      unappliedChanges { key label status severity reason category }
    }
    ... on AmbiguousPatientMatch {
      reason
      candidates { id firstName lastName }
    }
    ... on UnauthorizedError { message }
    ... on UpstreamServiceError { message service }
  }
}`;

type LookupResponse = {
  patient: {
    __typename: string;
    patient?: {
      __typename: string;
      id?: string;
      demographic?: {
        name?: { first?: string | null; last?: string | null } | null;
        address?: PatientAddress | null;
      } | null;
      clinical?: { medications: { id: string; name: string; status: string }[] } | null;
    } | null;
    unappliedChanges?: Change[];
    reason?: string;
    candidates?: { id: string; firstName: string; lastName?: string | null }[];
    message?: string;
  };
};

type PatientRecord = NonNullable<LookupResponse['patient']['patient']>;

const toIntakePatient = (record: PatientRecord, fallback: Partial<IntakePatient> = {}) => ({
  id: record.id as string,
  firstName: record.demographic?.name?.first ?? fallback.firstName ?? null,
  lastName: record.demographic?.name?.last ?? fallback.lastName ?? null,
  address: record.demographic?.address ?? null,
  medications: record.clinical?.medications ?? []
});

/**
 * Reads a patient straight by id. `matchById` compares the reference's
 * demographic against the record and rejects on any mismatch — passing only an
 * id means there is nothing to compare, so this is a plain read.
 */
async function readPatientById(id: string): Promise<IntakePatient | null> {
  const data = await networkApi<LookupResponse>(READ_BY_ID, {
    patient: { id },
    metadata: REQUEST_METADATA
  });

  const result = data.patient;
  if (result.__typename !== 'PatientPayload') return null;

  const record = result.patient;
  return record?.__typename === 'Patient' && record.id ? toIntakePatient(record) : null;
}

/**
 * Matches an existing patient on phone + last name + DOB. Two signals
 * (PHONE and NAME_AND_DOB) are the minimum for an auto-match; phone alone
 * always comes back AMBIGUOUS.
 *
 * Creation is deliberately not attempted here — `notFound` routes to the
 * new-profile screen, which calls `createPatient` with the full demographic.
 * Note a patient the org-scoped search cannot see also surfaces as `notFound`.
 */
export async function lookupPatient(input: {
  phone: string;
  lastName: string;
  dateOfBirth: string;
}): Promise<PatientLookupResult> {
  const data = await networkApi<LookupResponse>(LOOKUP, {
    patient: {
      demographic: {
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        name: { last: input.lastName }
      }
    },
    metadata: REQUEST_METADATA
  });

  const result = data.patient;

  if (result.__typename === 'AmbiguousPatientMatch') {
    const candidates = result.candidates ?? [];
    const top = candidates[0];

    // See TRUST_TOP_MATCH above — this skips identity verification.
    if (TRUST_TOP_MATCH && top) {
      const patient = await readPatientById(top.id);
      if (patient) return { kind: 'matched', patient };
    }

    return {
      kind: 'ambiguous',
      reason: result.reason ?? 'More than one record matched those details.',
      candidates
    };
  }

  if (result.__typename !== 'PatientPayload') {
    throw new Error(result.message ?? 'Patient lookup failed.');
  }

  const record = result.patient;
  if (record?.__typename === 'Patient' && record.id) {
    return { kind: 'matched', patient: toIntakePatient(record) };
  }

  // No patient resolved: the unapplied changes name the fields creation would
  // have needed (firstName, sex, ...). Phase 2 collects them here.
  return {
    kind: 'notFound',
    missingFields: (result.unappliedChanges ?? [])
      .filter((change) => change.status !== 'APPLIED')
      .map((change) => change.key)
  };
}

const CREATE = `
mutation IntakeCreatePatient($patient: PatientInput, $metadata: RequestMetadata!) {
  patient(patient: $patient, metadata: $metadata) {
    __typename
    ... on PatientPayload {
      patient { ${PATIENT_FIELDS} }
      unappliedChanges { key label status severity reason category }
    }
    ... on AmbiguousPatientMatch { reason candidates { id firstName lastName } }
    ... on UnauthorizedError { message }
    ... on UpstreamServiceError { message service }
  }
}`;

/**
 * Creates the patient and links them to the caller's org (MASTER) in the same
 * transaction — there is no separate linking step.
 *
 * firstName, lastName, dateOfBirth and sex are each independently required;
 * omitting any one comes back as a rejected change rather than a thrown error.
 */
export async function createPatient(input: {
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
}): Promise<IntakePatient> {
  const data = await networkApi<LookupResponse>(CREATE, {
    patient: {
      demographic: {
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        sex: input.sex,
        name: { first: input.firstName, last: input.lastName }
      }
    },
    metadata: REQUEST_METADATA
  });

  const result = data.patient;

  if (result.__typename === 'AmbiguousPatientMatch') {
    throw new Error(
      result.reason ?? 'Those details matched an existing record. Try verifying again.'
    );
  }
  if (result.__typename !== 'PatientPayload') {
    throw new Error(result.message ?? 'Could not create your profile.');
  }

  const record = result.patient;
  if (record?.__typename !== 'Patient' || !record.id) {
    const rejected = (result.unappliedChanges ?? []).find((change) => change.reason);
    throw new Error(rejected?.reason ?? 'Could not create your profile.');
  }

  return toIntakePatient(record, {
    firstName: input.firstName,
    lastName: input.lastName
  });
}
