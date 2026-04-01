import { graphql, HttpResponse } from 'msw';

// Scoped handlers — for per-test overrides when the same operation name
// is used by different endpoints with different responses.
// Tau env: lambdas shares boson's API URL, clinical uses local tau URL.
const lambdasGql = graphql.link('https://api.boson.health/graphql');
const clinicalGql = graphql.link('http://clinical-api.tau.health:8080/graphql');

export { lambdasGql, clinicalGql };

export const PATIENT = {
  __typename: 'Patient',
  id: 'pat_123',
  externalId: 'ext_pat_123',
  name: {
    __typename: 'HumanName',
    full: 'Sally Patient',
    first: 'Sally',
    middle: null,
    last: 'Patient',
    title: 'MD'
  },
  dateOfBirth: '1990-01-01',
  sex: 'FEMALE',
  gender: 'female',
  email: 'sally@example.com',
  phone: '+17185551234',
  address: null,
  preferredPharmacies: []
};

export const TREATMENT = {
  __typename: 'Treatment',
  id: 'trt_123',
  name: 'Amoxicillin 500mg capsule',
  codes: {}
};

export const DISPENSE_UNIT = {
  id: 'du_123',
  name: 'Tablet'
};

const servicesHandlers = [
  // Clinical API operations (via apolloClinical)
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
      data: { me: { name: { title: 'MD' }, address: { state: 'NY' } } }
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

const lambdasHandlers = [
  // Lambdas API operations (via apollo)
  // Components use 'GetPatient', SDK uses 'patient'
  lambdasGql.query('GetPatient', () =>
    HttpResponse.json({
      data: { patient: PATIENT }
    })
  ),

  lambdasGql.query('patient', () =>
    HttpResponse.json({
      data: { patient: PATIENT }
    })
  ),

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
      data: {
        createOrder: { __typename: 'Order', id: 'ord_abc' }
      }
    })
  ),

  lambdasGql.query('dispenseUnits', () =>
    HttpResponse.json({
      data: {
        dispenseUnits: [{ __typename: 'DispenseUnit', ...DISPENSE_UNIT }]
      }
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
