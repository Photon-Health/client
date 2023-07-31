import { FC, useEffect, useState } from 'react';
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

import { LocationResults, LocationSearch } from '../../../../components/LocationSearch';
import { LocalPickup } from './components/LocalPickup';
import { MailOrder } from './components/MailOrder';
import { Address } from '../../../../../models/general';
import { SendToPatient } from './components/SendToPatient';
import { FulfillmentOptions } from '../OrderForm';
import { formatAddress } from 'apps/app/src/utils';

interface SelectPharmacyCardProps {
  user: any;
  patient: any;
  address?: Address;
  errors?: any;
  touched?: any;
  pharmacyId: string;
  setFieldValue: any;
  updatePreferredPharmacy: boolean;
  setUpdatePreferredPharmacy: (value: boolean) => void;
  tabsList: FulfillmentOptions;
}

export const SelectPharmacyCard: FC<SelectPharmacyCardProps> = ({
  user,
  patient,
  address,
  errors,
  touched,
  pharmacyId,
  setFieldValue,
  updatePreferredPharmacy,
  setUpdatePreferredPharmacy,
  tabsList
}: SelectPharmacyCardProps) => {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleModalClose = ({ loc, lat, lng }: LocationResults) => {
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
        .geocode({ address: formatAddress(address) })
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
          {tabsList.map(({ name }) => (
            <TabPanel key={`${name}-panel`}>
              {name === 'Send to Patient' ? <SendToPatient patient={patient} /> : null}
              {name === 'Local Pickup' ? (
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
              ) : null}
              {name === 'Mail Order' ? (
                <MailOrder
                  user={user}
                  pharmacyId={pharmacyId}
                  location={location}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                  resetSelection={resetSelection}
                />
              ) : null}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Card>
  );
};
