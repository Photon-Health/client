import { Box, Button, Heading, Link, SlideFade, Text, VStack } from '@chakra-ui/react';

import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';
import { HolidayAlert } from './HolidayAlert';
import { PharmacyCard } from './PharmacyCard';
import { PharmacyFilters } from './PharmacyFilters';

interface PickupOptionsProps {
  pharmacies: EnrichedPharmacy[];
  preferredPharmacy: string;
  savingPreferred: boolean;
  selectedId: string;
  handleSelect: (id: string) => void;
  handleShowMore: () => void;
  handleSetPreferred: (id: string) => void;
  loadingMore: boolean;
  showingAllPharmacies: boolean;
  showHeading: boolean;
  enableOpenNow: boolean;
  enable24Hr: boolean;
  enablePrice: boolean;
  setEnableOpenNow: (isOpen: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
  setEnablePrice: (isPrice: boolean) => void;
  location: string;
  currentPharmacyId?: string;
  setCouponModalOpen: (isOpen: boolean) => void;
}

export const PickupOptions = ({
  preferredPharmacy,
  savingPreferred,
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  handleSetPreferred,
  loadingMore,
  showingAllPharmacies,
  showHeading,
  enableOpenNow,
  enable24Hr,
  enablePrice,
  setEnableOpenNow,
  setEnable24Hr,
  setEnablePrice,
  setCouponModalOpen,
  currentPharmacyId
}: PickupOptionsProps) => {
  return (
    <VStack spacing={3} align="span" w="full">
      {showHeading ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              {t.pickUp}
            </Heading>
            <Text>{t.getNearby}</Text>
          </VStack>
        </SlideFade>
      ) : null}
      <SlideFade offsetY="60px" in={true}>
        <PharmacyFilters
          enableOpenNow={enableOpenNow}
          enable24Hr={enable24Hr}
          enablePrice={enablePrice}
          setEnableOpenNow={setEnableOpenNow}
          setEnable24Hr={setEnable24Hr}
          setEnablePrice={setEnablePrice}
        />
      </SlideFade>
      {enablePrice ? (
        <SlideFade offsetY="60px" in={true}>
          <Box p={3} bgColor="blue.100" borderRadius="lg" mx={{ base: -3, md: undefined }}>
            <Text>
              The displayed price is a coupon for the selected pharmacy.{' '}
              <b>This is NOT insurance.</b>{' '}
              <Link
                textDecoration="underline"
                textUnderlineOffset="2px"
                color="blue.500"
                onClick={() => setCouponModalOpen(true)}
              >
                Learn more.
              </Link>
            </Text>
          </Box>
        </SlideFade>
      ) : null}
      <HolidayAlert>
        Holiday may affect pharmacy hours. Consider sending to a 24 hour pharmacy.
      </HolidayAlert>
      <VStack align="span" spacing={2}>
        {pharmacies.map((pharmacy: EnrichedPharmacy, i: number) => (
          <SlideFade offsetY="60px" in={true} key={`pickup-pharmacy-${pharmacy.id}-${i}`}>
            <PharmacyCard
              pharmacy={pharmacy}
              preferred={pharmacy.id === preferredPharmacy}
              savingPreferred={savingPreferred}
              selected={selectedId === pharmacy.id}
              onSelect={() => handleSelect(pharmacy.id)}
              onSetPreferred={() => handleSetPreferred(pharmacy.id)}
              selectable={true}
              showPrice
              isCurrentPharmacy={pharmacy.id === currentPharmacyId}
            />
          </SlideFade>
        ))}
      </VStack>
      {!showingAllPharmacies && (pharmacies?.length > 0 || loadingMore) ? (
        <Button
          colorScheme="brand"
          color="link"
          variant="link"
          textDecoration="none"
          loadingText=""
          isLoading={loadingMore}
          onClick={handleShowMore}
          p={3}
        >
          {t.showMore}
        </Button>
      ) : null}
    </VStack>
  );
};
