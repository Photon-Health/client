import { SlideFade } from '@chakra-ui/react';

import { BrandedPharmacyCard } from './BrandedPharmacyCard';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { getPharmacy } from '../../views/pharmacy.utils';
import { FulfillmentType } from '../../__generated__/graphql';

interface Props {
  options: string[];
  location: string;
  selectedId: string;
  fulfillingPharmacyId?: string;
  brandedOptionOverrides: BrandedOptionOverrides;
  handleSelect: (id: string) => void;
  shouldTrackOfferImpressionsAndSelections: boolean;
  numberOfOffers?: number;
}

export interface Offer {
  deliveryEstimate?: string;
  costType?: string;
  costAmount?: number;
  costAmountTitle?: string;
  retailAmount?: number;
  retailAmountTitle?: string;
  pharmacy: {
    id: string;
    name: string;
    fulfillmentTypes: FulfillmentType[];
  };
  tags: string[];
}

export interface BrandedOptionOverrides {
  amazonPharmacyOverride?: Offer;
  novocareExperimentOverride?: string;
}

export const BrandedOptions = ({
  options,
  location,
  selectedId,
  handleSelect,
  fulfillingPharmacyId,
  brandedOptionOverrides,
  shouldTrackOfferImpressionsAndSelections,
  numberOfOffers = 0
}: Props) => {
  if (!location) return null;
  if (options.length === 0) return null;

  return (
    <>
      {options.map((id, index) => (
        <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${id}`}>
          <OfferImpressionTracker
            pharmacy={{
              id,
              name: getPharmacy([], selectedId).selectedPharmacy?.name || 'Unknown Branded Pharmacy'
            }}
            ordinalPosition={index + numberOfOffers}
            isAlreadySelected={selectedId === id}
            enabled={shouldTrackOfferImpressionsAndSelections}
          >
            <BrandedPharmacyCard
              pharmacyId={id}
              isPharmacyFulfillingCurrentOrder={fulfillingPharmacyId === id}
              selected={selectedId === id}
              handleSelect={handleSelect}
              brandedOptionOverrides={brandedOptionOverrides}
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
