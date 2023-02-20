import {
  ApolloClient,
  DocumentNode,
  gql,
  NormalizedCacheObject,
} from "@apollo/client";
import { ALLERGEN_FIELDS } from "../fragments";
import { makeQuery } from "../utils";
import { Allergen, AllergenFilter } from "../types";

/**
 * GetAllergens options
 * @param filter Filter allergens (fuzzy) by name
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetAllergensOptions {
  filter?: AllergenFilter;
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Allergens
 */
export class AllergenQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(
    apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>
  ) {
    this.apollo = apollo;
  }

  /**
   * Retrieves all allergens, optionally filtered by name (fuzzy)
   * @param options - Query options
   * @returns
   */
  public async getAllergens(
    { fragment, filter }: GetAllergensOptions = {
      fragment: { AllergenFields: ALLERGEN_FIELDS },
    }
  ) {
    if (!fragment) {
      fragment = { AllergenFields: ALLERGEN_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_ALLERGENS = gql`
        ${fValue}
        query allergens($filter: AllergenFilter) {
            allergens(filter: $filter) {
                ...${fName}
            }
        }
      `;
    return makeQuery<{ allergens: Allergen[] }>(this.apollo, GET_ALLERGENS, {
      filter,
    });
  }
}
