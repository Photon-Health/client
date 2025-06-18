import { getOffers } from '../api/internal';
import { AmazonOffer } from '../components';
import { Order } from '../utils/models';

function getNovocareOffers(order: Order): AmazonOffer[] {
  const novocareExperimentSegment = determineNovocareExperimentSegment(order);

  if (novocareExperimentSegment) {
    return [
      {
        costType: 'NOVOCARE_OFFER',
        deliveryEstimate: novocareExperimentSegment
      }
    ];
  } else {
    return [];
  }
}

// this function will update the state for amazonPharmacyOverride if there are offers
// belonging to the amazon pharmacy type
export async function fetchOffers(order: Order): Promise<AmazonOffer[] | undefined> {
  const offers = await getOffers(order.id);

  const amazonOffers = offers
    .filter((offer) => offer.supplier === 'AMAZON_PHARMACY')
    .filter((offer) => offer.deliveryEstimate !== undefined)
    .map((offer) => ({
      deliveryEstimate: offer.deliveryEstimate?.deliveryPromise,
      costType: offer.cost?.type,
      costAmount: offer.cost?.amount
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

// this function will update the state for novocareExperimentOverride if there are specific medications inside the order
export function determineNovocareExperimentSegment(order: Order): string | undefined {
  const organizationId = order?.organization.id;

  const medicinesAndDeliveryTypes = [
    {
      patterns: ['wegovy'],
      deliveryType: 'Delivers in 3-5 days'
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
