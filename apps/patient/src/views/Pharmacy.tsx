import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
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
import { types } from '@photonhealth/sdk';
import * as TOAST_CONFIG from '../configs/toast';
import { formatAddress, addRatingsAndHours } from '../utils/general';
import { ExtendedFulfillmentType, Order } from '../utils/models';
import { text as t } from '../utils/text';
import { FixedFooter } from '../components/FixedFooter';
import { Nav } from '../components/Nav';
import { PoweredBy } from '../components/PoweredBy';
import { LocationModal } from '../components/LocationModal';
import { PickupOptions } from '../components/PickupOptions';
import { BrandedOptions } from '../components/BrandedOptions';
import { OrderContext } from './Main';
import { getSettings } from '@client/settings';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { FEATURED_PHARMACIES } from '../data/featuredPharmacies';
import {
  geocode,
  getPharmacies,
  rerouteOrder,
  selectOrderPharmacy,
  setPreferredPharmacy
} from '../api';

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

export const UNOPEN_BUSINESS_STATUS_MAP = {
  CLOSED_TEMPORARILY: 'Closed Temporarily',
  CLOSED_PERMANENTLY: 'Closed Permanently'
};
const FEATURE_INDIES_WITHIN_RADIUS = 3; // miles
const FEATURED_PHARMACIES_LIMIT = 2;
const MAX_ENRICHMENT = 5; // Maximum number of pharmacies to enrich at a time

const sortIndiePharmaciesFirst = (list: EnrichedPharmacy[], distance: number, limit: number) => {
  const featuredPharmacies = list
    .filter((p: EnrichedPharmacy) => FEATURED_PHARMACIES.includes(p.id) && p.distance < distance)
    .slice(0, limit);
  const otherPharmacies = list.filter(
    (p: EnrichedPharmacy) => !featuredPharmacies.some((f) => f.id === p.id)
  );
  return featuredPharmacies.concat(otherPharmacies);
};

export const Pharmacy = () => {
  const order = useContext<Order>(OrderContext);

  const orgSettings =
    order?.organization?.id in settings ? settings[order.organization.id] : settings.default;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isReroute = searchParams.get('reroute');

  const [preferredPharmacyId, setPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);
  const [initialPharmacies, setInitialPharmacies] = useState<EnrichedPharmacy[]>([]);
  const [pharmacyOptions, setPharmacyOptions] = useState([]);
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);
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
    setInitialPharmacies([]);
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
      toast({
        title: 'Invalid location',
        description: 'Please update your location and try again',
        ...TOAST_CONFIG.ERROR
      });

      setShowingAllPharmacies(true);

      console.error('Geocoding error:', error);

      return;
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
      const noPharmaciesErr = 'No pharmacies found near location';
      const genericError = 'Unable to get pharmacies';
      const toastMsg = error?.message === noPharmaciesErr ? noPharmaciesErr : genericError;
      toast({
        title: toastMsg,
        ...TOAST_CONFIG.WARNING
      });

      setLoadingPharmacies(false);

      console.error(JSON.stringify(error, undefined, 2));
      console.log(error);

      return;
    }

    // Sort initial list of pharmacies
    const newPharmacies: EnrichedPharmacy[] = sortIndiePharmaciesFirst(
      pharmaciesResult,
      FEATURE_INDIES_WITHIN_RADIUS,
      FEATURED_PHARMACIES_LIMIT
    );

    // Save in case we fetched more than we initially show
    setInitialPharmacies(newPharmacies);

    // We only show add a few at a time, so just enrich the first group of pharmacies
    const enrichedPharmacies: EnrichedPharmacy[] = await Promise.all(
      newPharmacies.slice(0, MAX_ENRICHMENT).map(addRatingsAndHours)
    );
    setPharmacyOptions(enrichedPharmacies);

    setLoadingPharmacies(false);
  };

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    /**
     * Initially we fetched a list of pharmacies from our db, if some
     * of those haven't received ratings/hours, enrich those first
     *  */
    const newPharmacies: EnrichedPharmacy[] = await Promise.all(
      initialPharmacies
        .slice(pharmacyOptions.length, pharmacyOptions.length + MAX_ENRICHMENT)
        .map(addRatingsAndHours)
    );

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
          title: 'No pharmacies found near location',
          ...TOAST_CONFIG.WARNING
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

    setSubmitting(true);

    try {
      const result = isReroute
        ? await rerouteOrder(order.id, selectedId, order.patient.id, token)
        : await selectOrderPharmacy(order.id, selectedId, order.patient.id, token);

      setTimeout(() => {
        if (result) {
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
            title: isReroute ? 'Unable to reroute order' : 'Unable to submit pharmacy selection',
            description: 'Please refresh and try again',
            ...TOAST_CONFIG.ERROR
          });
        }
      }, 1000);
      setSubmitting(false);
    } catch (error) {
      toast({
        title: isReroute ? 'Unable to reroute order' : 'Unable to submit pharmacy selection',
        description: 'Please refresh and try again',
        ...TOAST_CONFIG.ERROR
      });

      setSubmitting(false);

      console.log(error);
      console.error(JSON.stringify(error, undefined, 2));
    }
  };

  const handleSetPreferredPharmacy = async (pharmacyId: string) => {
    if (!pharmacyId) return;

    setSavingPreferred(true);

    try {
      const result: boolean = await setPreferredPharmacy(order.patient.id, pharmacyId, token);
      setTimeout(() => {
        if (result) {
          setPreferredPharmacyId(pharmacyId);
          toast({
            title: 'Set preferred pharmacy',
            ...TOAST_CONFIG.SUCCESS
          });
        } else {
          toast({
            title: 'Unable to set preferred pharmacy',
            description: 'Please refresh and try again',
            ...TOAST_CONFIG.ERROR
          });
        }
        setSavingPreferred(false);
      }, 750);
    } catch (error) {
      toast({
        title: 'Unable to set preferred pharmacy',
        description: 'Please refresh and try again',
        ...TOAST_CONFIG.ERROR
      });

      setSavingPreferred(false);

      console.error(JSON.stringify(error, undefined, 2));
      console.log(error);
    }
  };

  useEffect(() => {
    if (location) {
      initialize();
    }
  }, [location]);

  const patientAddressInAustinTX =
    order?.address?.city === 'Austin' && order?.address?.state === 'TX';
  const enableCourier = searchingInAustinTX && patientAddressInAustinTX && orgSettings.courier; // Courier limited to MoPed in Austin, TX
  const heading = isReroute ? t.pharmacy.heading.reroute : t.pharmacy.heading.original;
  const subheading = isReroute
    ? t.pharmacy.subheading.reroute(order.pharmacy.name)
    : t.pharmacy.subheading.original;

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
              {heading}
            </Heading>
            <Text>{subheading}</Text>
          </VStack>

          <HStack justify="space-between" w="full">
            {location ? (
              <VStack w="full" align="start" spacing={1}>
                <Text size="sm">{t.pharmacy.showing}</Text>
                <Link
                  onClick={() => setLocationModalOpen(true)}
                  display="inline"
                  color="link"
                  fontWeight="medium"
                  size="sm"
                  data-dd-privacy="mask"
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
