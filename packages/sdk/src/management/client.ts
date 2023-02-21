import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { CLIENT_FIELDS } from '../fragments';
import { makeMutation, makeQuery } from '../utils';
import { Client } from '../types';

/**
 * GetClients options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetClientsOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * RotateSecret options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface RotateSecretOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Auth0 Clients
 */
export class ClientQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves all Auth0 clients based on currently authenticated organization
   * @param options - Query options
   * @returns
   */
  public async getClients(
    { fragment }: GetClientsOptions = {
      fragment: { ClientFields: CLIENT_FIELDS }
    }
  ) {
    let [fName, fValue] = Object.entries(fragment!)[0];
    const GET_CLIENTS = gql`
          ${fValue}
          query clients {
            clients {
              ...${fName}
            }
          }
        `;
    return makeQuery<{ clients: Client[] }>(this.apollo, GET_CLIENTS);
  }

  /**
   * Rotates client_secret for the authenticated Auth0 organization
   * @param options - Query options
   * @returns
   */
  public rotateSecret({ fragment }: RotateSecretOptions) {
    if (!fragment) {
      fragment = { ClientFields: CLIENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const ROTATE_SECRET = gql`
      ${fValue}
      mutation rotateSecret(
        $id: ID!
      ) {
        rotateSecret(id: $id) {
          ...${fName}
        }
      }
    `;
    return makeMutation<{ rotateSecret: Client } | undefined | null>(this.apollo, ROTATE_SECRET);
  }
}
