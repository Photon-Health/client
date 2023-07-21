import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { FiCheck, FiMapPin } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { types } from '@photonhealth/react';
import { formatAddress, getHours } from '../utils/general';
import { GET_PHARMACIES } from '../utils/queries';
import { ExtendedFulfillmentType, Order } from '../utils/models';
import t from '../utils/text.json';
import { SELECT_ORDER_PHARMACY, SET_PREFERRED_PHARMACY } from '../utils/mutations';
import { graphQLClient } from '../configs/graphqlClient';
import { FixedFooter } from '../components/FixedFooter';
import { Nav } from '../components/Nav';
import { PoweredBy } from '../components/PoweredBy';
import { LocationModal } from '../components/LocationModal';
import { PickupOptions } from '../components/PickupOptions';
import { BrandedOptions } from '../components/BrandedOptions';
import { OrderContext } from './Main';
import { getSettings } from '@client/settings';
import { Pharmacy as PharmacyType } from '../utils/models';

export const AUSTIN_INDIE_PHARMACY_IDS: string[] = [
  'phr_01G9CM8JJ03N4VPPDKR4KV4YKR', // Tarrytown Pharmacy
  'phr_01G9CM8MFENM6P96F94RQWBMAY', // Northwest Hills Pharmacy at Davenport
  // People's pharmacies (4)
  'phr_01G9CM8MTAFDSKSJ5P3680FFBG',
  'phr_01G9CM90JXBT4JPDQZAMEVRQ5K',
  'phr_01G9CM8M2D23133Q9T91K3NQE5',
  'phr_01G9CM8TFRJNZ5CYW1PV3Z4Z9C',
  'phr_01G9CM8W0RD2YRWX8F64NJB4JM', // East Austin Medicine Shop
  'phr_01GFVHFPSTYPWPMGQ4Y0ZMEEP0', // Martin's Wellness & Compounding Pharmacy at Lamar Plaza Drug Store
  // Martin's Wellness Dripping Springs Pharmacy
  'phr_01G9CM8WDPTAPXX8RWFSFTDZRW', // Brodie Lane Pharmacy
  // MedSavers Pharmacy
  'phr_01GA9HPXHZY0NS2WBWEF52GKFM', // Gus's Drug
  'phr_01G9CM8J8CDW1TVNY9MMNBF1QM', // 38th Street Pharmacy
  'phr_01G9CM92EYZVK3FZ25JMYKRNR5', // Austin Compounding Pharmacy
  'phr_01GA9HPXJPCEXYEBVGFYT17066', // Buda Drug Store
  'phr_01G9CM92S2ES1TJD8DH1VTEBZJ', // Auro Pharmacy
  'phr_01GA9HPXD5ZM86MASCK625ZQJF', // Lake Hills Pharmacy
  'phr_01GA9HPXEQH5V38D5G11EKADNY', // Manor Pharmacy
  'phr_01G9CM940NTXPBR0HQ7042T5CA', // Alive And Well Pharmacy
  'phr_01GSB2FQ4F2D2JBJW58AGCP2V0' // Solutions Pharmacy
];

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER'];
export const UNOPEN_BUSINESS_STATUS_MAP = {
  CLOSED_TEMPORARILY: 'Closed Temporarily',
  CLOSED_PERMANENTLY: 'Closed Permanently'
};

const placesService = new google.maps.places.PlacesService(document.createElement('div'));
const geocoder = new google.maps.Geocoder();

const query = (method: string, data: object) =>
  new Promise((resolve, reject) => {
    placesService[method](data, (response, status) => {
      if (status === 'OK') {
        resolve({ response, status });
      } else {
        reject({ response, status });
      }
    });
  });

const geocode = async (address: string) => {
  const data = await geocoder.geocode({ address });
  if (data?.results) {
    return {
      address: data.results[0].formatted_address,
      lat: data.results[0].geometry.location.lat(),
      lng: data.results[0].geometry.location.lng()
    };
  }
};

const getPharmacies = async (
  searchParams: {
    latitude: number;
    longitude: number;
    radius: number;
  },
  limit: number,
  offset: number,
  token: string
) => {
  graphQLClient.setHeader('x-photon-auth', token);

  try {
    const query: { pharmaciesByLocation: types.Pharmacy[] } = await graphQLClient.request(
      GET_PHARMACIES,
      {
        location: searchParams,
        limit,
        offset
      }
    );
    return query.pharmaciesByLocation;
  } catch (error) {
    if (
      error?.response?.errors &&
      error.response.errors[0].message === 'No pharmacies found near location'
    ) {
      const { message } = error.response.errors[0];
      console.log(message);
      return message;
    } else {
      console.error(JSON.stringify(error, undefined, 2));
      return error;
    }
  }
};

const enrichPharmacy = async (p: PharmacyType) => {
  p.enriched = true; // Set this at beginning in case we need to break early

  // Get place from Google
  const name = p.name;
  const address = p.address ? formatAddress(p.address) : '';
  const placeRequest = {
    query: name + ' ' + address,
    fields: ['place_id']
  };
  let placeId: string;
  let placeStatus: string;
  try {
    const { response, status }: any = await query('findPlaceFromQuery', placeRequest);
    placeId = response[0]?.place_id;
    placeStatus = status;
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2));
    console.log(error);
    return p;
  }

  if (placeStatus !== 'OK' || !placeId) {
    console.log('Could not find Google place');
    return p; // Break early if place not found
  }

  // Get place details from Google
  const detailsRequest = {
    placeId,
    fields: [
      'opening_hours',
      'utc_offset_minutes', // this gives us isOpen()
      'rating',
      'business_status'
    ]
  };
  let details: any;
  let detailsStatus: string;
  try {
    const { response, status }: any = await query('getDetails', detailsRequest);
    details = response;
    detailsStatus = status;
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2));
    console.log(error);
    return p;
  }

  if (detailsStatus !== 'OK') {
    console.log('Could not find place details');
    return p; // Break early if place details not found
  }

  p.businessStatus = details?.business_status || '';
  p.rating = details?.rating || undefined;

  const openForBusiness = details?.business_status === 'OPERATIONAL';
  if (!openForBusiness) {
    return p; // Don't need hours for non-operational business
  }

  const currentTime = dayjs().format('HHmm');
  const { is24Hr, opens, opensDay, closes } = getHours(
    details?.opening_hours?.periods,
    currentTime
  );
  p.hours = {
    open: details?.opening_hours?.isOpen() || false,
    is24Hr,
    opens,
    opensDay,
    closes
  };

  return p;
};

export const Pharmacy = () => {
  const order = useContext<Order>(OrderContext);

  const orgSettings =
    order?.organization?.id in settings ? settings[order.organization.id] : settings.default;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [preferredPharmacyId, setPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);
  const [fetchedPharmacies, setFetchedPharmacies] = useState([]);
  const [pharmacyOptions, setPharmacyOptions] = useState([]);
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [showingAllPharmacies, setShowingAllPharmacies] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<string>(
    order?.address ? formatAddress(order.address) : ''
  );

  const searchingInAustinTX = /Austin.*(?:TX|Texas)/.test(location);
  const featureIndiesWithinRadius = 3; // miles

  const toast = useToast();

  const reset = () => {
    setPharmacyOptions([]);
    setSelectedId('');
    setShowFooter(false);
    setShowingAllPharmacies(false);
  };

  const handleModalClose = ({
    loc = undefined,
    lat = undefined,
    lng = undefined
  }: {
    loc: string | undefined;
    lat: number | undefined;
    lng: number | undefined;
  }) => {
    // Reset view if search location changes
    if (loc && loc !== location) {
      if (lat && lng) {
        reset();
        setLocation(loc);
        setLatitude(lat);
        setLongitude(lng);
      }
    }

    setLocationModalOpen(false);
  };

  const initialize = async () => {
    setLoadingPharmacies(true);

    // Perform geocode to get lat/lng
    const { address, lat, lng } = await geocode(location);
    if (!address || !lat || !lng) {
      setLoadingPharmacies(false);
      return;
    }
    setLocation(address);
    setLatitude(lat);
    setLongitude(lng);

    // Get pharmacies from photon db
    const pharmaciesResult = await getPharmacies(
      {
        latitude: lat,
        longitude: lng,
        radius: 25
      },
      searchingInAustinTX ? 30 : 3,
      0,
      token
    );
    if (pharmaciesResult === 'No pharmacies found near location') {
      setLoadingPharmacies(false);
      toast({
        title: pharmaciesResult,
        position: 'top',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    if (!pharmaciesResult) {
      setLoadingPharmacies(false);
      return;
    }

    // Add new pharmacies
    const newPharmacies: PharmacyType[] = pharmaciesResult;

    // Prioritize indie pharmacies in Austin, TX
    if (searchingInAustinTX) {
      const sortIndiesFirst = (a: PharmacyType, b: PharmacyType) => {
        const featurePharmacy = (p: PharmacyType) =>
          AUSTIN_INDIE_PHARMACY_IDS.includes(p.id) && p.distance < featureIndiesWithinRadius;
        const featureA = featurePharmacy(a);
        const featureB = featurePharmacy(b);
        if (featureA && !featureB) {
          return -1; // a comes before b
        } else if (!featureA && featureB) {
          return 1; // b comes before a
        } else {
          return 0; // no change in order
        }
      };
      newPharmacies.sort(sortIndiesFirst);
    }

    setFetchedPharmacies(newPharmacies);

    // Enrich first 3 since we only show 3 at a time
    const enrichedPharmacies: PharmacyType[] = await Promise.all(
      pharmaciesResult.slice(0, 3).map(enrichPharmacy)
    );
    setPharmacyOptions(enrichedPharmacies);

    setLoadingPharmacies(false);
  };

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    const updatedOptions = [...pharmacyOptions];

    let totalNewEnriched = 0;

    // Enrich existing pharmacies if we already have them
    if (pharmacyOptions.length < fetchedPharmacies.length) {
      const startIndex = pharmacyOptions.length;
      for (let i = startIndex; i < startIndex + 3; i++) {
        if (totalNewEnriched === 3) break;
        const newPharmacy = fetchedPharmacies[i];
        await enrichPharmacy(newPharmacy);
        updatedOptions.push(newPharmacy);
        totalNewEnriched = ++totalNewEnriched; // Increment counter
      }
    }

    if (totalNewEnriched >= 3) {
      // Break early and return enriched pharmacies
      setPharmacyOptions([...updatedOptions]);
      setLoadingPharmacies(false);
      return;
    }

    const pharmaciesToGet = 3 - totalNewEnriched;
    const totalEnriched = updatedOptions.length;

    // Get pharmacies from photon db
    const pharmaciesResult = await getPharmacies(
      {
        latitude,
        longitude,
        radius: 25
      },
      pharmaciesToGet,
      totalEnriched,
      token
    );
    if (pharmaciesResult === 'No pharmacies found near location') {
      console.log('No pharmacies found near location');
      setLoadingPharmacies(false);
      toast({
        title: pharmaciesResult,
        position: 'top',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    if (!pharmaciesResult) {
      console.log('Could not find pharmacies.');
      setLoadingPharmacies(false);
      toast({
        title: 'Could not find pharmacies',
        description: 'Please refresh and try again',
        position: 'top',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setFetchedPharmacies([...fetchedPharmacies, ...pharmaciesResult]);

    const enrichedPharmacies: PharmacyType[] = await Promise.all(
      pharmaciesResult.map(enrichPharmacy)
    );

    setPharmacyOptions([...updatedOptions, ...enrichedPharmacies]);
    setLoadingPharmacies(false);
  };

  const handleSelect = (pharmacyId: string) => {
    setSelectedId(pharmacyId);
    setShowFooter(true);
  };

  const handleSubmit = async () => {
    if (!selectedId) {
      console.error('No selectedId. Cannot set pharmacy on order.');
      return;
    }

    try {
      setSubmitting(true);

      graphQLClient.setHeader('x-photon-auth', token);
      const results: any = await graphQLClient.request(SELECT_ORDER_PHARMACY, {
        orderId: order.id,
        pharmacyId: selectedId,
        patientId: order.patient.id
      });

      setTimeout(() => {
        if (results?.selectOrderPharmacy) {
          setSuccessfullySubmitted(true);
          setTimeout(() => {
            setShowFooter(false);

            let type: ExtendedFulfillmentType = types.FulfillmentType.PickUp;
            if (orgSettings.courierProviders.includes(selectedId)) {
              type = 'COURIER';
            } else if (orgSettings.mailOrderNavigateProviders.includes(selectedId)) {
              type = types.FulfillmentType.MailOrder;
            }

            navigate(`/status?orderId=${order.id}&token=${token}&type=${type}`);
          }, 1000);
        } else {
          toast({
            title: 'Unable to submit pharmacy selection',
            description: 'Please refresh and try again',
            position: 'top',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      setSubmitting(false);

      console.log(error);
      console.error(JSON.stringify(error, undefined, 2));

      if (error?.response?.errors) {
        if (AUTH_HEADER_ERRORS.includes(error.response.errors[0].extensions.code)) {
          navigate('/no-match');
        } else {
          setError(error.response.errors[0].message);
        }
      }
    }
  };

  const setPreferredPharmacy = async (patientId: string, pharmacyId: string) => {
    if (!pharmacyId) return;

    setSavingPreferred(true);

    graphQLClient.setHeader('x-photon-auth', token);

    try {
      const result: { setPreferredPharmacy: boolean } = await graphQLClient.request(
        SET_PREFERRED_PHARMACY,
        {
          patientId,
          pharmacyId
        }
      );

      setTimeout(() => {
        if (result?.setPreferredPharmacy) {
          setSavingPreferred(false);
          setPreferredPharmacyId(pharmacyId);

          toast({
            title: 'Set preferred pharmacy',
            position: 'top',
            status: 'success',
            duration: 2000,
            isClosable: true
          });
        } else {
          setSavingPreferred(false);
          toast({
            title: 'Unable to set preferred pharmacy',
            description: 'Please refresh and try again',
            position: 'top',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      }, 750);
    } catch (error) {
      setSavingPreferred(false);

      console.error(JSON.stringify(error, undefined, 2));
      console.log(error);

      if (error?.response?.errors) {
        setError(error.response.errors[0].message);
      }
    }
  };

  const handleSetPreferredPharmacy = (id: string) => {
    setPreferredPharmacy(order.patient.id, id);
  };

  useEffect(() => {
    if (location) {
      initialize();
    }
  }, [location]);

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // Courier option limited to MoPed in Austin, TX
  const patientAddressInAustinTX =
    order?.address?.city === 'Austin' && order?.address?.state === 'TX';
  const enableCourier = searchingInAustinTX && patientAddressInAustinTX && orgSettings.courier;

  return (
    <Box>
      <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />
      <Helmet>
        <title>{t.pharmacy.title}</title>
      </Helmet>

      <Nav header={order.organization.name} orgId={order.organization.id} />

      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={6} align="span" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.pharmacy.heading}
            </Heading>
            <Text>{t.pharmacy.subheading}</Text>
          </VStack>

          <HStack justify="space-between" w="full">
            {location ? (
              <VStack w="full" align="start" spacing={1}>
                <Text size="sm">{t.pharmacy.showing}</Text>
                <Link
                  onClick={() => setLocationModalOpen(true)}
                  display="inline"
                  color="brandLink"
                  fontWeight="medium"
                  size="sm"
                >
                  <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
                  {location}
                </Link>
              </VStack>
            ) : (
              <Button variant="brand" onClick={() => setLocationModalOpen(true)}>
                {t.pharmacy.setLocation}
              </Button>
            )}
          </HStack>

          {location ? (
            <VStack spacing={9} align="stretch">
              {enableCourier ? (
                <BrandedOptions
                  type="COURIER"
                  options={orgSettings.courierProviders}
                  location={location}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  patientAddress={formatAddress(order?.address)}
                />
              ) : null}
              {orgSettings.mailOrderNavigate ? (
                <BrandedOptions
                  type={types.FulfillmentType.MailOrder}
                  options={orgSettings.mailOrderNavigateProviders}
                  location={location}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  patientAddress={formatAddress(order?.address)}
                />
              ) : null}

              <PickupOptions
                pharmacies={pharmacyOptions}
                preferredPharmacy={preferredPharmacyId}
                savingPreferred={savingPreferred}
                selectedId={selectedId}
                handleSelect={handleSelect}
                handleShowMore={handleShowMore}
                handleSetPreferred={handleSetPreferredPharmacy}
                loadingMore={loadingPharmacies}
                showingAllPharmacies={showingAllPharmacies}
                courierEnabled={enableCourier || orgSettings.mailOrderNavigate}
              />
            </VStack>
          ) : null}
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            w="full"
            variant={successfullySubmitted ? undefined : 'brand'}
            colorScheme={successfullySubmitted ? 'green' : undefined}
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleSubmit : undefined}
            isLoading={submitting}
          >
            {successfullySubmitted ? t.pharmacy.thankYou : t.pharmacy.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
