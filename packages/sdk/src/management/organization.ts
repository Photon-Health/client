import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { ORGANIZATION_FIELDS } from '../fragments';
import { makeQuery } from '../utils';
import { Organization } from '../types';

/**
 * GetOrganization options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetOrganizationOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * GetOrganizations options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetOrganizationsOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Auth0 Organizations
 */
export class OrgQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves the organization associated with the authenticated user
   * @param options - Query options
   * @returns
   */
  public async getOrganization(
    { fragment }: GetOrganizationOptions = {
      fragment: { OrganizationFields: ORGANIZATION_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { OrganizationFields: ORGANIZATION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment!)[0];
    const GET_ORGANIZATION = gql`
      ${fValue}
      query organization {
        organization {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ organization: Organization }>(this.apollo, GET_ORGANIZATION);
  }

  /**
   * Retrieves all organizations associated with the auhenticated user
   * @param options - Query options
   * @returns
   */
  public async getOrganizations(
    { fragment }: GetOrganizationsOptions = {
      fragment: { OrganizationFields: ORGANIZATION_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { OrganizationFields: ORGANIZATION_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment!)[0];
    const GET_ORGANIZATIONS = gql`
      ${fValue}
      query organizations {
        organizations {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ organizations: Organization[] }>(this.apollo, GET_ORGANIZATIONS);
  }
}
