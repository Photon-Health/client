import { SlideFade } from '@chakra-ui/react';

import { BrandedPharmacyCard } from './BrandedPharmacyCard';

interface Props {
  options: string[];
  location: string;
  selectedId: string;
  autoroutedPharmacyId?: string;
  currentPharmacyId?: string;
  handleSelect: (id: string) => void;
}

export const BrandedOptions = ({
  options,
  location,
  selectedId,
  handleSelect,
  autoroutedPharmacyId,
  currentPharmacyId
}: Props) => {
  if (!location) return null;
  if (options.length === 0) return null;

  return (
    <>
      {options.map((id) => (
        <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${id}`}>
          <BrandedPharmacyCard
            pharmacyId={id}
            isAutoroutedPharmacy={autoroutedPharmacyId === id}
            isPharmacyFulfillingCurrentOrder={currentPharmacyId === id}
            selected={selectedId === id}
            handleSelect={handleSelect}
          />
        </SlideFade>
      ))}
    </>
  );
};
