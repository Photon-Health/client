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
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  mutation TicketModalCreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n    }\n  }\n": types.TicketModalCreateTicketDocument,
    "\n  fragment ClientInfoCardFragment on Client {\n    id\n    appType\n    name\n    secret\n    whiteListedUrls\n  }\n": types.ClientInfoCardFragmentFragmentDoc,
    "\n  query ClientsDeveloperTabQuery {\n    clients {\n      id\n      ...ClientInfoCardFragment\n    }\n  }\n": types.ClientsDeveloperTabQueryDocument,
    "\n  mutation RotateSecret($clientId: ID!) {\n    rotateClientSecret(clientId: $clientId) {\n      id\n    }\n  }\n": types.RotateSecretDocument,
    "\n  mutation UpdateClient($clientId: ID!, $whiteListedUrls: [String!]!) {\n    updateClient(clientId: $clientId, whiteListedUrls: $whiteListedUrls) {\n      id\n    }\n  }\n": types.UpdateClientDocument,
    "\n  fragment InviteFormFragment on Invite {\n    id\n    invitee\n    inviter\n    expires_at\n  }\n": types.InviteFormFragmentFragmentDoc,
    "\n  query UserInviteFormQuery {\n    me {\n      id\n      name {\n        full\n      }\n    }\n  }\n": types.UserInviteFormQueryDocument,
    "\n  mutation InviteUser($email: String!, $roles: [String!]!, $provider: ProviderInput) {\n    inviteUser(email: $email, roles: $roles, provider: $provider) {\n      id\n    }\n  }\n": types.InviteUserDocument,
    "\n  fragment InviteFragment on Invite {\n    id\n    invitee\n    inviter\n    expired\n    expires_at\n  }\n": types.InviteFragmentFragmentDoc,
    "\n  mutation ResendInvite($inviteId: ID!) {\n    resendInvite(inviteId: $inviteId) {\n      id\n    }\n  }\n": types.ResendInviteDocument,
    "\n  mutation DeleteInvite($inviteId: ID!) {\n    deleteInvite(inviteId: $inviteId)\n  }\n": types.DeleteInviteDocument,
    "\n  query InvitesQuery {\n    invites {\n      ...InviteFragment\n      id\n      expired\n      expires_at\n    }\n  }\n": types.InvitesQueryDocument,
    "\n  query OrganizationQuery {\n    organization {\n      id\n      name\n      address {\n        street1\n        street2\n        postalCode\n        city\n        state\n        country\n      }\n      fax\n      phone\n      email\n    }\n  }\n": types.OrganizationQueryDocument,
    "\n  mutation UpdateOrganization($input: OrganizationInput!) {\n    updateOrganization(input: $input)\n  }\n": types.UpdateOrganizationDocument,
    "\n  query MeProfileQuery {\n    me {\n      id\n      npi\n      phone\n      fax\n      email\n      address {\n        street1\n        street2\n        state\n        postalCode\n        country\n        city\n      }\n      name {\n        first\n        full\n        last\n        middle\n        title\n      }\n      roles {\n        description\n        id\n        name\n      }\n    }\n    organization {\n      id\n      name\n    }\n  }\n": types.MeProfileQueryDocument,
    "\n  mutation UpdateMyProfile($updateMyProfileInput: ProfileInput!) {\n    updateMyProfile(input: $updateMyProfileInput)\n  }\n": types.UpdateMyProfileDocument,
    "\n  query SearchTreatments($filter: TreatmentFilter!) {\n    treatments(filter: $filter) {\n      id\n      name\n    }\n  }\n": types.SearchTreatmentsDocument,
    "\n  fragment EditRolesActionUserFragment on User {\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n": types.EditRolesActionUserFragmentFragmentDoc,
    "\n  mutation UpdateProviderProfileAndSetUserRolesMutation(\n    $providerId: ID!\n    $updateProviderProfileInput: UpdateProviderProfileInput!\n    $roles: [ID!]!\n  ) {\n    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)\n    setUserRoles(userId: $providerId, roles: $roles)\n  }\n": types.UpdateProviderProfileAndSetUserRolesMutationDocument,
    "\n  fragment RemoveUserActionUserFragment on User {\n    id\n    email\n    name {\n      full\n    }\n  }\n": types.RemoveUserActionUserFragmentFragmentDoc,
    "\n  mutation UserItemActionRemoveUserFromOrganization($userId: ID!) {\n    removeUserFromOrganization(userId: $userId)\n  }\n": types.UserItemActionRemoveUserFromOrganizationDocument,
    "\n  fragment UserItemUserFragment on User {\n    ...UserFragment\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n": types.UserItemUserFragmentFragmentDoc,
    "\n  fragment UserFragment on User {\n    ...RemoveUserActionUserFragment\n    ...EditRolesActionUserFragment\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n": types.UserFragmentFragmentDoc,
    "\n  query UsersListQuery($page: Int, $pageSize: Int) {\n    userCount\n    users(pageNum: $page, pageSize: $pageSize) {\n      id\n      ...UserItemUserFragment\n    }\n    roles {\n      name\n      id\n    }\n  }\n": types.UsersListQueryDocument,
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
export function graphql(source: "\n  mutation TicketModalCreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation TicketModalCreateTicket($input: TicketInput!) {\n    createTicket(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ClientInfoCardFragment on Client {\n    id\n    appType\n    name\n    secret\n    whiteListedUrls\n  }\n"): (typeof documents)["\n  fragment ClientInfoCardFragment on Client {\n    id\n    appType\n    name\n    secret\n    whiteListedUrls\n  }\n"];
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
export function graphql(source: "\n  mutation UpdateClient($clientId: ID!, $whiteListedUrls: [String!]!) {\n    updateClient(clientId: $clientId, whiteListedUrls: $whiteListedUrls) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateClient($clientId: ID!, $whiteListedUrls: [String!]!) {\n    updateClient(clientId: $clientId, whiteListedUrls: $whiteListedUrls) {\n      id\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation InviteUser($email: String!, $roles: [String!]!, $provider: ProviderInput) {\n    inviteUser(email: $email, roles: $roles, provider: $provider) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation InviteUser($email: String!, $roles: [String!]!, $provider: ProviderInput) {\n    inviteUser(email: $email, roles: $roles, provider: $provider) {\n      id\n    }\n  }\n"];
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
export function graphql(source: "\n  query SearchTreatments($filter: TreatmentFilter!) {\n    treatments(filter: $filter) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query SearchTreatments($filter: TreatmentFilter!) {\n    treatments(filter: $filter) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EditRolesActionUserFragment on User {\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment EditRolesActionUserFragment on User {\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProviderProfileAndSetUserRolesMutation(\n    $providerId: ID!\n    $updateProviderProfileInput: UpdateProviderProfileInput!\n    $roles: [ID!]!\n  ) {\n    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)\n    setUserRoles(userId: $providerId, roles: $roles)\n  }\n"): (typeof documents)["\n  mutation UpdateProviderProfileAndSetUserRolesMutation(\n    $providerId: ID!\n    $updateProviderProfileInput: UpdateProviderProfileInput!\n    $roles: [ID!]!\n  ) {\n    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)\n    setUserRoles(userId: $providerId, roles: $roles)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RemoveUserActionUserFragment on User {\n    id\n    email\n    name {\n      full\n    }\n  }\n"): (typeof documents)["\n  fragment RemoveUserActionUserFragment on User {\n    id\n    email\n    name {\n      full\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UserItemActionRemoveUserFromOrganization($userId: ID!) {\n    removeUserFromOrganization(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation UserItemActionRemoveUserFromOrganization($userId: ID!) {\n    removeUserFromOrganization(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserItemUserFragment on User {\n    ...UserFragment\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment UserItemUserFragment on User {\n    ...UserFragment\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFragment on User {\n    ...RemoveUserActionUserFragment\n    ...EditRolesActionUserFragment\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment UserFragment on User {\n    ...RemoveUserActionUserFragment\n    ...EditRolesActionUserFragment\n    id\n    npi\n    phone\n    fax\n    email\n    address {\n      street1\n      street2\n      state\n      postalCode\n      country\n      city\n    }\n    name {\n      first\n      full\n      last\n      middle\n      title\n    }\n    roles {\n      description\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UsersListQuery($page: Int, $pageSize: Int) {\n    userCount\n    users(pageNum: $page, pageSize: $pageSize) {\n      id\n      ...UserItemUserFragment\n    }\n    roles {\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  query UsersListQuery($page: Int, $pageSize: Int) {\n    userCount\n    users(pageNum: $page, pageSize: $pageSize) {\n      id\n      ...UserItemUserFragment\n    }\n    roles {\n      name\n      id\n    }\n  }\n"];
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