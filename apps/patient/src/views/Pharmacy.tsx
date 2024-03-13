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
import { formatAddress, preparePharmacyHours } from '../utils/general';
import { ExtendedFulfillmentType, Pharmacy as PharmacyWithHours } from '../utils/models';
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
import {
  geocode,
  getPharmacies,
  rerouteOrder,
  setOrderPharmacy,
  setPreferredPharmacy,
  triggerDemoNotification
} from '../api';
import { demoPharmacies } from '../data/demoPharmacies';
import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import costcoLogo from '../assets/costco_small.png';
import { isGLP } from '../utils/isGLP';

const GET_PHARMACIES_COUNT = 5; // Number of pharmacies to fetch at a time
const PHARMACY_SEARCH_RADIUS_IN_MILES = 25;

export const Pharmacy = () => {
  const { order, flattenedFills, setOrder } = useOrderContext();

  const orgSettings = getSettings(order.organization.id);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isReroute = searchParams.get('reroute');
  const pharmacyClosed = searchParams.get('pharmacyClosed');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');
  const [preferredPharmacyId, setPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);
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
  // auto select the "open now" filter if the pharmacy is closed
  const [enableOpenNow, setEnableOpenNow] = useState(!!pharmacyClosed);
  const [enable24Hr, setEnable24Hr] = useState(false);

  const toast = useToast();

  const isMultiRx = flattenedFills.length > 1;

  const enableMailOrder = !isDemo && orgSettings.mailOrderNavigate;
  const enableTopRankedCostco = !isDemo && orgSettings.topRankedCostco;
  const containsGLP = flattenedFills.some((fill) => isGLP(fill.treatment.name));

  const heading = isReroute ? t.changePharmacy : t.selectAPharmacy;
  const subheading = isReroute
    ? t.sendToNew(isMultiRx, order.pharmacy.name)
    : t.sendToSelected(isMultiRx);

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

  const initializeDemo = () => {
    // Mock geocode data
    setLocation('201 N 8th St, Brooklyn, NY 11211');
    setLatitude(40.717484);
    setLongitude(-73.955662397568);

    let pharmacies =
      enableOpenNow || enable24Hr
        ? demoPharmacies.filter((p) => (enableOpenNow && p.isOpen) || (enable24Hr && p.is24Hr))
        : demoPharmacies;

    pharmacies = pharmacies.slice(0, 5);

    setPharmacyOptions(pharmacies);

    if (pharmacies.length < 5) {
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
    let topRankedPharmacy: EnrichedPharmacy[] = [];
    let pharmaciesResult: EnrichedPharmacy[];

    // check if top ranked costco is enabled and there are GLP treatments
    try {
      if (enableTopRankedCostco && containsGLP) {
        topRankedPharmacy = await getPharmacies({
          searchParams: {
            latitude: lat,
            longitude: lng,
            radius: PHARMACY_SEARCH_RADIUS_IN_MILES
          },
          limit: 1,
          offset: 0,
          isOpenNow: enableOpenNow,
          is24hr: enable24Hr,
          name: 'costco'
        });
        if (topRankedPharmacy.length > 0) {
          // add a logo to the only item in the array
          topRankedPharmacy[0].logo = costcoLogo;
        }
      }
    } catch {
      // no costcos found :(
      pharmaciesResult = [];
    }

    // get the rest of the local pickup pharmacies
    try {
      pharmaciesResult = await getPharmacies({
        searchParams: {
          latitude: lat,
          longitude: lng,
          radius: PHARMACY_SEARCH_RADIUS_IN_MILES
        },
        limit: GET_PHARMACIES_COUNT,
        offset: 0,
        isOpenNow: enableOpenNow,
        is24hr: enable24Hr
      });
      // prepend top ranked pharmacy to the list
      pharmaciesResult = [...topRankedPharmacy, ...pharmaciesResult];
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

    const preparedPharmacies: PharmacyWithHours[] = pharmaciesResult.map((p) =>
      preparePharmacyHours(p)
    );
    setPharmacyOptions(preparedPharmacies);

    setLoadingPharmacies(false);
  };

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    if (isDemo) {
      const pharmacies =
        enableOpenNow || enable24Hr
          ? demoPharmacies.filter((p) => (enableOpenNow && p.isOpen) || (enable24Hr && p.is24Hr))
          : demoPharmacies;

      const newPharmacyOptions = pharmacies.slice(
        pharmacyOptions.length,
        pharmacyOptions.length + GET_PHARMACIES_COUNT
      );
      const totalPharmacyOptions = [...pharmacyOptions, ...newPharmacyOptions];
      setPharmacyOptions(totalPharmacyOptions);
      setLoadingPharmacies(false);

      if (totalPharmacyOptions.length === pharmacies.length) {
        setShowingAllPharmacies(true);
      }

      return;
    }

    let pharmaciesResult: EnrichedPharmacy[];
    try {
      pharmaciesResult = await getPharmacies({
        searchParams: {
          latitude,
          longitude,
          radius: PHARMACY_SEARCH_RADIUS_IN_MILES
        },
        limit: GET_PHARMACIES_COUNT,
        offset: pharmacyOptions.length,
        isOpenNow: enableOpenNow,
        is24hr: enable24Hr
      });
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

    const preparedPharmacies: PharmacyWithHours[] = pharmaciesResult.map(preparePharmacyHours);
    setPharmacyOptions([...pharmacyOptions, ...preparedPharmacies]);

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

          // Add selected pharmacy to order context so /status shows pharmacy on render
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
        : await setOrderPharmacy(order.id, selectedId, order.readyBy, order.readyByTime);

      setTimeout(() => {
        if (result) {
          setSuccessfullySubmitted(true);
          setTimeout(() => {
            setShowFooter(false);

            // Fudge it so that we can show the pharmacy card on initial load of the
            // status view for all types. On my christmas list for 2024 is better
            // fulfillment types on pharmacies.
            let type: ExtendedFulfillmentType = types.FulfillmentType.PickUp;
            let selectedPharmacy = null;
            if (selectedId in capsulePharmacyIdLookup) {
              type = 'COURIER';
              selectedPharmacy = { id: selectedId, name: 'Capsule Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_ALTO_PHARMACY_ID) {
              type = 'COURIER';
              selectedPharmacy = { id: selectedId, name: 'Alto Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_AMAZON_PHARMACY_ID) {
              type = types.FulfillmentType.MailOrder;
              selectedPharmacy = { id: selectedId, name: 'Amazon Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_COSTCO_PHARMACY_ID) {
              type = types.FulfillmentType.MailOrder;
              selectedPharmacy = { id: selectedId, name: 'Costco Pharmacy' };
            } else {
              type = types.FulfillmentType.PickUp;
              selectedPharmacy = pharmacyOptions.find((p) => p.id === selectedId);
            }

            setOrder({
              ...order,
              // Add selected pharmacy to order context so /status shows pharmacy on render
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

  return (
    <Box>
      <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />
      <Helmet>
        <title>{t.selectAPharmacy}</title>
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
                <Text size="sm">{t.showingLabel}</Text>
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
                {t.setLoc}
              </Button>
            )}
          </HStack>

          {location ? (
            <VStack spacing={9} align="stretch">
              {enableMailOrder ? (
                <BrandedOptions
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
                courierEnabled={enableMailOrder}
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
            {successfullySubmitted ? t.thankYou : t.selectPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
