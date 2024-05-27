import {
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Icon,
  SlideFade,
  Text,
  VStack
} from '@chakra-ui/react';

import { PharmacyCard } from './PharmacyCard';
import { text as t } from '../utils/text';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { PharmacyFilters } from './PharmacyFilters';
import { useOrderContext } from '../views/Main';
import { FiInfo } from 'react-icons/fi';
import dayjs from 'dayjs';

const holidays = [
  '2024-05-27' // Memorial Day
];

/**
 * Checks if it's a holiday or the weekend before so that we can surface
 * an hours disclaimer on the pharmacy list
 */
function showHolidayDisclaimer() {
  const today = dayjs();
  const formattedToday = today.format('YYYY-MM-DD');

  // Check if today is a holiday
  if (holidays.includes(formattedToday)) {
    return true;
  }

  const dayOfWeek = today.day(); // 0 (Sunday) to 6 (Saturday)

  // Check if today is Sunday or Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const nextMonday = today.day(8); // Get the next Monday
    const isNextMondayHoliday = holidays.includes(nextMonday.format('YYYY-MM-DD'));
    return isNextMondayHoliday; // true if the next Monday is a holiday, false otherwise
  } else {
    return false; // It's not the weekend
  }
}

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
  setEnableOpenNow: (isOpen: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
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
  setEnableOpenNow,
  setEnable24Hr
}: PickupOptionsProps) => {
  const { totalWalmartPrice } = useOrderContext();

  return (
    <VStack spacing={3} align="span" w="full">
      {showHeading ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              {t.pickUp}
            </Heading>
            <Text>{t.selectLocal}</Text>
          </VStack>
        </SlideFade>
      ) : null}

      <SlideFade offsetY="60px" in={true}>
        <PharmacyFilters
          enableOpenNow={enableOpenNow}
          enable24Hr={enable24Hr}
          setEnableOpenNow={setEnableOpenNow}
          setEnable24Hr={setEnable24Hr}
        />
      </SlideFade>

      {showHolidayDisclaimer() ? (
        <VStack align="span" spacing={2}>
          <Card
            bgColor="white"
            border="1px solid"
            borderColor="orange.500"
            borderRadius="lg"
            mx={{ base: -3, md: undefined }}
            color="orange.500"
          >
            <CardBody p={3}>
              <HStack>
                <Icon color="orange.500" as={FiInfo} fontWeight="bold" />
                <Text fontWeight="semibold">Hours may differ due to holiday</Text>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      ) : null}

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
              price={pharmacy.name === 'Walmart Pharmacy' ? totalWalmartPrice : 0}
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
      {showingAllPharmacies ? (
        <Text color="gray.500" textAlign="center">
          {t.showingAll}
        </Text>
      ) : null}
    </VStack>
  );
};
