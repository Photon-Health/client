import { networkApi, REQUEST_METADATA } from './client';
import { Change, PharmacyOption } from './types';

const ORDER = `
mutation IntakeOrder($input: OrderInput!, $metadata: RequestMetadata!) {
  order(input: $input, metadata: $metadata) {
    __typename
    ... on OrderPayload {
      order { id state pharmacy { id name } }
      appliedChanges { key label status severity reason category }
      unappliedChanges {
        key label status severity reason category
        options {
          displayName
          reason
          argument
          value
          ... on PharmacyChangeOption {
            offers {
              source
              isPromoted
              attributeTags { kind label }
              priceSummary { priceType totalAmount totalRetailAmount totalSavings }
              prescriptionDeliveryEstimates { prescriptionId deliveryPromise }
            }
            distanceMiles
            pharmacy {
              id
              name
              phone
              address { street1 street2 city state postalCode }
              isOpen
              hours { dayOfWeek is24Hr openFrom openUntil timezone }
              nextEvents {
                open {
                  ... on PharmacyOpenEvent { type datetime }
                  ... on PharmacyCloseEvent { type datetime }
                  ... on PharmacyOpen24HrEvent { type }
                }
                close {
                  ... on PharmacyOpenEvent { type datetime }
                  ... on PharmacyCloseEvent { type datetime }
                  ... on PharmacyOpen24HrEvent { type }
                }
              }
            }
          }
        }
      }
    }
    ... on AmbiguousOrderMatch { reason }
    ... on UnauthorizedError { message }
    ... on UpstreamServiceError { message service }
  }
}`;

type OrderResponse = {
  order: {
    __typename: string;
    order?: { id: string; state: string; pharmacy?: { id: string; name: string } | null } | null;
    appliedChanges?: Change[];
    unappliedChanges?: Change[];
    reason?: string;
    message?: string;
  };
};

const unwrap = (data: OrderResponse) => {
  const result = data.order;
  if (result.__typename !== 'OrderPayload') {
    throw new Error(result.message ?? result.reason ?? 'Order request failed.');
  }
  return result;
};

/**
 * Pharmacy candidates arrive as options on an AMBIGUOUS pharmacy change, not
 * as an AmbiguousOrderMatch — that union member means duplicate *orders*.
 */
const pharmacyOptions = (changes: Change[] = []): PharmacyOption[] =>
  changes
    .filter((change) => change.key.startsWith('pharmacy') && change.options?.length)
    .flatMap((change) => change.options ?? [])
    .filter((option) => Boolean(option.value))
    .map((option) => ({
      id: option.value as string,
      name: option.displayName,
      reason: option.reason,
      offers: option.offers ?? [],
      pharmacy: option.pharmacy ?? null,
      distanceMiles: option.distanceMiles ?? null
    }));

/**
 * The API's LocationInput accepts exactly one of address / latLong / text and
 * rejects the call if more than one is set, so the origin is a union here
 * rather than a bag of optional fields. `text` is not modelled: the resolver
 * rejects it with "Matching on near.text is not yet supported."
 *
 * A postal code is geocoded server-side, so nothing here needs a Maps SDK.
 */
export type SearchOrigin =
  | { postalCode: string }
  | { latitude: string; longitude: string; radiusMiles?: number };

const toLocationInput = (origin: SearchOrigin) =>
  'postalCode' in origin
    ? // No radius on this branch — the API takes none for an address.
      { address: { postalCode: origin.postalCode } }
    : {
        latLong: {
          latitude: origin.latitude,
          longitude: origin.longitude,
          // Also flags the search as deliberately fuzzy: without it a single
          // pharmacy within a mile auto-matches instead of offering a choice.
          radiusMiles: origin.radiusMiles ?? 10
        }
      };

/**
 * Creates the draft order and asks for nearby pharmacies in one call. The
 * order mutation rejects a new order with no prescriptions, so the draft
 * prescription must already exist.
 */
export async function createDraftOrder(input: {
  patientId: string;
  prescriptionId: string;
  origin: SearchOrigin;
}): Promise<{ orderId: string | null; pharmacies: PharmacyOption[] }> {
  const data = await networkApi<OrderResponse>(ORDER, {
    input: {
      state: 'DRAFT',
      patient: { id: input.patientId },
      prescriptions: { add: [{ id: input.prescriptionId }] },
      pharmacy: { near: toLocationInput(input.origin) }
    },
    metadata: REQUEST_METADATA
  });

  const result = unwrap(data);
  return {
    orderId: result.order?.id ?? null,
    pharmacies: pharmacyOptions(result.unappliedChanges)
  };
}

/** Attaches the chosen pharmacy. The order stays in DRAFT. */
export async function setOrderPharmacy(input: {
  orderId: string;
  pharmacyId: string;
}): Promise<{ orderId: string; pharmacyName: string | null }> {
  const data = await networkApi<OrderResponse>(ORDER, {
    input: {
      order: { id: input.orderId },
      state: 'DRAFT',
      pharmacy: { id: input.pharmacyId }
    },
    metadata: REQUEST_METADATA
  });

  const result = unwrap(data);
  if (!result.order?.id) {
    throw new Error('Could not attach the pharmacy to your request.');
  }
  return { orderId: result.order.id, pharmacyName: result.order.pharmacy?.name ?? null };
}
