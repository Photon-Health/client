import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react';

import { StateSelect } from '../../../components/StateSelect';
import { OptionalText } from '../../../components/OptionalText';
import { LoadingInputField } from '../../../components/LoadingInputField';

import { formatAddress } from '../../../../utils';

import { Address } from '../../../../models/general';
import { useEffect } from 'react';

interface PatientAddressCardProps {
  address: Address;
  touched: any;
  errors: any;
  setFieldValue: (field: string, value: string) => void;
  loading: boolean;
  showAddress: boolean;
  setShowAddress: any;
  updateAddress: boolean;
  setUpdateAddress: (value: boolean) => void;
  setTouched: (fields: { [field: string]: boolean }, shouldValidate?: boolean) => void;
}

export const PatientAddressCard = ({
  address,
  touched,
  errors,
  setFieldValue,
  loading,
  showAddress,
  setShowAddress,
  updateAddress,
  setUpdateAddress,
  setTouched
}: PatientAddressCardProps) => {
  useEffect(() => {
    const errorKeys = Object.keys(errors?.address || {});
    if (errorKeys?.length > 0 && !showAddress) {
      setShowAddress(true);
      setTouched({
        ...touched,
        address: errorKeys.reduce((acc: { [key: string]: boolean }, key) => {
          acc[key] = true;
          return acc;
        }, {})
      });
    }
  }, [errors]);

  return (
    <Card bg="bg-surface">
      <CardHeader>
        <HStack w="full" justify="space-between">
          <Heading size="xxs">{!showAddress ? 'Patient Address' : 'Set Patient Address'}</Heading>
          {!showAddress ? (
            <Button onClick={() => setShowAddress(true)} size="xs">
              Change
            </Button>
          ) : null}
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        {!showAddress ? (
          <Text>{formatAddress(address)}</Text>
        ) : (
          <VStack spacing={6} align="stretch" alignSelf="flex-start">
            <FormControl isInvalid={!!errors.address?.street1 && touched.address?.street1}>
              <FormLabel htmlFor="address.street1" mb={1}>
                Address Line 1
              </FormLabel>
              <FormHelperText pb={2} mt={0}>
                Enter street number and name
              </FormHelperText>
              <LoadingInputField name="address.street1" loading={loading ? 1 : 0} />
              <FormErrorMessage>{errors.address?.street1}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.address?.street2 && touched.address?.street2}>
              <FormLabel htmlFor="address.street2" optionalIndicator={<OptionalText />} mb={1}>
                Address Line 2
              </FormLabel>
              <FormHelperText pb={2} mt={0}>
                Enter Apt, Unit or Suite
              </FormHelperText>
              <LoadingInputField name="address.street2" loading={loading ? 1 : 0} />
              <FormErrorMessage>{errors.address?.street2}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.address?.city && touched.address?.city}>
              <FormLabel htmlFor="address.city">City</FormLabel>
              <LoadingInputField name="address.city" loading={loading ? 1 : 0} />
              <FormErrorMessage>{errors.address?.city}</FormErrorMessage>
            </FormControl>
            <HStack spacing="4" align="flex-start">
              <FormControl isInvalid={!!errors.address?.state && touched.address?.state}>
                <FormLabel htmlFor="address.state">State</FormLabel>
                <StateSelect isLoading={loading} name="address.state" menuPlacement="auto" />
                <FormErrorMessage>{errors.address?.state}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.address?.postalCode && touched.address?.postalCode}>
                <FormLabel htmlFor="address.postalCode">Zip Code</FormLabel>
                <LoadingInputField
                  name="address.postalCode"
                  maxLength={10}
                  onChange={(e: any) => {
                    if (/^[0-9-]+$/.test(e.target.value) || e.target.value === '') {
                      setFieldValue('address.postalCode', e.target.value);
                    }
                  }}
                  loading={loading ? 1 : 0}
                />
                <FormErrorMessage>{errors.address?.postalCode}</FormErrorMessage>
              </FormControl>
            </HStack>
            <Checkbox
              pt={2}
              isChecked={updateAddress}
              onChange={(e) => setUpdateAddress(e.target.checked)}
            >
              Save as Patient’s Address{' '}
            </Checkbox>
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};
