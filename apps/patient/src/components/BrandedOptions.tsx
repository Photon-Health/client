import { Card, Heading, SlideFade, Text, useBreakpointValue, VStack } from '@chakra-ui/react';

import { text as t } from '../utils/text';
import { BrandedPharmacyCard } from './BrandedPharmacyCard';

interface Props {
  options: string[];
  location: string;
  selectedId: string;
  handleSelect: (id: string) => void;
}

export const BrandedOptions = ({ options, location, selectedId, handleSelect }: Props) => {
  if (!location) return null;
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack spacing={2} align="span" w="full">
      <SlideFade offsetY="60px" in={true}>
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            {t.delivery}
          </Heading>
          <Text size="sm">{t.selectDelivery}</Text>
        </VStack>
      </SlideFade>

      {options.map((id) => (
        <SlideFade offsetY="60px" in={true} key={`courier-pharmacy-${id}`}>
          <Card
            bgColor="white"
            cursor="pointer"
            border="2px solid"
            borderColor={selectedId === id ? 'brand.500' : 'white'}
            mx={isMobile ? -3 : undefined}
          >
            <BrandedPharmacyCard
              pharmacyId={id}
              selectedId={selectedId}
              handleSelect={handleSelect}
            />
          </Card>
        </SlideFade>
      ))}
    </VStack>
  );
};
