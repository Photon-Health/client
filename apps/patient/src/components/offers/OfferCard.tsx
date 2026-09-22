import { Card, CardBody } from '@chakra-ui/react';

import { OfferInfo } from './OfferInfo';
import { PharmacyOffer } from '../../utils/models';
import { SetPreferredPharmacyFooter } from '../pharmacy-card/SetPreferredPharmacyFooter';
import { PharmacyCardSentHereFrame } from '../pharmacy-card/sent-here/PharmacyCardSentHereFrame';
import {
  getPharmacyCardBorderStyle,
  isPharmacyCardSelectable
} from '../pharmacy-card/sent-here/pharmacyCardSentHereStyles';

interface Props {
  offer: PharmacyOffer;
  isAutoroutedPharmacy: boolean;
  isPharmacyFulfillingCurrentOrder: boolean;
  selected: boolean;
  isPreferred: boolean;
  savingPreferred?: boolean;
  onSetPreferred?: () => void;
  handleSelect: (id: string, offer?: PharmacyOffer) => void;
}
export const OfferCard = ({
  offer,
  selected,
  handleSelect,
  isAutoroutedPharmacy,
  isPharmacyFulfillingCurrentOrder,
  isPreferred,
  savingPreferred = false,
  onSetPreferred
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
      onKeyDown={(e) => {
        if (isSelectable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleSelect(offer.pharmacy.id, offer);
        }
      }}
      cursor={isSelectable ? 'pointer' : undefined}
      pointerEvents={isSelectable ? undefined : 'none'}
      opacity={isSelectable ? undefined : 0.7}
      role="radio"
      aria-checked={selected}
      aria-label={offer.pharmacy.name}
      aria-disabled={!isSelectable ? true : undefined}
      tabIndex={isSelectable ? 0 : -1}
    >
      <CardBody p={3}>
        <OfferInfo
          pharmacy={offer.pharmacy}
          offer={offer}
          isCurrentPharmacy={isPharmacyFulfillingCurrentOrder}
          isPreferred={isPreferred}
        />
      </CardBody>
      <SetPreferredPharmacyFooter
        show={selected && !isPreferred}
        saving={savingPreferred}
        onSetPreferred={onSetPreferred}
      />
    </Card>
  );

  return isAutoroutedPharmacy ? (
    <PharmacyCardSentHereFrame selected={selected}>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
};
