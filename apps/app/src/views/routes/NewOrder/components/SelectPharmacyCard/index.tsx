import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  Heading,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure
} from '@chakra-ui/react';

import { types } from '@photonhealth/react';

import { LocationSearch } from '../../../../components/LocationSearch';
import { LocalPickup } from './components/LocalPickup';
import { MailOrder } from './components/MailOrder';
import { Address } from '../../../../../models/general';
import { SendToPatient } from './components/SendToPatient';

import { FulfillmentSettings } from '../../../../../models/general';

interface SelectPharmacyCardProps {
  user: any;
  auth0UserId: string;
  patient: any;
  address: Address;
  errors: any;
  touched: any;
  pharmacyId: string;
  setFieldValue: any;
  updatePreferredPharmacy: boolean;
  setUpdatePreferredPharmacy: (value: boolean) => void;
  settings: FulfillmentSettings;
}

export const SelectPharmacyCard: React.FC<SelectPharmacyCardProps> = ({
  user,
  auth0UserId,
  patient,
  address,
  errors,
  touched,
  pharmacyId,
  setFieldValue,
  updatePreferredPharmacy,
  setUpdatePreferredPharmacy,
  settings
}: SelectPharmacyCardProps) => {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('');

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

  const resetSelection = () => {
    setFieldValue('pharmacyId', '');
    setUpdatePreferredPharmacy(false);
  };

  const tabsList = [
    {
      name: 'Send to Patient',
      fulfillmentType: undefined,
      // @ts-ignore
      enabled: settings.sendToPatient || settings.sendToPatientUsers.includes(auth0UserId),
      comp: <SendToPatient patient={patient} />
    },
    {
      name: 'Local Pickup',
      fulfillmentType: types.FulfillmentType.PickUp,
      enabled: settings.pickUp,
      comp: (
        <LocalPickup
          location={location}
          latitude={latitude}
          longitude={longitude}
          onOpen={onOpen}
          errors={errors}
          touched={touched}
          patient={patient}
          pharmacyId={pharmacyId}
          updatePreferredPharmacy={updatePreferredPharmacy}
          setUpdatePreferredPharmacy={setUpdatePreferredPharmacy}
          preferredPharmacyIds={
            patient?.preferredPharmacies?.map((pharmacy: any) => pharmacy.id) || []
          }
          setFieldValue={setFieldValue}
          resetSelection={resetSelection}
        />
      )
    },
    {
      name: 'Mail Order',
      fulfillmentType: types.FulfillmentType.MailOrder,
      enabled: settings.mailOrder,
      comp: (
        <MailOrder
          user={user}
          pharmacyId={pharmacyId}
          location={location}
          setFieldValue={setFieldValue}
          errors={errors}
          touched={touched}
          resetSelection={resetSelection}
        />
      )
    }
  ];

  const [selectedTab, setSelectedTab] = useState(tabsList.findIndex((tab) => tab.enabled) || 0);

  const handleTabChange = (index: number) => {
    resetSelection();
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

  return (
    <Card bg="bg-surface">
      <LocationSearch isOpen={isOpen} onClose={handleModalClose} />
      <CardHeader>
        <HStack w="full" justify="space-between">
          <Heading size="xxs">Select a Pharmacy Option</Heading>
        </HStack>
      </CardHeader>
      <Tabs index={selectedTab} onChange={handleTabChange} variant="enclosed">
        <TabList px={5}>
          {tabsList.map(({ enabled, name }) => (
            <Tab key={`${name}-tab`} p={3} whiteSpace="nowrap" isDisabled={!enabled}>
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
    </Card>
  );
};
