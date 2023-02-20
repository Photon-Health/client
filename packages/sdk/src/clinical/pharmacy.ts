import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { PHARMACY_FIELDS } from '../fragments';
import { makeQuery } from '../utils';
import { FulfillmentType, LatLongSearch, Pharmacy } from '../types';

/**
 * GetPharmacies options
 * @param name Filter the result by pharmacy name
 * @param location The latitude, longitude, and radius of the search
 * @param type The fulfillment type of the pharmacy
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetPharmaciesOptions {
  name?: string;
  location?: LatLongSearch;
  type?: FulfillmentType;
  after?: number;
  first?: number;
  fragment?: Record<string, DocumentNode>;
}

/**
 * GetPharmacy options
 * @param id The id of the pharmacy
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetPharmacyOptions {
  id?: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Pharmacies
 */
export class PharmacyQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves all pharmacies, optionally filtered by pharmacy name, in a given latitude/longitude/radius
   * @param options - Query options
   * @returns
   */
  public async getPharmacies(
    { name, location, type, after, first, fragment }: GetPharmaciesOptions = {
      first: 100,
      fragment: { PharmacyFields: PHARMACY_FIELDS }
    }
  ) {
    if (!first) {
      first = 100;
    }
    if (!fragment) {
      fragment = { PharmacyFields: PHARMACY_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment!)[0];
    const GET_PHARMACIES = gql`
      ${fValue}
      query pharmacies($name: String, $location: LatLongSearch, $type: FulfillmentType, $after: Int, $first: Int) {
        pharmacies(name: $name, location: $location, type: $type, after: $after, first: $first) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ pharmacies: Pharmacy[] }>(this.apollo, GET_PHARMACIES, {
      name,
      location,
      type,
      after,
      first
    });
  }

  /**
   * Retrieves pharmacy by id
   * @param options - Query options
   * @returns
   */
  public async getPharmacy(
    { id, fragment }: GetPharmacyOptions = {
      id: '',
      fragment: { PharmacyFields: PHARMACY_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { PharmacyFields: PHARMACY_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_PHARMACY = gql`
          ${fValue}
          query pharmacy($id: ID!) {
            pharmacy(id: $id) {
              ...${fName}
            }
          }
        `;
    return makeQuery<{ pharmacy: Pharmacy }>(this.apollo, GET_PHARMACY, { id: id });
  }
}
