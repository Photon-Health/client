import { graphql, HttpResponse } from 'msw';
import { DISPENSE_UNIT, ORGANIZATION, PATIENT, PROVIDER, TREATMENT } from './fixtures';

/**
 * Unscoped MSW GraphQL handlers — match by operation name regardless of endpoint URL.
 * Use these as the base handler set; add scoped `graphql.link()` overrides per-test
 * when the same operation name needs different responses per endpoint.
 */

// Scoped handlers — for per-test overrides when the same operation name
// is used by different endpoints with different responses.
// Tau env: lambdas shares boson's API URL, clinical uses local tau URL.
export const lambdasGql = graphql.link('https://api.boson.health/graphql');
export const clinicalGql = graphql.link('http://clinical-api.tau.health:8080/graphql');

// ---------------------------------------------------------------------------
// Clinical API operations (via apolloClinical / services)
// ---------------------------------------------------------------------------

const servicesHandlers = [
  clinicalGql.query('GetCurrentUserSignatureAttestationStatus', () =>
    HttpResponse.json({
      data: {
        me: {
          signatureAttestationStatus: {
            __typename: 'CompletedSignatureAttestation',
            agreedAt: new Date().toISOString(),
            version: 'v1'
          }
        }
      }
    })
  ),

  clinicalGql.query('ScreenDraftedPrescriptionsQuery', () =>
    HttpResponse.json({
      data: { prescriptionScreen: { alerts: [] } }
    })
  ),

  clinicalGql.query('MeUserQuery', () =>
    HttpResponse.json({
      data: { me: { credentials: 'MD', address: { state: 'NY' } } }
    })
  ),

  clinicalGql.query('AnalyticsContextQuery', () =>
    HttpResponse.json({
      data: {
        me: PROVIDER,
        organization: ORGANIZATION
      }
    })
  ),

  clinicalGql.mutation('AgreeToSignatureAttestation', () =>
    HttpResponse.json({
      data: { agreeToSignatureAttestation: true }
    })
  ),

  clinicalGql.mutation('UpdatePrescriptionStates', () =>
    HttpResponse.json({
      data: { updatePrescriptionStates: true }
    })
  )
];

// ---------------------------------------------------------------------------
// Lambdas API operations (via apollo)
// ---------------------------------------------------------------------------

const lambdasHandlers = [
  // Components use 'GetPatient', SDK uses 'patient'
  lambdasGql.query('GetPatient', () => HttpResponse.json({ data: { patient: PATIENT } })),

  lambdasGql.query('patient', () => HttpResponse.json({ data: { patient: PATIENT } })),

  lambdasGql.query('GetPatientOrders', () =>
    HttpResponse.json({
      data: {
        patient: {
          __typename: 'Patient',
          id: PATIENT.id,
          name: { __typename: 'HumanName', full: PATIENT.name.full },
          orders: []
        }
      }
    })
  ),

  lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
    HttpResponse.json({
      data: {
        patient: {
          __typename: 'Patient',
          id: PATIENT.id,
          preferredPharmacies: [],
          address: null
        }
      }
    })
  ),

  lambdasGql.mutation('CreatePrescription', ({ variables }) =>
    HttpResponse.json({
      data: {
        createPrescription: {
          __typename: 'Prescription',
          id: 'rx_123',
          treatment: TREATMENT,
          dispenseQuantity: variables.dispenseQuantity,
          dispenseUnit: variables.dispenseUnit,
          fillsAllowed: variables.fillsAllowed,
          instructions: variables.instructions,
          state: 'DRAFT'
        }
      }
    })
  ),

  lambdasGql.mutation('createOrder', () =>
    HttpResponse.json({
      data: { createOrder: { __typename: 'Order', id: 'ord_abc' } }
    })
  ),

  lambdasGql.query('dispenseUnits', () =>
    HttpResponse.json({
      data: { dispenseUnits: [{ __typename: 'DispenseUnit', ...DISPENSE_UNIT }] }
    })
  ),

  lambdasGql.mutation('updatePatient', () =>
    HttpResponse.json({
      data: { updatePatient: { __typename: 'Patient', id: PATIENT.id } }
    })
  ),

  lambdasGql.mutation('removePatientPreferredPharmacy', () =>
    HttpResponse.json({
      data: { removePatientPreferredPharmacy: { __typename: 'Patient', id: PATIENT.id } }
    })
  )
];

export const defaultHandlers = [...servicesHandlers, ...lambdasHandlers];
