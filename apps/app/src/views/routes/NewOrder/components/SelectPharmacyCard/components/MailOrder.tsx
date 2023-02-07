import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { usePhoton, types } from '@photonhealth/react';
import { Pharmacy } from './Pharmacy';

interface MailOrderProps {
  location: string | undefined;
  setFieldValue: any;
  errors: any;
  touched: any;
}

export const MailOrder = ({ location, setFieldValue, errors, touched }: MailOrderProps) => {
  const { getPharmacies } = usePhoton();
  const { refetch } = getPharmacies({});

  const [pharmOptions, setPharmOptions] = useState<any>([]);

  const getPharmacyOptions = async () => {
    const result: any = await refetch({
      type: types.FulfillmentType.MailOrder
    });

    setPharmOptions(result.data.pharmacies);
  };

  useEffect(() => {
    getPharmacyOptions();
  }, [location]);

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <FormControl isInvalid={!!errors.pharmacyId && touched.pharmacyId}>
      <Text>Contact support to add additional mail order integrations.</Text>
      {errors ? <FormErrorMessage>Please select a pharmacy...</FormErrorMessage> : null}
      {pharmOptions.map(({ id }: any) => (
        <Box
          mt={4}
          p={3}
          border="1px"
          borderColor={borderColor}
          cursor="pointer"
          borderRadius={5}
          key={id}
          onClick={() => setFieldValue('pharmacyId', id)}
        >
          <HStack w="full" justify="space-between">
            <Pharmacy pharmacyId={id} showTags={false} />
            <Button
              display="inline"
              size="xs"
              minW="fit-content"
              onClick={() => setFieldValue('pharmacyId', id)}
            >
              Select
            </Button>
          </HStack>
        </Box>
      ))}
    </FormControl>
  );
};
