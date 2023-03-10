import { useState } from 'react';

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
  VStack
} from '@chakra-ui/react';

import { FiTarget } from 'react-icons/fi';
import { AsyncSelect } from 'chakra-react-select';

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

  const autocompleteService = new google.maps.places.AutocompleteService();
  const searchForLocations = async (inputValue: string) => {
    const request = {
      input: inputValue,
      types: ['geocode'],
      componentRestrictions: { country: 'us' }
    };
    const opts = await autocompleteService.getPlacePredictions(request);
    return formatLocationOptions(opts.predictions);
  };

  const geocoder = new google.maps.Geocoder();
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
          lat,
          lng
        });
        setGettingCurrentLocation(false);
      });
    } else {
      setGettingCurrentLocation(false);
    }
  };

  const loadOptions = (inputValue: string, callback: (options: any) => void) => {
    setTimeout(async () => {
      callback(await searchForLocations(inputValue));
    }, 1000);
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
