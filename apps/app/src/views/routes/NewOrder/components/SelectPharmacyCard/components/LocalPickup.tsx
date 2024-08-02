import { useEffect, useState } from 'react';
import {
  Button,
  CardBody,
  Checkbox,
  FormControl,
  FormErrorMessage,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  VStack,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';
import { usePhoton, types } from '@photonhealth/react';
import { AsyncSelect } from 'chakra-react-select';
import { RepeatIcon, StarIcon } from '@chakra-ui/icons';
import { useSearchParams } from 'react-router-dom';

import { titleCase } from '../../../../../../utils';
import { Pharmacy } from '../components/Pharmacy';

const formatPharmacyOptions = (p: types.Pharmacy[], preferredIds: string[], previousId = '') => {
  // grab preferred and previous pharmacies and put them at the top of the list
  const preferredAndPreviousIds = [...preferredIds, previousId];
  const filteredPreferred = p.filter((org: any) => preferredAndPreviousIds.includes(org.id));
  const remainingPharmacies = p.filter((org: any) => !preferredAndPreviousIds.includes(org.id));
  const newOrder = [...filteredPreferred, ...remainingPharmacies];

  const options = newOrder.map((org: any) => {
    return {
      value: org.id,
      label: (
        <Text mr={2}>
          {org.name}, {titleCase(org.address?.street1)}, {titleCase(org.address?.city)},{' '}
          {org.address?.state}{' '}
          {preferredIds.some((id) => id === org.id) ? (
            <Tag size="sm" colorScheme="blue" verticalAlign="text-center" me={1}>
              <TagLeftIcon boxSize="12px" as={StarIcon} />
              <TagLabel>Preferred</TagLabel>
            </Tag>
          ) : null}
          {previousId === org.id ? (
            <Tag size="sm" colorScheme="green" verticalAlign="text-center">
              <TagLeftIcon boxSize="12px" as={RepeatIcon} />
              <TagLabel>Previous</TagLabel>
            </Tag>
          ) : null}
        </Text>
      )
    };
  });
  return options;
};

interface LocalPickupProps {
  location: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  onOpen: any;
  errors?: any;
  touched?: any;
  patient: any;
  pharmacyId: string | undefined;
  updatePreferredPharmacy: any;
  setUpdatePreferredPharmacy: any;
  preferredPharmacyIds: string[];
  setFieldValue: (field: string, value: string) => void;
  resetSelection: any;
}

export const LocalPickup = (props: LocalPickupProps) => {
  const {
    location,
    onOpen,
    latitude,
    longitude,
    errors,
    touched,
    patient,
    pharmacyId,
    updatePreferredPharmacy,
    setUpdatePreferredPharmacy,
    setFieldValue,
    preferredPharmacyIds,
    resetSelection
  } = props;
  const [params] = useSearchParams();
  const { getPharmacies, getOrders } = usePhoton();
  const { refetch: refetchPharmacies } = getPharmacies({});
  const patientId = params.get('patientId') || '';

  const { orders } = getOrders({
    patientId,
    first: 1
  });
  const previousId = orders?.[0]?.pharmacy?.id || '';

  const [pharmOptions, setPharmOptions] = useState<any>([]);

  const getPharmacyOptions = async (inputValue?: string) => {
    const resultPharmacies: any = await refetchPharmacies({
      location: {
        latitude,
        longitude
      },
      type: types.FulfillmentType.PickUp
    });

    const filteredPharmacies = inputValue
      ? resultPharmacies.data.pharmacies.filter((pharmacy: any) =>
          pharmacy.name.toLowerCase().startsWith(inputValue.toLowerCase())
        )
      : resultPharmacies.data.pharmacies;

    return formatPharmacyOptions(filteredPharmacies, preferredPharmacyIds, previousId);
  };

  useEffect(() => {
    const getDefaultPharmacyOptions = async () => {
      if (location) {
        setPharmOptions(await getPharmacyOptions());
      }
    };
    getDefaultPharmacyOptions();
  }, [location]);

  const loadOptions = (inputValue: string, callback: (options: any) => void) => {
    setTimeout(async () => {
      callback(await getPharmacyOptions(inputValue));
    }, 500);
  };

  if (pharmacyId) {
    const isPreferred =
      pharmacyId &&
      patient?.preferredPharmacies?.some(({ id }: { id: string }) => id === pharmacyId);
    const isPrevious = previousId === pharmacyId;

    return (
      <CardBody p={0}>
        <Pharmacy
          pharmacyId={pharmacyId}
          isPreferred={isPreferred}
          isPrevious={isPrevious}
          resetSelection={resetSelection}
        />
        {isPreferred ? null : (
          <Checkbox
            pt={2}
            isChecked={updatePreferredPharmacy}
            onChange={(e) => setUpdatePreferredPharmacy(e.target.checked)}
          >
            Save as Preferred{' '}
            <Text as="span" fontSize="xs" color="gray.400">
              Optional
            </Text>
          </Checkbox>
        )}
      </CardBody>
    );
  }

  return location ? (
    <>
      <Wrap mb={3}>
        <WrapItem>
          <Text>Showing pharmacies near:</Text>
        </WrapItem>
        <WrapItem alignItems="center">
          <Button
            colorScheme="blue"
            variant="link"
            leftIcon={<FiMapPin />}
            onClick={onOpen}
            _focus={{ boxShadow: 'none' }}
          >
            {location}
          </Button>
        </WrapItem>
      </Wrap>
      <FormControl isInvalid={!!errors?.pharmacyId && touched?.pharmacyId}>
        <AsyncSelect
          {...props}
          name="pharmacyId"
          placeholder=""
          loadOptions={loadOptions}
          defaultOptions={pharmOptions}
          isClearable
          menuPlacement="auto"
          onChange={(data: any) => {
            if (data?.value) setFieldValue('pharmacyId', data.value);
          }}
        />
        {errors ? <FormErrorMessage>Please select a pharmacy...</FormErrorMessage> : null}
      </FormControl>
    </>
  ) : (
    <FormControl isInvalid={!!errors?.pharmacyId && touched?.pharmacyId}>
      <VStack align="start" spacing={3}>
        <Text>Set a location to be used for pharmacy search.</Text>
        <Button onClick={onOpen}>Set location</Button>
        {errors ? (
          <FormErrorMessage>Please set a location and select a pharmacy...</FormErrorMessage>
        ) : null}
      </VStack>
    </FormControl>
  );
};
