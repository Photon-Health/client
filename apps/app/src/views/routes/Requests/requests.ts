import {
  AddDraftOrderQuestionsMutation,
  ApproveDraftOrderMutation,
  ClaimDraftOrderMutation,
  NetworkPrescriptionMutation,
  PhotonPpDraftOrderCountsQuery,
  PhotonPpDraftOrderQuery,
  PhotonPpDraftOrdersQuery,
  PhotonPpPatientHistoryQuery,
  RejectDraftOrderMutation,
  SetDraftOrderWaitingForPatientMutation
} from '../../../network-api/documents';
import {
  buildRequestMetadata,
  getNetworkApiUrl,
  NetworkApiError,
  networkApiRequest
} from '../../../network-api/client';
import {
  DraftOrderDetailFieldsFragment,
  DraftOrderQuestionFieldsFragment,
  DraftOrderResultFieldsFragment,
  DraftOrderSummaryFieldsFragment,
  DraftStatus,
  NetworkPrescriptionFieldsFragment,
  PhotonPpDraftOrderFilter,
  PhotonPpDraftOrderOutcomeStatus,
  PrescriptionInput,
  PrescriptionSigningState
} from '../../../network-api/gql/graphql';

// Requests are draft orders from patients who signed up directly with Photon (the Photon PP
// org). network-api only runs in boson and tau so far.
export const requestsEnabled = () => !!getNetworkApiUrl();

export type DraftOrderSummary = DraftOrderSummaryFieldsFragment;
export type DraftOrderDetail = DraftOrderDetailFieldsFragment;
export type DraftOrderQuestion = DraftOrderQuestionFieldsFragment;
type DraftOrderLike = DraftOrderSummary | DraftOrderDetail;

export const REQUEST_TABS = [
  { key: 'to-review', label: 'To review', filter: PhotonPpDraftOrderFilter.Unclaimed },
  { key: 'my-reviews', label: 'My reviews', filter: PhotonPpDraftOrderFilter.MyReviews },
  {
    key: 'waiting-on-patient',
    label: 'Waiting on patient',
    filter: PhotonPpDraftOrderFilter.WaitingOnPatient
  },
  { key: 'closed', label: 'Closed', filter: PhotonPpDraftOrderFilter.Closed }
] as const;

export type RequestTabKey = (typeof REQUEST_TABS)[number]['key'];
export type RequestCounts = Record<RequestTabKey, number>;

// Keys Photon PP intake writes for the list columns rather than the intake answers card.
const REASON_KEY = 'reason';
const URGENCY_KEY = 'clinical_urgency';

export const formatAnswer = (answer: DraftOrderQuestion['answer']): string | undefined => {
  if (!answer) return undefined;
  if (answer.text != null) return answer.text;
  if (answer.boolean != null) return answer.boolean ? 'Yes' : 'No';
  if (answer.date != null) return String(answer.date);
  if (answer.choices?.length) return answer.choices.join(', ');
  return undefined;
};

const answerFor = (questions: DraftOrderQuestion[], key: string) =>
  formatAnswer(questions.find((question) => question.key === key)?.answer);

const isFromClaimingOrg = (draft: DraftOrderLike, question: DraftOrderQuestion) =>
  !!draft.claim && question.authorOrganizationId === draft.claim.organizationId;

/** Photon PP's intake questions, minus the ones shown as columns. */
export const intakeQuestions = (draft: DraftOrderLike) =>
  draft.order.questions.filter(
    (question) =>
      !isFromClaimingOrg(draft, question) &&
      question.key !== REASON_KEY &&
      question.key !== URGENCY_KEY
  );

/** Questions the claiming organization asked the patient. */
export const followUpQuestions = (draft: DraftOrderLike) =>
  draft.order.questions.filter((question) => isFromClaimingOrg(draft, question));

export const ageFromDateOfBirth = (dateOfBirth?: string | Date | null, now = new Date()) => {
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

export const formatSubmitted = (createdAt: string | Date, now = new Date()) => {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

export const urgencyColorScheme = (urgency?: string) => {
  if (!urgency) return 'gray';
  if (/left|window|urgent/i.test(urgency)) return 'red';
  if (/symptom/i.test(urgency)) return 'orange';
  if (/lab/i.test(urgency)) return 'blue';
  return 'gray';
};

export const describeRequest = (draft: DraftOrderLike) => {
  const patient = draft.order.patient?.__typename === 'Patient' ? draft.order.patient : undefined;
  const demographic = patient?.demographic;
  const lastInitial = demographic?.name.last ? ` ${demographic.name.last[0]}.` : '';
  return {
    id: draft.id,
    photonPpPatientId: patient?.id,
    patientName: `${demographic?.name.first ?? 'Unknown'}${lastInitial}`,
    age: ageFromDateOfBirth(demographic?.dateOfBirth),
    state: demographic?.address?.state ?? undefined,
    medication: draft.order.prescriptions.map((rx) => rx.treatment.name).join(', '),
    reason: answerFor(draft.order.questions, REASON_KEY),
    urgency: answerFor(draft.order.questions, URGENCY_KEY),
    submittedAt: draft.createdAt
  };
};

export type RequestStatus = { label: string; colorScheme: string };

export const requestStatus = (draft: DraftOrderLike): RequestStatus => {
  if (draft.outcome?.status === PhotonPpDraftOrderOutcomeStatus.Submitted) {
    return { label: 'Sent', colorScheme: 'green' };
  }
  if (draft.outcome?.status === PhotonPpDraftOrderOutcomeStatus.Rejected) {
    return { label: 'Declined', colorScheme: 'red' };
  }
  if (!draft.claim) return { label: 'Unclaimed', colorScheme: 'gray' };
  if (draft.claim.waitingForPatient) return { label: 'Waiting on patient', colorScheme: 'orange' };
  return draft.claim.claimedByMe
    ? { label: 'Claimed by you', colorScheme: 'blue' }
    : { label: 'Claimed by a colleague', colorScheme: 'purple' };
};

const unwrapDraftOrder = (result: DraftOrderResultFieldsFragment, action: string) => {
  if (result.__typename === 'PhotonPpDraftOrderPayload') return result.draftOrder;
  throw new NetworkApiError(`${action}: ${result.message}`);
};

export const fetchRequests = async (tab: RequestTabKey, token: string, after?: string | null) => {
  const filter = REQUEST_TABS.find((t) => t.key === tab)!.filter;
  const { photonPpDraftOrders: result } = await networkApiRequest(
    PhotonPpDraftOrdersQuery,
    { filter, first: 25, after },
    token
  );
  if (result.__typename !== 'PhotonPpDraftOrderConnection') {
    throw new NetworkApiError(`Loading requests: ${result.message}`);
  }
  return result;
};

export const fetchRequestCounts = async (token: string): Promise<RequestCounts> => {
  const data = await networkApiRequest(PhotonPpDraftOrderCountsQuery, {}, token);
  const count = (result: { totalCount?: number } | object) =>
    'totalCount' in result ? result.totalCount ?? 0 : 0;
  return {
    'to-review': count(data.toReview),
    'my-reviews': count(data.myReviews),
    'waiting-on-patient': count(data.waitingOnPatient),
    closed: count(data.closed)
  };
};

export const fetchRequest = async (id: string, token: string) => {
  const { photonPpDraftOrder } = await networkApiRequest(PhotonPpDraftOrderQuery, { id }, token);
  return unwrapDraftOrder(photonPpDraftOrder, 'Loading request');
};

export const fetchPatientHistory = async (photonPpPatientId: string, token: string) => {
  const { photonPpPatientOrders: result } = await networkApiRequest(
    PhotonPpPatientHistoryQuery,
    { patientId: photonPpPatientId },
    token
  );
  if (result.__typename !== 'PhotonPpPatientOrderConnection') {
    throw new NetworkApiError(`Loading patient history: ${result.message}`);
  }
  return result.nodes;
};

export const claimRequest = async (id: string, token: string) => {
  const { claimDraftOrder } = await networkApiRequest(
    ClaimDraftOrderMutation,
    { id, metadata: buildRequestMetadata() },
    token
  );
  return unwrapDraftOrder(claimDraftOrder, 'Claiming request');
};

export const declineRequest = async (id: string, reason: string, token: string) => {
  const { rejectDraftOrder } = await networkApiRequest(
    RejectDraftOrderMutation,
    { id, reason, metadata: buildRequestMetadata() },
    token
  );
  return unwrapDraftOrder(rejectDraftOrder, 'Declining request');
};

export type PatientQuestion = { key: string | null; text: string; reason: string | null };

export const askPatient = async (id: string, question: PatientQuestion, token: string) => {
  const { addDraftOrderQuestions: asked } = await networkApiRequest(
    AddDraftOrderQuestionsMutation,
    { id, questions: [question], metadata: buildRequestMetadata() },
    token
  );
  if (asked.__typename !== 'DraftOrderQuestionsPayload') {
    throw new NetworkApiError(`Asking the patient: ${asked.message}`);
  }
  const { setDraftOrderWaitingForPatient } = await networkApiRequest(
    SetDraftOrderWaitingForPatientMutation,
    { id, waitingForPatient: true, metadata: buildRequestMetadata() },
    token
  );
  return unwrapDraftOrder(setDraftOrderWaitingForPatient, 'Asking the patient');
};

export type PrescriptionEdit = {
  quantity?: number;
  instructions?: string;
  refillsAllowed?: number;
};
export type PrescriptionEdits = Record<string, PrescriptionEdit>;

const prescriptionMutation = async (
  prescription: PrescriptionInput,
  token: string,
  action: string
): Promise<NetworkPrescriptionFieldsFragment> => {
  const { prescription: result } = await networkApiRequest(
    NetworkPrescriptionMutation,
    { prescription, metadata: buildRequestMetadata() },
    token
  );
  if (result.__typename === 'AmbiguousPrescriptionMatch') {
    throw new NetworkApiError(`${action}: ${result.reason}`);
  }
  if (result.__typename !== 'PrescriptionPayload') {
    throw new NetworkApiError(`${action}: ${result.message}`);
  }
  const blocking = result.unappliedChanges.filter((change) => change.severity === 'BLOCKING');
  if (blocking.length || !result.prescription) {
    const reasons = blocking.map((change) => change.reason ?? change.label).join('; ');
    throw new NetworkApiError(`${action}: ${reasons || 'no prescription returned'}`);
  }
  return result.prescription;
};

/**
 * Writes and signs the draft's prescriptions for the claiming organization's own patient
 * (with any edits), then sends the draft with them in place of the intake prescriptions.
 */
export const approveRequest = async (
  draft: DraftOrderDetail,
  edits: PrescriptionEdits,
  token: string,
  signingMessage: string
) => {
  const patientId = draft.claim?.patientId;
  if (!patientId) throw new NetworkApiError('Claim this request before approving it');
  if (!draft.order.prescriptions.length) {
    throw new NetworkApiError('The request has no prescriptions');
  }

  const prescriptionIds: string[] = [];
  for (const source of draft.order.prescriptions) {
    const edit = edits[source.id] ?? {};
    const name = source.treatment.name;
    const written = await prescriptionMutation(
      {
        patient: { id: patientId },
        treatment: { id: source.treatment.id },
        instructions: edit.instructions ?? source.instructions,
        dispense: {
          quantity: edit.quantity ?? source.dispense?.quantity,
          unit: source.dispense?.unit,
          daysSupply: source.dispense?.daysSupply,
          refillsAllowed: edit.refillsAllowed ?? source.dispense?.refillsAllowed,
          dispenseAsWritten: source.dispense?.dispenseAsWritten
        },
        clinical: source.clinical?.diagnoses.length
          ? {
              diagnoses: {
                add: source.clinical.diagnoses
                  .filter((d) => d.icd10Code)
                  .map((d) => ({ icd10Code: d.icd10Code }))
              }
            }
          : undefined
      },
      token,
      `Writing ${name}`
    );
    if (written.status === DraftStatus.Blocked) {
      const alerts = (written.screeningAlerts ?? []).map((a) => a.description).join('; ');
      throw new NetworkApiError(`${name} is blocked by screening: ${alerts}`);
    }

    // Signing is a separate call — combining it with edits would invalidate the hash.
    const signed = await prescriptionMutation(
      {
        id: written.id,
        signing: { signedHash: written.signing.contentHash, message: signingMessage }
      },
      token,
      `Signing ${name}`
    );
    if (signed.signing.state !== PrescriptionSigningState.Signed) {
      throw new NetworkApiError(`Signing ${name}: the signature was not accepted`);
    }
    prescriptionIds.push(signed.id);
  }

  const { approveDraftOrder } = await networkApiRequest(
    ApproveDraftOrderMutation,
    { id: draft.id, prescriptionIds, metadata: buildRequestMetadata() },
    token
  );
  return unwrapDraftOrder(approveDraftOrder, 'Sending');
};
