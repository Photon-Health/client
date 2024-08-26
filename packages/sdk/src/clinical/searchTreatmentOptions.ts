import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { TREATMENT_OPTION_FIELDS } from '../fragments';
import { makeQuery } from '../utils';
import { Catalog } from '../types';

/**
 * Search Treatment Options options
 * @param searchString Search string to use for searching treatment options
 */
export interface SearchTreatmentOptionsOptions {
  searchTerm: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Catalogs
 */
export class TreatmentOptionsQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves treatment options by search string
   * @param options - Query options
   * @returns
   */
  public async searchTreatmentOptions(
    { searchTerm, fragment }: SearchTreatmentOptionsOptions = {
      searchTerm: '',
      fragment: { TreatmentOptionFields: TREATMENT_OPTION_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { TreatmentOptionFields: TREATMENT_OPTION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const SEARCH_TREATMENT_OPTIONS = gql`
      ${fValue}
      query searchTreatmentOptions($searchTerm: ID) {
        catalog(searchTerm: $searchTerm) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ catalog: Catalog }>(this.apollo, SEARCH_TREATMENT_OPTIONS, { searchTerm });
  }
}
