import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { WEBHOOK_CONFIG_FIELDS } from '../fragments';
import { makeMutation, makeQuery } from '../utils';
import { WebhookConfig } from '../types';

/**
 * GetWebhooks options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetWebhooksOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * CreateWebhook options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface CreateWebhookOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Webhooks
 */
export class WebhookQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves list of webhook associated with currently authenticated organization
   * @param options - Query options
   * @returns
   */
  public async getWebhooks(
    { fragment }: GetWebhooksOptions = {
      fragment: { WebhookFields: WEBHOOK_CONFIG_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { WebhookFields: WEBHOOK_CONFIG_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment!)[0];
    const GET_WEBHOOKS = gql`
      ${fValue}
      query webhooks {
        webhooks {
          ...${fName}
        }
      }
    `;
    return makeQuery<{ webhooks: WebhookConfig[] }>(this.apollo, GET_WEBHOOKS);
  }

  /**
   * Creates a new webhook for the authenticated organization
   * @param options - Query options
   * @returns
   */
  public createWebhook({ fragment }: CreateWebhookOptions) {
    if (!fragment) {
      fragment = { WebhookFields: WEBHOOK_CONFIG_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const CREATE_WEBHOOK = gql`
      ${fValue}
      mutation createWebhook(
        $name: String
        $filters: [String]
        $sharedSecret: String
        $url: String!
      ) {
        createWebhookConfig(name: $name, filters: $filters, sharedSecret: $sharedSecret, url: $url) {
          ...${fName}
        }
      }`;
    return makeMutation<{ createWebhookConfig: WebhookConfig } | undefined | null>(
      this.apollo,
      CREATE_WEBHOOK
    );
  }

  /**
   * Deletes a webhook, by id, inside the currently authenticated organization
   * @returns
   */
  public deleteWebhook() {
    const DELETE_WEBHOOK = gql`
      mutation deleteWebhookConfig($id: String!) {
        deleteWebhookConfig(id: $id)
      }
    `;
    return makeMutation<{ deleteWebhookConfig: boolean } | undefined | null>(
      this.apollo,
      DELETE_WEBHOOK
    );
  }
}
