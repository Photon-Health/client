/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  fragment ClientInfoCardFragment on Client {\n    id\n    appType\n    name\n    secret\n  }\n": types.ClientInfoCardFragmentFragmentDoc,
    "\n  query ClientsDeveloperTabQuery {\n    clients {\n      id\n      ...ClientInfoCardFragment\n    }\n  }\n": types.ClientsDeveloperTabQueryDocument,
    "\n  mutation RotateSecret($clientId: ID!) {\n    rotateClientSecret(clientId: $clientId) {\n      id\n    }\n  }\n": types.RotateSecretDocument,
    "\n  fragment InviteFormFragment on Invite {\n    id\n    invitee\n    inviter\n    expires_at\n  }\n": types.InviteFormFragmentFragmentDoc,
    "\n  query UserInviteFormQuery {\n    me {\n      id\n      name {\n        full\n      }\n    }\n  }\n": types.UserInviteFormQueryDocument,
    "\n  mutation InviteUser(\n    $email: String!\n    $inviter: String\n    $roles: [String!]!\n    $provider: ProviderInput\n  ) {\n    inviteUser(email: $email, inviter: $inviter, roles: $roles, provider: $provider) {\n      id\n    }\n  }\n": types.InviteUserDocument,
    "\n  fragment InviteFragment on Invite {\n    id\n    invitee\n    inviter\n    expired\n    expires_at\n  }\n": types.InviteFragmentFragmentDoc,
    "\n  mutation ResendInvite($inviteId: ID!) {\n    resendInvite(inviteId: $inviteId) {\n      id\n    }\n  }\n": types.ResendInviteDocument,
    "\n  mutation DeleteInvite($inviteId: ID!) {\n    deleteInvite(inviteId: $inviteId)\n  }\n": types.DeleteInviteDocument,
    "\n  query InvitesQuery {\n    invites {\n      ...InviteFragment\n      id\n      expired\n      expires_at\n    }\n  }\n": types.InvitesQueryDocument,
    "\n  query OrganizationQuery {\n    organization {\n      id\n      name\n      address {\n        street1\n        street2\n        postalCode\n        city\n        state\n        country\n      }\n      fax\n      phone\n      email\n    }\n  }\n": types.OrganizationQueryDocument,
    "\n  mutation UpdateOrganization($input: OrganizationInput!) {\n    updateOrganization(input: $input)\n  }\n": types.UpdateOrganizationDocument,
    "\n  query MeProfileQuery {\n    me {\n      id\n      npi\n      phone\n      fax\n      email\n      address {\n        street1\n        street2\n        state\n        postalCode\n        country\n        city\n      }\n      name {\n        first\n        full\n        last\n        middle\n        title\n      }\n      roles {\n        description\n        id\n        name\n      }\n    }\n    organization {\n      id\n      name\n    }\n  }\n": types.MeProfileQueryDocument,
    "\n  mutation UpdateMyProfile($updateMyProfileInput: ProfileInput!) {\n    updateMyProfile(input: $updateMyProfileInput)\n  }\n": types.UpdateMyProfileDocument,
    "\n  fragment UserFragment on User {\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n": types.UserFragmentFragmentDoc,
    "\n  mutation SetUserRoles($userId: ID!, $roles: [ID!]!) {\n    setUserRoles(userId: $userId, roles: $roles)\n  }\n": types.SetUserRolesDocument,
    "\n  mutation UpdateProviderProfile(\n    $providerId: ID!\n    $updateProviderProfileInput: UpdateProviderProfileInput!\n  ) {\n    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)\n  }\n": types.UpdateProviderProfileDocument,
    "\n  mutation RemoveUserFromOrganization($userId: ID!) {\n    removeUserFromOrganization(userId: $userId)\n  }\n": types.RemoveUserFromOrganizationDocument,
    "\n  query UsersListQuery {\n    users {\n      id\n      ...UserFragment\n      email\n      name {\n        full\n      }\n      roles {\n        id\n        name\n      }\n    }\n    roles {\n      name\n      id\n    }\n  }\n": types.UsersListQueryDocument,
    "\n  query AllRolesSelect {\n    roles {\n      id\n      name\n      description\n    }\n  }\n": types.AllRolesSelectDocument,
    "\n  fragment WebhookItemFragment on WebhookConfig {\n    id\n    url\n  }\n": types.WebhookItemFragmentFragmentDoc,
    "\n  mutation WebhookItemDeleteMutation($webhookId: ID!) {\n    deleteWebhookConfig(webhookId: $webhookId)\n  }\n": types.WebhookItemDeleteMutationDocument,
    "\n  query WebhookListQuery {\n    webhooks {\n      id\n      ...WebhookItemFragment\n    }\n  }\n": types.WebhookListQueryDocument,
    "\n  mutation WebhookFormCreateMutation($url: String!, $sharedSecret: String!, $filters: [String!]!) {\n    createWebhookConfig(url: $url, filters: $filters, sharedSecret: $sharedSecret)\n  }\n": types.WebhookFormCreateMutationDocument,
    "\n  query SettingsPageQuery {\n    me {\n      roles {\n        id\n      }\n    }\n    organization {\n      id\n      name\n      ...OrganizationTreatmentTabFragment\n    }\n    roles {\n      name\n      id\n    }\n  }\n": types.SettingsPageQueryDocument,
    "\n  fragment OrganizationTreatmentTabFragment on Organization {\n    id\n    name\n  }\n": types.OrganizationTreatmentTabFragmentFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ClientInfoCardFragment on Client {\n    id\n    appType\n    name\n    secret\n  }\n"): (typeof documents)["\n  fragment ClientInfoCardFragment on Client {\n    id\n    appType\n    name\n    secret\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClientsDeveloperTabQuery {\n    clients {\n      id\n      ...ClientInfoCardFragment\n    }\n  }\n"): (typeof documents)["\n  query ClientsDeveloperTabQuery {\n    clients {\n      id\n      ...ClientInfoCardFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RotateSecret($clientId: ID!) {\n    rotateClientSecret(clientId: $clientId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation RotateSecret($clientId: ID!) {\n    rotateClientSecret(clientId: $clientId) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment InviteFormFragment on Invite {\n    id\n    invitee\n    inviter\n    expires_at\n  }\n"): (typeof documents)["\n  fragment InviteFormFragment on Invite {\n    id\n    invitee\n    inviter\n    expires_at\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserInviteFormQuery {\n    me {\n      id\n      name {\n        full\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserInviteFormQuery {\n    me {\n      id\n      name {\n        full\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InviteUser(\n    $email: String!\n    $inviter: String\n    $roles: [String!]!\n    $provider: ProviderInput\n  ) {\n    inviteUser(email: $email, inviter: $inviter, roles: $roles, provider: $provider) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation InviteUser(\n    $email: String!\n    $inviter: String\n    $roles: [String!]!\n    $provider: ProviderInput\n  ) {\n    inviteUser(email: $email, inviter: $inviter, roles: $roles, provider: $provider) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment InviteFragment on Invite {\n    id\n    invitee\n    inviter\n    expired\n    expires_at\n  }\n"): (typeof documents)["\n  fragment InviteFragment on Invite {\n    id\n    invitee\n    inviter\n    expired\n    expires_at\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResendInvite($inviteId: ID!) {\n    resendInvite(inviteId: $inviteId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation ResendInvite($inviteId: ID!) {\n    resendInvite(inviteId: $inviteId) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteInvite($inviteId: ID!) {\n    deleteInvite(inviteId: $inviteId)\n  }\n"): (typeof documents)["\n  mutation DeleteInvite($inviteId: ID!) {\n    deleteInvite(inviteId: $inviteId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query InvitesQuery {\n    invites {\n      ...InviteFragment\n      id\n      expired\n      expires_at\n    }\n  }\n"): (typeof documents)["\n  query InvitesQuery {\n    invites {\n      ...InviteFragment\n      id\n      expired\n      expires_at\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OrganizationQuery {\n    organization {\n      id\n      name\n      address {\n        street1\n        street2\n        postalCode\n        city\n        state\n        country\n      }\n      fax\n      phone\n      email\n    }\n  }\n"): (typeof documents)["\n  query OrganizationQuery {\n    organization {\n      id\n      name\n      address {\n        street1\n        street2\n        postalCode\n        city\n        state\n        country\n      }\n      fax\n      phone\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOrganization($input: OrganizationInput!) {\n    updateOrganization(input: $input)\n  }\n"): (typeof documents)["\n  mutation UpdateOrganization($input: OrganizationInput!) {\n    updateOrganization(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MeProfileQuery {\n    me {\n      id\n      npi\n      phone\n      fax\n      email\n      address {\n        street1\n        street2\n        state\n        postalCode\n        country\n        city\n      }\n      name {\n        first\n        full\n        last\n        middle\n        title\n      }\n      roles {\n        description\n        id\n        name\n      }\n    }\n    organization {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query MeProfileQuery {\n    me {\n      id\n      npi\n      phone\n      fax\n      email\n      address {\n        street1\n        street2\n        state\n        postalCode\n        country\n        city\n      }\n      name {\n        first\n        full\n        last\n        middle\n        title\n      }\n      roles {\n        description\n        id\n        name\n      }\n    }\n    organization {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMyProfile($updateMyProfileInput: ProfileInput!) {\n    updateMyProfile(input: $updateMyProfileInput)\n  }\n"): (typeof documents)["\n  mutation UpdateMyProfile($updateMyProfileInput: ProfileInput!) {\n    updateMyProfile(input: $updateMyProfileInput)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFragment on User {\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment UserFragment on User {\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetUserRoles($userId: ID!, $roles: [ID!]!) {\n    setUserRoles(userId: $userId, roles: $roles)\n  }\n"): (typeof documents)["\n  mutation SetUserRoles($userId: ID!, $roles: [ID!]!) {\n    setUserRoles(userId: $userId, roles: $roles)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProviderProfile(\n    $providerId: ID!\n    $updateProviderProfileInput: UpdateProviderProfileInput!\n  ) {\n    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)\n  }\n"): (typeof documents)["\n  mutation UpdateProviderProfile(\n    $providerId: ID!\n    $updateProviderProfileInput: UpdateProviderProfileInput!\n  ) {\n    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveUserFromOrganization($userId: ID!) {\n    removeUserFromOrganization(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation RemoveUserFromOrganization($userId: ID!) {\n    removeUserFromOrganization(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UsersListQuery {\n    users {\n      id\n      ...UserFragment\n      email\n      name {\n        full\n      }\n      roles {\n        id\n        name\n      }\n    }\n    roles {\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  query UsersListQuery {\n    users {\n      id\n      ...UserFragment\n      email\n      name {\n        full\n      }\n      roles {\n        id\n        name\n      }\n    }\n    roles {\n      name\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllRolesSelect {\n    roles {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query AllRolesSelect {\n    roles {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment WebhookItemFragment on WebhookConfig {\n    id\n    url\n  }\n"): (typeof documents)["\n  fragment WebhookItemFragment on WebhookConfig {\n    id\n    url\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation WebhookItemDeleteMutation($webhookId: ID!) {\n    deleteWebhookConfig(webhookId: $webhookId)\n  }\n"): (typeof documents)["\n  mutation WebhookItemDeleteMutation($webhookId: ID!) {\n    deleteWebhookConfig(webhookId: $webhookId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WebhookListQuery {\n    webhooks {\n      id\n      ...WebhookItemFragment\n    }\n  }\n"): (typeof documents)["\n  query WebhookListQuery {\n    webhooks {\n      id\n      ...WebhookItemFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation WebhookFormCreateMutation($url: String!, $sharedSecret: String!, $filters: [String!]!) {\n    createWebhookConfig(url: $url, filters: $filters, sharedSecret: $sharedSecret)\n  }\n"): (typeof documents)["\n  mutation WebhookFormCreateMutation($url: String!, $sharedSecret: String!, $filters: [String!]!) {\n    createWebhookConfig(url: $url, filters: $filters, sharedSecret: $sharedSecret)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SettingsPageQuery {\n    me {\n      roles {\n        id\n      }\n    }\n    organization {\n      id\n      name\n      ...OrganizationTreatmentTabFragment\n    }\n    roles {\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  query SettingsPageQuery {\n    me {\n      roles {\n        id\n      }\n    }\n    organization {\n      id\n      name\n      ...OrganizationTreatmentTabFragment\n    }\n    roles {\n      name\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment OrganizationTreatmentTabFragment on Organization {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment OrganizationTreatmentTabFragment on Organization {\n    id\n    name\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;