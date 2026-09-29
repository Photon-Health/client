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

/** Address information */
export type AddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street1?: InputMaybe<Scalars['String']['input']>;
  street2?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Adds, removes, or confirms no known allergies (NKDA) in one request.
 * - add and remove may both be populated together — every entry in both arrays is resolved.
 * - none is mutually exclusive with any add/remove entries.
 * - Nothing meaningful set (empty/absent arrays and no none) is malformed.
 * - Omitting the whole allergies field (not this object) means "not yet asked."
 */
export type AllergiesPatch = {
  add?: InputMaybe<Array<AllergyReferenceInput>>;
  none?: InputMaybe<Scalars['Boolean']['input']>;
  remove?: InputMaybe<Array<AllergyReferenceInput>>;
};

/**
 * An on-file allergy, mirroring AllergyReferenceInput's shape but as a
 * resolved record rather than a caller-supplied locator — id and name are
 * always known once an allergy is on file.
 */
export type Allergy = {
  __typename?: 'Allergy';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rxNormId?: Maybe<Scalars['String']['output']>;
};

/**
 * A reference to an allergen, identified by exactly one of id/name/rxNormId —
 * id resolves exactly, name/rxNormId may come back AMBIGUOUS or REJECTED via
 * EntityResolutionDetail. Used by AllergiesPatch for both adding and removing.
 */
export type AllergyReferenceInput = {
  /** The internal Photon allergenId — exact, no resolution needed. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** Free-text allergen name — may resolve to one match or come back AMBIGUOUS. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** May also be ambiguous. */
  rxNormId?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Returned instead of OrderPayload when a patient already has more than one
 * in-progress draft order in this org and no order.id said which one was
 * meant. Resubmit with order.id set to one of the candidates.
 */
export type AmbiguousOrderMatch = {
  __typename?: 'AmbiguousOrderMatch';
  candidates: Array<OrderCandidate>;
  reason: Scalars['String']['output'];
};

/**
 * A likely-duplicate outcome for Patient: 2+ of {email, phone,
 * lastName+dateOfBirth} matched an existing record. Nothing was created or
 * updated — retry with patientId set to a candidate, or different
 * demographic input, to proceed.
 */
export type AmbiguousPatientMatch = {
  __typename?: 'AmbiguousPatientMatch';
  candidates: Array<PatientCandidate>;
  reason: Scalars['String']['output'];
};

/**
 * A likely-duplicate outcome for Prescription: the patient already has 2+
 * in-progress draft prescriptions and no prescriptionId disambiguated which
 * one to continue. Nothing was created or updated — retry with prescriptionId
 * set to a candidate to proceed.
 */
export type AmbiguousPrescriptionMatch = {
  __typename?: 'AmbiguousPrescriptionMatch';
  candidates: Array<PrescriptionCandidate>;
  reason: Scalars['String']['output'];
};

/** An on-file benefit/insurance entry, mirroring BenefitInput's shape. */
export type Benefit = {
  __typename?: 'Benefit';
  bin: Scalars['String']['output'];
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  memberId: Scalars['String']['output'];
  pcn?: Maybe<Scalars['String']['output']>;
};

/**
 * Identifies a benefit for add/remove/update.
 * - add: bin+memberId are required — there's nothing to resolve against yet, they're needed to create the row.
 * - remove/update: any one of id, bin+memberId, or groupId alone may identify an existing on-file benefit — id is exact; groupId alone may be ambiguous if this patient has more than one on-file benefit sharing it.
 * - update: pcn/groupId here become the new routing values; bin/memberId are only used to locate the existing entry, never to change it.
 */
export type BenefitReferenceInput = {
  /** Bank Identification Number — the 6-digit PBM routing identifier. */
  bin?: InputMaybe<Scalars['String']['input']>;
  /** May alone resolve to an on-file benefit; ambiguous if more than one matches. */
  groupId?: InputMaybe<Scalars['String']['input']>;
  /** The internal Photon benefitId — exact, no resolution needed. */
  id?: InputMaybe<Scalars['ID']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  /** Processor Control Number — secondary routing qualifier alongside BIN for the specific plan/processor. */
  pcn?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Adds, removes, updates, or confirms no known benefits in one request. Same
 * add/remove/none rules as AllergiesPatch; update entries change routing
 * fields (pcn/groupId) on an existing on-file benefit.
 */
export type BenefitsPatch = {
  add?: InputMaybe<Array<BenefitReferenceInput>>;
  none?: InputMaybe<Scalars['Boolean']['input']>;
  remove?: InputMaybe<Array<BenefitReferenceInput>>;
  /** Updates routing fields (pcn/groupId) on an existing on-file benefit identified by id, groupId, or bin+memberId. */
  update?: InputMaybe<Array<BenefitReferenceInput>>;
};

/**
 * A single field-level outcome: did this value take effect, and if not, why.
 * Every operation returns its changes via ChangeSet's appliedChanges/
 * unappliedChanges alongside its main payload.
 */
export type Change = {
  __typename?: 'Change';
  /** What this Change is about, independent of severity/status. Populated opportunistically — see ChangeCategory. */
  category?: Maybe<ChangeCategory>;
  /** Variant-specific data — see ChangeDetail for which shape applies to what kind of value this Change is about. */
  detail: ChangeDetail;
  /** Stable identifier for this change within the response, e.g. "allergies.0". */
  key: Scalars['String']['output'];
  /** Human-readable label for what this change is about. */
  label: Scalars['String']['output'];
  operation: ChangeOperation;
  /** What the caller could do about this. Check regardless of status: required when AMBIGUOUS, optional-but-valuable otherwise. */
  options?: Maybe<Array<ChangeOption>>;
  /** Explanation when status is not APPLIED, or when an APPLIED change carries an ADVISORY-severity note. */
  reason?: Maybe<Scalars['String']['output']>;
  severity: ChangeSeverity;
  status: ChangeStatus;
};

/**
 * What a Change is about — independent of severity (urgency) and status
 * (outcome). Populated opportunistically; an uncategorized Change is not an
 * error.
 */
export enum ChangeCategory {
  /** The reference is valid and usable, but a more specific code is preferred for claims. */
  CodingSpecificity = 'CODING_SPECIFICITY',
  /** The action would succeed, but needs explicit confirmation given its consequences. */
  ConfirmationRequired = 'CONFIRMATION_REQUIRED',
  /** A less expensive equivalent exists. */
  CostSavings = 'COST_SAVINGS',
  /** Multiple things could satisfy the reference; the caller must pick one. */
  Disambiguation = 'DISAMBIGUATION',
  InvalidInput = 'INVALID_INPUT',
  /** Required or optional data needed to proceed is absent. */
  MissingInput = 'MISSING_INPUT',
  /** The referenced code/product is retired or discontinued and no longer usable. */
  ObsoleteReference = 'OBSOLETE_REFERENCE',
  /**
   * A specific brand/manufacturer may matter — narrow-therapeutic-index
   * consistency, patient recognition/adherence, or a payer/dispense-as-written
   * requirement.
   */
  ProductPreference = 'PRODUCT_PREFERENCE',
  /** A clinical risk — an interaction, allergy conflict, or cross-reactivity. */
  Safety = 'SAFETY'
}

/** The variant-specific shape of a Change, beyond its shared envelope fields. */
export type ChangeDetail = EntityResolutionDetail | FieldChangeDetail | PharmacyResolutionDetail;

/**
 * Whether a Change represents something newly added, an existing value
 * modified in place, or something removed.
 */
export enum ChangeOperation {
  Added = 'ADDED',
  Modified = 'MODIFIED',
  Removed = 'REMOVED'
}

/**
 * A suggested next action for a Change — required when AMBIGUOUS, optional
 * otherwise. Structured for the caller to act on directly, not parsed from prose.
 * - Most Changes return GenericChangeOption.
 * - A Change about a pharmacy returns PharmacyChangeOption, which also carries offer data.
 */
export type ChangeOption = {
  /**
   * Argument path to set, e.g. "clinical.allergies.0.addAllergy.id". Null
   * if this option means calling a different operation entirely (value is
   * null too, then).
   */
  argument?: Maybe<Scalars['String']['output']>;
  /** Human-readable name of this option, e.g. "Warfarin" or "Penicillin G". */
  displayName: Scalars['String']['output'];
  /** Set only when this option is a catalog match, e.g. an AMBIGUOUS candidate. */
  match?: Maybe<EntityMatch>;
  /** The operation to call to take this option, e.g. "Prescription". */
  operation: Scalars['String']['output'];
  /** Why this option is surfaced, beyond the parent Change's own reason. */
  reason?: Maybe<Scalars['String']['output']>;
  /** The value to use for that argument. Set exactly when argument is. */
  value?: Maybe<Scalars['String']['output']>;
};

/**
 * Every operation's changes, pre-split by persisted vs not — an
 * array-length check instead of filtering by status.
 */
export type ChangeSet = {
  /** Changes that were persisted: status APPLIED */
  appliedChanges: Array<Change>;
  /**
   * Not persisted: REJECTED or AMBIGUOUS — check status for which; each
   * implies a different next step.
   */
  unappliedChanges: Array<Change>;
};

/** How much attention a change requires. */
export enum ChangeSeverity {
  /** Worth noting, doesn't block. */
  Advisory = 'ADVISORY',
  /** Must be resolved before proceeding. */
  Blocking = 'BLOCKING',
  /** Informational, no action needed. */
  Info = 'INFO'
}

/** Whether a specific attempted change took effect, and if not, why. */
export enum ChangeStatus {
  /** Multiple candidates matched; caller must disambiguate. */
  Ambiguous = 'AMBIGUOUS',
  /** Took effect, verified. */
  Applied = 'APPLIED',
  /** Attempted, explicitly failed (validation, conflict, safety). */
  Rejected = 'REJECTED'
}

/** Confidence tier for a match, so callers don't interpret a raw score. */
export enum ConfidenceLevel {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/**
 * Adds, removes, or confirms no known diagnoses in one request. Same
 * add/remove/none rules as AllergiesPatch; no update, since
 * DiagnosisReferenceInput only carries identity.
 */
export type DiagnosesPatch = {
  add?: InputMaybe<Array<DiagnosisReferenceInput>>;
  none?: InputMaybe<Scalars['Boolean']['input']>;
  remove?: InputMaybe<Array<DiagnosisReferenceInput>>;
};

/** An on-file diagnosis, mirroring DiagnosisReferenceInput's shape. */
export type Diagnosis = {
  __typename?: 'Diagnosis';
  icd10Code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

/**
 * A patient diagnosis, identified by exactly one of id/name/icd10Code. Used
 * by DiagnosesPatch (patient-level and prescription-level) and resolved
 * via a Change, keyed by list index (e.g. "clinical.diagnoses.add.0").
 */
export type DiagnosisReferenceInput = {
  /** May also be ambiguous. */
  icd10Code?: InputMaybe<Scalars['String']['input']>;
  /** The internal Photon diagnosisId — exact, no resolution needed. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** Free-text — may resolve to one match or come back AMBIGUOUS. */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Fulfillment and dispensing specifications. */
export type Dispense = {
  __typename?: 'Dispense';
  daysSupply?: Maybe<Scalars['Int']['output']>;
  dispenseAsWritten?: Maybe<Scalars['Boolean']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  refillsAllowed?: Maybe<Scalars['Int']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

/** Fulfillment and dispensing specifications. */
export type DispenseInput = {
  daysSupply?: InputMaybe<Scalars['Int']['input']>;
  dispenseAsWritten?: InputMaybe<Scalars['Boolean']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
  refillsAllowed?: InputMaybe<Scalars['Int']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
};

/** Overall readiness of a drafted prescription, driven by its screening alerts. */
export enum DraftStatus {
  /** Has a screening alert severe enough to prevent sending. Known gap: this API currently has no way to acknowledge/override a BLOCKED draft — it stays BLOCKED. */
  Blocked = 'BLOCKED',
  /** No blocking or warning-level screening alerts. */
  Ready = 'READY',
  /** Has screening alerts to review, but none block sending. */
  Warning = 'WARNING'
}

/** How and how confidently a ChangeOption matched a reference. */
export type EntityMatch = {
  __typename?: 'EntityMatch';
  /** Confidence tier; callers may auto-resolve when HIGH. */
  confidence?: Maybe<ConfidenceLevel>;
  /** Why this candidate matched. */
  matchType: EntityMatchType;
};

export enum EntityMatchType {
  DrugClassMatch = 'DRUG_CLASS_MATCH',
  ExactNameMatch = 'EXACT_NAME_MATCH',
  FuzzyNameMatch = 'FUZZY_NAME_MATCH',
  RxnormCodeMatch = 'RXNORM_CODE_MATCH'
}

/**
 * Outcome of resolving a free-text/coded reference to an entity. AMBIGUOUS
 * candidates surface as the parent Change's options, not here.
 * Change.operation also picks the candidate pool:
 * - ADDED resolves against global reference data (e.g. the allergen catalog)
 * - REMOVED resolves only against this record's current list
 */
export type EntityResolutionDetail = {
  __typename?: 'EntityResolutionDetail';
  /** What the caller actually typed or provided, e.g. "penicillin". */
  inputText?: Maybe<Scalars['String']['output']>;
  /** Set only when status == APPLIED. */
  resolvedEntityId?: Maybe<Scalars['ID']['output']>;
};

/**
 * A scalar field's before/after value. Read Change.operation for
 * ADDED/MODIFIED/REMOVED rather than inferring it from nullability.
 */
export type FieldChangeDetail = {
  __typename?: 'FieldChangeDetail';
  newValue?: Maybe<TypedValue>;
  previousValue?: Maybe<TypedValue>;
};

export enum FulfillmentType {
  MailOrder = 'MAIL_ORDER',
  PickUp = 'PICK_UP'
}

/** A ChangeOption with nothing more specific to add beyond the shared next-action fields. */
export type GenericChangeOption = ChangeOption & {
  __typename?: 'GenericChangeOption';
  argument?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  match?: Maybe<EntityMatch>;
  operation: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** A person's name, mirroring HumanNameInput's shape. */
export type HumanName = {
  __typename?: 'HumanName';
  first?: Maybe<Scalars['String']['output']>;
  last?: Maybe<Scalars['String']['output']>;
  middle?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** A patient or provider's name. Both fields optional; supply either or both. */
export type HumanNameInput = {
  first?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['String']['input']>;
};

/** An entity (e.g. a medication or allergen) referenced by a screening alert. */
export type InvolvedEntity = {
  __typename?: 'InvolvedEntity';
  /** Internal Photon ID of the medication/allergen/condition involved. */
  id: Scalars['ID']['output'];
  /** Human-readable name, e.g. "Penicillin" or "Warfarin". */
  name: Scalars['String']['output'];
};

export type LatLongInput = {
  latitude: Scalars['String']['input'];
  longitude: Scalars['String']['input'];
  radiusMiles?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Only one field is accepted. If multiple fields
 * are defined, we will reject the input.
 */
export type LocationInput = {
  address?: InputMaybe<PharmacyAddressInput>;
  latLong?: InputMaybe<LatLongInput>;
  text?: InputMaybe<Scalars['String']['input']>;
};

/**
 * An on-file medication history entry, mirroring MedicationReferenceInput's
 * shape.
 */
export type MedicationHistoryEntry = {
  __typename?: 'MedicationHistoryEntry';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rxNormId?: Maybe<Scalars['String']['output']>;
  status: MedicationHistoryStatus;
};

/** Whether a medication in a patient's history is currently being taken. */
export enum MedicationHistoryStatus {
  /** Patient is currently taking this medication. */
  Active = 'ACTIVE',
  /** Patient took this medication in the past but is not currently taking it. */
  Historical = 'HISTORICAL',
  /** Not known whether the patient is currently taking this medication. */
  Unknown = 'UNKNOWN'
}

/**
 * One medication in the patient's history, identified by exactly one of
 * id/name/rxNormId. status is not a locator — it's this entry's clinical
 * state, independent of how the medication was identified.
 */
export type MedicationReferenceInput = {
  /** The internal Photon medicationId — exact, no resolution needed. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** Free-text — may resolve to one match or come back AMBIGUOUS. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** May also be ambiguous. */
  rxNormId?: InputMaybe<Scalars['String']['input']>;
  /** This entry's clinical state — not consumed by screening yet. */
  status: MedicationHistoryStatus;
};

/**
 * Adds, removes, updates, or confirms no known medications in one request.
 * Same add/remove/none rules as AllergiesPatch; update entries match an
 * existing on-file entry by name/rxNormId.
 */
export type MedicationsPatch = {
  add?: InputMaybe<Array<MedicationReferenceInput>>;
  none?: InputMaybe<Scalars['Boolean']['input']>;
  remove?: InputMaybe<Array<MedicationReferenceInput>>;
  /** Updates status (ACTIVE/HISTORICAL/UNKNOWN) on an existing on-file entry matched by name/rxNormId. */
  update?: InputMaybe<Array<MedicationReferenceInput>>;
};

/**
 * Entry points for the Rx workflow: intake a patient, draft a prescription,
 * send it. There's no read-side beyond the ping health check.
 */
export type Mutation = {
  __typename?: 'Mutation';
  /** Sends prescriptions to a pharmacy or the patient, consolidated into one order (see Order). This stub performs no verification that prescriptionIds are valid/ready to send or belong to patientId. */
  order: OrderResult;
  /** Resolves Patient's demographic input to an existing or new patient record, and applies any clinical patches (allergies/medications/diagnoses/benefits). */
  patient: PatientResult;
  /**
   * Drafts a prescription: resolves treatment/diagnoses, runs clinical
   * screening, and lets a prescriber sign the current draft (see
   * PrescriptionSigningDetails). Known gap: no way to send a signed
   * prescription or acknowledge a BLOCKED draft's alerts through this API.
   */
  prescription: PrescriptionResult;
};


/**
 * Entry points for the Rx workflow: intake a patient, draft a prescription,
 * send it. There's no read-side beyond the ping health check.
 */
export type MutationOrderArgs = {
  input: OrderInput;
  metadata: RequestMetadata;
};


/**
 * Entry points for the Rx workflow: intake a patient, draft a prescription,
 * send it. There's no read-side beyond the ping health check.
 */
export type MutationPatientArgs = {
  metadata: RequestMetadata;
  patient?: InputMaybe<PatientInput>;
};


/**
 * Entry points for the Rx workflow: intake a patient, draft a prescription,
 * send it. There's no read-side beyond the ping health check.
 */
export type MutationPrescriptionArgs = {
  metadata: RequestMetadata;
  prescription?: InputMaybe<PrescriptionInput>;
};

export type OfferAttributeTag = {
  __typename?: 'OfferAttributeTag';
  kind: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

/**
 * One comparable number for choosing between pharmacies — not a line-item
 * receipt. See PrescriptionOffer/OfferPrescriptionPrice on patient-api for
 * the fuller per-prescription breakdown once an order exists.
 */
export type OfferPriceSummary = {
  __typename?: 'OfferPriceSummary';
  priceType?: Maybe<OfferPriceType>;
  totalAmount?: Maybe<Scalars['Float']['output']>;
  totalRetailAmount?: Maybe<Scalars['Float']['output']>;
  totalSavings?: Maybe<Scalars['Float']['output']>;
};

export enum OfferPriceType {
  Cash = 'CASH',
  Insurance = 'INSURANCE',
  Membership = 'MEMBERSHIP'
}

/** Base shape for every real (non-business-outcome) operation failure. */
export type OperationError = {
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

/**
 * The order produced by sending one or more prescriptions to the same
 * destination (a specific pharmacy, or the patient).
 */
export type Order = {
  __typename?: 'Order';
  /** Problems with this order that currently need attention. Empty once resolved, and always empty for a DRAFT order. */
  exceptions: Array<OrderException>;
  id: Scalars['ID']['output'];
  /** Null only for a legacy/orphaned order with no on-file patient. */
  patient?: Maybe<PatientRecordResult>;
  /** The pharmacy this order has been routed to. Null when unassigned — the patient chooses from the marketplace. */
  pharmacy?: Maybe<Pharmacy>;
  prescriptions: Array<Prescription>;
  /** Default is DRAFT, which allows changes without triggering downstream events. */
  state: OrderState;
};

/**
 * One possible existing/overlapping order surfaced when Order's input is a
 * likely duplicate — see AmbiguousOrderMatch.
 */
export type OrderCandidate = {
  __typename?: 'OrderCandidate';
  id: Scalars['ID']['output'];
  pharmacyId?: Maybe<Scalars['ID']['output']>;
  prescriptionIds: Array<Scalars['ID']['output']>;
};

/**
 * An open problem with an order. Scoped to the order itself — an order can
 * have multiple prescriptions across multiple pharmacy fulfillments
 * internally, but this reports on the order as a whole.
 */
export type OrderException = {
  __typename?: 'OrderException';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  type: OrderExceptionType;
};

/**
 * Why an order needs attention — usually a problem reaching or using the
 * destination pharmacy.
 */
export enum OrderExceptionType {
  DemographicMismatch = 'DEMOGRAPHIC_MISMATCH',
  DoctorNotLicensedInState = 'DOCTOR_NOT_LICENSED_IN_STATE',
  ExternalTransfer = 'EXTERNAL_TRANSFER',
  OrderError = 'ORDER_ERROR',
  PharmacyClosed = 'PHARMACY_CLOSED',
  PharmacyDoesNotAcceptInsurance = 'PHARMACY_DOES_NOT_ACCEPT_INSURANCE',
  PharmacyNeedsInsuranceInfo = 'PHARMACY_NEEDS_INSURANCE_INFO',
  PharmacyUnreachable = 'PHARMACY_UNREACHABLE',
  SupervisingPhysicianNeeded = 'SUPERVISING_PHYSICIAN_NEEDED'
}

/** Input for creating or updating an order. */
export type OrderInput = {
  /** The existing order to update. Omit to create a new one, in DRAFT state. */
  order?: InputMaybe<OrderReferenceInput>;
  /**
   * Patient to send the order to, can locate by ID or demographic info. Omit
   * this field entirely on an update to an existing order to leave the
   * patient untouched — it falls back to whoever is already on file.
   * Required when creating a brand-new order, since there's no on-file
   * patient to fall back to.
   */
  patient?: InputMaybe<PatientReferenceInput>;
  /**
   * The pharmacy to send to.
   * - Omit entirely to leave it untouched — on a brand-new order that means the patient chooses from the marketplace; on an existing order it keeps whatever pharmacy is already assigned.
   * - Set it to choose a pharmacy for the patient, at any time.
   * - Pass null explicitly (not simply omitting the field) to reset an already-assigned pharmacy — even on an already-submitted order — so the patient can choose again.
   */
  pharmacy?: InputMaybe<PharmacyReferenceInput>;
  /** Add/Remove prescriptions from the order */
  prescriptions?: InputMaybe<OrderPrescriptionsPatch>;
  /** Default is DRAFT, which allows changes without triggering downstream events */
  state?: InputMaybe<OrderState>;
};

/**
 * The successful result of Order: the order that was created, sending the
 * given prescriptions to their destination. Null only when nothing could be
 * sent — check unappliedChanges for why.
 */
export type OrderPayload = ChangeSet & {
  __typename?: 'OrderPayload';
  appliedChanges: Array<Change>;
  order?: Maybe<Order>;
  unappliedChanges: Array<Change>;
};

/**
 * Adds/removes prescriptions on an order. Removing disconnects a
 * prescription from the order — it does not cancel the prescription.
 */
export type OrderPrescriptionsPatch = {
  add?: InputMaybe<Array<PrescriptionReferenceInput>>;
  /** Detaches every prescription currently on the order. */
  none?: InputMaybe<Scalars['Boolean']['input']>;
  remove?: InputMaybe<Array<PrescriptionReferenceInput>>;
};

/**
 * Locates an existing order — provide id, or externalId when the Photon id
 * isn't known. Omit the whole field to create a new order in DRAFT state.
 */
export type OrderReferenceInput = {
  /** An external system's identifier for this order, scoped to the caller's organization. */
  externalId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Tier-2 result of Order: OrderPayload or a real (non-business-outcome)
 * failure type. Business-outcome issues (e.g. a rejected send) surface via
 * OrderPayload.changes, not here.
 */
export type OrderResult = AmbiguousOrderMatch | OrderPayload | UnauthorizedError | UpstreamServiceError;

/**
 * Lifecycle state for Order. Default is DRAFT, which allows changes
 * without triggering downstream events (e.g. sending to a pharmacy).
 */
export enum OrderState {
  /**
   * Only valid coming from SUBMITTED. Once an order is submitted, changing
   * its pharmacy or cancelling it are the only changes this mutation allows.
   */
  Canceled = 'CANCELED',
  /** Editable; no downstream events triggered. */
  Draft = 'DRAFT',
  /** Submitted for fulfillment; triggers downstream send events. */
  Submitted = 'SUBMITTED'
}

export type Patient = {
  __typename?: 'Patient';
  clinical?: Maybe<PatientClinical>;
  demographic?: Maybe<PatientDemographic>;
  id: Scalars['ID']['output'];
};

export type PatientAddress = {
  __typename?: 'PatientAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street1?: Maybe<Scalars['String']['output']>;
  street2?: Maybe<Scalars['String']['output']>;
};

/**
 * One possible existing patient match surfaced when Patient's demographic
 * input is a likely duplicate — see AmbiguousPatientMatch.
 */
export type PatientCandidate = {
  __typename?: 'PatientCandidate';
  dateOfBirth?: Maybe<Scalars['Date']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
};

export type PatientClinical = {
  __typename?: 'PatientClinical';
  allergies: Array<Allergy>;
  diagnoses: Array<Diagnosis>;
  medications: Array<MedicationHistoryEntry>;
  notes?: Maybe<Scalars['String']['output']>;
};

/**
 * Clinical context for Patient: allergy/medication/diagnosis patches plus
 * free-text notes.
 */
export type PatientClinicalInput = {
  allergies?: InputMaybe<AllergiesPatch>;
  /**
   * Patient-level diagnoses for future clinical screening context — not tied
   * to a specific prescription or used to justify a claim. Distinct from
   * Prescription's diagnoses argument (the code justifying one prescription).
   */
  diagnoses?: InputMaybe<DiagnosesPatch>;
  medications?: InputMaybe<MedicationsPatch>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type PatientDemographic = {
  __typename?: 'PatientDemographic';
  address?: Maybe<PatientAddress>;
  benefits: Array<Benefit>;
  dateOfBirth?: Maybe<Scalars['Date']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  name: HumanName;
  phone?: Maybe<Scalars['String']['output']>;
  preferredPharmacy?: Maybe<Pharmacy>;
  sex?: Maybe<Sex>;
};

/**
 * Demographic info used by Patient to resolve or create a record. If no ID
 * is provided, this data is used to match an existing patient and avoid
 * creating a duplicate.
 */
export type PatientDemographicInput = {
  address?: InputMaybe<AddressInput>;
  benefits?: InputMaybe<BenefitsPatch>;
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<HumanNameInput>;
  phone?: InputMaybe<Scalars['String']['input']>;
  preferredPharmacy?: InputMaybe<PharmacyReferenceInput>;
  sex?: InputMaybe<Sex>;
};

export type PatientInput = {
  clinical?: InputMaybe<PatientClinicalInput>;
  demographic?: InputMaybe<PatientDemographicInput>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * The successful result of Patient: the resolved (or newly created) patient,
 * echoing back demographic input. Null only when when a patient couldn't be
 * resolved or created
 */
export type PatientPayload = ChangeSet & {
  __typename?: 'PatientPayload';
  appliedChanges: Array<Change>;
  patient?: Maybe<PatientRecordResult>;
  unappliedChanges: Array<Change>;
};

/**
 * The patient record, or the failure from reading it back.
 * Empty lists on Patient mean "nothing on file".
 */
export type PatientRecordResult = Patient | UpstreamServiceError;

/** Locates or echoes the patient on a prescription. */
export type PatientReference = {
  __typename?: 'PatientReference';
  demographic?: Maybe<PatientDemographic>;
  id: Scalars['ID']['output'];
};

/**
 * Locates a patient for a prescription or order — by Photon ID or by demographic
 * data so the resolver can match the record. Excludes clinical history (allergies,
 * meds, diagnoses) which is managed via the Patient mutation.
 */
export type PatientReferenceInput = {
  /** Demographic info used to match an existing patient if ID is unknown. */
  demographic?: InputMaybe<PatientDemographicInput>;
  /** The internal Photon patient ID — exact, no resolution needed. */
  id?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Tier-2 result of Patient: PatientPayload, an AmbiguousPatientMatch on
 * likely duplicate, or a real (non-business-outcome) failure type.
 */
export type PatientResult = AmbiguousPatientMatch | PatientPayload | UnauthorizedError | UpstreamServiceError;

/**
 * An on-file pharmacy, mirroring the record shape returned for ambiguous
 * PharmacyReferenceInput matches.
 */
export type Pharmacy = {
  __typename?: 'Pharmacy';
  address?: Maybe<PharmacyAddress>;
  fulfillmentType?: Maybe<Array<FulfillmentType>>;
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
};

/** A pharmacy's location, mirroring PharmacyAddressInput's shape. */
export type PharmacyAddress = {
  __typename?: 'PharmacyAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street1?: Maybe<Scalars['String']['output']>;
  street2?: Maybe<Scalars['String']['output']>;
};

export type PharmacyAddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street1?: InputMaybe<Scalars['String']['input']>;
  street2?: InputMaybe<Scalars['String']['input']>;
};

/** A ChangeOption for a pharmacy candidate, carrying whatever offers apply to it. */
export type PharmacyChangeOption = ChangeOption & {
  __typename?: 'PharmacyChangeOption';
  argument?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  match?: Maybe<EntityMatch>;
  offers: Array<PharmacyOffer>;
  operation: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/**
 * A pricing/promotion signal available at a specific pharmacy for this
 * order's prescriptions — from a sponsored marketplace bundle (e.g. Amazon
 * Pharmacy, Novocare) or a cash discount card (GoodRx, RxSense). A pharmacy
 * can carry more than one simultaneously; each is reported separately rather
 * than merged into one blended number.
 */
export type PharmacyOffer = {
  __typename?: 'PharmacyOffer';
  /** Display-ready badges, e.g. { kind: "SPONSORED", label: "Sponsored" }. */
  attributeTags: Array<OfferAttributeTag>;
  /** Whether this offer is sponsored/promoted placement rather than an organic price match. */
  isPromoted: Scalars['Boolean']['output'];
  /** Per-prescription delivery timing — kept separate from priceSummary because timing can vary prescription to prescription even within one offer. */
  prescriptionDeliveryEstimates: Array<PrescriptionDeliveryEstimate>;
  /** Comparable top-line pricing across this order's prescriptions. Absent when this source has no pricing data. */
  priceSummary?: Maybe<OfferPriceSummary>;
  /** Identifies which offer source produced this — e.g. "AMAZON_PHARMACY", "NOVOCARE", "goodrx", "rxsense". */
  source: Scalars['String']['output'];
};

export type PharmacyReferenceInput = {
  fulfillmentType?: InputMaybe<FulfillmentType>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  near?: InputMaybe<LocationInput>;
  openAt?: InputMaybe<Scalars['Date']['input']>;
};

/**
 * Same shape as EntityResolutionDetail, plus whatever pharmacy offers apply
 * to the resolved (or, for AMBIGUOUS, each candidate) pharmacy — sponsored
 * placement, discount-card pricing, delivery timing. Populated opportunistically;
 * an empty list means no offers apply, not that offers weren't checked.
 */
export type PharmacyResolutionDetail = {
  __typename?: 'PharmacyResolutionDetail';
  /** What the caller actually typed or provided, e.g. "CVS on Main St". */
  inputText?: Maybe<Scalars['String']['output']>;
  offers: Array<PharmacyOffer>;
  /** Set only when status == APPLIED. */
  resolvedEntityId?: Maybe<Scalars['ID']['output']>;
};

/**
 * The structured content of a drafted or updated prescription, echoing back
 * fulfillment specifications, clinical justification, and readiness screening results.
 */
export type Prescription = {
  __typename?: 'Prescription';
  clinical?: Maybe<PrescriptionClinical>;
  dispense?: Maybe<Dispense>;
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  patient?: Maybe<PatientReference>;
  screeningAlerts?: Maybe<Array<ScreeningAlert>>;
  signing: PrescriptionSigningDetails;
  status?: Maybe<DraftStatus>;
  templateId?: Maybe<Scalars['ID']['output']>;
  treatment: Treatment;
};

/**
 * One possible existing draft surfaced when Prescription's patient already
 * has more than one in-progress draft and no prescriptionId was given to
 * say which one was meant — see AmbiguousPrescriptionMatch.
 */
export type PrescriptionCandidate = {
  __typename?: 'PrescriptionCandidate';
  dispense?: Maybe<Dispense>;
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
};

/** Prescription-level clinical justification and notes. */
export type PrescriptionClinical = {
  __typename?: 'PrescriptionClinical';
  diagnoses: Array<Diagnosis>;
  notes?: Maybe<Scalars['String']['output']>;
};

/** Prescription-level clinical justification and notes. */
export type PrescriptionClinicalInput = {
  /** Diagnosis/ICD-10 code(s) justifying this specific prescription claim. */
  diagnoses?: InputMaybe<DiagnosesPatch>;
  /** Prescriber or pharmacy notes. */
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type PrescriptionDeliveryEstimate = {
  __typename?: 'PrescriptionDeliveryEstimate';
  deliveryPromise: Scalars['String']['output'];
  deliveryPromiseRangeEnd?: Maybe<Scalars['DateTime']['output']>;
  deliveryPromiseRangeStart?: Maybe<Scalars['DateTime']['output']>;
  prescriptionId: Scalars['ID']['output'];
};

/** Input for drafting or updating a prescription. */
export type PrescriptionInput = {
  /** 4. Clinical justification & billing context */
  clinical?: InputMaybe<PrescriptionClinicalInput>;
  /** 3. Fulfillment specifications */
  dispense?: InputMaybe<DispenseInput>;
  /** Existing draft ID if modifying; omit to draft a new one. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** 2. Patient-facing dosing instructions (the sig) */
  instructions?: InputMaybe<Scalars['String']['input']>;
  /** Patient locator — by ID or demographic matching. */
  patient?: InputMaybe<PatientReferenceInput>;
  /** 5. Prescriber attestation to this draft's current content */
  signing?: InputMaybe<PrescriptionSigningDetailsInput>;
  /** Optional order set / template ID to pre-populate drug, sig, and dispense defaults. */
  templateId?: InputMaybe<Scalars['ID']['input']>;
  /** 1. The medication identity/locator */
  treatment?: InputMaybe<TreatmentReferenceInput>;
};

/**
 * The result of Prescription: the drafted or updated prescription with its
 * screening alerts. Null only when a draft couldn't be resolved or created —
 * check unappliedChanges for why.
 */
export type PrescriptionPayload = ChangeSet & {
  __typename?: 'PrescriptionPayload';
  appliedChanges: Array<Change>;
  prescription?: Maybe<Prescription>;
  unappliedChanges: Array<Change>;
};

/**
 * References an existing prescription, to add to or remove from an order.
 * Provide id, or externalId (scoped to the caller's organization) when the
 * Photon id isn't known.
 */
export type PrescriptionReferenceInput = {
  /** An external system's identifier for this prescription, scoped to the caller's organization. */
  externalId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Tier-2 result of Prescription: PrescriptionPayload, an
 * AmbiguousPrescriptionMatch on likely duplicate, or a real
 * (non-business-outcome) failure type. Business-outcome issues (e.g. a
 * BLOCKED alert) surface via PrescriptionPayload.prescription/changes, not here.
 */
export type PrescriptionResult = AmbiguousPrescriptionMatch | PrescriptionPayload | UnauthorizedError | UpstreamServiceError;

/**
 * Signing status echoed back on every Prescription. contentHash is always
 * freshly recomputed from this response's own clinically-significant fields
 * (never stored) — sign it and retry even if this call never asked about
 * signing before.
 */
export type PrescriptionSigningDetails = {
  __typename?: 'PrescriptionSigningDetails';
  /** Hash of this prescription's current clinically-significant fields (excludes notes). Sign this value to produce signedHash. */
  contentHash: Scalars['String']['output'];
  /** Echoed back only once state is SIGNED. */
  message?: Maybe<Scalars['String']['output']>;
  /** Set only once state is SIGNED. */
  signedAt?: Maybe<Scalars['Date']['output']>;
  state: PrescriptionSigningState;
};

/**
 * Caller's attempt to sign a drafted prescription's current content.
 * Can't be combined with a real treatment or diagnoses change in the same
 * call — signing attests to what's on file, not to edits made in the same
 * breath.
 */
export type PrescriptionSigningDetailsInput = {
  /** Optional signer note, echoed back on PrescriptionSigningDetails.message when the sign succeeds. */
  message?: InputMaybe<Scalars['String']['input']>;
  /** A previously-returned contentHash the caller is attesting to. Must match the server's freshly recomputed hash exactly, or the attempt is rejected as INVALIDATED_SIGN. */
  signedHash?: InputMaybe<Scalars['String']['input']>;
};

/** Derived signing status for a prescription draft's current content. */
export enum PrescriptionSigningState {
  /**
   * A signedHash was supplied (or one is on file) but does not match the
   * current contentHash — the draft changed since it was signed, or the
   * wrong hash was sent. Retry signing with the returned contentHash.
   */
  InvalidatedSign = 'INVALIDATED_SIGN',
  /** The supplied (or on-file) signedHash matches the current contentHash. */
  Signed = 'SIGNED',
  /** No signedHash supplied on this call, and no valid signature on file. */
  Unsigned = 'UNSIGNED'
}

/** A numeric amount with a unit, e.g. "30 tablets". */
export type QuantityValue = TypedValue & {
  __typename?: 'QuantityValue';
  displayValue: Scalars['String']['output'];
  unit: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Health check — confirms this subgraph is alive and composable. Not part of the Rx workflow. */
  ping: Scalars['String']['output'];
};

/** Non-clinical metadata carried on every operation. Used for analytics and debugging. */
export type RequestMetadata = {
  /** The client application name, e.g. "network-api-web". */
  client?: InputMaybe<Scalars['String']['input']>;
  /** Caller-supplied request ID for tracing. */
  requestId?: InputMaybe<Scalars['String']['input']>;
  /** Where the call originated. */
  source: RequestSource;
  /** The source/connector's version, e.g. "2.3.1". */
  sourceVersion?: InputMaybe<Scalars['String']['input']>;
};

/** Where a network-api call originated. */
export enum RequestSource {
  DirectApi = 'DIRECT_API',
  EmbeddableComponent = 'EMBEDDABLE_COMPONENT',
  LlmAgent = 'LLM_AGENT',
  McpConnector = 'MCP_CONNECTOR',
  WebApp = 'WEB_APP'
}

/**
 * One clinical screening finding (e.g. a drug interaction or allergy
 * conflict) surfaced while drafting a prescription. Not a Change — it's a
 * finding from evaluating the treatment against patient history, reusing
 * ChangeOption/ChangeCategory but not the full Change envelope.
 */
export type ScreeningAlert = {
  __typename?: 'ScreeningAlert';
  /** Always populated, unlike the opportunistic Change.category — every alert is categorizable by definition. */
  category: ChangeCategory;
  description: Scalars['String']['output'];
  involvedEntities: Array<InvolvedEntity>;
  /** An alternative that would avoid this conflict, when one exists. */
  options?: Maybe<Array<ChangeOption>>;
  severity: ScreeningSeverity;
  /**
   * Which kind of entity conflicted — orthogonal to category (why it
   * matters). A DRUG-type alert could be SAFETY or DUPLICATE_THERAPY; type
   * alone can't distinguish which.
   */
  type: ScreeningAlertType;
};

/** The type of clinical screening alert. */
export enum ScreeningAlertType {
  /** Conflicts with an allergy on the patient's record. */
  Allergen = 'ALLERGEN',
  /** Conflicts with a diagnosis/condition on the patient's record. */
  Condition = 'CONDITION',
  /** A drug-drug interaction. */
  Drug = 'DRUG'
}

/** How serious a clinical screening alert is. */
export enum ScreeningSeverity {
  /** Serious concern; blocks the draft. */
  Major = 'MAJOR',
  /** Low-severity concern; never blocks the draft. */
  Minor = 'MINOR',
  /** Notable concern; blocks the draft. */
  Moderate = 'MODERATE'
}

/** Patient sex, as used for demographic matching and clinical purposes. */
export enum Sex {
  /** Female. */
  Female = 'FEMALE',
  /** Male. */
  Male = 'MALE',
  /** Not provided or not known. */
  Unknown = 'UNKNOWN'
}

export type TextValue = TypedValue & {
  __typename?: 'TextValue';
  displayValue: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

/**
 * A resolved treatment (the drug being prescribed), mirroring
 * TreatmentReferenceInput's identity fields minus templateId — that's an
 * input-only locator convenience, not a fact about the treatment itself.
 */
export type Treatment = {
  __typename?: 'Treatment';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  ndc?: Maybe<Scalars['String']['output']>;
  rxNormId?: Maybe<Scalars['String']['output']>;
  upc?: Maybe<Scalars['String']['output']>;
};

/** Locates a treatment — by exactly one of id/rxNormId/name/ndc/upc. */
export type TreatmentReferenceInput = {
  /** Exact, no resolution needed. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** Free-text — may resolve to one match or come back AMBIGUOUS. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** NDC code. */
  ndc?: InputMaybe<Scalars['String']['input']>;
  rxNormId?: InputMaybe<Scalars['String']['input']>;
  /** UPC code. */
  upc?: InputMaybe<Scalars['String']['input']>;
};

/** A typed value exposed without the caller doing its own string parsing. */
export type TypedValue = {
  /** Human-readable rendering, always populated. */
  displayValue: Scalars['String']['output'];
};

/** No credential, or an invalid/expired credential. */
export type UnauthorizedError = OperationError & {
  __typename?: 'UnauthorizedError';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  /** The permission the caller was missing, if known. */
  requiredPermission?: Maybe<Scalars['String']['output']>;
};

/** A downstream service returned an unexpected error. */
export type UpstreamServiceError = OperationError & {
  __typename?: 'UpstreamServiceError';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  retryable: Scalars['Boolean']['output'];
  service: Scalars['String']['output'];
};

export type NetworkPrescriptionFieldsFragment = { __typename?: 'Prescription', id: string, status?: DraftStatus | null, instructions?: string | null, treatment: { __typename?: 'Treatment', id: string, name: string, rxNormId?: string | null, ndc?: string | null }, dispense?: { __typename?: 'Dispense', quantity?: number | null, unit?: string | null, daysSupply?: number | null, refillsAllowed?: number | null, dispenseAsWritten?: boolean | null } | null, clinical?: { __typename?: 'PrescriptionClinical', notes?: string | null, diagnoses: Array<{ __typename?: 'Diagnosis', icd10Code?: string | null }> } | null, screeningAlerts?: Array<{ __typename?: 'ScreeningAlert', severity: ScreeningSeverity, type: ScreeningAlertType, description: string }> | null, signing: { __typename?: 'PrescriptionSigningDetails', state: PrescriptionSigningState, contentHash: string } };

export type NetworkChangeFieldsFragment = { __typename?: 'Change', key: string, label: string, status: ChangeStatus, severity: ChangeSeverity, reason?: string | null };

export type NetworkOrderMutationVariables = Exact<{
  input: OrderInput;
  metadata: RequestMetadata;
}>;


export type NetworkOrderMutation = { __typename?: 'Mutation', order: { __typename: 'AmbiguousOrderMatch', reason: string } | { __typename: 'OrderPayload', order?: { __typename?: 'Order', id: string, state: OrderState, pharmacy?: { __typename?: 'Pharmacy', id: string, name: string, address?: { __typename?: 'PharmacyAddress', street1?: string | null, street2?: string | null, city?: string | null, state?: string | null, postalCode?: string | null } | null } | null, patient?: { __typename: 'Patient', id: string, demographic?: { __typename?: 'PatientDemographic', dateOfBirth?: any | null, sex?: Sex | null, gender?: string | null, email?: string | null, phone?: string | null, name: { __typename?: 'HumanName', first?: string | null, last?: string | null }, address?: { __typename?: 'PatientAddress', street1?: string | null, street2?: string | null, city?: string | null, state?: string | null, postalCode?: string | null, country?: string | null } | null } | null, clinical?: { __typename?: 'PatientClinical', notes?: string | null, allergies: Array<{ __typename?: 'Allergy', name: string }> } | null } | { __typename: 'UpstreamServiceError' } | null, prescriptions: Array<{ __typename?: 'Prescription', id: string, status?: DraftStatus | null, instructions?: string | null, treatment: { __typename?: 'Treatment', id: string, name: string, rxNormId?: string | null, ndc?: string | null }, dispense?: { __typename?: 'Dispense', quantity?: number | null, unit?: string | null, daysSupply?: number | null, refillsAllowed?: number | null, dispenseAsWritten?: boolean | null } | null, clinical?: { __typename?: 'PrescriptionClinical', notes?: string | null, diagnoses: Array<{ __typename?: 'Diagnosis', icd10Code?: string | null }> } | null, screeningAlerts?: Array<{ __typename?: 'ScreeningAlert', severity: ScreeningSeverity, type: ScreeningAlertType, description: string }> | null, signing: { __typename?: 'PrescriptionSigningDetails', state: PrescriptionSigningState, contentHash: string } }> } | null, unappliedChanges: Array<{ __typename?: 'Change', key: string, label: string, status: ChangeStatus, severity: ChangeSeverity, reason?: string | null }> } | { __typename: 'UnauthorizedError', code: string, message: string } | { __typename: 'UpstreamServiceError', code: string, message: string } };

export type NetworkPatientMutationVariables = Exact<{
  patient?: InputMaybe<PatientInput>;
  metadata: RequestMetadata;
}>;


export type NetworkPatientMutation = { __typename?: 'Mutation', patient: { __typename: 'AmbiguousPatientMatch', reason: string, candidates: Array<{ __typename?: 'PatientCandidate', id: string, firstName: string, lastName?: string | null, dateOfBirth?: any | null }> } | { __typename: 'PatientPayload', patient?: { __typename: 'Patient', id: string } | { __typename: 'UpstreamServiceError' } | null, unappliedChanges: Array<{ __typename?: 'Change', key: string, label: string, status: ChangeStatus, severity: ChangeSeverity, reason?: string | null }> } | { __typename: 'UnauthorizedError', code: string, message: string } | { __typename: 'UpstreamServiceError', code: string, message: string } };

export type NetworkPrescriptionMutationVariables = Exact<{
  prescription?: InputMaybe<PrescriptionInput>;
  metadata: RequestMetadata;
}>;


export type NetworkPrescriptionMutation = { __typename?: 'Mutation', prescription: { __typename: 'AmbiguousPrescriptionMatch', reason: string } | { __typename: 'PrescriptionPayload', prescription?: { __typename?: 'Prescription', id: string, status?: DraftStatus | null, instructions?: string | null, treatment: { __typename?: 'Treatment', id: string, name: string, rxNormId?: string | null, ndc?: string | null }, dispense?: { __typename?: 'Dispense', quantity?: number | null, unit?: string | null, daysSupply?: number | null, refillsAllowed?: number | null, dispenseAsWritten?: boolean | null } | null, clinical?: { __typename?: 'PrescriptionClinical', notes?: string | null, diagnoses: Array<{ __typename?: 'Diagnosis', icd10Code?: string | null }> } | null, screeningAlerts?: Array<{ __typename?: 'ScreeningAlert', severity: ScreeningSeverity, type: ScreeningAlertType, description: string }> | null, signing: { __typename?: 'PrescriptionSigningDetails', state: PrescriptionSigningState, contentHash: string } } | null, unappliedChanges: Array<{ __typename?: 'Change', key: string, label: string, status: ChangeStatus, severity: ChangeSeverity, reason?: string | null }> } | { __typename: 'UnauthorizedError', code: string, message: string } | { __typename: 'UpstreamServiceError', code: string, message: string } };

export const NetworkPrescriptionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkPrescriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Prescription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"treatment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rxNormId"}},{"kind":"Field","name":{"kind":"Name","value":"ndc"}}]}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"dispense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"daysSupply"}},{"kind":"Field","name":{"kind":"Name","value":"refillsAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"dispenseAsWritten"}}]}},{"kind":"Field","name":{"kind":"Name","value":"clinical"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"diagnoses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"icd10Code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"screeningAlerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"signing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"contentHash"}}]}}]}}]} as unknown as DocumentNode<NetworkPrescriptionFieldsFragment, unknown>;
export const NetworkChangeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Change"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<NetworkChangeFieldsFragment, unknown>;
export const NetworkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NetworkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestMetadata"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pharmacy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"patient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Patient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"demographic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"last"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"street1"}},{"kind":"Field","name":{"kind":"Name","value":"street2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"clinical"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"allergies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"prescriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NetworkPrescriptionFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unappliedChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NetworkChangeFields"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AmbiguousOrderMatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UnauthorizedError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UpstreamServiceError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkPrescriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Prescription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"treatment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rxNormId"}},{"kind":"Field","name":{"kind":"Name","value":"ndc"}}]}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"dispense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"daysSupply"}},{"kind":"Field","name":{"kind":"Name","value":"refillsAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"dispenseAsWritten"}}]}},{"kind":"Field","name":{"kind":"Name","value":"clinical"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"diagnoses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"icd10Code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"screeningAlerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"signing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"contentHash"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Change"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<NetworkOrderMutation, NetworkOrderMutationVariables>;
export const NetworkPatientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NetworkPatient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patient"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PatientInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestMetadata"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"patient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patient"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patient"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PatientPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"patient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Patient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unappliedChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NetworkChangeFields"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AmbiguousPatientMatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"candidates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UnauthorizedError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UpstreamServiceError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Change"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<NetworkPatientMutation, NetworkPatientMutationVariables>;
export const NetworkPrescriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NetworkPrescription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prescription"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PrescriptionInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestMetadata"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prescription"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prescription"}}},{"kind":"Argument","name":{"kind":"Name","value":"metadata"},"value":{"kind":"Variable","name":{"kind":"Name","value":"metadata"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrescriptionPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prescription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NetworkPrescriptionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unappliedChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NetworkChangeFields"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AmbiguousPrescriptionMatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UnauthorizedError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UpstreamServiceError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkPrescriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Prescription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"treatment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rxNormId"}},{"kind":"Field","name":{"kind":"Name","value":"ndc"}}]}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"dispense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"daysSupply"}},{"kind":"Field","name":{"kind":"Name","value":"refillsAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"dispenseAsWritten"}}]}},{"kind":"Field","name":{"kind":"Name","value":"clinical"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"diagnoses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"icd10Code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"screeningAlerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"signing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"contentHash"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NetworkChangeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Change"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<NetworkPrescriptionMutation, NetworkPrescriptionMutationVariables>;