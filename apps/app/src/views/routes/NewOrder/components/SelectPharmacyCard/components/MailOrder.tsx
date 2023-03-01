import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CardBody,
  FormControl,
  FormErrorMessage,
  HStack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { usePhoton, types } from '@photonhealth/react';
import { Pharmacy } from './Pharmacy';

const envName = process.env.REACT_APP_ENV_NAME as 'boson' | 'neutron' | 'photon';
const { fulfillmentSettings } = require(`../../../../../../configs/fulfillment.${envName}.ts`);

interface MailOrderProps {
  user: any;
  pharmacyId: string;
  location: string | undefined;
  setFieldValue: any;
  errors: any;
  touched: any;
  resetSelection: any;
}

export const MailOrder = ({
  user,
  pharmacyId,
  location,
  setFieldValue,
  errors,
  touched,
  resetSelection
}: MailOrderProps) => {
  const { getPharmacies } = usePhoton();
  const { refetch } = getPharmacies({});

  const [pharmOptions, setPharmOptions] = useState<any>([]);

  const getPharmacyOptions = async () => {
    const result: any = await refetch({
      type: types.FulfillmentType.MailOrder
    });

    const fConfig = fulfillmentSettings[user.org_id] || fulfillmentSettings.default;
    const options = result.data.pharmacies.filter(({ id }: { id: string }) =>
      fConfig.mailOrderProviders.includes(id)
    );

    setPharmOptions(options);
  };

  useEffect(() => {
    getPharmacyOptions();
  }, [location]);

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (pharmacyId) {
    return (
      <CardBody p={0}>
        <Pharmacy pharmacyId={pharmacyId} resetSelection={resetSelection} />
      </CardBody>
    );
  }

  return (
    <FormControl isInvalid={!!errors.pharmacyId && touched.pharmacyId}>
      <Text>Contact support to add additional mail order integrations.</Text>
      {errors ? <FormErrorMessage>Please select a pharmacy...</FormErrorMessage> : null}
      {pharmOptions.map(({ id }: { id: string }) => (
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
