import { VStack } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { MailOrderPharmacyOption, MailOrderSelectCard } from './MailOrderSelectCard';

export type MailOrderSelectListProps = {
  options: MailOrderPharmacyOption[];
  onSelect: (val: MailOrderPharmacyOption) => unknown;
  selectedId?: string;
  autoroutedPharmacyId?: string;
  shouldTrackOfferImpressionsAndSelections: boolean;
  numberOfPrecedingOptions?: number;
};

export function MailOrderSelectList({
  options,
  onSelect,
  selectedId,
  autoroutedPharmacyId,
  shouldTrackOfferImpressionsAndSelections,
  numberOfPrecedingOptions = 0
}: MailOrderSelectListProps) {
  return (
    <VStack w="full" align="stretch">
      {options?.map((option, index) => (
        <OfferImpressionTracker
          key={option.id}
          pharmacy={{
            id: option.id,
            name: option.name,
            fulfillmentTypes: option.fulfillmentTypes,
            logo: option.logo
          }}
          ordinalPosition={index + numberOfPrecedingOptions}
          isAlreadySelected={selectedId === option.id}
          enabled={shouldTrackOfferImpressionsAndSelections}
          offer={undefined}
        >
          <MailOrderSelectCard
            {...option}
            selected={selectedId === option.id}
            isAutoroutedPharmacy={!!autoroutedPharmacyId && option.id === autoroutedPharmacyId}
            onClick={onSelect}
          />
        </OfferImpressionTracker>
      ))}
    </VStack>
  );
}
