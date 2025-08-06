import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { patientAnalytics } from '../../configs/analytics';
import { EnrichedPharmacy } from '../models';

const OfferImpressionTracker = ({
  children,
  pharmacy,
  ordinalPosition,
  isAlreadySelected,
  shouldTrackOfferImpressionsAndSelections
}: {
  children: React.ReactNode;
  pharmacy: EnrichedPharmacy;
  ordinalPosition: number;
  isAlreadySelected: boolean;
  shouldTrackOfferImpressionsAndSelections: boolean;
}) => {
  const { ref } = useInView({
    triggerOnce: true,
    rootMargin: '-100px',
    onChange: (inView) => {
      if (inView && shouldTrackOfferImpressionsAndSelections) {
        patientAnalytics.track('Offer Impression', {
          pharmacy_id: pharmacy.id,
          pharmacy_name: pharmacy.name,
          ordinal_position: ordinalPosition,
          distance: pharmacy.distance,
          price: pharmacy.price,
          showReadyIn30Min: pharmacy.showReadyIn30Min,
          is24Hr: pharmacy.is24Hr,
          isClosingSoon: pharmacy.isClosingSoon,
          isAlreadySelected: isAlreadySelected
        });
      }
    }
  });

  return <div ref={ref}>{children}</div>;
};

export { OfferImpressionTracker };
