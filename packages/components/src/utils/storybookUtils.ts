import {
  Fill,
  FillState,
  Order,
  OrderState,
  Patient,
  Prescription,
  PrescriptionState,
  SexType,
  Treatment
} from '@photonhealth/sdk/src/types';
import { MedHistoryPrescription } from '../systems/PatientMedHistory';

export function createTestPatient(): Patient {
  return {
    dateOfBirth: '2020-12-31',
    id: 'test-patient-id-1',
    name: {
      first: 'test-patient-first-name',
      full: 'test-patient-full-name',
      last: 'test-patient-last-name'
    },
    phone: '123-456-7890',
    sex: SexType.Unknown
  };
}

function createTestOrder(): Order {
  return {
    createdAt: undefined,
    fills: [],
    id: '',
    patient: createTestPatient(),
    state: OrderState.Completed
  };
}

export function createTestPrescriber() {
  return {
    email: undefined,
    id: '',
    name: {
      first: 'test-provider-first-name',
      full: '',
      last: 'test-provider-last-name'
    },
    organizations: [],
    phone: undefined
  };
}

export function createTestPrescription(options: Partial<Prescription> = {}): Prescription {
  const testFill: Fill = {
    id: '',
    order: createTestOrder(),
    requestedAt: undefined,
    state: FillState.Sent,
    treatment: createTestTreatment()
  };
  return {
    dispenseQuantity: 0,
    effectiveDate: undefined,
    expirationDate: undefined,
    fills: [testFill],
    fillsAllowed: 0,
    fillsRemaining: 0,
    id: '',
    instructions: '',
    patient: createTestPatient(),
    prescriber: createTestPrescriber(),
    state: PrescriptionState.Expired,
    treatment: createTestTreatment(),
    writtenAt: undefined,
    dispenseUnit: 'Each',
    ...options
  };
}

export function createTestMedHistoryPrescription(
  options: Partial<MedHistoryPrescription> = {}
): MedHistoryPrescription {
  return {
    dispenseQuantity: 0,
    daysSupply: 0,
    dispenseAsWritten: false,
    fillsAllowed: 0,
    id: '',
    instructions: '',
    notes: '',
    writtenAt: undefined,
    dispenseUnit: 'Each',
    ...options
  };
}

let treatmentIdCounter = 1; // Counter to ensure unique IDs
export function createTestTreatment(options: Partial<Treatment> = {}) {
  return {
    id: `med_${treatmentIdCounter++}`,
    description: 'test-treatment-description-1',
    name: 'test-treatment-name-1',
    codes: {
      HCPCS: 'test-HCPCS',
      SKU: 'test-SKU',
      packageNDC: 'test-packageNDC',
      productNDC: 'test-productNDC',
      rxcui: 'test-rxcui'
    },
    ...options
  };
}
