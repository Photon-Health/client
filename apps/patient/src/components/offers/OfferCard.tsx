import { Card, CardBody } from '@chakra-ui/react';

import { OfferInfo } from './OfferInfo';
import { OfferBundleComplete } from '../../utils/models';
import { PharmacyCardSentHereFrame } from '../pharmacy-card/sent-here/PharmacyCardSentHereFrame';
import {
  getPharmacyCardBorderStyle,
  isPharmacyCardSelectable
} from '../pharmacy-card/sent-here/pharmacyCardSentHereStyles';

interface Props {
  offer: OfferBundleComplete;
  isAutoroutedPharmacy: boolean;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  isPreferred: boolean;
  handleSelect: (id: string, offer?: OfferBundleComplete) => void;
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
      bgColor={borderStyle.bgColor}
      border="2px solid"
      borderWidth={borderStyle.borderWidth}
      borderColor={borderStyle.borderColor}
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
    <PharmacyCardSentHereFrame selected={selected}>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
};
