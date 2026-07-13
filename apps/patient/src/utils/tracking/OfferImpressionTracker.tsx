import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { EnrichedPharmacy, OfferBundleDetails } from '../models';
import { useOrderContext } from '../../views/Main';
import { getOfferType } from '../offers';
import { Prescription } from '../../__generated__/graphql';
import { usePatientAnalytics } from '../../hooks/usePatientAnalytics';

// this is a set of offer impression keys that have been tracked
// emptied on page load so as not to track impressions unnecessarily
const trackedOfferImpressions = new Set<string>();

function getOfferImpressionKey(orderId: string, pharmacyId: string): string {
  return `${orderId}:${pharmacyId}`;
}

const OfferImpressionTracker = ({
  children,
  offer = undefined,
  pharmacy,
  ordinalPosition,
  isAlreadySelected,
  enabled
}: {
  children: React.ReactNode;
  offer: OfferBundleDetails | undefined;
  pharmacy: EnrichedPharmacy;
  ordinalPosition: number;
  isAlreadySelected: boolean;
  enabled: boolean;
}) => {
  const patientAnalytics = usePatientAnalytics();
  const { order } = useOrderContext();

  const { ref } = useInView({
    triggerOnce: true,
    rootMargin: '-100px',
    onChange: (inView) => {
      if (inView && enabled) {
        // only wanna track impressions per order/pharmacy per page load
        // to minimize impressione explosion when swappin between tabs
        const impressionKey = getOfferImpressionKey(order.id, pharmacy.id);
        if (trackedOfferImpressions.has(impressionKey)) {
          return;
        }

        trackedOfferImpressions.add(impressionKey);

        const rxIds = new Set(
          order.fills
            .map((f) => f.prescription)
            .filter((p): p is Prescription => !!p)
            .map((p) => p.id)
        );

        const price = offer?.costAmount || pharmacy.price;
        const offerType = getOfferType({ pharmacy, offer }) ?? 'None';

        patientAnalytics.track('Offer Impression', order, {
          offerType,
          offerShown: !!price,
          pharmacyFulfillmentType: pharmacy.fulfillmentTypes?.[0] ?? 'None',
          pharmacy_id: pharmacy.id,
          pharmacy_name: pharmacy.name,
          ordinal_position: ordinalPosition,
          distance: pharmacy.distance,
          price: pharmacy.price,
          retailPrice: pharmacy.retailPrice,
          showReadyIn30Min: pharmacy.showReadyIn30Min,
          is24Hr: pharmacy.is24Hr,
          isClosingSoon: pharmacy.isClosingSoon,
          isAlreadySelected: isAlreadySelected,
          deliveryEstimate: offer?.deliveryEstimate,
          costType: offer?.costType,
          costAmount: offer?.costAmount,
          costAmountTitle: offer?.costAmountTitle,
          retailAmount: offer?.retailAmount,
          retailAmountTitle: offer?.retailAmountTitle,
          numPrescriptions: rxIds.size,
          multiMedOffer: rxIds.size > 1,
          hasRefills: rxIds.size < order.fills.length,
          tags: offer?.tags,
          promotions: offer?.medications?.flatMap(
            (med) =>
              med.promotions?.map((promo) => ({
                medicationName: med.name,
                ...promo
              })) ?? []
          ),
          medicationCosts: offer?.medications
        });
      }
    }
  });

  return <div ref={ref}>{children}</div>;
};

export { OfferImpressionTracker };
