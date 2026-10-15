import { Text, VStack } from '@chakra-ui/react';

import { titleCase } from '../../utils';

interface AddressViewProps {
  address?: {
    street1: string;
    street2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
}

const AddressView = (props: AddressViewProps) => {
  const { address } = props;

  if (!address) {
    return <Text as="i">None</Text>;
  }

  const { street1, street2, city, state, postalCode } = address;
  return (
    <VStack spacing="0" className="mp-mask" alignItems="start">
      <Text>
        {titleCase(street1)}
        {street2 ? `, ${titleCase(street2)}` : ''}
      </Text>
      <Text>
        {titleCase(city)}, {state} {postalCode}
      </Text>
    </VStack>
  );
};

export default AddressView;
