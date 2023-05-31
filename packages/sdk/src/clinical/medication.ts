import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { MEDICATION_FIELDS } from '../fragments';
import { makeQuery } from '../utils';
import { Medication, MedicationFilter } from '../types';

/**
 * GetMedications options
 * @param name Filter medications by drug name
 * @param type Filter medication by type (RX or OTC)
 * @param code Filter medication by NDC/RxCUI
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetMedicationsOptions {
  filter?: MedicationFilter;
  after?: string;
  first?: number;
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Medications
 */
export class MedicationQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves all medications, optionally filtered by name, type, and code
   * @param options - Query options
   * @returns
   */
  public async getMedications(
    { filter, after, first, fragment }: GetMedicationsOptions = {
      fragment: { MedicationFields: MEDICATION_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { MedicationFields: MEDICATION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const GET_MEDICATIONS = gql`
      ${fValue}
      query medications($filter: MedicationFilter, $after: ID, $first: Int) {
        medications(filter: $filter, after: $after, first: $first) {
          ...${fName}
    }
  }
    `;
    return makeQuery<{ medications: Medication[] }>(this.apollo, GET_MEDICATIONS, {
      filter,
      after,
      first
    });
  }
}
