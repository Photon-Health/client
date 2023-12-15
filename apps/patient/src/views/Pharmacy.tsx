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
import { formatAddress, preparePharmacy } from '../utils/general';
import { ExtendedFulfillmentType } from '../utils/models';
import { text as t } from '../utils/text';
import {
  BrandedOptions,
  FixedFooter,
  LocationModal,
  Nav,
  PickupOptions,
  PoweredBy
} from '../components';
import { useOrderContext } from './Main';
import { getSettings } from '@client/settings';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import {
  geocode,
  getPharmacies,
  rerouteOrder,
  selectOrderPharmacy,
  setPreferredPharmacy,
  triggerDemoNotification
} from '../api';
import { demoPharmacies } from '../data/demoPharmacies';
import capsuleZipcodeLookup from '../data/capsuleZipcodes.json';
import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

const MAX_ENRICHMENT_COUNT = 5; // Maximum number of pharmacies to enrich at a time
const INITIAL_PHARMACY_COUNT = 5;
const PHARMACY_SEARCH_RADIUS_IN_MILES = 25;

export const Pharmacy = () => {
  const { order, setOrder } = useOrderContext();

  const orgSettings =
    order?.organization?.id in settings ? settings[order.organization.id] : settings.default;

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isReroute = searchParams.get('reroute');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

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
  const [enableOpenNow, setEnableOpenNow] = useState(false);
  const [enable24Hr, setEnable24Hr] = useState(false);

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
    // Mock geocode data
    setLocation('201 N 8th St, Brooklyn, NY 11211');
    setLatitude(40.717484);
    setLongitude(-73.955662397568);

    const filteredPharmacies =
      enableOpenNow || enable24Hr
        ? demoPharmacies.filter((p) => (enableOpenNow && p.isOpen) || (enable24Hr && p.is24Hr))
        : demoPharmacies;

    setInitialPharmacies(filteredPharmacies);
    setPharmacyOptions(filteredPharmacies.slice(0, 5));

    if (filteredPharmacies.length < 5) {
      setShowingAllPharmacies(true);
    }
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
      pharmaciesResult = await getPharmacies(
        {
          latitude: lat,
          longitude: lng,
          radius: PHARMACY_SEARCH_RADIUS_IN_MILES
        },
        INITIAL_PHARMACY_COUNT,
        0,
        enableOpenNow,
        enable24Hr
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

    // Save in case we fetched more than we initially show
    setInitialPharmacies(pharmaciesResult);

    // We only show add a few at a time, so just enrich the first group of pharmacies
    const preparedPharmacies: EnrichedPharmacy[] = await Promise.all(
      pharmaciesResult.slice(0, MAX_ENRICHMENT_COUNT).map((p) => preparePharmacy(p, true))
    );
    setPharmacyOptions(preparedPharmacies);

    setLoadingPharmacies(false);
  };

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    if (isDemo) {
      const newPharmacyOptions = initialPharmacies.slice(
        pharmacyOptions.length,
        pharmacyOptions.length + MAX_ENRICHMENT_COUNT
      );
      const totalPharmacyOptions = [...pharmacyOptions, ...newPharmacyOptions];
      setPharmacyOptions(totalPharmacyOptions);
      setLoadingPharmacies(false);

      if (totalPharmacyOptions.length === initialPharmacies.length) {
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
        .slice(pharmacyOptions.length, pharmacyOptions.length + MAX_ENRICHMENT_COUNT)
        .map((p) => preparePharmacy(p, true))
    );

    if (newPharmacies.length === MAX_ENRICHMENT_COUNT) {
      // Break early and return enriched pharmacies
      setPharmacyOptions([...pharmacyOptions, ...newPharmacies]);
      setLoadingPharmacies(false);
      return;
    }

    const pharmaciesToGet = MAX_ENRICHMENT_COUNT - newPharmacies.length;
    const totalEnriched = pharmacyOptions.length + newPharmacies.length;

    // Get pharmacies from our db
    let pharmaciesResult: types.Pharmacy[];
    try {
      pharmaciesResult = await getPharmacies(
        {
          latitude,
          longitude,
          radius: PHARMACY_SEARCH_RADIUS_IN_MILES
        },
        pharmaciesToGet,
        totalEnriched,
        enableOpenNow,
        enable24Hr
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
        setShowingAllPharmacies(true);
      } else {
        console.log(error);
      }
    }

    const preparedPharmacies: EnrichedPharmacy[] = await Promise.all(
      pharmaciesResult.map((p) => preparePharmacy(p, true))
    );
    newPharmacies.push(...preparedPharmacies);

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
        setTimeout(() => {
          setShowFooter(false);

          // Store selected pharmacy for smooth transition to /status
          const selectedPharmacy = pharmacyOptions.find((p) => p.id === selectedId);
          setOrder({
            ...order,
            pharmacy: selectedPharmacy
          });

          // Send order placed sms to demo participant
          triggerDemoNotification(
            phone,
            'photon:order:placed',
            selectedPharmacy.name,
            formatAddress(selectedPharmacy.address)
          );

          navigate(`/status?demo=true&phone=${phone}`);
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
            if (selectedId in capsulePharmacyIdLookup) {
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

  useEffect(() => {
    reset();
    if (isDemo) {
      initializeDemo();
    } else {
      initialize();
    }
  }, [enableOpenNow, enable24Hr]);

  const isCapsuleTerritory = order?.address?.postalCode in capsuleZipcodeLookup;
  const enableCourier = !isDemo && isCapsuleTerritory && orgSettings.enableCourierNavigate;
  const enableMailOrder = !isDemo && orgSettings.mailOrderNavigate;

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

      <Nav />

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
                  options={[capsuleZipcodeLookup[order?.address?.postalCode].pharmacyId]}
                  location={location}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  patientAddress={formatAddress(order?.address)}
                />
              ) : null}
              {enableMailOrder ? (
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
                courierEnabled={enableCourier || enableMailOrder}
                enableOpenNow={enableOpenNow}
                enable24Hr={enable24Hr}
                setEnableOpenNow={setEnableOpenNow}
                setEnable24Hr={setEnable24Hr}
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
