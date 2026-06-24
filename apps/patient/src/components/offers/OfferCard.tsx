import { Card, CardBody } from '@chakra-ui/react';

import { OfferInfo } from './OfferInfo';
import { OfferBundleDetails } from '../../utils/models';
import { PharmacyCardSentHereFrame } from '../PharmacyCardSentHereFrame';
import {
  getPharmacyCardBorderStyle,
  isPharmacyCardSelectable
} from '../pharmacyCardSentHereStyles';

interface Props {
  offer: OfferBundleDetails;
  isAutoroutedPharmacy: boolean;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  isPreferred: boolean;
  handleSelect: (id: string, offer?: OfferBundleDetails) => void;
}
export const OfferCard = ({
  offer,
  selected,
  handleSelect,
  isAutoroutedPharmacy,
  isPharmacyFulfillingCurrentOrder,
  isPreferred
}: Props) => {
  const borderStyle = getPharmacyCardBorderStyle({
    isAutoroutedPharmacy,
    isPharmacyFulfillingCurrentOrder,
    selected
  });
  const isSelectable = isPharmacyCardSelectable({
    isAutoroutedPharmacy,
    isPharmacyFulfillingCurrentOrder
  });

  const card = (
    <Card
      {...borderStyle}
      borderRadius="lg"
      shadow={'none'}
      onClick={() => isSelectable && handleSelect(offer.pharmacy.id, offer)}
      cursor={isSelectable ? 'pointer' : undefined}
      pointerEvents={isSelectable ? undefined : 'none'}
      opacity={isSelectable ? undefined : 0.7}
    >
      <CardBody p={3}>
        <OfferInfo
          pharmacy={offer.pharmacy}
          offer={offer}
          isCurrentPharmacy={isPharmacyFulfillingCurrentOrder}
          isPreferred={isPreferred}
        />
      </CardBody>
    </Card>
  );

  return isAutoroutedPharmacy ? (
    <PharmacyCardSentHereFrame>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
};
