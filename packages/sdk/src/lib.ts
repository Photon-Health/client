import { Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
  OnQueryUpdated
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context/index.js';
import { AuthManager } from './auth';
import { ClinicalQueryManager } from './clinical';
import { ManagementQueryManager } from './management';
import {
  Env as Environment,
  getClinicalUrl,
  clinicalApiUrl,
  lambdasApiUrl,
  clinicalAppUrl
} from './utils';

export * as types from './types';
export * as fragments from './fragments';

import pkg from '../package.json';

const version: string = pkg?.version ?? 'unknown';

export type Env = Environment;

/**
 * Configuration options for Photon SDK
 * @param domain The Auth0 domain
 * @param clientId A client_id of Auth0 client credentials
 * @param redirectURI A url to redirect to after login
 * @param organization An id of an organization to login as
 * @param audience The top-level domain of the Photon API
 * @param uri The GraphQL endpoint of the Photon API
 */
export interface PhotonClientOptions {
  domain?: string;
  clientId: string;
  redirectURI?: string;
  env?: Environment;
  organization?: string;
  audience?: string;
  connection?: string;
  uri?: string;
  developmentMode?: boolean;
}

export class PhotonClient {
  public organization?: string;

  private audience?: string;

  /**
   * The GraphQL endpoint of the "legacy" Photon API
   * */
  private uri?: string;

  /**
   * The GraphQL endpoint of Service's clinical API
   * */
  private clinicalApiUri?: string;

  /**
   * The clinical app url
   */
  public clinicalUrl?: string;

  private auth0Client: Auth0Client;

  /**
   * Authentication functionality of the SDK
   */
  public authentication: AuthManager;

  /**
   * Clinical API functionality of the SDK
   */
  public clinical: ClinicalQueryManager;

  /**
   * Management API functionality of the SDK
   */
  public management: ManagementQueryManager;

  /**
   * Apollo client instance
   */
  public apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * Apollo client services instance
   */
  public apolloClinical: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * Constructs a new PhotonSDK instance
   * @param config - Photon SDK configuration options
   * @remarks - Note, that organization is optional for scenarios in which a provider supports more than themselves.
   */
  constructor(
    {
      domain,
      clientId,
      redirectURI,
      organization,
      env = 'photon',
      audience,
      connection,
      uri,
      developmentMode = false
    }: PhotonClientOptions,
    elementsVersion?: string
  ) {
    this.audience = audience ? audience : lambdasApiUrl[env];
    this.uri = uri ? uri : `${lambdasApiUrl[env]}/graphql`;
    this.clinicalUrl = uri ? getClinicalUrl(uri) : clinicalAppUrl[env];

    this.clinicalApiUri = `${clinicalApiUrl[env]}/graphql`;

    if (developmentMode) {
      this.audience = lambdasApiUrl['neutron'];
      this.uri = `${lambdasApiUrl['neutron']}/graphql`;
      this.clinicalApiUri = `${clinicalApiUrl['neutron']}/graphql`;
    }

    const params: Auth0ClientOptions = {
      domain: domain ? domain : developmentMode ? 'auth.neutron.health' : 'auth.photon.health',
      clientId,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      useRefreshTokensFallback: true,
      authorizationParams: {
        redirect_uri: redirectURI,
        audience: this.audience,
        ...(connection ? { connection } : {})
      }
    };
    this.auth0Client = new Auth0Client(params);
    this.organization = organization;
    this.authentication = new AuthManager({
      authentication: this.auth0Client,
      organization: this.organization,
      audience: this.audience
    });

    this.apollo = this.constructApolloClient({ elementsVersion, isServices: false });
    this.apolloClinical = this.constructApolloClient({ elementsVersion, isServices: true });
    this.clinical = new ClinicalQueryManager(this.apollo);
    this.management = new ManagementQueryManager(this.apollo);
  }

  private constructApolloClient(
    { elementsVersion, isServices }: { elementsVersion?: string; isServices: boolean } = {
      isServices: false
    }
  ) {
    const apollo = new ApolloClient({
      link: setContext(async (_, { headers: baseHeaders, ...rest }) => {
        const token = await this.authentication.getAccessToken();

        const headers = {
          ...baseHeaders,
          'x-photon-sdk-version': version,
          ...(elementsVersion ? { 'x-photon-elements-version': elementsVersion } : {})
        };

        if (!token) {
          return { headers, ...rest };
        }

        return {
          ...rest,
          headers: isServices
            ? {
                ...headers,
                'x-photon-auth-token': token,
                'x-photon-auth-token-type': 'auth0'
              }
            : {
                ...headers,
                authorization: token
              }
        };
      }).concat(
        new HttpLink({
          uri: isServices ? this.clinicalApiUri : this.uri
        })
      ),
      defaultOptions: {
        query: {
          fetchPolicy: 'cache-first',
          errorPolicy: 'all'
        },
        mutate: {
          // Because of the way we do lambdas, we have a _slight_ delay between reads and writes
          // This forces a delay of 1s which isn't the greatest, but also isn't the worst
          // https://github.com/apollographql/apollo-feature-requests/issues/207
          onQueryUpdated: delayRefetchedQuery
        }
      },
      cache: new InMemoryCache({
        // Addresses and names don't have unique ids. So we just allow for merging these
        typePolicies: {
          Patient: {
            fields: {
              name: {
                merge(existing, incoming, { mergeObjects }) {
                  return mergeObjects(existing, incoming);
                }
              },
              address: {
                merge(existing, incoming, { mergeObjects }) {
                  return mergeObjects(existing, incoming);
                }
              }
            }
          },
          User: {
            fields: {
              name: {
                merge(existing, incoming, { mergeObjects }) {
                  return mergeObjects(existing, incoming);
                }
              },
              address: {
                merge(existing, incoming, { mergeObjects }) {
                  return mergeObjects(existing, incoming);
                }
              }
            }
          }
        }
      })
    });
    return apollo;
  }

  /**
   * Sets the organization ID to use
   * @returns PhotonSDK
   */
  public setOrganization(organizationId: string) {
    this.organization = organizationId;
    this.authentication = new AuthManager({
      authentication: this.auth0Client,
      organization: organizationId,
      audience: this.audience
    });
    return this;
  }
}

// https://github.com/apollographql/apollo-feature-requests/issues/207
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
const delayRefetchedQuery: OnQueryUpdated<unknown> = async (observableQuery) => {
  await wait(1000); // 1s to make it super obvious if working or not
  observableQuery.refetch();
};
