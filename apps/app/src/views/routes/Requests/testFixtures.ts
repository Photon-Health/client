import { graphql, HttpResponse } from 'msw';
import type { DraftOrder } from './requests';

export const NETWORK_API_URL = 'http://network-api.boson.health/graphql';
export const networkGql = graphql.link(NETWORK_API_URL);

export const DRAFT_ID = 'ordd_test';

export const INTAKE_NOTES = [
  'Reason: Emergency contraception',
  'Clinical urgency: 52 h left in window',
  'Time since unprotected sex: 1–3 days ago',
  'Weight: 162 lb'
].join('\n');

export function makeDraftOrder(overrides: Partial<DraftOrder> = {}): DraftOrder {
  return {
    __typename: 'Order',
    id: DRAFT_ID,
    state: 'DRAFT',
    pharmacy: {
      id: 'phr_cvs',
      name: 'CVS',
      address: {
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
        name: { first: 'Achilles', last: 'Rivera' },
        dateOfBirth: '1997-04-12',
        sex: 'MALE',
        gender: null,
        email: 'achilles@example.com',
        phone: '+13035550142',
        address: {
          street1: '1 Main St',
          street2: null,
          city: 'Denver',
          state: 'CO',
          postalCode: '80202',
          country: 'US'
        }
      },
      clinical: { notes: null, allergies: [] }
    },
    prescriptions: [
      {
        id: 'rx_pp',
        status: 'READY',
        treatment: { id: 'med_ella', name: 'Ella', rxNormId: null, ndc: '50090-5422-00' },
        instructions: 'Take 1 tablet by mouth as soon as possible',
        dispense: {
          quantity: 1,
          unit: 'Tablet',
          daysSupply: 1,
          refillsAllowed: 0,
          dispenseAsWritten: false
        },
        clinical: { notes: INTAKE_NOTES, diagnoses: [] },
        screeningAlerts: [],
        signing: { state: 'UNSIGNED', contentHash: 'hash_pp' }
      }
    ],
    ...overrides
  } as unknown as DraftOrder;
}

const orderPayload = (order: DraftOrder) => ({
  order: { __typename: 'OrderPayload', order, unappliedChanges: [] }
});

/**
 * Happy-path network-api handlers. `calls` records each mutation's variables in order so tests
 * can assert on the approve sequence.
 */
export function networkApiHandlers(
  calls: { operation: string; variables: Record<string, any> }[],
  draft = makeDraftOrder()
) {
  return [
    networkGql.mutation('NetworkOrder', ({ variables }) => {
      calls.push({ operation: 'NetworkOrder', variables });
      const input = variables.input;
      if (input.order?.id === DRAFT_ID) return HttpResponse.json({ data: orderPayload(draft) });
      const state = input.state ?? 'DRAFT';
      return HttpResponse.json({
        data: orderPayload({ ...draft, id: 'ordd_new', state } as DraftOrder)
      });
    }),
    networkGql.mutation('NetworkPatient', ({ variables }) => {
      calls.push({ operation: 'NetworkPatient', variables });
      return HttpResponse.json({
        data: {
          patient: {
            __typename: 'PatientPayload',
            patient: { __typename: 'Patient', id: 'pat_mine' },
            unappliedChanges: []
          }
        }
      });
    }),
    networkGql.mutation('NetworkPrescription', ({ variables }) => {
      calls.push({ operation: 'NetworkPrescription', variables });
      const signed = !!variables.prescription.signing;
      return HttpResponse.json({
        data: {
          prescription: {
            __typename: 'PrescriptionPayload',
            prescription: {
              ...draft.prescriptions[0],
              id: 'rx_mine',
              signing: { state: signed ? 'SIGNED' : 'UNSIGNED', contentHash: 'hash_mine' }
            },
            unappliedChanges: []
          }
        }
      });
    })
  ];
}
