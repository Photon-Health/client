import { Heading, SlideFade, Text, VStack } from '@chakra-ui/react';

import { text as t } from '../utils/text';
import { BrandedPharmacyCard } from './BrandedPharmacyCard';

interface Props {
  options: string[];
  location: string;
  selectedId: string;
  isAmazonPharmacyTestEnabled: boolean;
  handleSelect: (id: string) => void;
}

export const BrandedOptions = ({
  options,
  location,
  selectedId,
  handleSelect,
  isAmazonPharmacyTestEnabled
}: Props) => {
  if (!location) return null;
  if (options.length === 0) return null;

  return (
    <VStack spacing={2} align="span" w="full">
      <SlideFade offsetY="60px" in={true}>
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            {t.delivery}
          </Heading>
          <Text size="sm">{t.getDelivered}</Text>
        </VStack>
      </SlideFade>

      {options.map((id) => (
        <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${id}`}>
          <BrandedPharmacyCard
            pharmacyId={id}
            selected={selectedId === id}
            handleSelect={handleSelect}
            isAmazonPharmacyTestEnabled={isAmazonPharmacyTestEnabled}
          />
        </SlideFade>
      ))}
    </VStack>
  );
};
