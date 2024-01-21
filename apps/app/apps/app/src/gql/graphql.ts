/* eslint-disable */
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

export type CommentTicketInput = {
  body: Scalars['String']['input'];
};

export type CompletedSignatureAttestation = {
  __typename?: 'CompletedSignatureAttestation';
  agreedAt: Scalars['DateTime']['output'];
  version: Scalars['String']['output'];
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
  agreeToSignatureAttestation: Scalars['Boolean']['output'];
  createClient: Client;
  createTicket: Ticket;
  createWebhookConfig: Scalars['ID']['output'];
  deleteInvite: Scalars['ID']['output'];
  deleteWebhookConfig: Scalars['ID']['output'];
  inviteUser: Invite;
  removeUserFromOrganization: Scalars['ID']['output'];
  resendInvite: Invite;
  rotateClientSecret: Client;
  setUserRoles: Scalars['ID']['output'];
  updateClient: Scalars['ID']['output'];
  updateMyProfile: Scalars['ID']['output'];
  updateOrganization: Scalars['ID']['output'];
  updateProviderProfile: Scalars['ID']['output'];
  updateProviderSignature: Scalars['ID']['output'];
  updateWebhookConfig: Scalars['ID']['output'];
};


export type MutationAgreeToSignatureAttestationArgs = {
  version: Scalars['String']['input'];
};


export type MutationCreateClientArgs = {
  appType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  whiteListedUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationCreateTicketArgs = {
  input: TicketInput;
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


export type MutationRemoveUserFromOrganizationArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationResendInviteArgs = {
  inviteId: Scalars['ID']['input'];
};


export type MutationRotateClientSecretArgs = {
  clientId: Scalars['ID']['input'];
};


export type MutationSetUserRolesArgs = {
  roles: Array<Scalars['ID']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationUpdateClientArgs = {
  clientId: Scalars['ID']['input'];
  whiteListedUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateMyProfileArgs = {
  input: ProfileInput;
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

export type NeedsSignatureAttestation = {
  __typename?: 'NeedsSignatureAttestation';
  content?: Maybe<Scalars['String']['output']>;
  version: Scalars['String']['output'];
};

export type NotApplicableSignatureAttestation = {
  __typename?: 'NotApplicableSignatureAttestation';
  reason?: Maybe<Scalars['String']['output']>;
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

export type SignatureAttestationStatus = CompletedSignatureAttestation | NeedsSignatureAttestation | NotApplicableSignatureAttestation;

export type Ticket = {
  __typename?: 'Ticket';
  id: Scalars['String']['output'];
};

export type TicketInput = {
  comment: CommentTicketInput;
  subject: Scalars['String']['input'];
};

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
  signatureAttestationStatus?: Maybe<SignatureAttestationStatus>;
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
