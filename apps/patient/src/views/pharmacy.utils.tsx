import { getOfferBundles, getOffers } from '../api';
import { getLatestDelivery } from '../utils/deliveryPromise';
import { PHARMACY_BRANDING } from '../components/pharmacy-card-list';
import {
  EnrichedPharmacy,
  ExtendedFulfillmentType,
  OfferBundleDetails,
  OfferDetails,
  Order
} from '../utils/models';
import { FulfillmentType, Pharmacy as PharmacyType } from '../__generated__/graphql';

import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';

function getNovocareOffers(order: Order): OfferDetails[] {
  const novocareExperimentSegment = determineNovocareExperimentSegment(order);

  if (novocareExperimentSegment) {
    return [
      {
        costType: 'NOVOCARE_OFFER',
        deliveryEstimate: novocareExperimentSegment,
        tags: ['Delivers in 3-5 days'],
        pharmacy: {
          id: import.meta.env.VITE_NOVOCARE_PHARMACY_ID as string,
          name: 'Novocare',
          fulfillmentTypes: ['MAIL_ORDER']
        }
      }
    ];
  } else {
    return [];
  }
}

// this function will return the offers available for the given order (single rx)
export async function fetchOffers(order: Order): Promise<OfferDetails[] | undefined> {
  const offers = await getOffers(order.id);

  const amazonOffers = offers
    .filter((offer) => offer.supplier === 'AMAZON_PHARMACY')
    .filter((offer) => offer.deliveryEstimate !== undefined)
    .map((offer) => ({
      deliveryEstimate: offer.deliveryEstimate?.deliveryPromise,
      costType: offer.cost?.type,
      costAmount: offer.cost?.amount,
      costAmountTitle: offer.cost?.amountTitle,
      retailAmount: offer.cost?.retailAmount,
      retailAmountTitle: offer.cost?.retailAmountTitle,
      pharmacy: {
        id: import.meta.env.VITE_AMAZON_PHARMACY_ID as string,
        name: 'Amazon Pharmacy',
        fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[],
        logo: PHARMACY_BRANDING['phr_demoAmazon'].logo
      },
      tags: ['In Stock']
    }));

  const novocareOffers = getNovocareOffers(order);

  // measured will only want to show amazon offers if we do not have a novocare offer
  if (order.organization.id === 'org_pcPnPx5PVamzjS2p') {
    if (novocareOffers.length === 0) {
      return amazonOffers;
    } else {
      return novocareOffers;
    }
  }

  return [...amazonOffers, ...novocareOffers];
}

// this function will return the offers available for the given order
// (currently just for multi rx but will expand to single rx in PHO-322)
export async function fetchOfferBundles(
  order: Order
): Promise<OfferBundleDetails[] | OfferDetails[] | undefined> {
  const bundles = await getOfferBundles(order.id);

  const amazonOffers = bundles
    .filter((bundle) => bundle.supplier === 'AMAZON_PHARMACY')
    .map((bundle) => {
      const deliveryPromises = bundle.medications
        .map((m) => m.deliveryEstimate?.deliveryPromise)
        .filter((promise) => promise !== undefined);

      return {
        deliveryEstimate: getLatestDelivery(deliveryPromises),
        costType: bundle.pricingType,
        costAmount: bundle.aggregateCost?.totalAmount,
        costAmountTitle: bundle.medications[0]?.medicationPrice?.amountTitle, // should move amount titles to the top level instead of per medication in the API but for now we'll just use the first one since we expect them to be the same across medications
        retailAmount: bundle.aggregateCost?.totalRetailAmount,
        retailAmountTitle: bundle.medications[0]?.medicationPrice?.retailAmountTitle, // same as costAmountTitle, should be moved to top level eventually
        medications: bundle.medications.map((m) => ({
          name: m.prescription?.treatment?.name,
          amount: m.medicationPrice?.amount,
          retailAmount: m.medicationPrice?.retailAmount,
          promotions: m.medicationPrice?.promotions
        })),
        pharmacy: {
          id: import.meta.env.VITE_AMAZON_PHARMACY_ID as string,
          name: 'Amazon Pharmacy',
          fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[],
          logo: PHARMACY_BRANDING['phr_demoAmazon'].logo
        },
        tags: ['In Stock']
      };
    });

  const novocareOffers = getNovocareOffers(order);

  // measured will only want to show amazon offers if we do not have a novocare offer
  if (order.organization.id === 'org_pcPnPx5PVamzjS2p') {
    if (novocareOffers.length === 0) {
      return amazonOffers;
    } else {
      return novocareOffers;
    }
  }

  return [...amazonOffers, ...novocareOffers];
}

// this function will update the state for novocareExperimentOverride if there are specific medications inside the order
export function determineNovocareExperimentSegment(order: Order): string | undefined {
  const organizationId = order?.organization.id;

  const medicinesAndDeliveryTypes = [
    {
      patterns: ['wegovy'],
      deliveryType: ''
    }
  ];

  const organizationsAndAcceptableMedicationNames: Record<
    string,
    { patterns: string[]; deliveryType: string }[]
  > = {
    org_KzSVZBQixLRkqj5d: medicinesAndDeliveryTypes, // boson Test Organization 11
    org_wM4wI7rop0W1eNfM: medicinesAndDeliveryTypes, // production found
    org_pcPnPx5PVamzjS2p: medicinesAndDeliveryTypes, // production measured
    org_Oxc0CSPfdiyWW3VM: medicinesAndDeliveryTypes // production openloop
  };

  if (!organizationId) {
    return undefined;
  }

  const isCorrectOrganization =
    Object.keys(organizationsAndAcceptableMedicationNames).indexOf(order?.organization.id) > -1;

  if (!isCorrectOrganization) {
    return undefined;
  }

  const medications = order.fulfillments.map((f) => f.prescription.treatment.name.toLowerCase());

  const getDeliveryType = () => {
    // For each combination in the organization
    for (const combination of organizationsAndAcceptableMedicationNames[organizationId]) {
      const patterns = combination.patterns.map((r) => new RegExp(r.toLowerCase()));

      // If we have exactly the right number of medications
      if (medications.length === patterns.length) {
        // Check if we can match each pattern to a unique medication
        const unmatchedMedications = [...medications];
        const allPatternsMatch = patterns.every((pattern) => {
          const matchIndex = unmatchedMedications.findIndex((med) => med.match(pattern));
          if (matchIndex !== -1) {
            // Remove the matched medication so it can't be matched again
            unmatchedMedications.splice(matchIndex, 1);
            return true;
          }
          return false;
        });

        if (allPatternsMatch) {
          return combination.deliveryType;
        }
      }
    }
  };

  const deliveryType = getDeliveryType();

  return deliveryType;
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
  let selectedPharmacy: { id: string; name: string } | PharmacyType | undefined = undefined;
  if (selectedId in capsulePharmacyIdLookup) {
    type = 'COURIER';
    selectedPharmacy = { id: selectedId, name: 'Capsule Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_ALTO_PHARMACY_ID) {
    type = 'COURIER';
    selectedPharmacy = { id: selectedId, name: 'Alto Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_AMAZON_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Amazon Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_COST_PLUS_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Cost Plus Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_WALMART_MAIL_ORDER_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Walmart Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_COSTCO_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Costco Pharmacy' };
  } else if (selectedId === import.meta.env.VITE_NOVOCARE_PHARMACY_ID) {
    type = 'MAIL_ORDER';
    selectedPharmacy = { id: selectedId, name: 'Novocare' };
  } else {
    type = 'PICK_UP';
    selectedPharmacy = allPharmacies.find((p) => p.id === selectedId);
  }

  return { type, selectedPharmacy };
}
