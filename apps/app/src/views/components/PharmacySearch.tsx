import { useState, createRef, useEffect, RefObject } from 'react';
import { AsyncSelect } from 'chakra-react-select';
import { useField, FieldAttributes } from 'formik';

import {
  Box,
  Button,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import { usePhoton, types } from '@photonhealth/react';
import { titleCase } from '../../utils';

export const PharmacySearch = (props: FieldAttributes<any>) => {
  const { name, defaultSearch, errors, touched, patient, defaultSelection, loading } = props;
  const geocoder = new google.maps.Geocoder();
  const [pharmacyOptions, setPharmacyOptions] = useState<
    {
      value: any;
      label: string;
    }[]
  >([]);
  const [location, setLocation] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [customError, setCustomError] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [showDefaultPharmacy, setShowDefaultPharmacy] = useState<boolean>(false);

  const { getPharmacies, getPharmacy } = usePhoton();
  const { refetch } = getPharmacies({});
  const { pharmacy } = getPharmacy({ id: defaultSelection });

  const [, , { setValue, setTouched }] = useField(name);
  const ref: RefObject<any> = createRef();

  const onChanged = (selected: any) => {
    if (selected == null) {
      setValue('');
    } else {
      setValue(selected.value);
    }
  };

  const [locationDebounce] = useDebounce(location, 800);

  const geocode = async (address: string): Promise<google.maps.GeocoderResult[]> => {
    setIsGeocoding(true);
    const data = await geocoder.geocode({ address });
    return data.results;
  };

  const pharmacyLatLngSearch = async (geocoderResult: google.maps.GeocoderResult[]) => {
    setIsLoading(true);
    setIsGeocoding(false);
    const latitude = geocoderResult[0].geometry.location.lat();
    const longitude = geocoderResult[0].geometry.location.lng();
    const addressResult = geocoderResult[0].formatted_address;

    if (addressResult) setFormattedAddress(addressResult);

    if (!latitude || !longitude) {
      setCustomError('An unexpected error occurred.');
      const errorMessage = `An unexpected error occurred`;
      throw new Error(errorMessage); // stops execution
    }
    return refetch({
      location: {
        latitude,
        longitude
      }
    });
  };

  const formatPharmacyOptions = (p: types.Pharmacy[]) => {
    const options = p.map((org: any) => {
      return {
        value: org.id,
        label: `${org.name}, ${titleCase(org.address?.street1)}, ${titleCase(org.address?.city)}, 
              ${org.address?.state}`
      };
    });
    return options;
  };

  async function setDefaultPharmacy(p: any) {
    try {
      const pharmOptions = await formatPharmacyOptions([p]);
      if (pharmOptions) {
        setPharmacyOptions(pharmOptions);
        setShowDefaultPharmacy(true);
        setTouched(false);
        setIsHidden(true);
        setIsLoading(false);
      }
    } catch (e) {
      setCustomError('Something unexpected occured');
      setTouched(true);
      setShowDefaultPharmacy(false);
      setIsGeocoding(false);
      setIsHidden(false);
      setIsLoading(false);
    }
  }

  async function searchPharmacies(locationInput: string) {
    try {
      const geocodeResponse = await geocode(locationInput);
      const { data } = await pharmacyLatLngSearch(geocodeResponse);
      const pharmOptions = await formatPharmacyOptions(data.pharmacies);
      setPharmacyOptions(pharmOptions);
      if (pharmOptions) {
        setTouched(false);
        setIsHidden(true);
        setIsLoading(false);
      }
    } catch (e) {
      setCustomError('Please enter a valid zip code or address...');
      setTouched(true);
      setIsGeocoding(false);
      setIsHidden(false);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!location && !defaultSelection) {
      setCustomError('');
      setTouched(false);
      setIsHidden(false);
    }

    if (locationDebounce) {
      setCustomError('');
      searchPharmacies(locationDebounce);
    }
  }, [locationDebounce]);

  useEffect(() => {
    if (ref.current && pharmacyOptions.length > 0) {
      if (defaultSelection && showDefaultPharmacy) {
        ref.current.setValue(pharmacyOptions[0]);
      } else {
        ref.current.clearValue();
      }
    }
  }, [pharmacyOptions]);

  useEffect(() => {
    const setDefault = async () => {
      if (pharmacy) {
        await setDefaultPharmacy(pharmacy);
      }
    };
    if (!loading) {
      if (defaultSearch && !defaultSelection) {
        setIsLoading(true);
        setLocation(defaultSearch);
        setShowDefaultPharmacy(false);
      } else if (defaultSelection) {
        setIsLoading(true);
        setLocation('');
        setDefault().catch(console.error);
        setShowDefaultPharmacy(true);
      } else {
        setLocation('');
        setPharmacyOptions([]);
        setShowDefaultPharmacy(false);
        setTouched(false);
        setIsHidden(false);
        setIsLoading(false);
      }
    }
  }, [defaultSearch, defaultSelection, loading, pharmacy]);

  const filterOptions = (inputValue: string) => {
    return pharmacyOptions.filter((i: any) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue: string, callback: (options: any) => void) => {
    setTimeout(() => {
      callback(filterOptions(inputValue));
    }, 1000);
  };

  return (
    <>
      {!isHidden && (
        <FormHelperText pb={2} mt={0}>
          Enter a zipcode or address
        </FormHelperText>
      )}
      <InputGroup>
        <Input
          hidden={isHidden}
          value={location ?? ''}
          disabled={isGeocoding || isLoading}
          onChange={(e) => setLocation(e.target.value)}
        />
        {(isGeocoding || isLoading) && (
          <InputRightElement>
            <Spinner size="sm" />
          </InputRightElement>
        )}
      </InputGroup>
      {errors && !customError && !isHidden ? (
        <FormErrorMessage>Please enter a zipcode...</FormErrorMessage>
      ) : null}

      {customError && (
        <Text color="red.500" pt={2} fontSize="14px">
          {customError}
        </Text>
      )}
      {isHidden && (
        <Box pb={2} mt={0}>
          <Text mr={1} color="gray.600" fontSize="sm" display="inline">
            {showDefaultPharmacy && patient
              ? "Showing patient's preferred pharmacy"
              : 'Showing pharmacies near'}
          </Text>
          {!showDefaultPharmacy && (
            <Text mr={2} color="gray.900" fontSize="sm" display="inline">
              {formattedAddress}
            </Text>
          )}
          <Button
            display="inline"
            onClick={() => {
              setLocation('');
              setPharmacyOptions([]);
              setShowDefaultPharmacy(false);
              setIsHidden(false);
              setCustomError('');
            }}
            size="xs"
          >
            Change
          </Button>
        </Box>
      )}
      {isHidden && !customError && (
        <>
          <AsyncSelect
            zIndex={4}
            ref={ref}
            {...props}
            placeholder=""
            blurInputOnSelect={false}
            validateOnBlur={false}
            loadOptions={loadOptions}
            defaultOptions={pharmacyOptions}
            isSearchable
            isLoading={isLoading}
            isClearable
            onChange={onChanged}
          />
          {touched && errors ? (
            <Text color="red.500" pt={2} fontSize="14px">
              {errors}
            </Text>
          ) : null}
        </>
      )}
    </>
  );
};
