import { Button, HStack, Text } from '@chakra-ui/react';

interface PharmacyFiltersProps {
  enableOpenNow: boolean;
  enable24Hr: boolean;
  setEnableOpenNow: (isOpenNow: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
  showOpenNowFilter: boolean;
  show24HrFilter: boolean;
}
export const PharmacyFilters = ({
  enableOpenNow,
  enable24Hr,
  setEnableOpenNow,
  setEnable24Hr,
  showOpenNowFilter,
  show24HrFilter
}: PharmacyFiltersProps) => {
  return (
    <HStack my={2}>
      <Text>Filter by</Text>
      {showOpenNowFilter ? (
        <Button
          size="sm"
          bg="white"
          border="1px"
          borderColor="gray.200"
          _hover={{
            background: 'blue.50',
            color: 'blue.500',
            border: '1px',
            borderColor: 'blue.500'
          }}
          _active={{
            background: 'blue.50',
            color: 'blue.500',
            border: '1px',
            borderColor: 'blue.500'
          }}
          isActive={enableOpenNow}
          onClick={() => setEnableOpenNow(!enableOpenNow)}
        >
          Open Now
        </Button>
      ) : null}
      {show24HrFilter ? (
        <Button
          size="sm"
          bg="white"
          border="1px"
          borderColor="gray.200"
          _hover={{
            background: 'blue.50',
            color: 'blue.500',
            border: '1px',
            borderColor: 'blue.500'
          }}
          _active={{
            background: 'blue.50',
            color: 'blue.500',
            border: '1px',
            borderColor: 'blue.500'
          }}
          isActive={enable24Hr}
          onClick={() => setEnable24Hr(!enable24Hr)}
        >
          Open 24 Hours
        </Button>
      ) : null}
    </HStack>
  );
};
