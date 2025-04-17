import { useEffect, useRef, useState } from 'react';
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
import { getSettings } from '@client/settings';
import { useIsVisible } from 'apps/app/src/hooks/useIsIntersecting';

interface MailOrderProps {
  user: any;
  pharmacyId: string;
  location: string | undefined;
  setFieldValue: any;
  errors?: any;
  touched?: any;
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
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref);
  const { getPharmacies } = usePhoton();
  const { refetch } = getPharmacies({});
  const mailOrderProviders = getSettings(user?.org_id)?.mailOrderProviders;

  const [pharmOptions, setPharmOptions] = useState<any>([]);

  const getPharmacyOptions = async () => {
    const result: any = await refetch({
      type: types.FulfillmentType.MailOrder
    });

    const options = result.data.pharmacies.filter(({ id }: { id: string }) =>
      mailOrderProviders?.includes(id)
    );

    setPharmOptions(options);
  };

  useEffect(() => {
    getPharmacyOptions();
  }, [location]);

  useEffect(() => {
    if (isVisible && pharmOptions?.length === 1 && !pharmacyId) {
      setFieldValue('pharmacyId', pharmOptions[0].id);
    }
  }, [isVisible]);

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box ref={ref}>
      {pharmacyId ? (
        <CardBody p={0}>
          <Pharmacy
            pharmacyId={pharmacyId}
            resetSelection={resetSelection}
            disableChange={pharmOptions.length === 1}
          />
        </CardBody>
      ) : (
        <FormControl isInvalid={!!errors?.pharmacyId && touched?.pharmacyId} ref={ref}>
          <Text>Contact support to add additional mail order integrations.</Text>
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
          {errors ? <FormErrorMessage>Please select a pharmacy...</FormErrorMessage> : null}
        </FormControl>
      )}
    </Box>
  );
};
