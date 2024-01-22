import { Heading, SlideFade, Text, VStack } from '@chakra-ui/react';

import { text as t } from '../utils/text';
import { BrandedPharmacyCard } from './BrandedPharmacyCard';

interface Props {
  options: string[];
  location: string;
  selectedId: string;
  handleSelect: (id: string) => void;
  patientAddress: string;
}

export const BrandedOptions = ({
  options,
  location,
  selectedId,
  handleSelect,
  patientAddress
}: Props) => {
  if (!location) return null;

  return (
    <VStack spacing={2} align="span" w="full">
      <SlideFade offsetY="60px" in={true}>
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            {t.delivery}
          </Heading>
          <Text size="sm">{t.shipTo(patientAddress)}</Text>
        </VStack>
      </SlideFade>

      {options.map((id) => (
        <BrandedPharmacyCard
          key={id}
          pharmacyId={id}
          selectedId={selectedId}
          handleSelect={handleSelect}
        />
      ))}
    </VStack>
  );
};
