import { Text } from '@chakra-ui/react';

import { usePhoton } from 'packages/react';
import { SelectField } from './SelectField';

export const PharmacySelect = (props: any) => {
  const { getPharmacies } = usePhoton();
  const { pharmacies, loading, error } = getPharmacies({});

  if (error) return <Text color="red">{error.message}</Text>;

  const options = pharmacies.map((org: any) => {
    return {
      value: org.id,
      label: `${org.name}`
    };
  });

  return <SelectField {...props} isLoading={loading} options={options} />;
};
