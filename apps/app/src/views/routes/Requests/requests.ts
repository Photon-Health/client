import {
  NetworkOrderMutation,
  NetworkPatientMutation,
  NetworkPrescriptionMutation
} from '../../../network-api/documents';
import {
  buildRequestMetadata,
  NetworkApiError,
  getNetworkApiUrl,
  networkApiRequest
} from '../../../network-api/client';
import {
  NetworkChangeFieldsFragment,
  NetworkOrderMutation as NetworkOrderResult,
  NetworkPrescriptionFieldsFragment,
  OrderInput,
  OrderState,
  PrescriptionInput,
  ChangeSeverity,
  DraftStatus,
  PrescriptionSigningState
} from '../../../network-api/gql/graphql';

// Requests are draft orders created under the Photon PP org and surfaced to every org as an
// inbox. v1 is a test build: drafts are read with a hard-coded PP token that is only exposed to
// local/boson builds, and network-api has no list query yet, so the inbox is seeded with a
// configured list of draft order ids.
export const requestsConfig = () => {
  const env = import.meta.env.VITE_ENV_NAME as string;
  const ppToken = import.meta.env.PHOTON_PP_AUTH_TOKEN as string | undefined;
  const draftOrderIds = ((import.meta.env.PHOTON_PP_DRAFT_ORDER_IDS as string | undefined) ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const enabled = ['boson', 'tau'].includes(env) && !!getNetworkApiUrl() && !!ppToken;
  return { enabled, ppToken: ppToken ?? '', draftOrderIds };
};

type OrderPayload = Extract<NetworkOrderResult['order'], { __typename: 'OrderPayload' }>;
export type DraftOrder = NonNullable<OrderPayload['order']>;
type DraftPatient = Extract<NonNullable<DraftOrder['patient']>, { __typename: 'Patient' }>;

export type IntakeAnswer = { label: string; value: string };

export type DraftRequest = {
  id: string;
  patient?: DraftPatient;
  patientName: string;
  age?: number;
  state?: string;
  medication: string;
  reason?: string;
  urgency?: string;
  intakeAnswers: IntakeAnswer[];
  prescriptions: NetworkPrescriptionFieldsFragment[];
  pharmacy?: DraftOrder['pharmacy'];
  order: DraftOrder;
};

// Intake answers live in notes as "Label: value" lines. `Reason` and `Clinical urgency` are
// pulled out for the list view; everything else is shown as an intake answer.
export const parseIntakeNotes = (notes?: string | null) => {
  let reason: string | undefined;
  let urgency: string | undefined;
  const answers: IntakeAnswer[] = [];

  for (const line of (notes ?? '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf(':');
    const label = separator > 0 ? trimmed.slice(0, separator).trim() : '';
    const value = separator > 0 ? trimmed.slice(separator + 1).trim() : trimmed;

    if (/^reason$/i.test(label)) reason = value;
    else if (/^(clinical )?urgency$/i.test(label)) urgency = value;
    else answers.push({ label, value });
  }

  return { reason, urgency, answers };
};

export const urgencyColorScheme = (urgency?: string) => {
  if (!urgency) return 'gray';
  if (/left|window|urgent/i.test(urgency)) return 'red';
  if (/symptom/i.test(urgency)) return 'orange';
  if (/lab/i.test(urgency)) return 'blue';
  return 'gray';
};

export const ageFromDateOfBirth = (dateOfBirth?: string | null, now = new Date()) => {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return undefined;
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
};

export const toDraftRequest = (order: DraftOrder): DraftRequest => {
  const patient = order.patient?.__typename === 'Patient' ? order.patient : undefined;
  const demographic = patient?.demographic;
  const notes = [...order.prescriptions.map((rx) => rx.clinical?.notes), patient?.clinical?.notes]
    .filter(Boolean)
    .join('\n');
  const { reason, urgency, answers } = parseIntakeNotes(notes);
  const lastInitial = demographic?.name.last ? ` ${demographic.name.last[0]}.` : '';

  return {
    id: order.id,
    patient,
    patientName: `${demographic?.name.first ?? 'Unknown'}${lastInitial}`,
    age: ageFromDateOfBirth(demographic?.dateOfBirth),
    state: demographic?.address?.state ?? undefined,
    medication: order.prescriptions.map((rx) => rx.treatment.name).join(', '),
    reason,
    urgency,
    intakeAnswers: answers,
    prescriptions: order.prescriptions,
    pharmacy: order.pharmacy,
    order
  };
};

// Claims and handled drafts are tracked client-side only for v1.
const CLAIMED_KEY = 'photon-requests-claimed';
const HANDLED_KEY = 'photon-requests-handled';

const readIds = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addId = (key: string, id: string) => {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set([...readIds(key), id])]));
  } catch {
    // Storage unavailable — state just won't persist across reloads
  }
};

export const getClaimedIds = () => readIds(CLAIMED_KEY);
export const claimRequest = (id: string) => addId(CLAIMED_KEY, id);
export const getHandledIds = () => readIds(HANDLED_KEY);
export const markRequestHandled = (id: string) => addId(HANDLED_KEY, id);

const assertNoBlockingChanges = (changes: NetworkChangeFieldsFragment[], step: string) => {
  const blocking = changes.filter(
    (change) => change.severity === ChangeSeverity.Blocking || change.status === 'REJECTED'
  );
  if (blocking.length) {
    throw new NetworkApiError(
      `${step}: ${blocking.map((c) => c.reason ?? `${c.label} was not applied`).join('; ')}`
    );
  }
};

const orderMutation = async (input: OrderInput, token: string, step: string) => {
  const { order: result } = await networkApiRequest(
    NetworkOrderMutation,
    { input, metadata: buildRequestMetadata() },
    token
  );
  if (result.__typename !== 'OrderPayload') {
    throw new NetworkApiError(`${step}: ${'message' in result ? result.message : result.reason}`);
  }
  if (!result.order) throw new NetworkApiError(`${step}: no order returned`);
  return result;
};

const prescriptionMutation = async (
  prescription: PrescriptionInput,
  token: string,
  step: string
) => {
  const { prescription: result } = await networkApiRequest(
    NetworkPrescriptionMutation,
    { prescription, metadata: buildRequestMetadata() },
    token
  );
  if (result.__typename !== 'PrescriptionPayload') {
    throw new NetworkApiError(`${step}: ${'message' in result ? result.message : result.reason}`);
  }
  if (!result.prescription) throw new NetworkApiError(`${step}: no prescription returned`);
  assertNoBlockingChanges(result.unappliedChanges, step);
  return result.prescription;
};

// Reading a draft is a no-op `order` mutation — network-api echoes the current state.
export const fetchDraftRequest = async (id: string, token: string) => {
  const { order } = await orderMutation({ order: { id } }, token, 'Loading request');
  return toDraftRequest(order!);
};

export const fetchDraftRequests = async (ids: string[], token: string) => {
  const handled = new Set(getHandledIds());
  const results = await Promise.allSettled(
    ids.filter((id) => !handled.has(id)).map((id) => fetchDraftRequest(id, token))
  );
  const requests = results
    .filter((r): r is PromiseFulfilledResult<DraftRequest> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((request) => request.order.state === OrderState.Draft);
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  return { requests, failures: failures.map((f) => String(f.reason?.message ?? f.reason)) };
};

/**
 * Recreates the PP draft under the provider's own org and sends it:
 * resolve/create patient → draft prescriptions → sign → draft order → submit.
 * The PP draft can't be canceled (DRAFT → CANCELED isn't allowed), so it's marked handled
 * client-side instead.
 */
export const approveDraftRequest = async (
  request: DraftRequest,
  providerToken: string,
  signingMessage: string
) => {
  const demographic = request.patient?.demographic;
  if (!demographic) throw new NetworkApiError('The request has no patient details');
  if (!request.prescriptions.length) throw new NetworkApiError('The request has no prescriptions');

  const { patient: patientResult } = await networkApiRequest(
    NetworkPatientMutation,
    {
      patient: {
        demographic: {
          name: { first: demographic.name.first, last: demographic.name.last },
          dateOfBirth: demographic.dateOfBirth,
          sex: demographic.sex,
          gender: demographic.gender,
          email: demographic.email,
          phone: demographic.phone,
          address: demographic.address
            ? {
                street1: demographic.address.street1,
                street2: demographic.address.street2,
                city: demographic.address.city,
                state: demographic.address.state,
                postalCode: demographic.address.postalCode,
                country: demographic.address.country
              }
            : undefined
        }
      },
      metadata: buildRequestMetadata()
    },
    providerToken
  );
  if (patientResult.__typename === 'AmbiguousPatientMatch') {
    throw new NetworkApiError(
      `Creating patient: multiple possible matches in your organization (${patientResult.reason})`
    );
  }
  if (patientResult.__typename !== 'PatientPayload') {
    throw new NetworkApiError(`Creating patient: ${patientResult.message}`);
  }
  assertNoBlockingChanges(patientResult.unappliedChanges, 'Creating patient');
  if (patientResult.patient?.__typename !== 'Patient') {
    throw new NetworkApiError('Creating patient: no patient returned');
  }
  const patientId = patientResult.patient.id;

  const prescriptionIds: string[] = [];
  for (const source of request.prescriptions) {
    const draft = await prescriptionMutation(
      {
        patient: { id: patientId },
        treatment: { id: source.treatment.id },
        instructions: source.instructions,
        dispense: source.dispense
          ? {
              quantity: source.dispense.quantity,
              unit: source.dispense.unit,
              daysSupply: source.dispense.daysSupply,
              refillsAllowed: source.dispense.refillsAllowed,
              dispenseAsWritten: source.dispense.dispenseAsWritten
            }
          : undefined,
        clinical: {
          notes: source.clinical?.notes,
          diagnoses: source.clinical?.diagnoses.length
            ? {
                add: source.clinical.diagnoses
                  .filter((d) => d.icd10Code)
                  .map((d) => ({ icd10Code: d.icd10Code }))
              }
            : undefined
        }
      },
      providerToken,
      `Creating prescription for ${source.treatment.name}`
    );
    if (draft.status === DraftStatus.Blocked) {
      const alerts = (draft.screeningAlerts ?? []).map((a) => a.description).join('; ');
      throw new NetworkApiError(`${source.treatment.name} is blocked by screening: ${alerts}`);
    }

    // Signing is a separate call — combining it with edits would invalidate the hash.
    const signed = await prescriptionMutation(
      { id: draft.id, signing: { signedHash: draft.signing.contentHash, message: signingMessage } },
      providerToken,
      `Signing ${source.treatment.name}`
    );
    if (signed.signing.state !== PrescriptionSigningState.Signed) {
      throw new NetworkApiError(`Signing ${source.treatment.name}: signature was not accepted`);
    }
    prescriptionIds.push(signed.id);
  }

  const created = await orderMutation(
    {
      patient: { id: patientId },
      prescriptions: { add: prescriptionIds.map((id) => ({ id })) },
      ...(request.pharmacy ? { pharmacy: { id: request.pharmacy.id } } : {})
    },
    providerToken,
    'Creating order'
  );
  assertNoBlockingChanges(created.unappliedChanges, 'Creating order');
  const orderId = created.order!.id;

  const submitted = await orderMutation(
    { order: { id: orderId }, state: OrderState.Submitted },
    providerToken,
    'Sending order'
  );
  if (submitted.order!.state !== OrderState.Submitted) {
    const reasons = submitted.unappliedChanges.map((c) => c.reason).filter(Boolean);
    throw new NetworkApiError(
      `Sending order: the order was created but not sent${
        reasons.length ? ` (${reasons.join('; ')})` : ''
      }`
    );
  }

  markRequestHandled(request.id);
  return orderId;
};
