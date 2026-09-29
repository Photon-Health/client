export type Medication = { id: string; name: string; status: string };

/**
 * The API models sex as MALE | FEMALE | UNKNOWN. UNKNOWN is what it stores for
 * "not answered", so `verify/profile` offers only the first two rather than
 * writing a deliberate answer as a skipped one.
 */
export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN';

/** network-api's PatientAddress — every field is nullable. */
export type PatientAddress = {
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type IntakePatient = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  /** Only `postalCode` is read — it decides whether the zip screen is shown. */
  address?: PatientAddress | null;
  medications: Medication[];
};

export type PatientCandidate = {
  id: string;
  firstName: string;
  lastName?: string | null;
};

/**
 * Screen 2's three outcomes. `notFound` is a named state rather than an error
 * so the phase-2 new-patient screen can slot into that branch unchanged.
 */
export type PatientLookupResult =
  | { kind: 'matched'; patient: IntakePatient }
  | { kind: 'notFound'; missingFields: string[] }
  | { kind: 'ambiguous'; reason: string; candidates: PatientCandidate[] };

/** `kind` is a free string on the wire; Tag's tones are a closed set. */
export type OfferAttributeTag = { kind: string; label: string };

export type OfferPriceSummary = {
  priceType?: string | null;
  totalAmount?: number | null;
  totalRetailAmount?: number | null;
  totalSavings?: number | null;
};

export type PharmacyOffer = {
  source: string;
  isPromoted: boolean;
  attributeTags: OfferAttributeTag[];
  priceSummary?: OfferPriceSummary | null;
  prescriptionDeliveryEstimates: { prescriptionId: string; deliveryPromise: string }[];
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
  /** 24 hour HH:MM, local to the pharmacy. */
  openFrom: string;
  openUntil: string;
  dayOfWeek: DayOfWeek;
  is24Hr: boolean;
  /** IANA zone the openFrom/openUntil pair is expressed in. */
  timezone: string;
};

/** `datetime` is absent on the 24hr member, which is why it is optional here. */
export type PharmacyEvent = { type: string; datetime?: string | null };

export type PharmacyEvents = { open: PharmacyEvent; close: PharmacyEvent };

/** The `pharmacy` on a PharmacyChangeOption — the candidate's on-file record. */
export type CandidatePharmacy = {
  id: string;
  name: string;
  phone?: string | null;
  address?: PatientAddress | null;
  /** Null when we hold no hours for this pharmacy. */
  isOpen?: boolean | null;
  hours?: PharmacyHours[] | null;
  nextEvents?: PharmacyEvents | null;
};

export type PharmacyOption = {
  /** Pharmacy id, taken from the change option's `value`. */
  id: string;
  name: string;
  reason?: string | null;
  offers: PharmacyOffer[];
  pharmacy?: CandidatePharmacy | null;
  /** Null on a name-only search and on sponsored candidates. */
  distanceMiles?: number | null;
};

export type Change = {
  key: string;
  label: string;
  status: string;
  severity: string;
  reason?: string | null;
  category?: string | null;
  options?:
    | {
        displayName: string;
        reason?: string | null;
        argument?: string | null;
        value?: string | null;
        /** These three come only from PharmacyChangeOption. */
        offers?: PharmacyOffer[] | null;
        pharmacy?: CandidatePharmacy | null;
        distanceMiles?: number | null;
      }[]
    | null;
};
