import { memo } from 'react';
import { Card, CardBody } from '@chakra-ui/react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PharmacyInfo } from './PharmacyInfo';
import { EnrichedPharmacy } from '../utils/models';

dayjs.extend(customParseFormat);

interface PharmacyCardProps {
  pharmacy: EnrichedPharmacy;
  preferred?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
  showDetails?: boolean;
  showPrice?: boolean;
  isCurrentPharmacy?: boolean;
}

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  preferred = false,
  selected = false,
  onSelect,
  selectable = false,
  showDetails = true,
  showPrice = false,
  isCurrentPharmacy = false
}: PharmacyCardProps) {
  if (!pharmacy) return null;

  return (
    <Card
      bgColor={isCurrentPharmacy ? 'gray.200' : 'white'}
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected && onSelect ? 'brand.500' : isCurrentPharmacy ? 'gray.300' : 'gray.200'}
      shadow={'none'}
      borderRadius="lg"
      onClick={() => onSelect && onSelect()}
      mx={{ base: -2, md: undefined }}
      cursor={selectable ? 'pointer' : undefined}
      pointerEvents={isCurrentPharmacy ? 'none' : undefined}
      opacity={isCurrentPharmacy ? 0.7 : undefined}
    >
      <CardBody p={3}>
        <PharmacyInfo
          pharmacy={pharmacy}
          tagline={pharmacy.tagline ?? undefined}
          preferred={preferred}
          showDetails={showDetails}
          showPrice={showPrice}
          boldPharmacyName={false}
          selected={selected}
          isCurrentPharmacy={isCurrentPharmacy}
          isStatus={false}
          freeDelivery={pharmacy.isFreeDelivery}
          availableInYourArea={pharmacy.availableInYourArea}
        />
      </CardBody>
    </Card>
  );
});
