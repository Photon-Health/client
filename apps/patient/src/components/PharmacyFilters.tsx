import { Button, HStack, Text } from '@chakra-ui/react';

interface PharmacyFiltersProps {
  enableOpenNow: boolean;
  enable24Hr: boolean;
  enablePrice: boolean;
  setEnableOpenNow: (isOpenNow: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
  setEnablePrice: (price: boolean) => void;
}
export const PharmacyFilters = ({
  enableOpenNow,
  enable24Hr,
  enablePrice,
  setEnableOpenNow,
  setEnable24Hr,
  setEnablePrice
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
        24 Hours
      </Button>
      <Button
        size="sm"
        borderRadius="lg"
        variant="filter"
        isActive={enablePrice}
        onClick={() => {
          if (setEnablePrice) setEnablePrice(false);
          setEnablePrice(!enablePrice);
        }}
      >
        Price
      </Button>
    </HStack>
  );
};
