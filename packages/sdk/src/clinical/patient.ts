import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { PATIENT_FIELDS } from '../fragments';
import { makeMutation, makeQuery } from '../utils';
import { Patient } from '../types';

/**
 * GetPatient options
 * @param id The id of the patient
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetPatientOptions {
  id?: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * GetPatients options
 * @param after Paginated query after this cursor
 * @param first Specify page size limit (default: 25)
 * @param name Filter the result by patient name
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetPatientsOptions {
  after?: string;
  first?: number;
  name?: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * CreatePatient options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface CreatePatientOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * UpdatePatient options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface UpdatePatientOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * RemovePatientPreferredPharmacy options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface RemovePatientPreferredPharmacyOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * removePatientAllergy options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface RemovePatientAllergyOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Patients
 */
export class PatientQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves patient by id
   * @param options - Query options
   * @returns
   */
  public async getPatient(
    { id, fragment }: GetPatientOptions = {
      id: '',
      fragment: { PatientFields: PATIENT_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { PatientFields: PATIENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment!)[0];
    const GET_PATIENT = gql`
      ${fValue}
      query patient($id: ID!) {
        patient(id: $id) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ patient: Patient }>(this.apollo, GET_PATIENT, { id });
  }

  /**
   * Retrieves all patients in a paginated fashion, optionally filtered by name
   * @param options - Query options
   * @returns
   */
  public async getPatients(
    { after, first, name, fragment }: GetPatientsOptions = {
      first: 25,
      fragment: { PatientFields: PATIENT_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { PatientFields: PATIENT_FIELDS };
    }
    if (!first) {
      first = 25;
    }
    let [fName, fValue] = Object.entries(fragment!)[0];
    const GET_PATIENTS = gql`
      ${fValue}
      query patients($after: ID, $name: String, $first: Int) {
        patients(after: $after, first: $first, filter: { name: $name }) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ patients: Patient[] }>(this.apollo, GET_PATIENTS, {
      after,
      name,
      first
    });
  }

  /**
   * Creates a new patient
   * @param options - Query options
   * @returns
   */
  public createPatient({ fragment }: CreatePatientOptions) {
    if (!fragment) {
      fragment = { PatientFields: PATIENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const CREATE_PATIENT = gql`
      ${fValue}
      mutation createPatient(
        $externalId: ID
        $name: NameInput!
        $dateOfBirth: AWSDate!
        $sex: SexType!
        $gender: String
        $email: AWSEmail
        $phone: AWSPhone!
        $address: AddressInput
        $allergies: [AllergenInput]
        $medicationHistory: [MedHistoryInput]
        $preferredPharmacies: [ID]
      ) {
        createPatient(
          externalId: $externalId
          name: $name
          dateOfBirth: $dateOfBirth
          sex: $sex
          gender: $gender
          address: $address
          email: $email
          phone: $phone
          allergies: $allergies
          medicationHistory: $medicationHistory
          preferredPharmacies: $preferredPharmacies
        ) {
          ...${fName}
        }
      }`;
    return makeMutation<{ createPatient: Patient } | undefined | null>(this.apollo, CREATE_PATIENT);
  }

  /**
   * Updates an existing patient
   * @param options - Query options
   * @returns
   */
  public updatePatient({ fragment }: UpdatePatientOptions) {
    if (!fragment) {
      fragment = { PatientFields: PATIENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const UPDATE_PATIENT = gql`
      ${fValue}
      mutation updatePatient(
        $id: ID!
        $externalId: ID
        $name: NameInput
        $dateOfBirth: AWSDate
        $sex: SexType
        $gender: String
        $email: AWSEmail
        $phone: AWSPhone
        $allergies: [AllergenInput]
        $medicationHistory: [MedHistoryInput]
        $address: AddressInput
        $preferredPharmacies: [ID]
      ) {
        updatePatient(
          id: $id
          externalId: $externalId
          name: $name
          dateOfBirth: $dateOfBirth
          sex: $sex
          gender: $gender
          email: $email
          phone: $phone
          allergies: $allergies
          medicationHistory: $medicationHistory
          address: $address,
          preferredPharmacies: $preferredPharmacies
        ) {
          ...${fName}
        }
      }`;
    return makeMutation<{ updatePatient: Patient } | undefined | null>(this.apollo, UPDATE_PATIENT);
  }

  /**
   * Adds a preferred pharmcy to a patient
   * @param options - Query options
   * @returns
   */
  public removePatientPreferredPharmacy({ fragment }: RemovePatientPreferredPharmacyOptions) {
    if (!fragment) {
      fragment = { PatientFields: PATIENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const REMOVE_PATIENT_PREFERRED_PHARM = gql`
      ${fValue}
      mutation removePatientPreferredPharmacy(
        $patientId: ID!
        $pharmacyId: ID!
      ) {
        removePatientPreferredPharmacy(
          patientId: $patientId
          pharmacyId: $pharmacyId
        ) {
          ...${fName}
        }
      }`;
    return makeMutation<{ removePatientPreferredPharmacy: Patient } | undefined | null>(
      this.apollo,
      REMOVE_PATIENT_PREFERRED_PHARM
    );
  }

  /**
   * Removes an allergen from a patient
   * @param options - Query options
   * @returns
   */
  public removePatientAllergy({ fragment }: RemovePatientAllergyOptions) {
    if (!fragment) {
      fragment = { PatientFields: PATIENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const REMOVE_PATIENT_ALLERGY = gql`
      ${fValue}
      mutation removePatientAllergy(
        $id: ID!
        $allergenId: ID!
      ) {
        updatePatient(
          id: $id
          allergenId: $allergenId
        ) {
          ...${fName}
        }
      }`;
    return makeMutation<{ removePatientAllergy: Patient } | undefined | null>(
      this.apollo,
      REMOVE_PATIENT_ALLERGY
    );
  }
}
