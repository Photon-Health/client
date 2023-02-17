import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { ClientQueryManager } from "./client";
import { OrgQueryManager } from "./organization";
import { WebhookQueryManager } from "./webhook";

/**
  * Contains various methods for Photon Management API
  */
export class ManagementQueryManager {
  /**
   * Methods for interacting with Auth0 Clients
   */
  public client: ClientQueryManager;
  /**
   * Methods for interacting with Auth0 Organizations
   */
  public organization: OrgQueryManager;
  /**
   * Methods for interacting with Photon Webhooks
   */
  public webhook: WebhookQueryManager;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(
    apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>
  ) {
    this.client = new ClientQueryManager(apollo);
    this.organization = new OrgQueryManager(apollo);
    this.webhook = new WebhookQueryManager(apollo);
  }
}
