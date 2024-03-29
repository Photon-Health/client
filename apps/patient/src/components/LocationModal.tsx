import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  Button,
  Divider,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack
} from '@chakra-ui/react';
import { FiTarget } from 'react-icons/fi';
import { AsyncSelect } from 'chakra-react-select';
import { debounce } from 'lodash';

import { text as t } from '../utils/text';

const formatLocationOptions = (p: any) => {
  const options = p.map((org: any) => {
    return {
      value: org.place_id,
      label: org.description
    };
  });
  return options;
};

const autocompleteService = new google.maps.places.AutocompleteService();
const geocoder = new google.maps.Geocoder();

export const LocationModal = ({ isOpen, onClose }: any) => {
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo');

  const searchForLocations = async (inputValue: string) => {
    const request = {
      input: inputValue,
      types: ['geocode'],
      componentRestrictions: { country: 'us' }
    };
    const opts = await autocompleteService.getPlacePredictions(request);
    return formatLocationOptions(opts.predictions);
  };

  const debouncedSearchForLocations = debounce(
    async (inputValue: string, callback: (options: any) => void) => {
      const options = await searchForLocations(inputValue);
      callback(options);
    },
    1000
  );

  const geocode = async (address: string) => {
    const data = await geocoder.geocode({ address });
    if (data?.results) {
      onClose({
        loc: data.results[0].formatted_address,
        lat: data.results[0].geometry.location.lat(),
        lng: data.results[0].geometry.location.lng()
      });
    }
  };

  const getCurrentLocation = async () => {
    setGettingCurrentLocation(true);
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const data = await geocoder.geocode({ location: { lat, lng } });
        onClose({
          loc: data.results[0].formatted_address,
          lat: data.results[0].geometry.location.lat(),
          lng: data.results[0].geometry.location.lng()
        });
        setGettingCurrentLocation(false);
      });
    } else {
      setGettingCurrentLocation(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose({})}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t.setLoc}</ModalHeader>
        <ModalCloseButton />
        {isDemo ? (
          <Alert status="warning">
            <AlertIcon />
            <Text>Unable to change location in demo mode</Text>
          </Alert>
        ) : null}
        <ModalBody pb={6}>
          <Text>{t.enterLocLong}</Text>
          <Button
            w="full"
            leftIcon={<FiTarget />}
            mt={5}
            onClick={async () => getCurrentLocation()}
            isLoading={gettingCurrentLocation}
            loadingText={t.gettingLoc}
            isDisabled={!!isDemo}
          >
            {t.useLoc}
          </Button>
          <HStack spacing={2} mt={5}>
            <Divider />
            <Text fontWeight="medium">OR</Text>
            <Divider />
          </HStack>
          <VStack spacing={1} align="start">
            <Text mt={5} fontWeight="medium">
              {t.findLoc}
            </Text>
            <VStack w="full" align="stretch">
              <Text pb={0} mt={0} fontSize="sm">
                {t.enterLoc}
              </Text>
              <AsyncSelect
                placeholder=""
                loadOptions={(inputValue: string, callback: (options) => void) => {
                  debouncedSearchForLocations(inputValue, callback);
                }}
                defaultOptions={[]}
                isClearable
                menuPlacement="auto"
                isDisabled={!!isDemo}
                onChange={async (val) => {
                  if (val) {
                    await geocode(val.label);
                  }
                }}
              />
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
