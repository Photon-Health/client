import { useRef, useState } from 'react';
import * as Sentry from '@sentry/react';

import {
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
  VStack,
  useToast
} from '@chakra-ui/react';

import { FiTarget } from 'react-icons/fi';
import { AsyncSelect, OptionsOrGroups } from 'chakra-react-select';

const formatLocationOptions = (p: any) => {
  const options = p.map((org: any) => {
    return {
      value: org.place_id,
      label: org.description
    };
  });
  return options;
};

export const LocationSearch = ({ isOpen, onClose }: any) => {
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState<boolean>(false);
  const toast = useToast();

  const autocompleteServiceRef = useRef(new google.maps.places.AutocompleteService());
  const geocoderRef = useRef(new google.maps.Geocoder());

  const searchForLocations = async (inputValue: string) => {
    const request = {
      input: inputValue,
      types: ['geocode'],
      componentRestrictions: { country: 'us' }
    };
    const opts = await autocompleteServiceRef.current.getPlacePredictions(request);
    return formatLocationOptions(opts.predictions);
  };

  const geocode = async (address: string) => {
    const data = await geocoderRef.current.geocode({ address });
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
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const data = await geocoderRef.current.geocode({ location: { lat, lng } });
          onClose({
            loc: data.results[0].formatted_address,
            lat,
            lng
          });
          setGettingCurrentLocation(false);
        },
        (error) => {
          console.error('Geolocation error: ', error);
          setGettingCurrentLocation(false);
        }
      );
    } else {
      setGettingCurrentLocation(false);
    }
  };

  const loadOptions = async (
    inputValue: string,
    callback: (options: any) => void
  ): Promise<OptionsOrGroups<never, never>> => {
    try {
      const result = await searchForLocations(inputValue);
      callback(result);
      return result;
    } catch (e) {
      toast({
        title: 'Location Search Error',
        description: 'There was an error searching for locations. Please refresh the page.',
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true
      });
      Sentry.withScope((scope) => {
        scope.setTag('component', 'LocationSearch');
        scope.setExtra('function', 'searchForLocations');
        Sentry.captureException(e);
      });
      return [];
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose({})}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Set your location</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text>Enter the zipcode or address where you'd like to search for a pharmacy.</Text>
          <Button
            w="full"
            leftIcon={<FiTarget />}
            mt={5}
            onClick={async () => getCurrentLocation()}
            isLoading={gettingCurrentLocation}
            loadingText="Getting current location"
          >
            Use my current location
          </Button>
          <HStack spacing={2} mt={5}>
            <Divider />
            <Text fontWeight="medium">OR</Text>
            <Divider />
          </HStack>
          <VStack spacing={1} align="start">
            <Text mt={5} fontWeight="medium">
              Find a location
            </Text>
            <VStack w="full" align="stretch">
              <Text pb={0} mt={0} fontSize="sm">
                Enter a zipcode or address
              </Text>
              <AsyncSelect
                placeholder=""
                loadOptions={loadOptions}
                defaultOptions={[]}
                isClearable
                menuPlacement="auto"
                onChange={async (val) => {
                  if (val) {
                    // @ts-ignore
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
