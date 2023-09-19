import { useState, useEffect } from 'react';
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
import { formatAddress, enrichPharmacy } from '../utils/general';
import { ExtendedFulfillmentType } from '../utils/models';
import { text as t } from '../utils/text';
import { FixedFooter } from '../components/FixedFooter';
import { Nav } from '../components/Nav';
import { PoweredBy } from '../components/PoweredBy';
import { LocationModal } from '../components/LocationModal';
import { PickupOptions } from '../components/PickupOptions';
import { BrandedOptions } from '../components/BrandedOptions';
import { useOrderContext } from './Main';
import { getSettings } from '@client/settings';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { FEATURED_PHARMACIES } from '../data/featuredPharmacies';
import {
  geocode,
  getPharmacies,
  rerouteOrder,
  selectOrderPharmacy,
  setPreferredPharmacy,
  triggerDemoNotification
} from '../api';
import { demoPharmacies } from '../data/demoPharmacies';

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
  const { order, setOrder } = useOrderContext();

  const orgSettings =
    order?.organization?.id in settings ? settings[order.organization.id] : settings.default;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isReroute = searchParams.get('reroute');
  const isDemo = searchParams.get('demo');

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

  const initializeDemo = () => {
    // Set geocode data
    setLocation('201 N 8th St, Brooklyn, NY 11211');
    setLatitude(40.717484);
    setLongitude(-73.955662397568);

    setInitialPharmacies(demoPharmacies);
    setPharmacyOptions(demoPharmacies.slice(0, 5));
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
        description: 'Please update your location and try again.',
        ...TOAST_CONFIG.ERROR
      });

      setShowingAllPharmacies(true);

      console.log('Geocoding error:', error);

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
        0
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

      console.log('Get pharmacies error: ', error);

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
      newPharmacies.slice(0, MAX_ENRICHMENT).map((p) => enrichPharmacy(p, true))
    );
    setPharmacyOptions(enrichedPharmacies);

    setLoadingPharmacies(false);
  };

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    if (isDemo) {
      const newOps = demoPharmacies.slice(
        pharmacyOptions.length,
        pharmacyOptions.length + MAX_ENRICHMENT
      );
      const totalOps = [...pharmacyOptions, ...newOps];
      setPharmacyOptions(totalOps);
      setLoadingPharmacies(false);

      if (totalOps.length === demoPharmacies.length) {
        setShowingAllPharmacies(true);
      }

      return;
    }

    /**
     * Initially we fetched a list of pharmacies from our db, if some
     * of those haven't received ratings/hours, enrich those first
     *  */
    const newPharmacies: EnrichedPharmacy[] = await Promise.all(
      initialPharmacies
        .slice(pharmacyOptions.length, pharmacyOptions.length + MAX_ENRICHMENT)
        .map((p) => enrichPharmacy(p, true))
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
        totalEnriched
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
        console.log(error);
      }
    }

    const enrichedPharmacies: EnrichedPharmacy[] = await Promise.all(
      pharmaciesResult.map((p) => enrichPharmacy(p, true))
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

    if (isDemo) {
      setTimeout(() => {
        setSuccessfullySubmitted(true);
        setTimeout(async () => {
          setShowFooter(false);

          // Store selected pharmacy for smooth transition to /status
          const selectedPharmacy = pharmacyOptions.find((p) => p.id === selectedId);
          setOrder({
            ...order,
            pharmacy: selectedPharmacy
          });

          // Send sms to demo participant
          await triggerDemoNotification(
            '5416029101',
            'photon:order:placed',
            selectedPharmacy.name,
            formatAddress(selectedPharmacy.address)
          );

          navigate(`/status?demo=true`);
        }, 1000);
        setSubmitting(false);
      }, 1000);

      return;
    }

    try {
      const result = isReroute
        ? await rerouteOrder(order.id, selectedId, order.patient.id)
        : await selectOrderPharmacy(order.id, selectedId, order.patient.id);

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

            // Update the order context so /status shows the newly selected pharmacy
            const selectedPharmacy = pharmacyOptions.find((p) => p.id === selectedId);
            setOrder({
              ...order,
              pharmacy: selectedPharmacy
            });

            navigate(`/status?orderId=${order.id}&token=${token}&type=${type}`);
          }, 1000);
        } else {
          toast({
            title: isReroute ? 'Unable to reroute order' : 'Unable to submit pharmacy selection',
            description: 'Please refresh and try again',
            ...TOAST_CONFIG.ERROR
          });
        }
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      toast({
        title: isReroute ? 'Unable to reroute order' : 'Unable to submit pharmacy selection',
        description: 'Please refresh and try again',
        ...TOAST_CONFIG.ERROR
      });

      setSubmitting(false);

      console.error(JSON.stringify(error, undefined, 2));
    }
  };

  const handleSetPreferredPharmacy = async (pharmacyId: string) => {
    if (!pharmacyId) return;

    setSavingPreferred(true);

    // Handle stp demo
    if (isDemo) {
      setTimeout(() => {
        setPreferredPharmacyId(pharmacyId);
        toast({
          title: 'Set preferred pharmacy',
          ...TOAST_CONFIG.SUCCESS
        });
        setSavingPreferred(false);
      }, 750);
      return;
    }

    try {
      const result: boolean = await setPreferredPharmacy(order.patient.id, pharmacyId);
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
    }
  };

  useEffect(() => {
    if (isDemo) {
      initializeDemo();
    } else {
      if (location) {
        initialize();
      }
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
