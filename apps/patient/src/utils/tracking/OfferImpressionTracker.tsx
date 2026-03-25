import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { EnrichedPharmacy, OfferBundleDetails } from '../models';
import { useOrderContext } from '../../views/Main';
import { OfferDetails } from '../models';
import { getOfferType } from '../offers';
import { Prescription } from '../../__generated__/graphql';
import { usePatientAnalytics } from '../../hooks/usePatientAnalytics';

const OfferImpressionTracker = ({
  children,
  offer = undefined,
  pharmacy,
  ordinalPosition,
  isAlreadySelected,
  enabled
}: {
  children: React.ReactNode;
  offer: OfferDetails | OfferBundleDetails | undefined;
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
          promotions:
            offer && 'medications' in offer
              ? offer.medications?.flatMap(
                  (med) =>
                    med.promotions?.map((promo) => ({
                      medicationName: med.name,
                      ...promo
                    })) ?? []
                )
              : null
        });
      }
    }
  });

  return <div ref={ref}>{children}</div>;
};

export { OfferImpressionTracker };
