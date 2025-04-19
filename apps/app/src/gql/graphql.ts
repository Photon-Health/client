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

export type Allergen = {
  __typename?: 'Allergen';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rxNormId?: Maybe<Scalars['String']['output']>;
};

export type AllergenFilter = {
  name?: InputMaybe<Scalars['String']['input']>;
  rxNormId?: InputMaybe<Scalars['Int']['input']>;
};

export type Benefit = {
  __typename?: 'Benefit';
  bin: Scalars['String']['output'];
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  memberId: Scalars['String']['output'];
  payerName?: Maybe<Scalars['String']['output']>;
  pcn?: Maybe<Scalars['String']['output']>;
  planName?: Maybe<Scalars['String']['output']>;
  type: BenefitType;
};

export type BenefitInput = {
  bin: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  patientId: Scalars['ID']['input'];
  pcn?: InputMaybe<Scalars['String']['input']>;
};

export enum BenefitType {
  Coupon = 'coupon',
  Discount = 'discount',
  Insurance = 'insurance'
}

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

export enum MedicationType {
  Otc = 'OTC',
  Rx = 'RX'
}

export type Mutation = {
  __typename?: 'Mutation';
  agreeToSignatureAttestation: Scalars['Boolean']['output'];
  createBenefit: Benefit;
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
  updateClient: Client;
  updateMyProfile: Scalars['ID']['output'];
  updateOrganization: Scalars['ID']['output'];
  updateOrganizationSettings: OrganizationSettings;
  updateProviderProfile: Scalars['ID']['output'];
  updateProviderSignature: Scalars['ID']['output'];
  updateWebhookConfig: Scalars['ID']['output'];
};


export type MutationAgreeToSignatureAttestationArgs = {
  version: Scalars['String']['input'];
};


export type MutationCreateBenefitArgs = {
  input: BenefitInput;
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


export type MutationUpdateOrganizationSettingsArgs = {
  input: OrganizationSettingsInput;
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
  settings?: Maybe<OrganizationSettings>;
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

export type OrganizationPatientUxSettings = {
  __typename?: 'OrganizationPatientUxSettings';
  enablePatientDeliveryPharmacies?: Maybe<Scalars['Boolean']['output']>;
  enablePatientRerouting?: Maybe<Scalars['Boolean']['output']>;
  patientFeaturedPharmacyName?: Maybe<Scalars['String']['output']>;
};

export type OrganizationPatientUxSettingsInput = {
  enablePatientDeliveryPharmacies?: InputMaybe<Scalars['Boolean']['input']>;
  enablePatientRerouting?: InputMaybe<Scalars['Boolean']['input']>;
  patientFeaturedPharmacyName?: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationProviderUxSettings = {
  __typename?: 'OrganizationProviderUxSettings';
  enableDeliveryPharmacies?: Maybe<Scalars['Boolean']['output']>;
  enableDuplicateRxWarnings?: Maybe<Scalars['Boolean']['output']>;
  enablePatientRouting?: Maybe<Scalars['Boolean']['output']>;
  enablePickupPharmacies?: Maybe<Scalars['Boolean']['output']>;
  enablePrescribeToOrder?: Maybe<Scalars['Boolean']['output']>;
  enablePrescriberOrdering?: Maybe<Scalars['Boolean']['output']>;
  enableRxTemplates?: Maybe<Scalars['Boolean']['output']>;
  enableTreatmentHistory?: Maybe<Scalars['Boolean']['output']>;
  federatedAuth?: Maybe<Scalars['Boolean']['output']>;
};

export type OrganizationProviderUxSettingsInput = {
  enableDeliveryPharmacies?: InputMaybe<Scalars['Boolean']['input']>;
  enableDuplicateRxWarnings?: InputMaybe<Scalars['Boolean']['input']>;
  enablePatientRouting?: InputMaybe<Scalars['Boolean']['input']>;
  enablePickupPharmacies?: InputMaybe<Scalars['Boolean']['input']>;
  enablePrescribeToOrder?: InputMaybe<Scalars['Boolean']['input']>;
  enablePrescriberOrdering?: InputMaybe<Scalars['Boolean']['input']>;
  enableRxTemplates?: InputMaybe<Scalars['Boolean']['input']>;
  enableTreatmentHistory?: InputMaybe<Scalars['Boolean']['input']>;
  federatedAuth?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OrganizationSettings = {
  __typename?: 'OrganizationSettings';
  brandColor: Scalars['String']['output'];
  brandLogo?: Maybe<Scalars['String']['output']>;
  enablePriorAuthorizationSupport: Scalars['Boolean']['output'];
  enableRxClarificationSupport: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  organizationId: Scalars['ID']['output'];
  patientUx: OrganizationPatientUxSettings;
  priorAuthorizationContactAdmin: Scalars['Boolean']['output'];
  priorAuthorizationContactProvider: Scalars['Boolean']['output'];
  priorAuthorizationEmail?: Maybe<Scalars['String']['output']>;
  priorAuthorizationExceptionMessage?: Maybe<Scalars['String']['output']>;
  priorAuthorizationName?: Maybe<Scalars['String']['output']>;
  providerUx: OrganizationProviderUxSettings;
  rxClarificationContactAdmin: Scalars['Boolean']['output'];
  rxClarificationContactProvider: Scalars['Boolean']['output'];
  rxClarificationEmail?: Maybe<Scalars['String']['output']>;
  rxClarificationName?: Maybe<Scalars['String']['output']>;
  supportContactAdmin: Scalars['Boolean']['output'];
  supportEmail?: Maybe<Scalars['String']['output']>;
  supportName?: Maybe<Scalars['String']['output']>;
};

export type OrganizationSettingsInput = {
  brandColor?: InputMaybe<Scalars['String']['input']>;
  brandLogo?: InputMaybe<Scalars['String']['input']>;
  enablePriorAuthorizationSupport?: InputMaybe<Scalars['Boolean']['input']>;
  enableRxClarificationSupport?: InputMaybe<Scalars['Boolean']['input']>;
  patientUx?: InputMaybe<OrganizationPatientUxSettingsInput>;
  priorAuthorizationContactAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  priorAuthorizationContactProvider?: InputMaybe<Scalars['Boolean']['input']>;
  priorAuthorizationEmail?: InputMaybe<Scalars['String']['input']>;
  priorAuthorizationExceptionMessage?: InputMaybe<Scalars['String']['input']>;
  priorAuthorizationName?: InputMaybe<Scalars['String']['input']>;
  providerUx?: InputMaybe<OrganizationProviderUxSettingsInput>;
  rxClarificationContactAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  rxClarificationContactProvider?: InputMaybe<Scalars['Boolean']['input']>;
  rxClarificationEmail?: InputMaybe<Scalars['String']['input']>;
  rxClarificationName?: InputMaybe<Scalars['String']['input']>;
  supportContactAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  supportEmail?: InputMaybe<Scalars['String']['input']>;
  supportName?: InputMaybe<Scalars['String']['input']>;
};

export type Patient = {
  __typename?: 'Patient';
  benefits: Array<Benefit>;
  dateOfBirth: Scalars['Date']['output'];
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Name;
  phone: Scalars['String']['output'];
  sex: SexType;
  treatmentHistory: Array<TreatmentHistory>;
};

export type PatientsFilter = {
  externalIds?: InputMaybe<Array<Scalars['String']['input']>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
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
  state: PrescriptionState;
  treatment: Treatment;
  writtenAt: Scalars['DateTime']['output'];
};

export type PrescriptionScreenResult = {
  __typename?: 'PrescriptionScreenResult';
  alerts: Array<PrescriptionScreeningAlert>;
};

export type PrescriptionScreeningAlert = {
  __typename?: 'PrescriptionScreeningAlert';
  description: Scalars['String']['output'];
  involvedEntities: Array<PrescriptionScreeningAlertInvolvedEntity>;
  severity: PrescriptionScreeningAlertSeverity;
  type: PrescriptionScreeningAlertType;
};

export type PrescriptionScreeningAlertInvolvedAllergen = PrescriptionScreeningAlertInvolvedEntity & {
  __typename?: 'PrescriptionScreeningAlertInvolvedAllergen';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PrescriptionScreeningAlertInvolvedDraftedPrescription = PrescriptionScreeningAlertInvolvedEntity & {
  __typename?: 'PrescriptionScreeningAlertInvolvedDraftedPrescription';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PrescriptionScreeningAlertInvolvedEntity = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PrescriptionScreeningAlertInvolvedExistingPrescription = PrescriptionScreeningAlertInvolvedEntity & {
  __typename?: 'PrescriptionScreeningAlertInvolvedExistingPrescription';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
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

export enum PrescriptionState {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Depleted = 'DEPLETED',
  Draft = 'DRAFT',
  Expired = 'EXPIRED'
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

export type Query = {
  __typename?: 'Query';
  /** Retrieve a list of all allergens */
  allergens: Array<Allergen>;
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
  /** Retrieve the matching medication for a given package NDC */
  medicationFromNdc: Medication;
  order?: Maybe<Order>;
  organization?: Maybe<Organization>;
  /** Retrieve a patient */
  patient?: Maybe<Patient>;
  /** Retrieve patients by filter (functions as an OR query returning patients that match any of the filter fields) */
  patients: Array<Patient>;
  /** Retrieve a list of all alerts for attempting to prescribe the propsed prescriptions to the given patientId */
  prescriptionScreen: PrescriptionScreenResult;
  /** Retrieve a role */
  role?: Maybe<Role>;
  /** Retrieve a list of available roles for current user organization */
  roles: Array<Role>;
  /**
   * DEPRECATED: Retrieve a list of available treatment options by search string
   * @deprecated Use the `treatments` query instead.
   */
  treatmentOptions: Array<TreatmentOption>;
  /** Retrieve a list of available treatment items by search string */
  treatments: Array<Treatment>;
  user?: Maybe<User>;
  /** Get number of users in the current organization */
  userCount: Scalars['Int']['output'];
  /**
   * Retrieve users for current user organization
   * Default pageSize is 50, max 100
   */
  users: Array<User>;
  webhook?: Maybe<WebhookConfig>;
  webhooks: Array<WebhookConfig>;
};


export type QueryAllergensArgs = {
  filter: AllergenFilter;
};


export type QueryClientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInviteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMedicationFromNdcArgs = {
  packageNdc: Scalars['String']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPatientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPatientsArgs = {
  filter: PatientsFilter;
};


export type QueryPrescriptionScreenArgs = {
  draftedPrescriptions: Array<DraftedPrescriptionInput>;
  patientId: Scalars['ID']['input'];
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTreatmentOptionsArgs = {
  searchTerm: Scalars['String']['input'];
};


export type QueryTreatmentsArgs = {
  filter: TreatmentFilter;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  pageNum?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
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

export type TreatmentFilter = {
  term?: InputMaybe<Scalars['String']['input']>;
};

export type TreatmentHistory = {
  __typename?: 'TreatmentHistory';
  active: Scalars['Boolean']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  prescription?: Maybe<Prescription>;
  treatment: Treatment;
};

export type TreatmentOption = {
  __typename?: 'TreatmentOption';
  form?: Maybe<Scalars['String']['output']>;
  medicationId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ndc: Scalars['String']['output'];
  route?: Maybe<Scalars['String']['output']>;
  schedule?: Maybe<Scalars['String']['output']>;
  strength?: Maybe<Scalars['String']['output']>;
  type: MedicationType;
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

export type AuthComponentOrgSettingsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthComponentOrgSettingsQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', settings?: { __typename?: 'OrganizationSettings', providerUx: { __typename?: 'OrganizationProviderUxSettings', federatedAuth?: boolean | null } } | null } | null };

export type NavOrgSettingsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type NavOrgSettingsQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', settings?: { __typename?: 'OrganizationSettings', providerUx: { __typename?: 'OrganizationProviderUxSettings', federatedAuth?: boolean | null } } | null } | null };

export type TicketModalCreateTicketMutationVariables = Exact<{
  input: TicketInput;
}>;


export type TicketModalCreateTicketMutation = { __typename?: 'Mutation', createTicket: { __typename?: 'Ticket', id: string } };

export type OrderFormOrgSettingsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type OrderFormOrgSettingsQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', settings?: { __typename?: 'OrganizationSettings', providerUx: { __typename?: 'OrganizationProviderUxSettings', enablePrescriberOrdering?: boolean | null, enablePatientRouting?: boolean | null, enablePickupPharmacies?: boolean | null, enableDeliveryPharmacies?: boolean | null } } | null } | null };

export type NewOrderOrgSettingsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type NewOrderOrgSettingsQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', settings?: { __typename?: 'OrganizationSettings', providerUx: { __typename?: 'OrganizationProviderUxSettings', enablePrescriberOrdering?: boolean | null } } | null } | null };

export type PrescriptionFormOrgSettingsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type PrescriptionFormOrgSettingsQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', settings?: { __typename?: 'OrganizationSettings', providerUx: { __typename?: 'OrganizationProviderUxSettings', enablePrescribeToOrder?: boolean | null, enableRxTemplates?: boolean | null, enableDuplicateRxWarnings?: boolean | null, enableTreatmentHistory?: boolean | null, enablePatientRouting?: boolean | null, enablePickupPharmacies?: boolean | null, enableDeliveryPharmacies?: boolean | null } } | null } | null };

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

export type OrganizationSettingsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationSettingsQueryQuery = { __typename?: 'Query', organization?: { __typename?: 'Organization', settings?: { __typename?: 'OrganizationSettings', id: string, organizationId: string, brandColor: string, brandLogo?: string | null, supportContactAdmin: boolean, supportName?: string | null, supportEmail?: string | null, enableRxClarificationSupport: boolean, rxClarificationContactProvider: boolean, rxClarificationContactAdmin: boolean, rxClarificationName?: string | null, rxClarificationEmail?: string | null, enablePriorAuthorizationSupport: boolean, priorAuthorizationContactProvider: boolean, priorAuthorizationContactAdmin: boolean, priorAuthorizationName?: string | null, priorAuthorizationEmail?: string | null, priorAuthorizationExceptionMessage?: string | null, providerUx: { __typename?: 'OrganizationProviderUxSettings', enablePrescriberOrdering?: boolean | null, enablePrescribeToOrder?: boolean | null, enableRxTemplates?: boolean | null, enableDuplicateRxWarnings?: boolean | null, enableTreatmentHistory?: boolean | null, enablePatientRouting?: boolean | null, enablePickupPharmacies?: boolean | null, enableDeliveryPharmacies?: boolean | null }, patientUx: { __typename?: 'OrganizationPatientUxSettings', enablePatientRerouting?: boolean | null, enablePatientDeliveryPharmacies?: boolean | null, patientFeaturedPharmacyName?: string | null } } | null } | null };

export type UpdateOrganizationSettingsMutationVariables = Exact<{
  input: OrganizationSettingsInput;
}>;


export type UpdateOrganizationSettingsMutation = { __typename?: 'Mutation', updateOrganizationSettings: { __typename?: 'OrganizationSettings', id: string } };

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
export const AuthComponentOrgSettingsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthComponentOrgSettingsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"providerUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"federatedAuth"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AuthComponentOrgSettingsQueryQuery, AuthComponentOrgSettingsQueryQueryVariables>;
export const NavOrgSettingsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NavOrgSettingsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"providerUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"federatedAuth"}}]}}]}}]}}]}}]} as unknown as DocumentNode<NavOrgSettingsQueryQuery, NavOrgSettingsQueryQueryVariables>;
export const TicketModalCreateTicketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TicketModalCreateTicket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TicketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTicket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TicketModalCreateTicketMutation, TicketModalCreateTicketMutationVariables>;
export const OrderFormOrgSettingsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrderFormOrgSettingsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"providerUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enablePrescriberOrdering"}},{"kind":"Field","name":{"kind":"Name","value":"enablePatientRouting"}},{"kind":"Field","name":{"kind":"Name","value":"enablePickupPharmacies"}},{"kind":"Field","name":{"kind":"Name","value":"enableDeliveryPharmacies"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderFormOrgSettingsQueryQuery, OrderFormOrgSettingsQueryQueryVariables>;
export const NewOrderOrgSettingsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NewOrderOrgSettingsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"providerUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enablePrescriberOrdering"}}]}}]}}]}}]}}]} as unknown as DocumentNode<NewOrderOrgSettingsQueryQuery, NewOrderOrgSettingsQueryQueryVariables>;
export const PrescriptionFormOrgSettingsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrescriptionFormOrgSettingsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"providerUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enablePrescribeToOrder"}},{"kind":"Field","name":{"kind":"Name","value":"enableRxTemplates"}},{"kind":"Field","name":{"kind":"Name","value":"enableDuplicateRxWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"enableTreatmentHistory"}},{"kind":"Field","name":{"kind":"Name","value":"enablePatientRouting"}},{"kind":"Field","name":{"kind":"Name","value":"enablePickupPharmacies"}},{"kind":"Field","name":{"kind":"Name","value":"enableDeliveryPharmacies"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PrescriptionFormOrgSettingsQueryQuery, PrescriptionFormOrgSettingsQueryQueryVariables>;
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
export const OrganizationSettingsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationSettingsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"brandColor"}},{"kind":"Field","name":{"kind":"Name","value":"brandLogo"}},{"kind":"Field","name":{"kind":"Name","value":"supportContactAdmin"}},{"kind":"Field","name":{"kind":"Name","value":"supportName"}},{"kind":"Field","name":{"kind":"Name","value":"supportEmail"}},{"kind":"Field","name":{"kind":"Name","value":"enableRxClarificationSupport"}},{"kind":"Field","name":{"kind":"Name","value":"rxClarificationContactProvider"}},{"kind":"Field","name":{"kind":"Name","value":"rxClarificationContactAdmin"}},{"kind":"Field","name":{"kind":"Name","value":"rxClarificationName"}},{"kind":"Field","name":{"kind":"Name","value":"rxClarificationEmail"}},{"kind":"Field","name":{"kind":"Name","value":"enablePriorAuthorizationSupport"}},{"kind":"Field","name":{"kind":"Name","value":"priorAuthorizationContactProvider"}},{"kind":"Field","name":{"kind":"Name","value":"priorAuthorizationContactAdmin"}},{"kind":"Field","name":{"kind":"Name","value":"priorAuthorizationName"}},{"kind":"Field","name":{"kind":"Name","value":"priorAuthorizationEmail"}},{"kind":"Field","name":{"kind":"Name","value":"priorAuthorizationExceptionMessage"}},{"kind":"Field","name":{"kind":"Name","value":"providerUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enablePrescriberOrdering"}},{"kind":"Field","name":{"kind":"Name","value":"enablePrescribeToOrder"}},{"kind":"Field","name":{"kind":"Name","value":"enableRxTemplates"}},{"kind":"Field","name":{"kind":"Name","value":"enableDuplicateRxWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"enableTreatmentHistory"}},{"kind":"Field","name":{"kind":"Name","value":"enablePatientRouting"}},{"kind":"Field","name":{"kind":"Name","value":"enablePickupPharmacies"}},{"kind":"Field","name":{"kind":"Name","value":"enableDeliveryPharmacies"}}]}},{"kind":"Field","name":{"kind":"Name","value":"patientUx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enablePatientRerouting"}},{"kind":"Field","name":{"kind":"Name","value":"enablePatientDeliveryPharmacies"}},{"kind":"Field","name":{"kind":"Name","value":"patientFeaturedPharmacyName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrganizationSettingsQueryQuery, OrganizationSettingsQueryQueryVariables>;
export const UpdateOrganizationSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganizationSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganizationSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationSettingsMutation, UpdateOrganizationSettingsMutationVariables>;
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