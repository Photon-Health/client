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

import { types, usePhoton } from '@photonhealth/react';

import { LocationSearch } from '../../../../components/LocationSearch';
import { LocalPickup } from './components/LocalPickup';
import { MailOrder } from './components/MailOrder';
import { Address } from '../../../../../models/general';
import { SendToPatient } from './components/SendToPatient';

const pharmacySelectionEnabledOrgs = [process.env.REACT_APP_MODERN_PEDIATRICS_ORG_ID];

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
  const { user } = usePhoton();

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
    ...(pharmacySelectionEnabledOrgs.includes(user.org_id)
      ? [
          {
            name: 'Send to Patient',
            fulfillmentType: undefined,
            isDisabled: onlyCurexa,
            comp: <SendToPatient patient={patient} />
          }
        ]
      : []),
    {
      name: 'Send to Patient',
      fulfillmentType: undefined,
      isDisabled: onlyCurexa,
      comp: <SendToPatient patient={patient} />
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
    }
  ];

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
    </Card>
  );
};
