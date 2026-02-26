/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  DateTime: { input: any; output: any };
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
  mediSpanId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rxNormId?: InputMaybe<Scalars['Int']['input']>;
};

export type Benefit = {
  __typename?: 'Benefit';
  bin: Scalars['String']['output'];
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  memberId: Scalars['String']['output'];
  pcn?: Maybe<Scalars['String']['output']>;
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
  connections?: Maybe<Array<Connection>>;
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

export type Connection = {
  __typename?: 'Connection';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export enum ContactPreference {
  Admin = 'admin',
  Group = 'group',
  Photon = 'photon',
  Provider = 'provider'
}

export type Coverage = {
  __typename?: 'Coverage';
  alerts: Array<CoverageAlert>;
  daysSupply: Scalars['Int']['output'];
  dispenseQuantity: Scalars['Float']['output'];
  dispenseUnit: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAlternative: Scalars['Boolean']['output'];
  paRequired: Scalars['Boolean']['output'];
  pharmacy: Pharmacy;
  prescriptionId: Scalars['ID']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  status: CoverageStatus;
  statusMessage: Scalars['String']['output'];
  treatment: Treatment;
};

export type CoverageAlert = {
  __typename?: 'CoverageAlert';
  label: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type CoverageResponse = {
  __typename?: 'CoverageResponse';
  coverages: Array<Coverage>;
};

export type CoverageRxInput = {
  icd10Codes?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['ID']['input'];
};

export enum CoverageStatus {
  Covered = 'COVERED',
  CoveredWithRestrictions = 'COVERED_WITH_RESTRICTIONS',
  NotCovered = 'NOT_COVERED'
}

export type Customer = {
  __typename?: 'Customer';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type DraftedPrescriptionInput = {
  daysSupply?: InputMaybe<Scalars['Int']['input']>;
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']['input']>;
  dispenseQuantity?: InputMaybe<Scalars['Float']['input']>;
  dispenseUnit?: InputMaybe<Scalars['String']['input']>;
  doNotFillBeforeDate?: InputMaybe<Scalars['Date']['input']>;
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
  ndc?: Maybe<Scalars['String']['output']>;
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
  createSupervisor: Supervisor;
  createTicket: Ticket;
  createWebhookConfig: Scalars['ID']['output'];
  deleteInvite: Scalars['ID']['output'];
  deleteWebhookConfig: Scalars['ID']['output'];
  generateCoverageOptions: Array<Coverage>;
  inviteUser: Invite;
  removeUserFromOrganization: Scalars['ID']['output'];
  resendInvite: Invite;
  rotateClientSecret: Client;
  setUserRoles: Scalars['ID']['output'];
  trackEvent: Scalars['Boolean']['output'];
  updateClient: Client;
  updateMyProfile: Scalars['ID']['output'];
  updateOrganization: Scalars['ID']['output'];
  updateOrganizationSettings: OrganizationSettings;
  updatePrescriptionStates: Scalars['Boolean']['output'];
  updateProviderProfile: Scalars['ID']['output'];
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

export type MutationCreateSupervisorArgs = {
  input: SupervisorInput;
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

export type MutationGenerateCoverageOptionsArgs = {
  pharmacyId: Scalars['ID']['input'];
  prescriptions: Array<CoverageRxInput>;
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

export type MutationTrackEventArgs = {
  event: Scalars['String']['input'];
  properties?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateClientArgs = {
  clientId: Scalars['ID']['input'];
  connections?: InputMaybe<Array<Scalars['String']['input']>>;
  whiteListedUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationUpdateMyProfileArgs = {
  input: ProviderProfileInput;
};

export type MutationUpdateOrganizationArgs = {
  input: OrganizationInput;
};

export type MutationUpdateOrganizationSettingsArgs = {
  input: OrganizationSettingsInput;
};

export type MutationUpdatePrescriptionStatesArgs = {
  input: UpdatePrescriptionStatesInput;
};

export type MutationUpdateProviderProfileArgs = {
  input: ProviderProfileInput;
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
  customer?: Maybe<Customer>;
  email?: Maybe<Scalars['String']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  settings?: Maybe<OrganizationSettings>;
  type: OrgType;
};

export type OrganizationContactRxPdfSettings = {
  __typename?: 'OrganizationContactRxPdfSettings';
  fromFaxPreference?: Maybe<ContactPreference>;
  fromPhonePreference?: Maybe<ContactPreference>;
};

export type OrganizationContactSettings = {
  __typename?: 'OrganizationContactSettings';
  rxPdf?: Maybe<OrganizationContactRxPdfSettings>;
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
  optionalPatientAddress?: Maybe<Scalars['Boolean']['output']>;
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
  optionalPatientAddress?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OrganizationSettings = {
  __typename?: 'OrganizationSettings';
  brandColor: Scalars['String']['output'];
  brandLogo?: Maybe<Scalars['String']['output']>;
  contact?: Maybe<OrganizationContactSettings>;
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
  phone?: Maybe<Scalars['String']['output']>;
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
  doNotFillBeforeDate?: Maybe<Scalars['Date']['output']>;
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

export type PrescriptionRoutingConstraint = {
  __typename?: 'PrescriptionRoutingConstraint';
  constraintPharmacies: Array<Pharmacy>;
  prescription: Prescription;
  routingConstraintType: RoutingConstraintType;
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

export type PrescriptionScreeningAlertInvolvedAllergen =
  PrescriptionScreeningAlertInvolvedEntity & {
    __typename?: 'PrescriptionScreeningAlertInvolvedAllergen';
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
  };

export type PrescriptionScreeningAlertInvolvedDraftedPrescription =
  PrescriptionScreeningAlertInvolvedEntity & {
    __typename?: 'PrescriptionScreeningAlertInvolvedDraftedPrescription';
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
  };

export type PrescriptionScreeningAlertInvolvedEntity = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PrescriptionScreeningAlertInvolvedExistingPrescription =
  PrescriptionScreeningAlertInvolvedEntity & {
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

export type ProviderInput = {
  address: AddressInput;
  fax?: InputMaybe<Scalars['String']['input']>;
  npi: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type ProviderProfileInput = {
  address?: InputMaybe<AddressInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<UserNameInput>;
  npi?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  /** A base64 encoded string of the signature picture */
  signature?: InputMaybe<Scalars['String']['input']>;
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
  pharmacies: Array<Pharmacy>;
  /** Retrieve a list of all alerts for attempting to prescribe the propsed prescriptions to the given patientId */
  prescriptionScreen: PrescriptionScreenResult;
  /** Retrieve a role */
  role?: Maybe<Role>;
  /** Retrieve a list of available roles for current user organization */
  roles: Array<Role>;
  /** Retrieve all pharmacy routing constraints for a prescription */
  routingConstraintForRx: PrescriptionRoutingConstraint;
  /** Retrieve a list of all substances matching the provided filter */
  substances: Array<Maybe<Substance>>;
  supervisors: Array<Maybe<Supervisor>>;
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

export type QueryPharmaciesArgs = {
  fulfillmentType?: InputMaybe<FulfillmentType>;
  integrated?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPrescriptionScreenArgs = {
  draftedPrescriptions: Array<DraftedPrescriptionInput>;
  patientId: Scalars['ID']['input'];
};

export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRoutingConstraintForRxArgs = {
  prescriptionId: Scalars['ID']['input'];
};

export type QuerySubstancesArgs = {
  filter: SubstanceFilter;
};

export type QuerySupervisorsArgs = {
  orgId?: InputMaybe<Scalars['ID']['input']>;
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

export type QueryUserCountArgs = {
  filter?: InputMaybe<UsersFilter>;
};

export type QueryUsersArgs = {
  filter?: InputMaybe<UsersFilter>;
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

export enum RoutingConstraintType {
  Exclude = 'EXCLUDE',
  Include = 'INCLUDE',
  NoAdvice = 'NO_ADVICE',
  NoRouting = 'NO_ROUTING'
}

export enum SexType {
  Female = 'FEMALE',
  Male = 'MALE',
  Unknown = 'UNKNOWN'
}

export type SignatureAttestationStatus =
  | CompletedSignatureAttestation
  | NeedsSignatureAttestation
  | NotApplicableSignatureAttestation;

export type Substance = {
  __typename?: 'Substance';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SubstanceFilter = {
  medispanId?: InputMaybe<Scalars['String']['input']>;
  ndc?: InputMaybe<Scalars['String']['input']>;
  rxNormId?: InputMaybe<Scalars['Int']['input']>;
};

export type Supervisor = {
  __typename?: 'Supervisor';
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  npi: Scalars['String']['output'];
  orgId: Scalars['String']['output'];
};

export type SupervisorInput = {
  fullName: Scalars['String']['input'];
  npi: Scalars['String']['input'];
};

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
  ndc?: InputMaybe<Scalars['String']['input']>;
  rxNormId?: InputMaybe<Scalars['String']['input']>;
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

export type UpdatePrescriptionStatesInput = {
  ids: Array<Scalars['ID']['input']>;
  state: PrescriptionState;
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

export type UsersFilter = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type WebhookConfig = {
  __typename?: 'WebhookConfig';
  filters: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type SearchTreatmentsQueryVariables = Exact<{
  filter: TreatmentFilter;
}>;

export type SearchTreatmentsQuery = {
  __typename?: 'Query';
  treatments: Array<
    | { __typename?: 'Compound'; id: string; name: string }
    | { __typename?: 'MedicalEquipment'; id: string; name: string }
    | { __typename?: 'Medication'; id: string; name: string }
  >;
};

export const SearchTreatmentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchTreatments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'TreatmentFilter' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'treatments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<SearchTreatmentsQuery, SearchTreatmentsQueryVariables>;
