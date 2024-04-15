/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useEffect, useCallback, useMemo } from 'react';
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
import queryString from 'query-string';
import { types } from '@photonhealth/sdk';
import * as TOAST_CONFIG from '../configs/toast';
import { formatAddress, preparePharmacy } from '../utils/general';
import { ExtendedFulfillmentType } from '../utils/models';
import { text as t } from '../utils/text';
import {
  BrandedOptions,
  FixedFooter,
  LocationModal,
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
import { isGLP } from '../utils/isGLP';

const GET_PHARMACIES_COUNT = 5; // Number of pharmacies to fetch at a time
const PHARMACY_SEARCH_RADIUS_IN_MILES = 25;

export const Pharmacy = () => {
  const { order, flattenedFills, setOrder, isDemo } = useOrderContext();

  const orgSettings = getSettings(order?.organization.id);

  const navigate = useNavigate();
  const toast = useToast();

  // search params
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isReroute = searchParams.get('reroute');
  const openNow = searchParams.get('openNow');
  const phone = searchParams.get('phone');

  // preferred pharmacy
  const [preferredPharmacyId, setPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);

  // View state
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);

  // selection state
  const [selectedId, setSelectedId] = useState<string>('');

  // Submitting state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  // loading state
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [showingAllPharmacies, setShowingAllPharmacies] = useState<boolean>(false);

  // Address state
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [location, setLocation] = useState(
    order?.address ? formatAddress(order.address) : undefined
  );
  const [cleanAddress, setCleanAddress] = useState<string>();
  const [loadingLocation, setLoadingLocation] = useState(false);

  // loading state
  const isLoading = loadingLocation || loadingPharmacies;

  // filters
  const [enableOpenNow, setEnableOpenNow] = useState(
    openNow !== null ? !!openNow : order?.readyBy === 'Urgent'
  );
  const [enable24Hr, setEnable24Hr] = useState(order?.readyBy === 'After hours');

  // pagination
  const [pageOffset, setPageOffset] = useState(0);

  const isMultiRx = flattenedFills.length > 1;

  const enableMailOrder = !isDemo && orgSettings.mailOrderNavigate;

  const enableTopRankedCostco = !isDemo && orgSettings.topRankedCostco;
  const enableTopRankedWalgreens = !isDemo && orgSettings.topRankedWalgreens;
  const containsGLP = flattenedFills.some((fill) => isGLP(fill.treatment.name));

  const heading = isReroute ? t.changePharmacy : t.selectAPharmacy;
  const subheading = isReroute
    ? t.sendToNew(isMultiRx, order.pharmacy!.name)
    : t.sendToSelected(isMultiRx);

  // Pharmacy results
  const [topRankedPharmacies, setTopRankedPharmacies] = useState<EnrichedPharmacy[]>([]);
  const [pharmacyResults, setPharmacyResults] = useState<EnrichedPharmacy[]>([]);
  const allPharmacies = useMemo(() => {
    const topRankedIds = topRankedPharmacies.map((p) => p.id);
    const combined = [
      ...topRankedPharmacies,
      ...pharmacyResults.filter((p) => !topRankedIds.includes(p.id))
    ];
    if (isDemo) {
      // demo pharmacies already are prepared
      return combined;
    }
    return combined.map(preparePharmacy);
  }, [isDemo, pharmacyResults, topRankedPharmacies]);

  const showToastWarning = () =>
    toast({
      title: isReroute ? 'Unable to change pharmacies' : 'Unable to submit pharmacy selection',
      description: isReroute
        ? 'Your order is already being processed. Text us if you need it sent to a different pharmacy.'
        : 'Please refresh and try again',
      ...TOAST_CONFIG.WARNING
    });

  const reset = () => {
    setTopRankedPharmacies([]);
    setPharmacyResults([]);
    setPageOffset(0);
    setSelectedId('');
    setShowFooter(false);
    setShowingAllPharmacies(false);
  };

  const handleModalClose = ({ loc = undefined }: { loc?: string | undefined }) => {
    reset();
    setLocation(loc);
    setLocationModalOpen(false);
  };

  // Reset when we toggle 24hr/open now
  useEffect(() => {
    reset();
  }, [enable24Hr, enableOpenNow]);

  // Initialize demo data
  useEffect(() => {
    if (isDemo) {
      // Mock geocode data
      setLocation('201 N 8th St, Brooklyn, NY 11211');
      setCleanAddress('201 N 8th St, Brooklyn, NY 11211');
      setLatitude(40.717484);
      setLongitude(-73.955662397568);

      let pharmacies =
        enableOpenNow || enable24Hr
          ? demoPharmacies.filter((p) => (enableOpenNow && p.isOpen) || (enable24Hr && p.is24Hr))
          : demoPharmacies;

      pharmacies = pharmacies.slice(0, 5);

      setPharmacyResults(pharmacies);

      if (pharmacies.length < 5) {
        setShowingAllPharmacies(true);
      }
    }
  }, [enable24Hr, enableOpenNow, isDemo]);

  // Update and geocode location
  useEffect(() => {
    const onUpdateLocation = async () => {
      if (location == null) {
        return;
      }
      setLoadingLocation(true);
      try {
        const locationData = await geocode(location);
        setLatitude(locationData.lat);
        setLongitude(locationData.lng);
        setCleanAddress(locationData.address);
      } catch (e: any) {
        toast({
          title: 'Invalid location',
          description: 'Please update your location and try again.',
          ...TOAST_CONFIG.ERROR
        });
        setShowingAllPharmacies(true);

        console.warn('Geocoding error:', e);
      }
      setLoadingLocation(false);
    };
    onUpdateLocation();
  }, [location, toast]);

  const getCostco = useCallback(
    async ({
      enable24Hr,
      enableOpenNow,
      latitude,
      longitude
    }: {
      enable24Hr: boolean;
      enableOpenNow: boolean;
      latitude: number | undefined;
      longitude: number | undefined;
    }) => {
      if (latitude == null || longitude == null) {
        return [];
      }
      try {
        const topRankedCostco: EnrichedPharmacy[] = await getPharmacies({
          searchParams: { latitude, longitude, radius: PHARMACY_SEARCH_RADIUS_IN_MILES },
          limit: 1,
          offset: 0,
          isOpenNow: enableOpenNow,
          is24hr: enable24Hr,
          name: 'costco'
        });
        if (topRankedCostco.length > 0) {
          return [topRankedCostco[0]];
        }
      } catch {
        // no costcos found :(
      }
      return [];
    },
    []
  );

  const getWalgreens = useCallback(
    async ({
      enable24Hr,
      enableOpenNow,
      latitude,
      longitude
    }: {
      enable24Hr: boolean;
      enableOpenNow: boolean;
      latitude: number | undefined;
      longitude: number | undefined;
    }) => {
      if (latitude == null || longitude == null) {
        return [];
      }

      try {
        const topRankedWags: EnrichedPharmacy[] = await getPharmacies({
          searchParams: { latitude, longitude, radius: PHARMACY_SEARCH_RADIUS_IN_MILES },
          limit: 1,
          offset: 0,
          isOpenNow: enableOpenNow,
          is24hr: enable24Hr,
          name: 'walgreens'
        });
        if (topRankedWags.length > 0) {
          return [topRankedWags[0]];
        }
      } catch {
        // no walgreens found :(
      }
      return [];
    },
    []
  );

  const loadPharmacies = useCallback(
    async ({
      enable24Hr,
      enableOpenNow,
      latitude,
      longitude,
      pageOffset = 0
    }: {
      enable24Hr: boolean;
      enableOpenNow: boolean;
      latitude: number | undefined;
      longitude: number | undefined;
      pageOffset?: number;
    }) => {
      if (latitude == null || longitude == null) {
        return [];
      }

      const res = await getPharmacies({
        searchParams: { latitude, longitude, radius: PHARMACY_SEARCH_RADIUS_IN_MILES },
        limit: GET_PHARMACIES_COUNT,
        offset: pageOffset,
        isOpenNow: enableOpenNow,
        is24hr: enable24Hr
      });
      setPageOffset(pageOffset + res.length);
      return res;
    },
    []
  );

  useEffect(() => {
    const fetchPharmaciesOnLocationChange = async () => {
      if (isDemo) return;
      if (latitude == null || longitude == null) {
        // Need to wait till we have lat/lng
        return;
      }

      setLoadingPharmacies(true);
      try {
        // Get pharmacies from photon db
        let topRankedPharmacies: EnrichedPharmacy[] = [];

        // check if top ranked costco is enabled and there are GLP treatments
        if (enableTopRankedCostco && containsGLP) {
          topRankedPharmacies = [
            ...(await getCostco({ latitude, longitude, enable24Hr, enableOpenNow })),
            ...topRankedPharmacies
          ];
        }

        if (enableTopRankedWalgreens && order?.readyBy === 'Urgent') {
          topRankedPharmacies = [
            ...(await getWalgreens({ latitude, longitude, enable24Hr, enableOpenNow })),
            ...topRankedPharmacies
          ];
        }

        const pharmacies = await loadPharmacies({ latitude, longitude, enable24Hr, enableOpenNow });
        setTopRankedPharmacies(topRankedPharmacies);
        setPharmacyResults(pharmacies);
      } catch (error: any) {
        const noPharmaciesErr = 'No pharmacies found near location';
        const genericError = 'Unable to get pharmacies';
        const toastMsg = error?.message === noPharmaciesErr ? noPharmaciesErr : genericError;
        toast({ ...TOAST_CONFIG.WARNING, title: toastMsg });

        console.log('Get pharmacies error: ', error);
      }
      setLoadingPharmacies(false);
    };

    fetchPharmaciesOnLocationChange();
  }, [
    containsGLP,
    enable24Hr,
    enableOpenNow,
    enableTopRankedCostco,
    enableTopRankedWalgreens,
    getCostco,
    getWalgreens,
    isDemo,
    latitude,
    loadPharmacies,
    longitude,
    order?.readyBy,
    toast
  ]);

  const handleShowMore = async () => {
    setLoadingPharmacies(true);

    if (isDemo) {
      const pharmacies =
        enableOpenNow || enable24Hr
          ? demoPharmacies.filter((p) => (enableOpenNow && p.isOpen) || (enable24Hr && p.is24Hr))
          : demoPharmacies;

      const newPharmacyOptions = pharmacies.slice(
        pharmacyResults.length,
        pharmacyResults.length + GET_PHARMACIES_COUNT
      );
      const totalPharmacyOptions = [...pharmacyResults, ...newPharmacyOptions];
      setPharmacyResults(totalPharmacyOptions);
      setLoadingPharmacies(false);

      if (totalPharmacyOptions.length === pharmacies.length) {
        setShowingAllPharmacies(true);
      }

      return;
    }

    const newPharmacies = await loadPharmacies({
      latitude,
      longitude,
      enable24Hr,
      enableOpenNow,
      pageOffset
    });
    setPharmacyResults([...pharmacyResults, ...newPharmacies]);
    if (newPharmacies.length < GET_PHARMACIES_COUNT) {
      setShowingAllPharmacies(true);
    }

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

    if (!order) {
      console.error('No order present');
      return;
    }

    setSubmitting(true);

    if (isDemo) {
      setTimeout(() => {
        setSuccessfullySubmitted(true);
        setTimeout(() => {
          setShowFooter(false);

          // Add selected pharmacy to order context so /status shows pharmacy on render
          const selectedPharmacy = allPharmacies.find((p) => p.id === selectedId)!;
          setOrder({ ...order, pharmacy: selectedPharmacy });

          // Send order placed sms to demo participant
          triggerDemoNotification(
            phone!,
            'photon:order:placed',
            selectedPharmacy.name,
            formatAddress(selectedPharmacy.address!)
          );

          navigate(`/status?demo=true&phone=${phone}`);
        }, 1000);
        setSubmitting(false);
      }, 1000);

      return;
    }

    try {
      const result = isReroute
        ? await rerouteOrder(order.id, selectedId)
        : await setOrderPharmacy(
            order.id,
            selectedId,
            order.readyBy,
            order.readyByDay,
            order.readyByTime
          );

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
              selectedPharmacy = allPharmacies.find((p) => p.id === selectedId);
            }

            setOrder({ ...order, isReroutable: !isReroute, pharmacy: selectedPharmacy });
            const query = queryString.stringify({ orderId: order.id, token, type });
            return navigate(`/status?${query}`);
          }, 1000);
        } else {
          showToastWarning();
        }
        setSubmitting(false);
      }, 1000);
    } catch (error: any) {
      showToastWarning();
      setSubmitting(false);
      if (isReroute) {
        setOrder({ ...order, isReroutable: false });
        const query = queryString.stringify({
          orderId: order.id,
          token
        });
        return navigate(`/status?${query}`);
      }
    }
  };

  const handleSetPreferredPharmacy = async (pharmacyId: string) => {
    if (!pharmacyId) return;

    setSavingPreferred(true);

    // Handle stp demo
    if (isDemo) {
      setTimeout(() => {
        setPreferredPharmacyId(pharmacyId);
        toast({ ...TOAST_CONFIG.SUCCESS, title: 'Set preferred pharmacy' });
        setSavingPreferred(false);
      }, 750);
      return;
    }

    try {
      const result: boolean = await setPreferredPharmacy(order.patient.id, pharmacyId);
      setTimeout(() => {
        if (result) {
          setPreferredPharmacyId(pharmacyId);
          toast({ ...TOAST_CONFIG.SUCCESS, title: 'Set preferred pharmacy' });
        } else {
          toast({
            title: 'Unable to set preferred pharmacy',
            description: 'Please refresh and try again',
            ...TOAST_CONFIG.ERROR
          });
        }
        setSavingPreferred(false);
      }, 750);
    } catch (error: any) {
      toast({
        ...TOAST_CONFIG.ERROR,
        title: 'Unable to set preferred pharmacy',
        description: 'Please refresh and try again'
      });

      setSavingPreferred(false);

      console.error(JSON.stringify(error, undefined, 2));
    }
  };

  if (!order) {
    console.error('No error');
    return null;
  }

  return (
    <Box>
      {!isDemo && <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />}
      <Helmet>
        <title>{t.selectAPharmacy}</title>
      </Helmet>

      <Box bgColor="white" shadow="sm">
        <Container>
          <VStack spacing={4} align="span" py={4}>
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
                    cursor={isDemo ? 'default' : 'auto'}
                  >
                    <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
                    {cleanAddress}
                  </Link>
                </VStack>
              ) : (
                <Button variant="brand" onClick={() => setLocationModalOpen(true)}>
                  {t.setLoc}
                </Button>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container pb={showFooter ? 28 : 8}>
        <VStack spacing={4} align="span" py={4}>
          {location ? (
            <VStack spacing={9} align="stretch">
              {enableMailOrder ? (
                <BrandedOptions
                  options={orgSettings.mailOrderNavigateProviders ?? []}
                  location={location}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  patientAddress={formatAddress(order.address!)}
                />
              ) : null}

              <PickupOptions
                pharmacies={allPharmacies}
                preferredPharmacy={preferredPharmacyId}
                savingPreferred={savingPreferred}
                selectedId={selectedId}
                handleSelect={handleSelect}
                handleShowMore={handleShowMore}
                handleSetPreferred={handleSetPreferredPharmacy}
                loadingMore={isLoading}
                showingAllPharmacies={showingAllPharmacies}
                courierEnabled={enableMailOrder ?? false}
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
            borderRadius="lg"
            w="full"
            variant={successfullySubmitted ? undefined : 'brand'}
            colorScheme={successfullySubmitted ? 'green' : undefined}
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleSubmit : undefined}
            isLoading={submitting}
            disabled={selectedId == null}
            isDisabled={selectedId == null}
          >
            {successfullySubmitted ? t.thankYou : t.selectPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
