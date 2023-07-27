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
import { types } from '@photonhealth/sdk';
import { formatAddress, getHours } from '../utils/general';
import { ExtendedFulfillmentType, Order } from '../utils/models';
import t from '../utils/text.json';
import { SELECT_ORDER_PHARMACY, SET_PREFERRED_PHARMACY } from '../utils/graphql';
import { graphQLClient } from '../configs/graphqlClient';
import { FixedFooter } from '../components/FixedFooter';
import { Nav } from '../components/Nav';
import { PoweredBy } from '../components/PoweredBy';
import { LocationModal } from '../components/LocationModal';
import { PickupOptions } from '../components/PickupOptions';
import { BrandedOptions } from '../components/BrandedOptions';
import { OrderContext } from './Main';
import { getSettings } from '@client/settings';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { FEATURED_PHARMACIES } from '../utils/featuredPharmacies';
import { getPharmacies } from '../api/internal';
import { geocode } from '../api/external';

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

export const UNOPEN_BUSINESS_STATUS_MAP = {
  CLOSED_TEMPORARILY: 'Closed Temporarily',
  CLOSED_PERMANENTLY: 'Closed Permanently'
};
const FEATURE_INDIES_WITHIN_RADIUS = 3; // miles
const FEATURED_PHARMACIES_LIMIT = 2;

const placesService = new google.maps.places.PlacesService(document.createElement('div'));
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

const sortIndiePharmaciesFirst = (list: EnrichedPharmacy[], distance: number, limit: number) => {
  const featuredPharmacies = list
    .filter((p: EnrichedPharmacy) => FEATURED_PHARMACIES.includes(p.id) && p.distance < distance)
    .slice(0, limit);
  const otherPharmacies = list.filter(
    (p: EnrichedPharmacy) => !featuredPharmacies.some((f) => f.id === p.id)
  );
  return featuredPharmacies.concat(otherPharmacies);
};

/**
 * Adds ratings and hours to the Pharmacy object using Google Place API.
 * If the details are not found or an error occurs during the process, the original Pharmacy object is returned.
 *
 * @param {Pharmacy} p - The Pharmacy object to enrich with additional details.
 * @returns {Promise<Pharmacy>} - A Promise that resolves to the enriched Pharmacy object.
 */
export const addRatingsAndHours = async (p: EnrichedPharmacy) => {
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
    return p; // Break early if place isn't found
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

export const Reroute = () => {
  const order = useContext<Order>(OrderContext);

  const orgSettings =
    order?.organization?.id in settings ? settings[order.organization.id] : settings.default;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [preferredPharmacyId, setPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);
  const [initialPharmacies, setInitialPharmacies] = useState<EnrichedPharmacy[]>([]);
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
    let locationData: { address: string; lat: number; lng: number };
    try {
      locationData = await geocode(location);
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    const { address, lat, lng } = locationData;
    if (!address || !lat || !lng) {
      setLoadingPharmacies(false);
      return;
    }

    setLocation(address);
    setLatitude(lat);
    setLongitude(lng);

    // Get pharmacies from photon db
    let pharmaciesResult: types.Pharmacy[];
    try {
      // Get pharmacies from photon db
      pharmaciesResult = await getPharmacies(
        {
          latitude: lat,
          longitude: lng,
          radius: 25
        },
        30, // Set high to ensure indie's are found. Request time increase is minimal.
        0,
        token
      );
      if (!pharmaciesResult || pharmaciesResult.length === 0) {
        setLoadingPharmacies(false);
        return;
      }
    } catch (error) {
      if (error.message === 'No pharmacies found near location') {
        setLoadingPharmacies(false);
        toast({
          title: error.message,
          position: 'top',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
        return;
      } else {
        console.error(JSON.stringify(error, undefined, 2));
        console.log(error);
      }
    }

    // Sort initial list of pharmacies
    const newPharmacies: EnrichedPharmacy[] = sortIndiePharmaciesFirst(
      pharmaciesResult,
      FEATURE_INDIES_WITHIN_RADIUS,
      FEATURED_PHARMACIES_LIMIT
    );

    // Save in case we fetched more than we initially show
    setInitialPharmacies(newPharmacies);

    // We only show 3 at a time, so just enrich the first 3
    const enrichedPharmacies: EnrichedPharmacy[] = await Promise.all(
      newPharmacies.slice(0, 3).map(addRatingsAndHours)
    );
    setPharmacyOptions(enrichedPharmacies);

    setLoadingPharmacies(false);
  };

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    const newPharmacies = [];

    /**
     * Initially we fetched a list of pharmacies from our db, if some
     * of those haven't received ratings/hours, enrich those first
     *  */
    const MAX_ENRICHMENT = 3; // Maximum number of pharmacies to enrich at a time
    const pharmaciesToEnrich = initialPharmacies.slice(
      pharmacyOptions.length,
      pharmacyOptions.length + MAX_ENRICHMENT
    );

    for (const newPharmacy of pharmaciesToEnrich) {
      await addRatingsAndHours(newPharmacy);
      newPharmacies.push(newPharmacy);
    }

    if (newPharmacies.length === MAX_ENRICHMENT) {
      // Break early and return enriched pharmacies
      setPharmacyOptions([...pharmacyOptions, ...newPharmacies]);
      setLoadingPharmacies(false);
      return;
    }

    const pharmaciesToGet = MAX_ENRICHMENT - newPharmacies.length;
    const totalEnriched = pharmacyOptions.length + newPharmacies.length;

    // Get pharmacies from our db
    let pharmaciesResult: types.Pharmacy[];
    try {
      pharmaciesResult = await getPharmacies(
        {
          latitude,
          longitude,
          radius: 25
        },
        pharmaciesToGet,
        totalEnriched,
        token
      );
      if (!pharmaciesResult || pharmaciesResult.length === 0) {
        setLoadingPharmacies(false);
        return;
      }
    } catch (error) {
      if (error.message === 'No pharmacies found near location') {
        setLoadingPharmacies(false);
        toast({
          title: error.message,
          position: 'top',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      } else {
        console.error(JSON.stringify(error, undefined, 2));
        console.log(error);
      }
    }

    const enrichedPharmacies: EnrichedPharmacy[] = await Promise.all(
      pharmaciesResult.map(addRatingsAndHours)
    );
    newPharmacies.push(...enrichedPharmacies);

    setPharmacyOptions([...pharmacyOptions, ...newPharmacies]);
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