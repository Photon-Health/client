import { Button, HStack, Text } from '@chakra-ui/react';
import { patientAnalytics } from '../configs/analytics';

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
          patientAnalytics.track('Toggle 24 Hours Filter', {
            enabled: !enable24Hr,
            previousOpenNowState: enableOpenNow
          });
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
          patientAnalytics.track('Toggle Open Now Filter', {
            enabled: !enable24Hr,
            previous24HrState: enable24Hr
          });
        }}
      >
        24 Hours
      </Button>
    </HStack>
  );
};
