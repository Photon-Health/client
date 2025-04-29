import { getOffers } from '../api/internal';
import { Order } from '../utils/models';

// this function will update the state for amazonPharmacyOverride if there are offers
// belonging to the amazon pharmacy type
export async function fetchOffers(order: Order) {
  const offers = await getOffers(order.id);

  const amazonOffers = offers
    .filter((offer) => offer.supplier === 'AMAZON_PHARMACY')
    .filter((offer) => offer.deliveryEstimate !== undefined);

  if (amazonOffers.length > 0 && amazonOffers[0]?.deliveryEstimate?.deliveryPromise) {
    return {
      amazonPharmacyOverride: amazonOffers[0]?.deliveryEstimate?.deliveryPromise
    };
  }
}

// this function will update the state for novocareExperimentOverride if there are specific medications inside the order
export function determineNovocareExperimentSegment(
  order: Order
): { novocareExperimentOverride: string | undefined } | undefined {
  const organizationId = order?.organization.id;

  const medicinesAndDeliveryTypes = [
    {
      patterns: ['ozempic'],
      deliveryType: 'Delivers in 3-5 days'
    },
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
    org_pcPnPx5PVamzjS2p: medicinesAndDeliveryTypes // production measured
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

  if (deliveryType) {
    return {
      novocareExperimentOverride: deliveryType
    };
  }
}
