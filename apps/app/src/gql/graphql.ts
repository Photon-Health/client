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

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street1: Scalars['String']['output'];
  street2?: Maybe<Scalars['String']['output']>;
};

export type AddressInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  state: Scalars['String']['input'];
  street1: Scalars['String']['input'];
  street2?: InputMaybe<Scalars['String']['input']>;
};

export type Client = {
  __typename?: 'Client';
  appType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  secret?: Maybe<Scalars['String']['output']>;
  whiteListedUrls: Array<Scalars['String']['output']>;
};

export type Compound = Treatment & {
  __typename?: 'Compound';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Fill = {
  __typename?: 'Fill';
  filledAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  order: Order;
  prescription?: Maybe<Prescription>;
  requestedAt: Scalars['DateTime']['output'];
  state: FillState;
  treatment: Treatment;
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

export type Invite = {
  __typename?: 'Invite';
  email?: Maybe<Scalars['String']['output']>;
  expired: Scalars['Boolean']['output'];
  expires_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  invitee: Scalars['String']['output'];
  inviter: Scalars['String']['output'];
  roles: Array<Role>;
  url?: Maybe<Scalars['String']['output']>;
};

export type MedicalEquipment = Treatment & {
  __typename?: 'MedicalEquipment';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Medication = Treatment & {
  __typename?: 'Medication';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  strength?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addRole: Scalars['ID']['output'];
  createClient: Client;
  createWebhookConfig: Scalars['ID']['output'];
  deleteInvite: Scalars['ID']['output'];
  deleteWebhookConfig: Scalars['ID']['output'];
  inviteUser: Invite;
  removeRole: Scalars['ID']['output'];
  resendInvite: Invite;
  rotateClientSecret: Client;
  updateClient: Scalars['ID']['output'];
  updateOrganization: Scalars['ID']['output'];
  updateProviderProfile: Scalars['ID']['output'];
  updateProviderSignature: Scalars['ID']['output'];
  updateWebhookConfig: Scalars['ID']['output'];
};


export type MutationAddRoleArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateClientArgs = {
  appType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  whiteListedUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationCreateWebhookConfigArgs = {
  filters: Array<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sharedSecret: Scalars['String']['input'];
  url: Scalars['String']['input'];
};


export type MutationDeleteInviteArgs = {
  inviteId: Scalars['ID']['input'];
};


export type MutationDeleteWebhookConfigArgs = {
  webhookId: Scalars['ID']['input'];
};


export type MutationInviteUserArgs = {
  email: Scalars['String']['input'];
  inviter?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<ProviderInput>;
  roles: Array<Scalars['String']['input']>;
};


export type MutationRemoveRoleArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['String']['input'];
};


export type MutationResendInviteArgs = {
  inviteId: Scalars['ID']['input'];
};


export type MutationRotateClientSecretArgs = {
  clientId: Scalars['ID']['input'];
};


export type MutationUpdateClientArgs = {
  clientId: Scalars['ID']['input'];
  whiteListedUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateOrganizationArgs = {
  input: OrganizationInput;
};


export type MutationUpdateProviderProfileArgs = {
  input: UpdateProviderProfileInput;
  providerId: Scalars['ID']['input'];
};


export type MutationUpdateProviderSignatureArgs = {
  input: ProviderSignatureInput;
  providerId: Scalars['ID']['input'];
};


export type MutationUpdateWebhookConfigArgs = {
  filters: Array<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sharedSecret: Scalars['String']['input'];
  url: Scalars['String']['input'];
  webhookId: Scalars['ID']['input'];
};

export type Name = {
  __typename?: 'Name';
  first: Scalars['String']['output'];
  /** Convenience method for getting a formated name */
  full: Scalars['String']['output'];
  last: Scalars['String']['output'];
  middle?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Order = {
  __typename?: 'Order';
  address?: Maybe<Address>;
  createdAt: Scalars['DateTime']['output'];
  externalId?: Maybe<Scalars['ID']['output']>;
  fills: Array<Fill>;
  fulfillment?: Maybe<OrderFulfillment>;
  id: Scalars['ID']['output'];
  organization: Organization;
  patient: Patient;
  pharmacy?: Maybe<Pharmacy>;
  state: OrderState;
};

export type OrderFulfillment = {
  __typename?: 'OrderFulfillment';
  carrier?: Maybe<Scalars['String']['output']>;
  state: Scalars['String']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  type: FulfillmentType;
};

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

export type Organization = {
  __typename?: 'Organization';
  NPI?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Address>;
  email?: Maybe<Scalars['String']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  type: OrgType;
};

export type OrganizationInput = {
  NPI?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<AddressInput>;
  email: Scalars['String']['input'];
  fax: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  type: OrgType;
};

export type Patient = {
  __typename?: 'Patient';
  dateOfBirth: Scalars['Date']['output'];
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Name;
  phone: Scalars['String']['output'];
  sex: SexType;
};

export type Pharmacy = {
  __typename?: 'Pharmacy';
  address?: Maybe<Address>;
  distance?: Maybe<Scalars['Float']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  fulfillmentTypes?: Maybe<Array<Maybe<FulfillmentType>>>;
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  npi?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

export type Prescription = {
  __typename?: 'Prescription';
  daysSupply?: Maybe<Scalars['Int']['output']>;
  dispenseAsWritten: Scalars['Boolean']['output'];
  dispenseQuantity: Scalars['Float']['output'];
  dispenseUnit: Scalars['String']['output'];
  effectiveDate: Scalars['Date']['output'];
  expirationDate: Scalars['Date']['output'];
  fills: Array<Maybe<Fill>>;
  fillsAllowed: Scalars['Int']['output'];
  fillsRemaining: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  instructions: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  treatment: Treatment;
  writtenAt: Scalars['DateTime']['output'];
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

export type Query = {
  __typename?: 'Query';
  /** Retrieve a client */
  client?: Maybe<Client>;
  /** Retrieves all clients of org */
  clients: Array<Client>;
  /** Retrieve a invite */
  invite?: Maybe<Invite>;
  /** Retrieve a list of available invites for current user organization */
  invites: Array<Invite>;
  /** Retrieve the profile of the currently authenticated user */
  me: User;
  order?: Maybe<Order>;
  organization?: Maybe<Organization>;
  /** Retrieve a role */
  role?: Maybe<Role>;
  /** Retrieve a list of available roles for current user organization */
  roles: Array<Role>;
  user?: Maybe<User>;
  /** Retrieve users for current user organization */
  users: Array<User>;
  webhook?: Maybe<WebhookConfig>;
  webhooks: Array<WebhookConfig>;
};


export type QueryClientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInviteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWebhookArgs = {
  id: Scalars['ID']['input'];
};

export type Role = {
  __typename?: 'Role';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export enum SexType {
  Female = 'FEMALE',
  Male = 'MALE',
  Unknown = 'UNKNOWN'
}

export type Treatment = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UpdateProviderProfileInput = {
  address?: InputMaybe<AddressInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<UpdateUserNameInput>;
  npi?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  roles: Array<Scalars['String']['input']>;
  /** A base64 encoded string of the signature picture */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserNameInput = {
  first?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['String']['input']>;
  middle?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Address>;
  email?: Maybe<Scalars['String']['output']>;
  externalId?: Maybe<Scalars['String']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Name>;
  npi?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  roles: Array<Role>;
  /** A base64 encoded string of the signature picture that can be rendered */
  signature?: Maybe<Scalars['String']['output']>;
};

export type UserNameInput = {
  first: Scalars['String']['input'];
  last: Scalars['String']['input'];
  middle?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type WebhookConfig = {
  __typename?: 'WebhookConfig';
  filters: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type MeProfileQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MeProfileQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', email?: string | null, phone?: string | null, npi?: string | null, name?: { __typename?: 'Name', full: string } | null, address?: { __typename?: 'Address', street1: string, street2?: string | null, city: string, state: string, postalCode: string, country: string } | null }, organization?: { __typename?: 'Organization', id: string, name: string } | null };

export type ClientInfoCardFragmentFragment = { __typename?: 'Client', id: string, appType: string, name: string, secret?: string | null } & { ' $fragmentName'?: 'ClientInfoCardFragmentFragment' };

export type ClientsDeveloperTabQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ClientsDeveloperTabQueryQuery = { __typename?: 'Query', clients: Array<(
    { __typename?: 'Client', id: string }
    & { ' $fragmentRefs'?: { 'ClientInfoCardFragmentFragment': ClientInfoCardFragmentFragment } }
  )> };

export type RotateSecretMutationVariables = Exact<{
  clientId: Scalars['ID']['input'];
}>;


export type RotateSecretMutation = { __typename?: 'Mutation', rotateClientSecret: { __typename?: 'Client', id: string } };

export type InviteFormFragmentFragment = { __typename?: 'Invite', id: string, invitee: string, inviter: string, expires_at?: any | null } & { ' $fragmentName'?: 'InviteFormFragmentFragment' };

export type UserInviteFormQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UserInviteFormQueryQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, name?: { __typename?: 'Name', full: string } | null } };

export type InviteUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  inviter?: InputMaybe<Scalars['String']['input']>;
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

export type UserItemFragmentFragment = { __typename?: 'User', id: string, email?: string | null, name?: { __typename?: 'Name', full: string } | null, roles: Array<{ __typename?: 'Role', id: string }> } & { ' $fragmentName'?: 'UserItemFragmentFragment' };

export type UsersListQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersListQueryQuery = { __typename?: 'Query', users: Array<(
    { __typename?: 'User', id: string, email?: string | null, name?: { __typename?: 'Name', full: string } | null, roles: Array<{ __typename?: 'Role', name?: string | null }> }
    & { ' $fragmentRefs'?: { 'UserItemFragmentFragment': UserItemFragmentFragment } }
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
    & { ' $fragmentRefs'?: { 'OrganizationTreatmentTabFragmentFragment': OrganizationTreatmentTabFragmentFragment;'OrganizationTemplateTabFragmentFragment': OrganizationTemplateTabFragmentFragment } }
  ) | null, roles: Array<{ __typename?: 'Role', name?: string | null, id: string }> };

export type OrganizationTemplateTabFragmentFragment = { __typename?: 'Organization', id: string, name: string } & { ' $fragmentName'?: 'OrganizationTemplateTabFragmentFragment' };

export type OrganizationTreatmentTabFragmentFragment = { __typename?: 'Organization', id: string, name: string } & { ' $fragmentName'?: 'OrganizationTreatmentTabFragmentFragment' };

export const ClientInfoCardFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ClientInfoCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Client"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appType"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"secret"}}]}}]} as unknown as DocumentNode<ClientInfoCardFragmentFragment, unknown>;
export const InviteFormFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InviteFormFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invite"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invitee"}},{"kind":"Field","name":{"kind":"Name","value":"inviter"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]} as unknown as DocumentNode<InviteFormFragmentFragment, unknown>;
export const InviteFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InviteFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invite"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invitee"}},{"kind":"Field","name":{"kind":"Name","value":"inviter"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]} as unknown as DocumentNode<InviteFragmentFragment, unknown>;
export const UserItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<UserItemFragmentFragment, unknown>;
export const WebhookItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<WebhookItemFragmentFragment, unknown>;
export const OrganizationTemplateTabFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationTemplateTabFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Organization"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<OrganizationTemplateTabFragmentFragment, unknown>;
export const OrganizationTreatmentTabFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationTreatmentTabFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Organization"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<OrganizationTreatmentTabFragmentFragment, unknown>;
export const MeProfileQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeProfileQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"npi"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<MeProfileQueryQuery, MeProfileQueryQueryVariables>;
export const ClientsDeveloperTabQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientsDeveloperTabQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ClientInfoCardFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ClientInfoCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Client"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appType"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"secret"}}]}}]} as unknown as DocumentNode<ClientsDeveloperTabQueryQuery, ClientsDeveloperTabQueryQueryVariables>;
export const RotateSecretDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RotateSecret"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rotateClientSecret"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RotateSecretMutation, RotateSecretMutationVariables>;
export const UserInviteFormQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserInviteFormQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}}]}}]}}]} as unknown as DocumentNode<UserInviteFormQueryQuery, UserInviteFormQueryQueryVariables>;
export const InviteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roles"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"provider"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProviderInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"inviter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviter"}}},{"kind":"Argument","name":{"kind":"Name","value":"roles"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roles"}}},{"kind":"Argument","name":{"kind":"Name","value":"provider"},"value":{"kind":"Variable","name":{"kind":"Name","value":"provider"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<InviteUserMutation, InviteUserMutationVariables>;
export const ResendInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ResendInviteMutation, ResendInviteMutationVariables>;
export const DeleteInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteId"}}}]}]}}]} as unknown as DocumentNode<DeleteInviteMutation, DeleteInviteMutationVariables>;
export const InvitesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InvitesQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InviteFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InviteFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Invite"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invitee"}},{"kind":"Field","name":{"kind":"Name","value":"inviter"}},{"kind":"Field","name":{"kind":"Name","value":"expired"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}}]}}]} as unknown as DocumentNode<InvitesQueryQuery, InvitesQueryQueryVariables>;
export const OrganizationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fax"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<OrganizationQueryQuery, OrganizationQueryQueryVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const UsersListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserItemFragment"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<UsersListQueryQuery, UsersListQueryQueryVariables>;
export const AllRolesSelectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllRolesSelect"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<AllRolesSelectQuery, AllRolesSelectQueryVariables>;
export const WebhookItemDeleteMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WebhookItemDeleteMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"webhookId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWebhookConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"webhookId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"webhookId"}}}]}]}}]} as unknown as DocumentNode<WebhookItemDeleteMutationMutation, WebhookItemDeleteMutationMutationVariables>;
export const WebhookListQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WebhookListQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<WebhookListQueryQuery, WebhookListQueryQueryVariables>;
export const WebhookFormCreateMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WebhookFormCreateMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sharedSecret"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWebhookConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sharedSecret"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sharedSecret"}}}]}]}}]} as unknown as DocumentNode<WebhookFormCreateMutationMutation, WebhookFormCreateMutationMutationVariables>;
export const SettingsPageQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsPageQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationTreatmentTabFragment"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrganizationTemplateTabFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationTreatmentTabFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Organization"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrganizationTemplateTabFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Organization"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<SettingsPageQueryQuery, SettingsPageQueryQueryVariables>;