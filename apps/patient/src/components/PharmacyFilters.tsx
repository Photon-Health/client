import { Button, HStack, Text } from '@chakra-ui/react';
import { useOrderContext } from '../views/Main';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

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
  const { order } = useOrderContext();
  const patientAnalytics = usePatientAnalytics();
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
          patientAnalytics.track('Toggle Open Now Filter', order, {
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
          patientAnalytics.track('Toggle 24 Hours Filter', order, {
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
