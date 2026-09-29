import { graphql, HttpResponse } from 'msw';
import type { DraftOrderDetail, DraftOrderQuestion } from './requests';

export const NETWORK_API_URL = 'http://network-api.boson.health/graphql';
export const networkGql = graphql.link(NETWORK_API_URL);

export const DRAFT_ID = 'ordd_test';
const PHOTON_PP_ORG = 'org_photon_pp';
const MY_ORG = 'org_mine';

const question = (
  id: string,
  key: string | null,
  text: string,
  answer: DraftOrderQuestion['answer'],
  authorOrganizationId = PHOTON_PP_ORG
): DraftOrderQuestion => ({
  __typename: 'OrderQuestion',
  id,
  key,
  text,
  reason: null,
  authorOrganizationId,
  answer,
  answeredAt: answer ? '2026-09-29T10:00:00.000Z' : null,
  createdAt: '2026-09-29T10:00:00.000Z'
});

const textAnswer = (text: string) => ({
  __typename: 'OrderQuestionAnswer' as const,
  text,
  boolean: null,
  date: null,
  choices: null
});

export function makeDraft(overrides: Partial<DraftOrderDetail> = {}): DraftOrderDetail {
  return {
    __typename: 'PhotonPpDraftOrder',
    id: DRAFT_ID,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    claim: null,
    outcome: null,
    order: {
      __typename: 'Order',
      id: DRAFT_ID,
      state: 'DRAFT',
      pharmacy: {
        __typename: 'Pharmacy',
        id: 'phr_cvs',
        name: 'CVS',
        address: {
          __typename: 'PharmacyAddress',
          street1: '1600 16th St',
          street2: null,
          city: 'Denver',
          state: 'CO',
          postalCode: '80202'
        }
      },
      patient: {
        __typename: 'Patient',
        id: 'pat_pp',
        demographic: {
          __typename: 'PatientDemographic',
          name: { __typename: 'HumanName', first: 'Achilles', last: 'Rivera' },
          dateOfBirth: '1997-04-12',
          sex: 'MALE',
          address: { __typename: 'PatientAddress', state: 'CO' }
        },
        clinical: { __typename: 'PatientClinical', allergies: [] }
      },
      prescriptions: [
        {
          __typename: 'Prescription',
          id: 'rx_pp',
          status: 'READY',
          treatment: {
            __typename: 'Treatment',
            id: 'med_ella',
            name: 'ella 30 mg',
            rxNormId: null,
            ndc: '50090-5422-00'
          },
          instructions: 'Take 1 tablet by mouth as soon as possible',
          dispense: {
            __typename: 'Dispense',
            quantity: 1,
            unit: 'Tablet',
            daysSupply: 1,
            refillsAllowed: 0,
            dispenseAsWritten: false
          },
          clinical: { __typename: 'PrescriptionClinical', notes: null, diagnoses: [] },
          screeningAlerts: [],
          signing: {
            __typename: 'PrescriptionSigningDetails',
            state: 'UNSIGNED',
            contentHash: 'hash_pp'
          }
        }
      ],
      questions: [
        question('ordq_reason', 'reason', 'Reason', textAnswer('Emergency contraception')),
        question(
          'ordq_urgency',
          'clinical_urgency',
          'Clinical urgency',
          textAnswer('52 h left in window')
        ),
        question(
          'ordq_timing',
          'time_since_unprotected_sex',
          'Time since unprotected sex',
          textAnswer('1–3 days ago')
        ),
        question('ordq_breastfeeding', 'breastfeeding', 'Breastfeeding', null)
      ]
    },
    ...overrides
  } as DraftOrderDetail;
}

type Call = { operation: string; variables: Record<string, any> };

const payload = (draftOrder: DraftOrderDetail) => ({
  __typename: 'PhotonPpDraftOrderPayload',
  draftOrder
});

const connection = (nodes: DraftOrderDetail[]) => ({
  __typename: 'PhotonPpDraftOrderConnection',
  nodes,
  endCursor: nodes.at(-1)?.id ?? null,
  hasNextPage: false,
  totalCount: nodes.length
});

/**
 * A stateful fake network-api holding one Photon PP draft. `calls` records each operation's
 * variables in order, so tests can assert on what was sent.
 */
export function networkApiHandlers(calls: Call[], initial = makeDraft()) {
  let draft = initial;
  let nextPrescription = 0;

  const inTab = (filter: string) => {
    if (filter === 'UNCLAIMED') return !draft.claim && !draft.outcome;
    if (filter === 'CLOSED') return !!draft.outcome;
    if (!draft.claim || draft.outcome) return false;
    return filter === 'WAITING_ON_PATIENT'
      ? draft.claim.waitingForPatient
      : !draft.claim.waitingForPatient;
  };

  const claimed = (waitingForPatient = false) => ({
    __typename: 'PhotonPpDraftOrderClaim' as const,
    organizationId: MY_ORG,
    claimedAt: new Date().toISOString(),
    waitingForPatient,
    patientId: 'pat_mine',
    claimedByUserId: 'auth0|me',
    claimedByMe: true
  });

  return [
    networkGql.query('PhotonPpDraftOrders', ({ variables }) => {
      calls.push({ operation: 'PhotonPpDraftOrders', variables });
      return HttpResponse.json({
        data: { photonPpDraftOrders: connection(inTab(variables.filter) ? [draft] : []) }
      });
    }),
    networkGql.query('PhotonPpDraftOrderCounts', () => {
      const count = (filter: string) => ({
        __typename: 'PhotonPpDraftOrderConnection',
        totalCount: inTab(filter) ? 1 : 0
      });
      return HttpResponse.json({
        data: {
          toReview: count('UNCLAIMED'),
          myReviews: count('MY_REVIEWS'),
          waitingOnPatient: count('WAITING_ON_PATIENT'),
          closed: count('CLOSED')
        }
      });
    }),
    networkGql.query('PhotonPpDraftOrder', () =>
      HttpResponse.json({ data: { photonPpDraftOrder: payload(draft) } })
    ),
    networkGql.query('PhotonPpPatientHistory', ({ variables }) => {
      calls.push({ operation: 'PhotonPpPatientHistory', variables });
      return HttpResponse.json({
        data: {
          photonPpPatientOrders: {
            __typename: 'PhotonPpPatientOrderConnection',
            nodes: [
              {
                __typename: 'PhotonPpPatientOrder',
                organizationId: 'org_clinic',
                patientId: 'pat_clinic',
                createdAt: '2026-03-10T00:00:00.000Z',
                order: {
                  __typename: 'Order',
                  id: 'ord_history',
                  state: 'SUBMITTED',
                  prescriptions: [
                    {
                      __typename: 'Prescription',
                      id: 'rx_history',
                      treatment: {
                        __typename: 'Treatment',
                        id: 'med_amox',
                        name: 'Amoxicillin 500 mg'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      });
    }),
    networkGql.mutation('ClaimDraftOrder', ({ variables }) => {
      calls.push({ operation: 'ClaimDraftOrder', variables });
      draft = { ...draft, claim: claimed() };
      return HttpResponse.json({ data: { claimDraftOrder: payload(draft) } });
    }),
    networkGql.mutation('RejectDraftOrder', ({ variables }) => {
      calls.push({ operation: 'RejectDraftOrder', variables });
      draft = {
        ...draft,
        claim: claimed(),
        outcome: {
          __typename: 'PhotonPpDraftOrderOutcome',
          status: 'REJECTED',
          closedAt: new Date().toISOString(),
          orderId: null,
          rejectionReason: variables.reason
        }
      } as DraftOrderDetail;
      return HttpResponse.json({ data: { rejectDraftOrder: payload(draft) } });
    }),
    networkGql.mutation('AddDraftOrderQuestions', ({ variables }) => {
      calls.push({ operation: 'AddDraftOrderQuestions', variables });
      const added = variables.questions.map((q: { key: string | null; text: string }, i: number) =>
        question(`ordq_new_${i}`, q.key, q.text, null, MY_ORG)
      );
      draft = {
        ...draft,
        order: { ...draft.order, questions: [...draft.order.questions, ...added] }
      };
      return HttpResponse.json({
        data: {
          addDraftOrderQuestions: {
            __typename: 'DraftOrderQuestionsPayload',
            order: { __typename: 'Order', id: DRAFT_ID }
          }
        }
      });
    }),
    networkGql.mutation('SetDraftOrderWaitingForPatient', ({ variables }) => {
      calls.push({ operation: 'SetDraftOrderWaitingForPatient', variables });
      draft = { ...draft, claim: claimed(variables.waitingForPatient) };
      return HttpResponse.json({ data: { setDraftOrderWaitingForPatient: payload(draft) } });
    }),
    networkGql.mutation('NetworkPrescription', ({ variables }) => {
      calls.push({ operation: 'NetworkPrescription', variables });
      const signing = !!variables.prescription.signing;
      const id = variables.prescription.id ?? `rx_mine_${nextPrescription++}`;
      return HttpResponse.json({
        data: {
          prescription: {
            __typename: 'PrescriptionPayload',
            prescription: {
              ...draft.order.prescriptions[0],
              id,
              signing: {
                __typename: 'PrescriptionSigningDetails',
                state: signing ? 'SIGNED' : 'UNSIGNED',
                contentHash: `hash_${id}`
              }
            },
            unappliedChanges: []
          }
        }
      });
    }),
    networkGql.mutation('ApproveDraftOrder', ({ variables }) => {
      calls.push({ operation: 'ApproveDraftOrder', variables });
      draft = {
        ...draft,
        outcome: {
          __typename: 'PhotonPpDraftOrderOutcome',
          status: 'SUBMITTED',
          closedAt: new Date().toISOString(),
          orderId: 'ord_test',
          rejectionReason: null
        },
        order: { ...draft.order, id: 'ord_test', state: 'SUBMITTED' }
      } as DraftOrderDetail;
      return HttpResponse.json({ data: { approveDraftOrder: payload(draft) } });
    })
  ];
}
