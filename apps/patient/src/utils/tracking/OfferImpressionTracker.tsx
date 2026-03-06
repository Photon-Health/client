import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { patientAnalytics } from '../../configs/analytics';
import { EnrichedPharmacy, OfferType } from '../models';
import { useOrderContext } from '../../views/Main';
import { Offer } from '../../components/pharmacy-card-list';

const OfferImpressionTracker = ({
  children,
  offer = undefined,
  pharmacy,
  ordinalPosition,
  isAlreadySelected,
  enabled
}: {
  children: React.ReactNode;
  offer: Offer | undefined;
  pharmacy: EnrichedPharmacy;
  ordinalPosition: number;
  isAlreadySelected: boolean;
  enabled: boolean;
}) => {
  const { order } = useOrderContext();

  const { ref } = useInView({
    triggerOnce: true,
    rootMargin: '-100px',
    onChange: (inView) => {
      if (inView && enabled) {
        const rxIds = order.fills.reduce((acc, cur) => {
          if (cur.prescription) {
            acc.add(cur.prescription.id);
          }
          return acc;
        }, new Set<string>());

        const price = offer?.costAmount || pharmacy.price;

        let offerType: string | null = null;
        if (offer?.costType) {
          offerType = OfferType.AmazonPharmacy;
        } else if (pharmacy.source === 'goodrx') {
          offerType = OfferType.GoodRx;
        } else if (pharmacy.source === 'rxsense') {
          offerType = OfferType.RxSense;
        }

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
          medCount: rxIds.size,
          multiMedOffer: rxIds.size > 1,
          tags: offer?.tags
        });
      }
    }
  });

  return <div ref={ref}>{children}</div>;
};

export { OfferImpressionTracker };
