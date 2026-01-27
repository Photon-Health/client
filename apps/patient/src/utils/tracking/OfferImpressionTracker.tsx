import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { patientAnalytics } from '../../configs/analytics';
import { EnrichedPharmacy } from '../models';
import { useOrderContext } from '../../views/Main';
import { Offer } from '../../components/pharmacy-card-list';

const OfferImpressionTracker = ({
  children,
  offer,
  pharmacy,
  ordinalPosition,
  isAlreadySelected,
  enabled
}: {
  children: React.ReactNode;
  offer: Offer;
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
        patientAnalytics.track('Offer Impression', order, {
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
          deliveryEstimate: offer.deliveryEstimate,
          costType: offer.costType,
          costAmount: offer.costAmount,
          costAmountTitle: offer.costAmountTitle,
          retailAmount: offer.retailAmount,
          retailAmountTitle: offer.retailAmountTitle,
          tags: offer.tags
        });
      }
    }
  });

  return <div ref={ref}>{children}</div>;
};

export { OfferImpressionTracker };
