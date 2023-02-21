import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client'
import { MEDICATION_FIELDS, SEARCH_MEDICATION_FIELDS } from '../fragments'
import { makeQuery } from '../utils'
import {
  Medication,
  MedicationFilter,
  QueryMedicationConceptsArgs,
  SearchMedication
} from '../types'

/**
 * GetConceptOptions options
 * @param name Filter concepts by name
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetConceptOptions {
  name: string
  fragment?: Record<string, DocumentNode>
}

/**
 * GetStrengthOptions options
 * @param id SearchMedication CONCEPT id
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetStrengthsOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * GetRoutesOptions options
 * @param id SearchMedication STRENGTH id
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetRoutesOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * GetFormsOptions options
 * @param id SearchMedication ROUTE id
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetFormsOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * GetProductOptions options
 * @param id SearchMedication FORM id or any valid prescribable concept id
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetProductOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * GetProductOptions options
 * @param id SearchMedication FORM id or any Medication of type DRUG
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetProductOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * GetPackageOptions options
 * @param id Any valid Medication of type PRODUCT
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetPackageOptions {
  id: string
  fragment?: Record<string, DocumentNode>
}

/**
 * Contains various methods for Photon Medications
 */
export class SearchMedicationQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo
  }

  /**
   * Retrieves all medication concepts, filtered by name
   * @param options - Query options
   * @returns
   */
  public async getConcepts({ name, fragment }: GetConceptOptions) {
    if (!fragment) {
      fragment = { SearchMedicationFields: SEARCH_MEDICATION_FIELDS }
    }
    let [fName, fValue] = Object.entries(fragment)[0]
    const GET_CONCEPTS = gql`
        ${fValue}
        query medicationConcepts($name: String!) {
          medicationConcepts(name: $name) {
            ...${fName}
      }
    }
      `
    return makeQuery<{ medicationConcepts: SearchMedication[] }>(this.apollo, GET_CONCEPTS, {
      name
    })
  }

  /**
   * Retrieves all strengths for a SearchMedication CONCEPT
   * @param options - Query options
   * @returns
   */
  public async getStrengths({ id, fragment }: GetStrengthsOptions) {
    if (!fragment) {
      fragment = { SearchMedicationFields: SEARCH_MEDICATION_FIELDS }
    }
    let [fName, fValue] = Object.entries(fragment)[0]
    const GET_STRENGTHS = gql`
          ${fValue}
          query medicationStrengths($id: String!) {
            medicationStrengths(id: $id) {
              ...${fName}
        }
      }
        `
    return makeQuery<{ medicationStrengths: SearchMedication[] }>(this.apollo, GET_STRENGTHS, {
      id
    })
  }

  /**
   * Retrieves all routes for a SearchMedication STRENGTH
   * @param options - Query options
   * @returns
   */
  public async getRoutes({ id, fragment }: GetRoutesOptions) {
    if (!fragment) {
      fragment = { SearchMedicationFields: SEARCH_MEDICATION_FIELDS }
    }
    let [fName, fValue] = Object.entries(fragment)[0]
    const GET_ROUTES = gql`
              ${fValue}
              query medicationRoutes($id: String!) {
                medicationRoutes(id: $id) {
                  ...${fName}
            }
          }
            `
    return makeQuery<{ medicationRoutes: SearchMedication[] }>(this.apollo, GET_ROUTES, {
      id
    })
  }

  /**
   * Retrieves all forms for a SearchMedication ROUTE
   * @param options - Query options
   * @returns
   */
  public async getForms({ id, fragment }: GetFormsOptions) {
    if (!fragment) {
      fragment = { MedicationFields: MEDICATION_FIELDS }
    }
    let [fName, fValue] = Object.entries(fragment)[0]
    const GET_FORMS = gql`
              ${fValue}
              query medicationForms($id: String!) {
                medicationForms(id: $id) {
                  ...${fName}
            }
          }
            `
    return makeQuery<{ medicationForms: Medication[] }>(this.apollo, GET_FORMS, {
      id
    })
  }

  /**
   * Retrieves all products for a SearchMedication FORM/Medication DRUG
   * @param options - Query options
   * @returns
   */
  public async getProducts({ id, fragment }: GetProductOptions) {
    if (!fragment) {
      fragment = { MedicationFields: MEDICATION_FIELDS }
    }
    let [fName, fValue] = Object.entries(fragment)[0]
    const GET_PRODUCTS = gql`
                  ${fValue}
                  query medicationProducts($id: String!) {
                    medicationProducts(id: $id) {
                      ...${fName}
                }
              }
                `
    return makeQuery<{ medicationProducts: Medication[] }>(this.apollo, GET_PRODUCTS, {
      id
    })
  }

  /**
   * Retrieves all packages for a Medication PRODUCT
   * @param options - Query optiofns
   * @returns
   */
  public async getPackages({ id, fragment }: GetPackageOptions) {
    if (!fragment) {
      fragment = { MedicationFields: MEDICATION_FIELDS }
    }
    let [fName, fValue] = Object.entries(fragment)[0]
    const GET_PACKAGES = gql`
                  ${fValue}
                  query medicationPackages($id: String!) {
                    medicationPackages(id: $id) {
                      ...${fName}
                }
              }
                `
    return makeQuery<{ medicationPackages: Medication[] }>(this.apollo, GET_PACKAGES, {
      id
    })
  }
}
