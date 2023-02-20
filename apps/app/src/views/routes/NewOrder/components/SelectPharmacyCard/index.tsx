import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Heading,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
  CardBody,
  Checkbox,
  Text
} from '@chakra-ui/react';

import { types } from '@photonhealth/react';

import { LocationSearch } from '../../../../components/LocationSearch';
import { LocalPickup } from './components/LocalPickup';
import { MailOrder } from './components/MailOrder';
import { Pharmacy } from './components/Pharmacy';
import { Address } from '../../../../../models/general';
import { SendToPatient } from './components/SendToPatient';

interface SelectPharmacyCardProps {
  patient: any;
  address: Address;
  onlyCurexa: boolean;
  errors: any;
  touched: any;
  pharmacyId: string;
  setFieldValue: any;
  updatePreferredPharmacy: boolean;
  setUpdatePreferredPharmacy: (value: boolean) => void;
}

export const SelectPharmacyCard: React.FC<SelectPharmacyCardProps> = ({
  patient,
  address,
  onlyCurexa,
  errors,
  touched,
  pharmacyId,
  setFieldValue,
  updatePreferredPharmacy,
  setUpdatePreferredPharmacy
}: SelectPharmacyCardProps) => {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('');

  const [selectedTab, setSelectedTab] = useState(onlyCurexa ? 1 : 0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleModalClose = ({
    loc = undefined,
    lat = undefined,
    lng = undefined
  }: {
    loc: string | undefined;
    lat: number | undefined;
    lng: number | undefined;
  }) => {
    if (lat && lng && loc) {
      setLatitude(lat);
      setLongitude(lng);
      setLocation(loc);
    }
    onClose();
  };

  const tabsList = [
    {
      name: 'Local Pickup',
      fulfillmentType: types.FulfillmentType.PickUp,
      isDisabled: onlyCurexa,
      comp: (
        <LocalPickup
          location={location}
          latitude={latitude}
          longitude={longitude}
          onOpen={onOpen}
          errors={errors}
          touched={touched}
          preferredPharmacyIds={
            patient?.preferredPharmacies?.map((pharmacy: any) => pharmacy.id) || []
          }
          setFieldValue={setFieldValue}
        />
      )
    },
    {
      name: 'Mail Order',
      fulfillmentType: types.FulfillmentType.MailOrder,
      isDisabled: !onlyCurexa,
      comp: (
        <MailOrder
          location={location}
          setFieldValue={setFieldValue}
          errors={errors}
          touched={touched}
        />
      )
    },
    {
      name: 'Send to patient',
      fulfillmentType: undefined,
      isDisabled: false,
      comp: <SendToPatient patient={patient} />
    }
  ];

  const handleTabChange = (index: number) => {
    setFieldValue('fulfillmentType', tabsList[index].fulfillmentType);
    setSelectedTab(index);
  };

  useEffect(() => {
    setLatitude(undefined);
    setLongitude(undefined);
    setLocation('');
  }, [patient?.id]);

  const geocoder = new google.maps.Geocoder();
  useEffect(() => {
    if (!address || !address.postalCode) {
      setLatitude(undefined);
      setLongitude(undefined);
      setLocation('');
    } else {
      geocoder
        .geocode({
          address: `${address.street1} ${address.street2 || ''} ${address.city}, ${address.state} ${
            address.postalCode
          }`
        })
        .then(({ results }) => {
          if (results) {
            setLocation(results[0].formatted_address);
            setLatitude(results[0].geometry.location.lat());
            setLongitude(results[0].geometry.location.lng());
          }
        })
        .catch((err) => {
          console.log('Error geocoding', err);
        });
    }
  }, [address]);

  const isPreferred =
    pharmacyId && patient?.preferredPharmacies?.some(({ id }: { id: string }) => id === pharmacyId);

  return (
    <Card bg="bg-surface">
      <LocationSearch isOpen={isOpen} onClose={handleModalClose} />
      <CardHeader>
        <HStack w="full" justify="space-between">
          <Heading size="xxs">{pharmacyId ? 'Pharmacy' : 'Select a Pharmacy'}</Heading>
          {pharmacyId ? (
            <Button onClick={() => setFieldValue('pharmacyId', '')} size="xs">
              Change
            </Button>
          ) : null}
        </HStack>
      </CardHeader>
      {pharmacyId ? (
        <CardBody pt={0}>
          <Pharmacy pharmacyId={pharmacyId} isPreferred={isPreferred} />
          {isPreferred ? null : (
            <Checkbox
              pt={2}
              isChecked={updatePreferredPharmacy}
              onChange={(e) => setUpdatePreferredPharmacy(e.target.checked)}
            >
              Save as Patient's Preferred Pharmacy{' '}
              <Text as="span" fontSize="xs" color="gray.400">
                Optional
              </Text>
            </Checkbox>
          )}
        </CardBody>
      ) : (
        <Tabs index={selectedTab} onChange={handleTabChange} variant="enclosed">
          <TabList px={5}>
            {tabsList.map(({ isDisabled, name }) => (
              <Tab key={`${name}-tab`} p={3} whiteSpace="nowrap" isDisabled={isDisabled}>
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels p={1}>
            {tabsList.map(({ comp, name }) => (
              <TabPanel key={`${name}-panel`}>{comp}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}
    </Card>
  );
};
