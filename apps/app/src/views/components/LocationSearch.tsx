import { useRef, useEffect, useState } from 'react';
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
import { StyledToast } from './StyledToast';

const formatLocationOptions = (p: any) => {
  const options = p.map((org: any) => {
    return {
      value: org.place_id,
      label: org.description
    };
  });
  return options;
};

export interface LocationResults {
  loc?: string;
  lat?: number;
  lng?: number;
}

interface LocationSearchProps {
  isOpen: boolean;
  onClose: (value: LocationResults) => void;
}

export const LocationSearch = ({ isOpen, onClose }: LocationSearchProps) => {
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState<boolean>(false);
  const toast = useToast();
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const handleLocationError = (functionName: string) => {
    toast({
      position: 'top-right',
      duration: 4000,
      render: ({ onClose }) => (
        <StyledToast
          onClose={onClose}
          type="info"
          title="Location Search Error"
          description="There was an error searching for locations. Please refresh the page."
        />
      )
    });
    Sentry.withScope((scope) => {
      scope.setTag('component', 'LocationSearch');
      scope.setExtra('function', functionName);
    });
  };

  // intermittently, the google maps instance is not available on page load. The interval is to check for it
  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    } else {
      let checkCount = 0;

      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
          geocoderRef.current = new google.maps.Geocoder();
          clearInterval(interval);
        }

        checkCount += 1;

        if (checkCount >= 20) {
          Sentry.withScope((scope) => {
            scope.setTag('component', 'LocationSearch');
            Sentry.captureException(
              new Error('Unable to find the Google Maps instance after 20 attempts.')
            );
          });
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const searchForLocations = async (inputValue: string) => {
    const request = {
      input: inputValue,
      types: ['geocode'],
      componentRestrictions: { country: 'us' }
    };

    if (!autocompleteServiceRef.current?.getPlacePredictions) {
      handleLocationError('searchForLocations');
      return [];
    }

    const opts = await autocompleteServiceRef.current?.getPlacePredictions(request);
    return formatLocationOptions(opts?.predictions ?? []);
  };

  const geocode = async (address: string) => {
    if (!autocompleteServiceRef.current?.getPlacePredictions) {
      handleLocationError('geocode');
      return;
    }

    const data = await geocoderRef.current?.geocode({ address });
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
      if (!autocompleteServiceRef.current?.getPlacePredictions) {
        handleLocationError('getCurrentLocation');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const data = await geocoderRef.current?.geocode({ location: { lat, lng } });
          if (data?.results) {
            onClose({
              loc: data.results[0].formatted_address,
              lat,
              lng
            });
          }
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
      handleLocationError('loadOptions');
      return [];
    }
  };

  const handleModalClose = () => onClose({});

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
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
