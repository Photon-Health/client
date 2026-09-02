import _ from 'lodash';
import { getOfferBundles } from '../api';
import {
  EnrichedPharmacy,
  ExtendedFulfillmentType,
  OfferBundleComplete,
  Order
} from '../utils/models';
import { summarizeOfferBundle } from '../utils/offers';
import { Pharmacy as PharmacyType } from '../__generated__/graphql';

import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';

export async function fetchOfferBundles(order: Order): Promise<OfferBundleComplete[] | undefined> {
  const bundles = await getOfferBundles(order.id);

  // Group by pharmacy so all bundles from one source are tied to one pharmacy card
  const byPharmacy = _.groupBy(
    bundles.filter((bundle) => bundle.pharmacy), // a bundle without a pharmacy has nothing to render as a card
    (bundle) => bundle.pharmacy!.id
  );

  return Object.values(byPharmacy).map((group) => {
    const { pharmacy, source, attributeTags } = group[0];

    return {
      source,
      isPromoted: group.some((bundle) => bundle.isPromoted),
      pharmacy: {
        id: pharmacy!.id,
        name: pharmacy!.name,
        fulfillmentTypes: pharmacy!.fulfillmentTypes,
        logo: pharmacy!.logo
      },
      tags: attributeTags ?? [],
      ...summarizeOfferBundle(group.flatMap((bundle) => bundle.offers ?? []))
    };
  });
}

export function getPharmacy(
  allPharmacies: EnrichedPharmacy[],
  selectedId: string
): {
  type: ExtendedFulfillmentType;
  selectedPharmacy: { id: string; name: string } | PharmacyType | undefined;
} {
  // Fudge it so that we can show the pharmacy card on initial load of the
  // status view for all types. On my christmas list for 2024 is better
  // fulfillment types on pharmacies.
  let type: ExtendedFulfillmentType = 'PICK_UP';
  let selectedPharmacy:
    | { id: string; name: string; fulfillmentTypes: string[] }
    | PharmacyType
    | undefined = undefined;
  if (selectedId in capsulePharmacyIdLookup) {
    type = 'COURIER';
    selectedPharmacy = { id: selectedId, name: 'Capsule Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_ALTO_PHARMACY_ID) {
    type = 'COURIER';
    selectedPharmacy = { id: selectedId, name: 'Alto Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_COST_PLUS_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Cost Plus Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_WALMART_MAIL_ORDER_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Walmart Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_COSTCO_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Costco Pharmacy' };
  } else {
    // default to grabbing pharmacy and its fulfillmentType
    selectedPharmacy = allPharmacies.find((p) => p.id === selectedId);
    type = selectedPharmacy?.fulfillmentTypes?.[0] ?? 'PICK_UP';
  }

  return { type, selectedPharmacy };
}
