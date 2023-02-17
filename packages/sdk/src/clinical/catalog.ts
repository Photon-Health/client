import {
  ApolloClient,
  DocumentNode,
  gql,
  NormalizedCacheObject,
} from "@apollo/client";
import { CATALOG_FIELDS, MEDICATION_FIELDS } from "../fragments";
import { makeMutation, makeQuery } from "../utils";
import { Catalog, Treatment } from "../types";

/**
 * GetCatalogs options
 * @param fragment Allows you to override the default query to request more fields
 */
 export interface GetCatalogsOptions {
  fragment?: Record<string, DocumentNode>
}

/**
 * GetCatalog options
 * @param id The id of the catalog to fetch
 * @param fragment Allows you to override the default query to request more fields
 */
 export interface GetCatalogOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * AddToCatalogOptions options
 * @param fragment Allows you to override the default query to request more fields
 */
 export interface AddToCatalogOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * RemoveFromCatalogOptions options
 * @param fragment Allows you to override the default query to request more fields
 */
 export interface RemoveFromCatalogOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
  * Contains various methods for Photon Catalogs
  */
export class CatalogQueryManager {
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
   * Retrieves all catalogs based on currently authenticated organization
   * @param options - Query options
   * @returns
   */
  public async getCatalogs(
    { fragment }: GetCatalogsOptions = {
      fragment: { CatalogFields: CATALOG_FIELDS },
    }
  ) {
    if (!fragment) {
      fragment = { CatalogFields: CATALOG_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_CATALOGS = gql`
      ${fValue}
      query catalogs {
        catalogs {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ catalogs: Catalog[] }>(this.apollo, GET_CATALOGS);
  }

  /**
   * Retrieves catalog by id
   * @param options - Query options
   * @returns
   */
  public async getCatalog(
    {
      id,
      fragment,
    }: GetCatalogOptions = {
      id: "",
      fragment: { CatalogFields: CATALOG_FIELDS },
    }
  ) {
    if (!fragment) {
      fragment = { CatalogFields: CATALOG_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_CATALOG = gql`
      ${fValue}
      query catalog($id: ID) {
        catalog(id: $id) {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ catalog: Catalog }>(this.apollo, GET_CATALOG, { id });
  }

  /**
   * Adds a treatment to a catalog
   * @param options - Query options
   * @returns
   */
   public addToCatalog({ fragment }: AddToCatalogOptions) {
    if (!fragment) {
      fragment = { MedicationFields: MEDICATION_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const ADD_TO_CATALOG = gql`
      ${fValue}
      mutation addToCatalog(
        $catalogId: ID!
        $treatmentId: ID!
      ) {
        addToCatalog(
          catalogId: $catalogId
          treatmentId: $treatmentId
        ) {
          ...${fName}
        }
      }
    `;
    return makeMutation<{ addToCatalog: Treatment } | undefined | null>(
      this.apollo,
      ADD_TO_CATALOG
    );
  }

  /**
   * Removes a treatment from a catalog
   * @param options - Query options
   * @returns
   */
   public removeFromCatalog({ fragment }: RemoveFromCatalogOptions) {
    if (!fragment) {
      fragment = { MedicationFields: MEDICATION_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const REMOVE_FROM_CATALOG = gql`
      ${fValue}
      mutation removeFromCatalog(
        $catalogId: ID!
        $treatmentId: ID!
      ) {
        removeFromCatalog(
          catalogId: $catalogId
          treatmentId: $treatmentId
        ) {
          ...${fName}
        }
      }
    `;
    return makeMutation<{ removeFromCatalog: Treatment } | undefined | null>(
      this.apollo,
      REMOVE_FROM_CATALOG
    );
  }
}
