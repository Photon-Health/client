import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { DISPENSE_UNIT_FIELDS, PRESCRIPTION_FIELDS } from '../fragments';
import { DispenseUnit, Prescription, PrescriptionState } from '../types';
import { makeMutation, makeQuery } from '../utils';

/**
 * GetPrescriptionsOptions options
 * @param patientId - Filter the result by patientId
 * @param patientName - Filter the result by patientName
 * @param prescriberId - Filter the result by prescriberId
 * @param state - Filter the result by the state of the prescription (e.g. READY)
 * @param after - Paginated query after this cursor
 * @param first - Specify page size limit (default: 25)
 * @param fragment - Allows you to override the default query to request more fields
 */
export interface GetPrescriptionsOptions {
  patientId?: string;
  patientName?: string;
  prescriberId?: string;
  state?: PrescriptionState;
  after?: string;
  first?: number;
  fragment?: Record<string, DocumentNode>;
}

/**
 * GetPrescriptionOptions options
 * @param id - The id of the prescription
 * @param fragment - Allows you to override the default query to request more fields
 */
export interface GetPrescriptionOptions {
  id: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * GetDispenseUnitOptions options
 * @param fragment - Allows you to override the default query to request more fields
 */
export interface GetDispenseUnitOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * CreatePrescriptionOptions options
 * @param fragment - Allows you to override the default query to request more fields
 */
export interface CreatePrescriptionOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Prescriptions
 */
export class PrescriptionQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  public async getPrescriptions(
    {
      patientId,
      patientName,
      prescriberId,
      state,
      after,
      first,
      fragment
    }: GetPrescriptionsOptions = {
      first: 25,
      fragment: { PrescriptionFields: PRESCRIPTION_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { PrescriptionFields: PRESCRIPTION_FIELDS };
    }
    if (!first) {
      first = 25;
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const GET_PRESCRIPTIONS = gql`
      ${fValue}
      query prescriptions(
        $patientId: ID
        $patientName: String
        $prescriberId: ID
        $state: PrescriptionState
        $after: ID
        $first: Int
      ) {
        prescriptions(
          filter: {
            patientId: $patientId
            patientName: $patientName
            prescriberId: $prescriberId
            state: $state
          }
          after: $after
          first: $first
        ) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ prescriptions: Prescription[] }>(this.apollo, GET_PRESCRIPTIONS, {
      patientId,
      patientName,
      prescriberId,
      state,
      after,
      first
    });
  }

  public async getPrescription(
    { id, fragment }: GetPrescriptionOptions = {
      id: '',
      fragment: { PrescriptionFields: PRESCRIPTION_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { PrescriptionFields: PRESCRIPTION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const GET_PRESCRIPTION = gql`
      ${fValue}
      query prescription($id: ID!) {
        prescription(id: $id) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ prescription: Prescription }>(this.apollo, GET_PRESCRIPTION, {
      id
    });
  }

  public async getDispenseUnits(
    { fragment }: GetDispenseUnitOptions = {
      fragment: { DispenseUnitFields: DISPENSE_UNIT_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { DispenseUnitFields: DISPENSE_UNIT_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const GET_DISPENSE_UNITS = gql`
      ${fValue}
      query dispenseUnits {
        dispenseUnits {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ dispenseUnits: DispenseUnit[] }>(this.apollo, GET_DISPENSE_UNITS, {});
  }

  public createPrescription({ fragment }: CreatePrescriptionOptions) {
    if (!fragment) {
      fragment = { PrescriptionFields: PRESCRIPTION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const CREATE_PRESCRIPTION = gql`
      ${fValue}
      mutation createPrescription(
        $externalId: ID
        $patientId: ID!
        $treatmentId: ID!
        $dispenseAsWritten: Boolean
        $dispenseQuantity: Float!
        $dispenseUnit: String!
        $fillsAllowed: Int!
        $daysSupply: Int
        $instructions: String!
        $notes: String
        $effectiveDate: AWSDate
        $diagnoses: [ID]
      ) {
        createPrescription(
          externalId: $externalId
          patientId: $patientId
          treatmentId: $treatmentId
          dispenseAsWritten: $dispenseAsWritten
          dispenseQuantity: $dispenseQuantity
          dispenseUnit: $dispenseUnit
          fillsAllowed: $fillsAllowed
          daysSupply: $daysSupply
          instructions: $instructions
          notes: $notes
          effectiveDate: $effectiveDate
          diagnoses: $diagnoses
        ) {
          ...${fName}
        }
      }`;
    return makeMutation<{ createPrescription: Prescription } | undefined | null>(
      this.apollo,
      CREATE_PRESCRIPTION
    );
  }

  // DEPRECATED
  public createPrescriptions({ fragment }: CreatePrescriptionOptions) {
    if (!fragment) {
      fragment = { PrescriptionFields: PRESCRIPTION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const CREATE_PRESCRIPTIONS = gql`
      ${fValue}
      mutation createPrescriptions(
        $prescriptions: [PrescriptionInput]!
      ) {
        createPrescriptions(
          prescriptions: $prescriptions
        ) {
          ...${fName}
        }
      }`;
    return makeMutation<{ createPrescriptions: [Prescription] } | undefined | null>(
      this.apollo,
      CREATE_PRESCRIPTIONS
    );
  }
}
