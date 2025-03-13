/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
};

export type AddressInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  state: Scalars['String']['input'];
  street1: Scalars['String']['input'];
  street2?: InputMaybe<Scalars['String']['input']>;
};

export type AllergenFilter = {
  name?: InputMaybe<Scalars['String']['input']>;
  rxNormId?: InputMaybe<Scalars['Int']['input']>;
};

export type CommentTicketInput = {
  body: Scalars['String']['input'];
};

export type DraftedPrescriptionInput = {
  daysSupply?: InputMaybe<Scalars['Int']['input']>;
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']['input']>;
  dispenseQuantity?: InputMaybe<Scalars['Float']['input']>;
  dispenseUnit?: InputMaybe<Scalars['String']['input']>;
  effectiveDate?: InputMaybe<Scalars['Date']['input']>;
  expirationDate?: InputMaybe<Scalars['Date']['input']>;
  fillsAllowed?: InputMaybe<Scalars['Int']['input']>;
  fillsRemaining?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  treatment: DraftedPrescriptionTreatmentInput;
  writtenAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DraftedPrescriptionTreatmentInput = {
  id: Scalars['ID']['input'];
};

export enum FillState {
  Canceled = 'CANCELED',
  New = 'NEW',
  Scheduled = 'SCHEDULED',
  Sent = 'SENT'
}

export enum FulfillmentType {
  MailOrder = 'MAIL_ORDER',
  PickUp = 'PICK_UP'
}

export enum MedicationType {
  Otc = 'OTC',
  Rx = 'RX'
}

export enum OrderState {
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Error = 'ERROR',
  Pending = 'PENDING',
  Placed = 'PLACED'
}

export enum OrgType {
  Pharmacy = 'PHARMACY',
  Prescriber = 'PRESCRIBER'
}

export type OrganizationInput = {
  NPI?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<AddressInput>;
  email: Scalars['String']['input'];
  fax: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  type: OrgType;
};

export enum PrescriptionScreeningAlertSeverity {
  Major = 'MAJOR',
  Minor = 'MINOR',
  Moderate = 'MODERATE'
}

export enum PrescriptionScreeningAlertType {
  Allergen = 'ALLERGEN',
  Drug = 'DRUG'
}

export type ProfileInput = {
  address?: InputMaybe<AddressInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<UserNameInput>;
  npi?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  /** A base64 encoded string of the signature picture */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type ProviderInput = {
  address: AddressInput;
  npi: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type ProviderProfileInput = {
  address?: InputMaybe<AddressInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  name: UserNameInput;
  npi?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  roles: Array<Scalars['String']['input']>;
  /** A base64 encoded string of the signature picture */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type ProviderSignatureInput = {
  signature: Scalars['String']['input'];
};

export enum SexType {
  Female = 'FEMALE',
  Male = 'MALE',
  Unknown = 'UNKNOWN'
}

export type TicketInput = {
  comment: CommentTicketInput;
  subject: Scalars['String']['input'];
};

export type TreatmentFilter = {
  term?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProviderProfileInput = {
  address?: InputMaybe<AddressInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<UpdateUserNameInput>;
  npi?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  /** A base64 encoded string of the signature picture */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserNameInput = {
  first?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['String']['input']>;
  middle?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UserNameInput = {
  first: Scalars['String']['input'];
  last: Scalars['String']['input'];
  middle?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type TicketModalCreateTicketMutationVariables = Exact<{
  input: TicketInput;
}>;


export type TicketModalCreateTicketMutation = { __typename?: 'Mutation', createTicket: { __typename?: 'Ticket', id: string } };

export type ClientInfoCardFragmentFragment = { __typename?: 'Client', id: string, appType: string, name: string, secret?: string | null, whiteListedUrls: Array<string> } & { ' $fragmentName'?: 'ClientInfoCardFragmentFragment' };

export type ClientsDeveloperTabQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ClientsDeveloperTabQueryQuery = { __typename?: 'Query', clients: Array<(
    { __typename?: 'Client', id: string }
    & { ' $fragmentRefs'?: { 'ClientInfoCardFragmentFragment': ClientInfoCardFragmentFragment } }
  )> };

export type RotateSecretMutationVariables = Exact<{
  clientId: Scalars['ID']['input'];
}>;


export type RotateSecretMutation = { __typename?: 'Mutation', rotateClientSecret: { __typename?: 'Client', id: string } };

export type UpdateClientMutationVariables = Exact<{
  clientId: Scalars['ID']['input'];
  whiteListedUrls: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UpdateClientMutation = { __typename?: 'Mutation', updateClient: { __typename?: 'Client', id: string } };

export type InviteFormFragmentFragment = { __typename?: 'Invite', id: string, invitee: string, inviter: string, expires_at?: any | null } & { ' $fragmentName'?: 'InviteFormFragmentFragment' };

export type UserInviteFormQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UserInviteFormQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, name?: { __typename?: 'Name', full: string } | null } };

export type InviteUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  roles: Array<Scalars['String']['input']> | Scalars['String']['input'];
  provider?: InputMaybe<ProviderInput>;
}>;


export type InviteUserMutation = { __typename?: 'Mutation', inviteUser: { __typename?: 'Invite', id: string } };

export type InviteFragmentFragment = { __typename?: 'Invite', id: string, invitee: string, inviter: string, expired: boolean, expires_at?: any | null } & { ' $fragmentName'?: 'InviteFragmentFragment' };

export type ResendInviteMutationVariables = Exact<{
  inviteId: Scalars['ID']['input'];
}>;


export type ResendInviteMutation = { __typename?: 'Mutation', resendInvite: { __typename?: 'Invite', id: string } };

export type DeleteInviteMutationVariables = Exact<{
  inviteId: Scalars['ID']['input'];
}>;


export type DeleteInviteMutation = { __typename?: 'Mutation', deleteInvite: string };

export type InvitesQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type InvitesQueryQuery = { __typename?: 'Query', invites: Array<(
    { __typename?: 'Invite', id: string, expired: boolean, expires_at?: any | null }
    & { ' $fragmentRefs'?: { 'InviteFragmentFragment': InviteFragmentFragment } }
  )> };

export type OrganizationQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', id: string, name: string, fax?: string | null, phone?: string | null, email?: string | null, address?: { __typename?: 'Address', street1: string, street2?: string | null, postalCode: string, city: string, state: string, country: string } | null } | null };

export type UpdateOrganizationMutationVariables = Exact<{
  input: OrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization: string };

export type MeProfileQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MeProfileQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, npi?: string | null, phone?: string | null, fax?: string | null, email?: string | null, address?: { __typename?: 'Address', street1: string, street2?: string | null, state: string, postalCode: string, country: string, city: string } | null, name?: { __typename?: 'Name', first: string, full: string, last: string, middle?: string | null, title?: string | null } | null, roles: Array<{ __typename?: 'Role', description?: string | null, id: string, name?: string | null }> }, organization?: { __typename?: 'Organization', id: string, name: string } | null };

export type UpdateMyProfileMutationVariables = Exact<{
  updateMyProfileInput: ProfileInput;
}>;


export type UpdateMyProfileMutation = { __typename?: 'Mutation', updateMyProfile: string };

export type SearchTreatmentsQueryVariables = Exact<{
  filter: TreatmentFilter;
}>;


export type SearchTreatmentsQuery = { __typename?: 'Query', treatments: Array<{ __typename?: 'Compound', id: string, name: string } | { __typename?: 'MedicalEquipment', id: string, name: string } | { __typename?: 'Medication', id: string, name: string }> };

export type EditRolesActionUserFragmentFragment = { __typename?: 'User', id: string, npi?: string | null, phone?: string | null, fax?: string | null, email?: string | null, address?: { __typename?: 'Address', street1: string, street2?: string | null, state: string, postalCode: string, country: string, city: string } | null, name?: { __typename?: 'Name', first: string, full: string, last: string, middle?: string | null, title?: string | null } | null, roles: Array<{ __typename?: 'Role', description?: string | null, id: string, name?: string | null }> } & { ' $fragmentName'?: 'EditRolesActionUserFragmentFragment' };

export type UpdateProviderProfileAndSetUserRolesMutationMutationVariables = Exact<{
  providerId: Scalars['ID']['input'];
  updateProviderProfileInput: UpdateProviderProfileInput;
  roles: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type UpdateProviderProfileAndSetUserRolesMutationMutation = { __typename?: 'Mutation', updateProviderProfile: string, setUserRoles: string };

export type RemoveUserActionUserFragmentFragment = { __typename?: 'User', id: string, email?: string | null, name?: { __typename?: 'Name', full: string } | null } & { ' $fragmentName'?: 'RemoveUserActionUserFragmentFragment' };

export type UserItemActionRemoveUserFromOrganizationMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type UserItemActionRemoveUserFromOrganizationMutation = { __typename?: 'Mutation', removeUserFromOrganization: string };

export type UserItemUserFragmentFragment = (
  { __typename?: 'User', id: string, npi?: string | null, phone?: string | null, fax?: string | null, email?: string | null, address?: { __typename?: 'Address', street1: string, street2?: string | null, state: string, postalCode: string, country: string, city: string } | null, name?: { __typename?: 'Name', first: string, full: string, last: string, middle?: string | null, title?: string | null } | null, roles: Array<{ __typename?: 'Role', description?: string | null, id: string, name?: string | null }> }
  & { ' $fragmentRefs'?: { 'UserFragmentFragment': UserFragmentFragment } }
) & { ' $fragmentName'?: 'UserItemUserFragmentFragment' };

export type UserFragmentFragment = (
  { __typename?: 'User', id: string, npi?: string | null, phone?: string | null, fax?: string | null, email?: string | null, address?: { __typename?: 'Address', street1: string, street2?: string | null, state: string, postalCode: string, country: string, city: string } | null, name?: { __typename?: 'Name', first: string, full: string, last: string, middle?: string | null, title?: string | null } | null, roles: Array<{ __typename?: 'Role', description?: string | null, id: string, name?: string | null }> }
  & { ' $fragmentRefs'?: { 'RemoveUserActionUserFragmentFragment': RemoveUserActionUserFragmentFragment;'EditRolesActionUserFragmentFragment': EditRolesActionUserFragmentFragment } }
) & { ' $fragmentName'?: 'UserFragmentFragment' };

export type UsersListQueryQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersListQueryQuery = { __typename?: 'Query', userCount: number, users: Array<(
    { __typename?: 'User', id: string }
    & { ' $fragmentRefs'?: { 'UserItemUserFragmentFragment': UserItemUserFragmentFragment } }
  )>, roles: Array<{ __typename?: 'Role', name?: string | null, id: string }> };

export type AllRolesSelectQueryVariables = Exact<{ [key: string]: never; }>;


export type AllRolesSelectQuery = { __typename?: 'Query', roles: Array<{ __typename?: 'Role', id: string, name?: string | null, description?: string | null }> };

export type WebhookItemFragmentFragment = { __typename?: 'WebhookConfig', id: string, url: string } & { ' $fragmentName'?: 'WebhookItemFragmentFragment' };

export type WebhookItemDeleteMutationMutationVariables = Exact<{
  webhookId: Scalars['ID']['input'];
}>;


export type WebhookItemDeleteMutationMutation = { __typename?: 'Mutation', deleteWebhookConfig: string };

export type WebhookListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type WebhookListQueryQuery = { __typename?: 'Query', webhooks: Array<(
    { __typename?: 'WebhookConfig', id: string }
    & { ' $fragmentRefs'?: { 'WebhookItemFragmentFragment': WebhookItemFragmentFragment } }
  )> };

export type WebhookFormCreateMutationMutationVariables = Exact<{
  url: Scalars['String']['input'];
  sharedSecret: Scalars['String']['input'];
  filters: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type WebhookFormCreateMutationMutation = { __typename?: 'Mutation', createWebhookConfig: string };

export type SettingsPageQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsPageQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', roles: Array<{ __typename?: 'Role', id: string }> }, organization?: (
    { __typename?: 'Organization', id: string, name: string }
    & { ' $fragmentRefs'?: { 'OrganizationTreatmentTabFragmentFragment': OrganizationTreatmentTabFragmentFragment } }
  ) | null, roles: Array<{ __typename?: 'Role', name?: string | null, id: string }> };

export type OrganizationTreatmentTabFragmentFragment = { __typename?: 'Organization', id: string, name: string } & { ' $fragmentName'?: 'OrganizationTreatmentTabFragmentFragment' };

export const ClientInfoCardFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ClientInfoCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Client"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appType"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"whiteListedUrls"}}]}}]} as unknown as DocumentNode<ClientInfoCardFragmentFragment, unknown>;
export const InviteFormFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InviteFormFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invite"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invitee"}},{"kind":"Field","name":{"kind":"Name","value":"inviter"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]} as unknown as DocumentNode<InviteFormFragmentFragment, unknown>;
export const InviteFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InviteFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invite"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invitee"}},{"kind":"Field","name":{"kind":"Name","value":"inviter"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]} as unknown as DocumentNode<InviteFragmentFragment, unknown>;
export const RemoveUserActionUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoveUserActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}}]}}]} as unknown as DocumentNode<RemoveUserActionUserFragmentFragment, unknown>;
export const EditRolesActionUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditRolesActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<EditRolesActionUserFragmentFragment, unknown>;
export const UserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoveUserActionUserFragment"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditRolesActionUserFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoveUserActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditRolesActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UserFragmentFragment, unknown>;
export const UserItemUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItemUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoveUserActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditRolesActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoveUserActionUserFragment"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditRolesActionUserFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UserItemUserFragmentFragment, unknown>;
export const WebhookItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<WebhookItemFragmentFragment, unknown>;
export const OrganizationTreatmentTabFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationTreatmentTabFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Organization"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<OrganizationTreatmentTabFragmentFragment, unknown>;
export const TicketModalCreateTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TicketModalCreateTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TicketModalCreateTicketMutation, TicketModalCreateTicketMutationVariables>;
export const ClientsDeveloperTabQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientsDeveloperTabQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ClientInfoCardFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ClientInfoCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Client"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appType"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"whiteListedUrls"}}]}}]} as unknown as DocumentNode<ClientsDeveloperTabQueryQuery, ClientsDeveloperTabQueryQueryVariables>;
export const RotateSecretDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RotateSecret"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rotateClientSecret"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RotateSecretMutation, RotateSecretMutationVariables>;
export const UpdateClientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateClient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"whiteListedUrls"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateClient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"whiteListedUrls"},"value":{"kind":"Variable","name":{"kind":"Name","value":"whiteListedUrls"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateClientMutation, UpdateClientMutationVariables>;
export const UserInviteFormQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserInviteFormQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}}]}}]}}]} as unknown as DocumentNode<UserInviteFormQueryQuery, UserInviteFormQueryQueryVariables>;
export const InviteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roles"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProviderInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"roles"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roles"}}},{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<InviteUserMutation, InviteUserMutationVariables>;
export const ResendInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ResendInviteMutation, ResendInviteMutationVariables>;
export const DeleteInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}}}]}]}}]} as unknown as DocumentNode<DeleteInviteMutation, DeleteInviteMutationVariables>;
export const InvitesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InvitesQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InviteFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InviteFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invite"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invitee"}},{"kind":"Field","name":{"kind":"Name","value":"inviter"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]} as unknown as DocumentNode<InvitesQueryQuery, InvitesQueryQueryVariables>;
export const OrganizationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<OrganizationQueryQuery, OrganizationQueryQueryVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const MeProfileQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeProfileQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<MeProfileQueryQuery, MeProfileQueryQueryVariables>;
export const UpdateMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updateMyProfileInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updateMyProfileInput"}}}]}]}}]} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const SearchTreatmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchTreatments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TreatmentFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"treatments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SearchTreatmentsQuery, SearchTreatmentsQueryVariables>;
export const UpdateProviderProfileAndSetUserRolesMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProviderProfileAndSetUserRolesMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updateProviderProfileInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProviderProfileInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roles"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProviderProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"providerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updateProviderProfileInput"}}}]},{"kind":"Field","name":{"kind":"Name","value":"setUserRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roles"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roles"}}}]}]}}]} as unknown as DocumentNode<UpdateProviderProfileAndSetUserRolesMutationMutation, UpdateProviderProfileAndSetUserRolesMutationMutationVariables>;
export const UserItemActionRemoveUserFromOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserItemActionRemoveUserFromOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeUserFromOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UserItemActionRemoveUserFromOrganizationMutation, UserItemActionRemoveUserFromOrganizationMutationVariables>;
export const UsersListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersListQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userCount"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pageNum"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserItemUserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoveUserActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditRolesActionUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoveUserActionUserFragment"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditRolesActionUserFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItemUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"city"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"full"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"middle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UsersListQueryQuery, UsersListQueryQueryVariables>;
export const AllRolesSelectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllRolesSelect"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<AllRolesSelectQuery, AllRolesSelectQueryVariables>;
export const WebhookItemDeleteMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WebhookItemDeleteMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"webhookId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWebhookConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"webhookId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"webhookId"}}}]}]}}]} as unknown as DocumentNode<WebhookItemDeleteMutationMutation, WebhookItemDeleteMutationMutationVariables>;
export const WebhookListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WebhookListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<WebhookListQueryQuery, WebhookListQueryQueryVariables>;
export const WebhookFormCreateMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WebhookFormCreateMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sharedSecret"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWebhookConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sharedSecret"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sharedSecret"}}}]}]}}]} as unknown as DocumentNode<WebhookFormCreateMutationMutation, WebhookFormCreateMutationMutationVariables>;
export const SettingsPageQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsPageQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationTreatmentTabFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationTreatmentTabFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Organization"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<SettingsPageQueryQuery, SettingsPageQueryQueryVariables>;