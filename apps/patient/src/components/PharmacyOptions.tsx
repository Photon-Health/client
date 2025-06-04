import { SlideFade, VStack } from '@chakra-ui/react';

import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { PharmacyCard } from './PharmacyCard';

interface PharmacyOptionsProps {
  pharmacies: EnrichedPharmacy[];
  preferredPharmacyId?: string;
  selectedId: string;
  handleSelect: (id: string) => void;
  currentPharmacyId?: string;
  showPrice?: boolean;
}

export const PharmacyOptions = ({
  pharmacies,
  preferredPharmacyId,
  selectedId,
  handleSelect,
  currentPharmacyId,
  showPrice = false
}: PharmacyOptionsProps) => {
  return (
    <VStack align="span" spacing={2}>
      {pharmacies.map((pharmacy: EnrichedPharmacy, i: number) => (
        <SlideFade offsetY="60px" in={true} key={`pickup-pharmacy-${pharmacy.id}-${i}`}>
          <PharmacyCard
            pharmacy={pharmacy}
            preferred={pharmacy.id === preferredPharmacyId}
            selected={selectedId === pharmacy.id}
            onSelect={() => handleSelect(pharmacy.id)}
            selectable={true}
            showPrice={showPrice}
            isCurrentPharmacy={pharmacy.id === currentPharmacyId}
          />
        </SlideFade>
      ))}
    </VStack>
  );
};
