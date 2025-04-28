export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** An extended ISO 8601 date string in the format YYYY-MM-DD. */
  AWSDate: any;
  /** An extended ISO 8601 date and time string in the format YYYY-MM-DDThh:mm:ss.sssZ. */
  AWSDateTime: any;
  /** An email address in the format local-part@domain-part as defined by RFC 822. */
  AWSEmail: any;
  /** A phone number. This value is stored as a string. Phone numbers can contain either spaces or hyphens to separate digit groups. Phone numbers without a country code are assumed to be US/North American numbers adhering to the North American Numbering Plan (NANP). */
  AWSPhone: any;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String'];
  country: Scalars['String'];
  name?: Maybe<Name>;
  postalCode: Scalars['String'];
  state: Scalars['String'];
  street1: Scalars['String'];
  street2?: Maybe<Scalars['String']>;
};

export type AddressInput = {
  city: Scalars['String'];
  country: Scalars['String'];
  name?: InputMaybe<NameInput>;
  postalCode: Scalars['String'];
  state: Scalars['String'];
  street1: Scalars['String'];
  street2?: InputMaybe<Scalars['String']>;
};

export type Allergen = {
  __typename?: 'Allergen';
  id: Scalars['ID'];
  name: Scalars['String'];
  rxcui?: Maybe<Scalars['ID']>;
};

export type AllergenFilter = {
  name?: InputMaybe<Scalars['String']>;
};

export type AllergenInput = {
  allergenId: Scalars['ID'];
  comment?: InputMaybe<Scalars['String']>;
  onset?: InputMaybe<Scalars['AWSDate']>;
};

export type Catalog = {
  __typename?: 'Catalog';
  id: Scalars['ID'];
  name: Scalars['String'];
  templates: Array<Maybe<PrescriptionTemplate>>;
  treatments: Array<Maybe<Treatment>>;
};

export type Client = {
  __typename?: 'Client';
  appType?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
};

export enum ConceptType {
  Drug = 'DRUG',
  Package = 'PACKAGE',
  Product = 'PRODUCT'
}

export type Diagnosis = {
  __typename?: 'Diagnosis';
  code: Scalars['String'];
  name: Scalars['String'];
  type: DiagnosisType;
};

export enum DiagnosisType {
  Icd10 = 'ICD10'
}

export type DispenseUnit = {
  __typename?: 'DispenseUnit';
  name: Scalars['String'];
};

export type DrugFilter = {
  code?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type Fill = {
  __typename?: 'Fill';
  filledAt?: Maybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  order: Order;
  prescription?: Maybe<Prescription>;
  requestedAt: Scalars['AWSDateTime'];
  state: FillState;
  treatment: Treatment;
};

export type FillInput = {
  /** ID of a `Prescription` (optional for OTCs) */
  prescriptionId?: InputMaybe<Scalars['ID']>;
  /** ID of a `Treatment` (optional if `prescriptionId` is set) */
  treatmentId?: InputMaybe<Scalars['ID']>;
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

export type FulfillmentState =
  | 'SENT'
  | 'RECEIVED'
  | 'READY'
  | 'PICKED_UP'
  | 'FILLING'
  | 'SHIPPED'
  | 'DELIVERED';

export type Invite = {
  __typename?: 'Invite';
  createdAt: Scalars['AWSDateTime'];
  email: Scalars['String'];
  expired: Scalars['Boolean'];
  expiresAt: Scalars['AWSDateTime'];
  roles?: Maybe<Array<Maybe<Role>>>;
  url: Scalars['String'];
};

export type InviteInput = {
  email: Scalars['String'];
  /** A list of role ids */
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type LatLongSearch = {
  latitude?: InputMaybe<Scalars['Float']>;
  longitude?: InputMaybe<Scalars['Float']>;
  /** Search radius in miles */
  radius?: InputMaybe<Scalars['Int']>;
};

export type MedHistoryInput = {
  active: Scalars['Boolean'];
  comment?: InputMaybe<Scalars['String']>;
  medicationId: Scalars['ID'];
};

export type MedicalEquipment = Treatment & {
  __typename?: 'MedicalEquipment';
  codes: TreatmentCodes;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Medication = Treatment & {
  __typename?: 'Medication';
  brandName?: Maybe<Scalars['String']>;
  codes: TreatmentCodes;
  concept: ConceptType;
  controlled: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  form?: Maybe<Scalars['String']>;
  genericName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  manufacturer?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  schedule?: Maybe<ScheduleType>;
  strength?: Maybe<Scalars['String']>;
  /** Null implies a medication cant be prescribed */
  type?: Maybe<MedicationType>;
};

export type MedicationFilter = {
  drug?: InputMaybe<DrugFilter>;
  package?: InputMaybe<PackageFilter>;
  product?: InputMaybe<ProductFilter>;
};

export enum MedicationType {
  /** Over-the-Counter */
  Otc = 'OTC',
  /** Prescription */
  Rx = 'RX'
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Add role to user as an organization's admin */
  addRole: User;
  addToCatalog: Treatment;
  /** Create a new `Order` for a specific `Patient` */
  createOrder: Order;
  /** Create a new `Patient` record */
  createPatient: Patient;
  /** Create a new `Prescription` associated with the logged in prescriber. A `patientId` is returned after creating a `Patient` with the `createPatient` mutation. `treatmentId` can be searched with the `medications` or `medicalEquipment` queries. */
  createPrescription: Prescription;
  createPrescriptionTemplate?: Maybe<PrescriptionTemplate>;
  /** Creates multiple new `Prescription` associated with the logged in prescriber. */
  createPrescriptions: Array<Maybe<Prescription>>;
  createWebhookConfig: WebhookConfig;
  deletePrescriptionTemplate: PrescriptionTemplate;
  deleteWebhookConfig?: Maybe<Scalars['Boolean']>;
  /** Create a new invite to the current authenticated organization for the specified email */
  inviteUser: Invite;
  removeFromCatalog: Treatment;
  removePatientAllergy: Patient;
  /** Removes a preferred pharmacy to a patient */
  removePatientPreferredPharmacy: Patient;
  /** Remove role from user as an organzation's admin */
  removeRole: User;
  rotateSecret: Client;
  /** Update an existing `Patient` record */
  updatePatient: Patient;
  updatePrescriptionTemplate: PrescriptionTemplate;
  /** Allow a user to update their own profile */
  updateProfile: User;
  updateWebhookConfig: WebhookConfig;
  /** Start account verification. Only applicable for Doctors */
  verifyAccount: Verification;
};

export type MutationAddRoleArgs = {
  input: RoleInput;
};

export type MutationAddToCatalogArgs = {
  catalogId: Scalars['ID'];
  treatmentId: Scalars['ID'];
};

export type MutationCreateOrderArgs = {
  address: AddressInput;
  externalId?: InputMaybe<Scalars['ID']>;
  fills: Array<FillInput>;
  patientId: Scalars['ID'];
  pharmacyId?: InputMaybe<Scalars['ID']>;
};

export type MutationCreatePatientArgs = {
  address?: InputMaybe<AddressInput>;
  allergies?: InputMaybe<Array<InputMaybe<AllergenInput>>>;
  dateOfBirth: Scalars['AWSDate'];
  email?: InputMaybe<Scalars['AWSEmail']>;
  externalId?: InputMaybe<Scalars['ID']>;
  gender?: InputMaybe<Scalars['String']>;
  medicationHistory?: InputMaybe<Array<InputMaybe<MedHistoryInput>>>;
  name: NameInput;
  phone: Scalars['AWSPhone'];
  preferredPharmacies?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  sex: SexType;
};

export type MutationCreatePrescriptionArgs = {
  daysSupply?: InputMaybe<Scalars['Int']>;
  diagnoses?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']>;
  dispenseQuantity: Scalars['Float'];
  dispenseUnit: Scalars['String'];
  effectiveDate?: InputMaybe<Scalars['AWSDate']>;
  externalId?: InputMaybe<Scalars['ID']>;
  instructions: Scalars['String'];
  notes?: InputMaybe<Scalars['String']>;
  patientId: Scalars['ID'];
  fillsAllowed: Scalars['Int'];
  treatmentId: Scalars['ID'];
};

export type MutationCreatePrescriptionTemplateArgs = {
  catalogId: Scalars['ID'];
  daysSupply?: InputMaybe<Scalars['Int']>;
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']>;
  dispenseQuantity?: InputMaybe<Scalars['Float']>;
  dispenseUnit?: InputMaybe<Scalars['String']>;
  instructions?: InputMaybe<Scalars['String']>;
  notes?: InputMaybe<Scalars['String']>;
  fillsAllowed?: InputMaybe<Scalars['Int']>;
  treatmentId: Scalars['ID'];
};

export type MutationUpdatePrescriptionTemplateArgs = {
  catalogId: Scalars['ID'];
  templateId: Scalars['ID'];
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']>;
  dispenseQuantity?: InputMaybe<Scalars['Float']>;
  dispenseUnit?: InputMaybe<Scalars['String']>;
  fillsAllowed?: InputMaybe<Scalars['Int']>;
  instructions?: InputMaybe<Scalars['String']>;
  notes?: InputMaybe<Scalars['String']>;
};

export type MutationCreatePrescriptionsArgs = {
  prescriptions: Array<InputMaybe<PrescriptionInput>>;
};

export type MutationCreateWebhookConfigArgs = {
  filters?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
  sharedSecret?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type MutationDeletePrescriptionTemplateArgs = {
  catalogId: Scalars['ID'];
  templateId: Scalars['ID'];
};

export type MutationDeleteWebhookConfigArgs = {
  id: Scalars['String'];
};

export type MutationInviteUserArgs = {
  input: InviteInput;
};

export type MutationRemoveFromCatalogArgs = {
  catalogId: Scalars['ID'];
  treatmentId: Scalars['ID'];
};

export type MutationRemovePatientAllergyArgs = {
  allergenId: Scalars['ID'];
  id: Scalars['ID'];
};

export type MutationRemovePatientPreferredPharmacyArgs = {
  patientId: Scalars['ID'];
  pharmacyId: Scalars['ID'];
};

export type MutationRemoveRoleArgs = {
  input: RoleInput;
};

export type MutationRotateSecretArgs = {
  id: Scalars['ID'];
};

export type MutationUpdatePatientArgs = {
  address?: InputMaybe<AddressInput>;
  allergies?: InputMaybe<Array<InputMaybe<AllergenInput>>>;
  email?: InputMaybe<Scalars['AWSEmail']>;
  externalId?: InputMaybe<Scalars['ID']>;
  gender?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  medicationHistory?: InputMaybe<Array<InputMaybe<MedHistoryInput>>>;
  name?: InputMaybe<NameInput>;
  phone?: InputMaybe<Scalars['AWSPhone']>;
  preferredPharmacies?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type MutationUpdateProfileArgs = {
  input: ProfileInput;
};

export type MutationUpdateWebhookConfigArgs = {
  filters?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  sharedSecret?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type Name = {
  __typename?: 'Name';
  first: Scalars['String'];
  /** Convenience method for getting a formated name */
  full: Scalars['String'];
  last: Scalars['String'];
  middle?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type NameInput = {
  first: Scalars['String'];
  last: Scalars['String'];
  middle?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type Order = {
  __typename?: 'Order';
  address?: Maybe<Address>;
  createdAt: Scalars['AWSDateTime'];
  externalId?: Maybe<Scalars['ID']>;
  fills: Array<Fill>;
  fulfillment?: Maybe<OrderFulfillment>;
  id: Scalars['ID'];
  patient: Patient;
  /** The pharmacy that owns this `Order` */
  pharmacy?: Maybe<Pharmacy>;
  state: OrderState;
};

export type OrderFilter = {
  patientId?: InputMaybe<Scalars['ID']>;
  patientName?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<OrderState>;
};

export type OrderFulfillment = {
  __typename?: 'OrderFulfillment';
  carrier?: Maybe<Scalars['String']>;
  state: FulfillmentState;
  trackingNumber?: Maybe<Scalars['String']>;
  type: FulfillmentType;
  minutesUntilReady?: Maybe<Scalars['Int']>;
  pharmacyEstimatedReadyAt?: Maybe<Scalars['AWSDateTime']>;
};

export enum OrderState {
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Error = 'ERROR',
  Pending = 'PENDING',
  Placed = 'PLACED',
  Routing = 'ROUTING'
}

export enum OrgType {
  Pharmacy = 'PHARMACY',
  Prescriber = 'PRESCRIBER'
}

export type Organization = {
  __typename?: 'Organization';
  NPI?: Maybe<Scalars['String']>;
  address?: Maybe<Address>;
  email?: Maybe<Scalars['AWSEmail']>;
  fax?: Maybe<Scalars['AWSPhone']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  phone?: Maybe<Scalars['AWSPhone']>;
  type?: Maybe<OrgType>;
};

export type PackageFilter = {
  code?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  product: Scalars['ID'];
  type?: InputMaybe<MedicationType>;
};

export type Patient = {
  __typename?: 'Patient';
  address?: Maybe<Address>;
  allergies?: Maybe<Array<Maybe<PatientAllergy>>>;
  dateOfBirth: Scalars['AWSDate'];
  email?: Maybe<Scalars['AWSEmail']>;
  externalId?: Maybe<Scalars['ID']>;
  gender?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  medicationHistory?: Maybe<Array<Maybe<PatientMedication>>>;
  name: Name;
  orders?: Maybe<Array<Maybe<Order>>>;
  phone: Scalars['AWSPhone'];
  preferredPharmacies?: Maybe<Array<Maybe<Pharmacy>>>;
  prescriptions?: Maybe<Array<Maybe<Prescription>>>;
  sex: SexType;
};

export type PatientOrdersArgs = {
  after?: InputMaybe<Scalars['ID']>;
  filter?: InputMaybe<PatientOrderFilter>;
  first?: InputMaybe<Scalars['Int']>;
};

export type PatientPrescriptionsArgs = {
  after?: InputMaybe<Scalars['ID']>;
  filter?: InputMaybe<PatientPrescriptionFilter>;
  first?: InputMaybe<Scalars['Int']>;
};

export type PatientAllergy = {
  __typename?: 'PatientAllergy';
  allergen: Allergen;
  comment?: Maybe<Scalars['String']>;
  onset?: Maybe<Scalars['AWSDate']>;
};

export type PatientFilter = {
  name?: InputMaybe<Scalars['String']>;
};

export type PatientMedication = {
  __typename?: 'PatientMedication';
  active: Scalars['Boolean'];
  comment?: Maybe<Scalars['String']>;
  medication: Medication;
  prescription?: Maybe<Prescription>;
};

export type PatientOrderFilter = {
  state?: InputMaybe<OrderState>;
};

export type PatientPrescriptionFilter = {
  prescriberId?: InputMaybe<Scalars['ID']>;
  state?: InputMaybe<PrescriptionState>;
};

export type DayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

export type PharmacyHours = {
  openFrom: string;
  openUntil: string;
  dayOfWeek: DayOfWeek;
  is24Hr: boolean;
  timezone: string;
};

export type PharmacyOpenEvent = {
  type: string;
  datetime: Scalars['AWSDateTime'];
};

export type PharmacyCloseEvent = {
  type: string;
  datetime: Scalars['AWSDateTime'];
};

export type PharmacyOpen24HrEvent = {
  type: string;
};

export type PharmacyEvent = PharmacyOpenEvent | PharmacyCloseEvent | PharmacyOpen24HrEvent;

export type PharmacyEvents = {
  open: PharmacyEvent;
  close: PharmacyEvent;
};

export type Pharmacy = {
  __typename?: 'Pharmacy';
  NPI?: Maybe<Scalars['String']>;
  address?: Maybe<Address>;
  fax?: Maybe<Scalars['AWSPhone']>;
  fulfillmentTypes?: Maybe<Array<Maybe<FulfillmentType>>>;
  id: Scalars['ID'];
  name: Scalars['String'];
  phone?: Maybe<Scalars['AWSPhone']>;
  is24Hr?: boolean;
  nextEvents?: PharmacyEvents;
  hours?: Maybe<Array<PharmacyHours>>;
  isOpen?: boolean;
};

export type Prescription = {
  __typename?: 'Prescription';
  daysSupply?: Maybe<Scalars['Int']>;
  diagnoses?: Maybe<Array<Maybe<Diagnosis>>>;
  dispenseAsWritten?: Maybe<Scalars['Boolean']>;
  dispenseQuantity: Scalars['Float'];
  dispenseUnit: Scalars['String'];
  effectiveDate: Scalars['AWSDate'];
  expirationDate: Scalars['AWSDate'];
  externalId?: Maybe<Scalars['ID']>;
  fills: Array<Maybe<Fill>>;
  id: Scalars['ID'];
  instructions: Scalars['String'];
  notes?: Maybe<Scalars['String']>;
  patient: Patient;
  prescriber: Provider;
  fillsAllowed: Scalars['Int'];
  fillsRemaining: Scalars['Int'];
  state: PrescriptionState;
  treatment: Treatment;
  writtenAt: Scalars['AWSDateTime'];
};

export type PrescriptionFilter = {
  patientId?: InputMaybe<Scalars['ID']>;
  patientName?: InputMaybe<Scalars['String']>;
  prescriberId?: InputMaybe<Scalars['ID']>;
  state?: InputMaybe<PrescriptionState>;
};

export type PrescriptionInput = {
  /** Number of days a single fill lasts */
  daysSupply?: InputMaybe<Scalars['Int']>;
  /** ICD10 codes for patient diagnosises */
  diagnoses?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** True if substitutes are not allowed at the pharmacy */
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']>;
  /** Amount of a `dispenseUnit` per fill */
  dispenseQuantity: Scalars['Float'];
  /** Unit to dispense treatment in */
  dispenseUnit: Scalars['String'];
  /** Date when the script is first valid */
  effectiveDate?: InputMaybe<Scalars['AWSDate']>;
  /** Reference ID for linking to external objects */
  externalId?: InputMaybe<Scalars['ID']>;
  /** Prescriber instructions for patient */
  instructions: Scalars['String'];
  /** Prescriber notes, available to pharmacist */
  notes?: InputMaybe<Scalars['String']>;
  /** ID of the patient that this prescription belongs to */
  patientId: Scalars['ID'];
  /** Number of fills allowed before expiration of script */
  fillsAllowed: Scalars['Int'];
  /** ID of the treatment being prescribed */
  treatmentId: Scalars['ID'];
};

export enum PrescriptionState {
  Draft = 'DRAFT',
  Active = 'ACTIVE',
  Depleted = 'DEPLETED',
  Expired = 'EXPIRED',
  Canceled = 'CANCELED'
}

export type PrescriptionTemplate = {
  __typename?: 'PrescriptionTemplate';
  daysSupply?: Maybe<Scalars['Int']>;
  dispenseAsWritten?: Maybe<Scalars['Boolean']>;
  dispenseQuantity?: Maybe<Scalars['Float']>;
  dispenseUnit?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  instructions?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  fillsAllowed?: Maybe<Scalars['Int']>;
  treatment: Treatment;
  name: Maybe<Scalars['String']>;
  isPrivate: Scalars['Boolean'];
};

export type ProductFilter = {
  code?: InputMaybe<Scalars['String']>;
  drug: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<MedicationType>;
};

export type ProfileInput = {
  address?: InputMaybe<AddressInput>;
  fax?: InputMaybe<Scalars['AWSPhone']>;
  name?: InputMaybe<NameInput>;
  npi?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['AWSPhone']>;
  /** This should be a base64 encoded string of the signature image */
  signature?: InputMaybe<Scalars['String']>;
};

export type Provider = {
  __typename?: 'Provider';
  NPI?: Maybe<Scalars['String']>;
  address?: Maybe<Address>;
  email: Scalars['AWSEmail'];
  externalId?: Maybe<Scalars['ID']>;
  fax?: Maybe<Scalars['AWSPhone']>;
  id: Scalars['ID'];
  name: Name;
  organizations: Array<Organization>;
  phone: Scalars['AWSPhone'];
};

export type Query = {
  __typename?: 'Query';
  /** Get list of allergens, filtered optionally by name (fuzzy search) */
  allergens?: Maybe<Array<Maybe<Allergen>>>;
  /** Get a catalog by id */
  catalog?: Maybe<Catalog>;
  /** Get catalogs associated with caller's organization */
  catalogs: Array<Maybe<Catalog>>;
  clients: Array<Maybe<Client>>;
  /** Get list of Dispense Units for use in creating a prescription */
  dispenseUnits: Array<Maybe<DispenseUnit>>;
  /** Get a fill */
  fill?: Maybe<Fill>;
  /** See all invitations that the organization has made */
  invites?: Maybe<Array<Maybe<Invite>>>;
  /** Retrieve the profile of the currently authenticated user */
  me: User;
  /** Get list of Medical Equipment */
  medicalEquipment: Array<Maybe<MedicalEquipment>>;
  /** Get list of SearchMedication concepts that contain the specified name */
  medicationConcepts?: Maybe<Array<Maybe<SearchMedication>>>;
  /** Get list of forms related to a SearchMedication of type ROUTE. These are returned as prescribable medications */
  medicationForms?: Maybe<Array<Maybe<Medication>>>;
  /** Get list of Medicationn packages related to a Medication of type PRODUCT */
  medicationPackages?: Maybe<Array<Maybe<Medication>>>;
  /** Get list of Medication products related to a Medication of type DRUG */
  medicationProducts?: Maybe<Array<Maybe<Medication>>>;
  /** Get list of routes related to a SearchMedication of type STRENGTH */
  medicationRoutes?: Maybe<Array<Maybe<SearchMedication>>>;
  /** Get list of strengths related to a SearchMedication of type CONCEPT */
  medicationStrengths?: Maybe<Array<Maybe<SearchMedication>>>;
  /** Get list of medications */
  medications: Array<Maybe<Medication>>;
  /** Get an order by ID */
  order?: Maybe<Order>;
  /** Get all orders for a patient */
  orders: Array<Maybe<Order>>;
  /** Get the organization the user is currently authenticated with */
  organization: Organization;
  /** Get all the orgnaizations the user belongs to */
  organizations: Array<Maybe<Organization>>;
  /** Get a patient by ID */
  patient?: Maybe<Patient>;
  /** Get all patients associated with caller's organization */
  patients: Array<Maybe<Patient>>;
  /** Search pharmacies */
  pharmacies: Array<Maybe<Pharmacy>>;
  /** Get a pharmacy by ID */
  pharmacy?: Maybe<Pharmacy>;
  /** Get a prescription by ID */
  prescription?: Maybe<Prescription>;
  /** Get all prescriptions associated with caller's organization */
  prescriptions: Array<Maybe<Prescription>>;
  /** Retrieve a list of available roles */
  roles?: Maybe<Array<Maybe<Role>>>;
  /** Retrieve a list of users for an organization */
  users?: Maybe<Array<Maybe<User>>>;
  /** Retrieve all verifications for yourself */
  verifications?: Maybe<Array<Maybe<Verification>>>;
  webhooks?: Maybe<Array<Maybe<WebhookConfig>>>;
};

export type QueryAllergensArgs = {
  filter?: InputMaybe<AllergenFilter>;
};

export type QueryCatalogArgs = {
  id?: InputMaybe<Scalars['ID']>;
};

export type QueryFillArgs = {
  id: Scalars['ID'];
};

export type QueryMedicalEquipmentArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};

export type QueryMedicationConceptsArgs = {
  name: Scalars['String'];
};

export type QueryMedicationFormsArgs = {
  id: Scalars['String'];
};

export type QueryMedicationPackagesArgs = {
  id: Scalars['String'];
};

export type QueryMedicationProductsArgs = {
  id: Scalars['String'];
};

export type QueryMedicationRoutesArgs = {
  id: Scalars['String'];
};

export type QueryMedicationStrengthsArgs = {
  id: Scalars['String'];
};

export type QueryMedicationsArgs = {
  after?: InputMaybe<Scalars['ID']>;
  filter?: InputMaybe<MedicationFilter>;
  first?: InputMaybe<Scalars['Int']>;
};

export type QueryOrderArgs = {
  id: Scalars['ID'];
};

export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['ID']>;
  filter?: InputMaybe<OrderFilter>;
  first?: InputMaybe<Scalars['Int']>;
};

export type QueryPatientArgs = {
  id: Scalars['ID'];
};

export type QueryPatientsArgs = {
  after?: InputMaybe<Scalars['ID']>;
  filter?: InputMaybe<PatientFilter>;
  first?: InputMaybe<Scalars['Int']>;
};

export type QueryPharmaciesArgs = {
  after?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  location?: InputMaybe<LatLongSearch>;
  name?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<FulfillmentType>;
};

export type QueryPharmacyArgs = {
  id: Scalars['ID'];
};

export type QueryPrescriptionArgs = {
  id: Scalars['ID'];
};

export type QueryPrescriptionsArgs = {
  after?: InputMaybe<Scalars['ID']>;
  filter?: InputMaybe<PrescriptionFilter>;
  first?: InputMaybe<Scalars['Int']>;
};

export type Role = {
  __typename?: 'Role';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};

export type RoleInput = {
  roleId: Scalars['String'];
  userId: Scalars['String'];
};

export enum ScheduleType {
  I = 'I',
  Ii = 'II',
  Iii = 'III',
  Iv = 'IV',
  V = 'V'
}

export type SearchMedication = {
  __typename?: 'SearchMedication';
  id: Scalars['ID'];
  name: Scalars['String'];
  type?: Maybe<SearchMedicationType>;
};

export enum SearchMedicationType {
  Concept = 'CONCEPT',
  Form = 'FORM',
  Route = 'ROUTE',
  Strength = 'STRENGTH'
}

export enum SexType {
  Female = 'FEMALE',
  Male = 'MALE',
  Unknown = 'UNKNOWN'
}

export type Treatment = {
  codes: TreatmentCodes;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  __typename?: 'MedicalEquipment' | 'Compound' | 'Medication';
};

export type TreatmentCodes = {
  __typename?: 'TreatmentCodes';
  HCPCS?: Maybe<Scalars['String']>;
  SKU?: Maybe<Scalars['String']>;
  packageNDC?: Maybe<Scalars['String']>;
  productNDC?: Maybe<Scalars['String']>;
  rxcui?: Maybe<Scalars['String']>;
};

export type TreatmentOption = {
  __typename?: 'TreatmentOption';
  id: Scalars['ID'];
  name: Scalars['String'];
  ndc: Scalars['String'];
  type: MedicationType;
  route?: Scalars['String'];
  form?: Scalars['String'];
  strength?: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Address>;
  email?: Maybe<Scalars['AWSEmail']>;
  externalId?: Maybe<Scalars['ID']>;
  fax?: Maybe<Scalars['AWSPhone']>;
  id: Scalars['ID'];
  name?: Maybe<Name>;
  npi?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['AWSPhone']>;
  roles?: Maybe<Array<Maybe<Role>>>;
  /** A base64 encoded string of the signature picture that can be rendered */
  signature?: Maybe<Scalars['String']>;
  /** Verification status of the account. If not a Doctor, wil be NOT_APPLICABLE */
  verificationStatus: Scalars['String'];
};

export type Verification = {
  __typename?: 'Verification';
  clientSecret: Scalars['String'];
  createdAt: Scalars['AWSDateTime'];
  expired: Scalars['Boolean'];
  lastError?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  verifyUrl: Scalars['String'];
};

export type WebhookConfig = {
  __typename?: 'WebhookConfig';
  filters?: Maybe<Array<Maybe<Scalars['String']>>>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

const PERMISSIONS_ARR = [
  'create:order',
  'edit:profile',
  'manage:organization',
  'manage:user_roles',
  'read:client',
  'read:invite',
  'read:order',
  'read:organization',
  'read:patient',
  'read:prescription',
  'read:profile',
  'read:user_roles',
  'read:webhook_config',
  'update:client_keys',
  'update:order',
  'update:patient',
  'update:prescription',
  'write:client',
  'write:invite',
  'write:order',
  'write:patient',
  'write:prescription',
  'write:webhook_config'
] as const;

export type Permission = (typeof PERMISSIONS_ARR)[number];
