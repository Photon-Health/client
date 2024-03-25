import { Button, HStack, Text } from '@chakra-ui/react';

interface PharmacyFiltersProps {
  enableOpenNow: boolean;
  enable24Hr: boolean;
  setEnableOpenNow: (isOpenNow: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
}
export const PharmacyFilters = ({
  enableOpenNow,
  enable24Hr,
  setEnableOpenNow,
  setEnable24Hr
}: PharmacyFiltersProps) => {
  return (
    <HStack>
      <Text>Filter by</Text>
      <Button
        size="sm"
        borderRadius="lg"
        variant="filter"
        isActive={enableOpenNow}
        onClick={() => {
          if (enable24Hr) setEnable24Hr(false);
          setEnableOpenNow(!enableOpenNow);
        }}
      >
        Open Now
      </Button>
      <Button
        size="sm"
        borderRadius="lg"
        variant="filter"
        isActive={enable24Hr}
        onClick={() => {
          if (setEnableOpenNow) setEnableOpenNow(false);
          setEnable24Hr(!enable24Hr);
        }}
      >
        Open 24 Hours
      </Button>
    </HStack>
  );
};
