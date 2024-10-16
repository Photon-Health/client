/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Box,
  Button,
  Center,
  CircularProgress,
  Container,
  Heading,
  HStack,
  Link,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import queryString from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactGA from 'react-ga4';
import { Helmet } from 'react-helmet';
import { FiCheck, FiMapPin } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BrandedOptions,
  CouponModal,
  FixedFooter,
  LocationModal,
  PickupOptions,
  PoweredBy
} from '../components';
import * as TOAST_CONFIG from '../configs/toast';
import { formatAddress, preparePharmacy } from '../utils/general';
import { ExtendedFulfillmentType } from '../utils/models';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

import {
  geocode,
  getPharmacies,
  rerouteOrder,
  setOrderPharmacy,
  setPreferredPharmacy,
  triggerDemoNotification
} from '../api';

import capsulePharmacyIdLookup from '../data/capsulePharmacyIds.json';
import capsuleZipcodeLookup from '../data/capsuleZipcodes.json';
import { demoPharmacies } from '../data/demoPharmacies';
import { isGLP } from '../utils/isGLP';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { datadogRum } from '@datadog/browser-rum';
import { Pharmacy as PharmacyType } from '../__generated__/graphql';

const GET_PHARMACIES_COUNT = 5; // Number of pharmacies to fetch at a time

export const Pharmacy = () => {
  const { order, flattenedFills, setOrder, isDemo, fetchOrder } = useOrderContext();

  const orgSettings = getSettings(order?.organization.id);

  const navigate = useNavigate();
  const toast = useToast();

  // multiple rx's
  const isMultiRx = flattenedFills.length > 1;

  // search params
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isReroute = searchParams.get('reroute');
  const openNow = searchParams.get('openNow');
  const phone = searchParams.get('phone');

  // preferred pharmacy
  const [preferredPharmacyId, setPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);

  // top ranked pharmacies
  const enableTopRankedCostco = !isDemo && orgSettings.topRankedCostco;
  const enableTopRankedWalgreens = !isDemo && orgSettings.topRankedWalgreens;
  const containsGLP = flattenedFills.some((fill) => isGLP(fill.treatment.name));

  // View state
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);
  const isOrgWithCouponsEnabled = [
    'Sesame',
    'Updated Test Pharmacy 11',
    'Photon Test Org'
  ].includes(order?.organization.name ?? '');
  const [showSearchToggle, setShowSearchToggle] = useState(
    isOrgWithCouponsEnabled && // select orgs
      !containsGLP && // no glp1's
      !isMultiRx // one rx
  );

  // selection state
  const [selectedId, setSelectedId] = useState<string>('');

  // Submitting state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  // Address state
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [location, setLocation] = useState(
    order?.address ? formatAddress(order.address) : undefined
  );
  const [cleanAddress, setCleanAddress] = useState<string>();
  const [loadingLocation, setLoadingLocation] = useState(false);

  // loading state
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(true);
  const [showingAllPharmacies, setShowingAllPharmacies] = useState<boolean>(false);
  const isLoading = loadingLocation || loadingPharmacies;

  // sorting
  type SortBy = 'price' | 'distance';
  const [sortBy, setSortBy] = useState<SortBy>('price');

  // filters
  const [enableOpenNow, setEnableOpenNow] = useState(
    openNow !== null ? !!openNow : order?.readyBy === 'Urgent'
  );
  const [enable24Hr, setEnable24Hr] = useState(order?.readyBy === 'After hours');

  // pagination
  const [pageOffset, setPageOffset] = useState(0);

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

  // capsule
  const isCapsuleTerritory =
    order?.address?.postalCode != null && order.address.postalCode in capsuleZipcodeLookup;
  const enableCourier =
    !isDemo &&
    sortBy !== 'price' && // Hide for cash price search
    isCapsuleTerritory &&
    orgSettings.enableCourierNavigate;
  const capsulePharmacyId = order?.address?.postalCode
    ? capsuleZipcodeLookup[order.address.postalCode as keyof typeof capsuleZipcodeLookup]
        ?.pharmacyId
    : null;

  // mail order
  const hasTopRankedCostco = topRankedPharmacies.some((p) => p.name === 'Costco Pharmacy');
  const enableMailOrder =
    !isDemo &&
    // Hide for cash price search
    sortBy !== 'price' &&
    // If we're showing costco, we don't want to show mail order
    !orgSettings.topRankedCostco &&
    !hasTopRankedCostco && // this means org is Sesame, we don't want to show Amazon and top ranked Costco at the same time
    orgSettings.mailOrderNavigate;

  // headings
  const heading = isReroute ? t.changePharmacy : t.selectAPharmacy;

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
    if (loc) {
      reset();
      setLocation(loc);
    }
    setLocationModalOpen(false);
  };

  // Reset when we toggle 24hr/open now
  useEffect(() => {
    reset();
  }, [sortBy, enable24Hr, enableOpenNow]);

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
      latitude,
      longitude
    }: {
      latitude: number | undefined;
      longitude: number | undefined;
    }) => {
      if (latitude == null || longitude == null) {
        return [];
      }
      try {
        const topRankedCostco: EnrichedPharmacy[] = await getPharmacies({
          searchParams: { latitude, longitude, radius: 15 },
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
    [enable24Hr, enableOpenNow]
  );

  const getWalgreens = useCallback(
    async ({
      latitude,
      longitude
    }: {
      latitude: number | undefined;
      longitude: number | undefined;
    }) => {
      if (latitude == null || longitude == null) {
        return [];
      }

      try {
        const topRankedWags: EnrichedPharmacy[] = await getPharmacies({
          searchParams: { latitude, longitude, radius: 15 },
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
    [enable24Hr, enableOpenNow]
  );

  const enablePrice = useMemo(
    () => sortBy === 'price' && isOrgWithCouponsEnabled,
    [sortBy, isOrgWithCouponsEnabled]
  );

  const loadPharmacies = useCallback(
    async ({
      latitude,
      longitude,
      pageOffset = 0
    }: {
      latitude: number | undefined;
      longitude: number | undefined;
      pageOffset?: number;
    }) => {
      if (latitude == null || longitude == null) {
        return [];
      }

      const res = await getPharmacies({
        searchParams: { latitude, longitude },
        limit: GET_PHARMACIES_COUNT,
        offset: pageOffset,
        isOpenNow: enableOpenNow,
        is24hr: enable24Hr,
        includePrice: enablePrice
      });
      setPageOffset(pageOffset + res.length);
      return res;
    },
    [enable24Hr, enableOpenNow, enablePrice]
  );

  useEffect(() => {
    const fetchPharmaciesOnLocationOrSortChange = async () => {
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
        if (enableTopRankedCostco && sortBy !== 'price') {
          topRankedPharmacies = [
            ...(await getCostco({ latitude, longitude })),
            ...topRankedPharmacies
          ];
        }

        if (enableTopRankedWalgreens && order?.readyBy === 'Urgent') {
          topRankedPharmacies = [
            ...(await getWalgreens({ latitude, longitude })),
            ...topRankedPharmacies
          ];
        }

        // using the existing enablePrice flag to determine if we should fetch pharmacies with prices
        // a different query than the original query
        const pharmacies = await loadPharmacies({
          latitude,
          longitude
        });

        if (pharmacies?.length === 0) {
          if (sortBy === 'price') {
            if (initialLoad) {
              // If we're on initial load and no pharmacies are found, we should try again with distance
              setShowSearchToggle(false);
              setSortBy('distance');
              setInitialLoad(false);

              // Re-fetch to get pharmacies by distance
              const pharmaciesReSearch = await loadPharmacies({
                latitude,
                longitude
              });
              setTopRankedPharmacies(topRankedPharmacies);
              setPharmacyResults(pharmaciesReSearch);
            } else {
              toast({ ...TOAST_CONFIG.WARNING, title: 'No pharmacies found near location' });
              setShowingAllPharmacies(true);
            }
          } else {
            toast({ ...TOAST_CONFIG.WARNING, title: 'No pharmacies found near location' });
          }
        } else {
          if (sortBy === 'price') {
            setShowingAllPharmacies(true);
          }

          setTopRankedPharmacies(topRankedPharmacies);
          setPharmacyResults(pharmacies);
          if (initialLoad) {
            setInitialLoad(false);
          }
        }
      } catch (error: any) {
        toast({ ...TOAST_CONFIG.WARNING, title: 'Unable to get pharmacies' });
        console.log('Get pharmacies error: ', error);
      }
      setLoadingPharmacies(false);
    };

    fetchPharmaciesOnLocationOrSortChange();
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
    toast,
    sortBy,
    initialLoad
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

  const trackSelectedPharmacyRank = (
    selectedPharmacyId: string,
    pharmacies: EnrichedPharmacy[]
  ): void => {
    // Get pharmacy index in list
    const index = pharmacies.findIndex((p) => p.id === selectedPharmacyId);
    if (index !== -1) {
      ReactGA.event('pharmacy_selected', {
        category: 'Pharmacy',
        action: 'Select',
        label: 'Pharmacy Rank',
        value: index + 1
      });
      if (sortBy === 'price') {
        datadogRum.addAction('price_selection', {
          orderId: order.id,
          organization: order.organization.name,
          pharmacyId: selectedPharmacyId,
          timestamp: new Date().toISOString(),
          price: pharmacies[index].price
        });
      }
    }
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

    trackSelectedPharmacyRank(selectedId, allPharmacies);

    try {
      const patientSelectedPrice = sortBy === 'price';
      const result = isReroute
        ? await rerouteOrder(order.id, selectedId, patientSelectedPrice)
        : await setOrderPharmacy(
            order.id,
            selectedId,
            order.readyBy ?? undefined,
            order.readyByDay ?? undefined,
            order.readyByTime,
            patientSelectedPrice
          );

      setTimeout(() => {
        if (result) {
          setSuccessfullySubmitted(true);
          setTimeout(async () => {
            setShowFooter(false);

            // Fudge it so that we can show the pharmacy card on initial load of the
            // status view for all types. On my christmas list for 2024 is better
            // fulfillment types on pharmacies.
            let type: ExtendedFulfillmentType = 'PICK_UP';
            let selectedPharmacy: { id: string; name: string } | PharmacyType | undefined =
              undefined;
            if (selectedId in capsulePharmacyIdLookup) {
              type = 'COURIER';
              selectedPharmacy = { id: selectedId, name: 'Capsule Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_ALTO_PHARMACY_ID) {
              type = 'COURIER';
              selectedPharmacy = { id: selectedId, name: 'Alto Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_AMAZON_PHARMACY_ID) {
              type = 'MAIL_ORDER';
              selectedPharmacy = { id: selectedId, name: 'Amazon Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_COST_PLUS_PHARMACY_ID) {
              type = 'MAIL_ORDER';
              selectedPharmacy = { id: selectedId, name: 'Cost Plus Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_WALMART_MAIL_ORDER_PHARMACY_ID) {
              type = 'MAIL_ORDER';
              selectedPharmacy = { id: selectedId, name: 'Walmart Pharmacy' };
            } else if (selectedId === process.env.REACT_APP_COSTCO_PHARMACY_ID) {
              type = 'MAIL_ORDER';
              selectedPharmacy = { id: selectedId, name: 'Costco Pharmacy' };
            } else {
              type = 'PICK_UP';
              selectedPharmacy = allPharmacies.find((p) => p.id === selectedId);
            }

            setOrder({
              ...order,
              isReroutable: !isReroute,
              discountCards: []
            });

            // necessary to ensure the order is updated with the new coupon before navigating
            await fetchOrder(selectedPharmacy);

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

  if (initialLoad && showSearchToggle && isLoading) {
    return (
      <Box>
        <Helmet>
          <title>{t.selectAPharmacy}</title>
        </Helmet>
        <Container>
          <Center h="100vh">
            <CircularProgress isIndeterminate color="gray.800" />
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      {!isDemo && <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />}
      <Helmet>
        <title>{t.selectAPharmacy}</title>
      </Helmet>

      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />

      <Box bgColor="white" shadow="sm">
        <Container>
          <VStack spacing={4} align="span" py={4}>
            <VStack spacing={2} align="start">
              <Heading as="h3" size="lg">
                {heading}
              </Heading>
            </VStack>

            <HStack justify="space-between" w="full">
              {location ? (
                <VStack w="full" align="start" spacing={1}>
                  <Text size="sm">{t.showingLabel}</Text>
                  <Link
                    onClick={() => setLocationModalOpen(true)}
                    display="inline"
                    color="link"
                    fontWeight="semibold"
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
            {showSearchToggle ? (
              <HStack>
                <Text whiteSpace="nowrap">Sort by</Text>
                <HStack w="full">
                  {(['price', 'distance'] as const).map((sort) => (
                    <Button
                      key={sort}
                      w="50%"
                      size="lg"
                      isActive={sortBy === sort}
                      _active={{
                        backgroundColor: 'brand.500',
                        color: 'white',
                        borderColor: 'brand.500'
                      }}
                      border="2px"
                      borderColor="gray.100"
                      backgroundColor="white"
                      onClick={() => setSortBy(sort)}
                      borderRadius="xl"
                    >
                      {sort === 'distance' ? 'Distance' : 'Cash Price'}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            ) : null}
            {showSearchToggle && sortBy === 'price' ? (
              <Box p={3} bgColor="blue.50" borderRadius="lg">
                <Text>
                  The displayed price is a coupon for the selected pharmacy.{' '}
                  <b>This is NOT insurance.</b>{' '}
                  <Link
                    textDecoration="underline"
                    textUnderlineOffset="2px"
                    color="blue.500"
                    onClick={() => setCouponModalOpen(true)}
                  >
                    Learn more.
                  </Link>
                </Text>
              </Box>
            ) : null}
          </VStack>
        </Container>
      </Box>

      <Container pb={showFooter ? 32 : 8}>
        {location ? (
          <VStack spacing={6} align="stretch" pt={4}>
            {enableCourier || enableMailOrder ? (
              <BrandedOptions
                options={[
                  ...(enableCourier && order?.address?.postalCode && capsulePharmacyId
                    ? [capsulePharmacyId]
                    : []),
                  ...(enableMailOrder ? orgSettings.mailOrderNavigateProviders ?? [] : [])
                ]}
                location={location}
                selectedId={selectedId}
                handleSelect={handleSelect}
              />
            ) : null}

            <PickupOptions
              location={location}
              pharmacies={allPharmacies}
              preferredPharmacy={preferredPharmacyId}
              savingPreferred={savingPreferred}
              selectedId={selectedId}
              handleSelect={handleSelect}
              handleShowMore={handleShowMore}
              handleSetPreferred={handleSetPreferredPharmacy}
              loadingMore={isLoading}
              showingAllPharmacies={showingAllPharmacies}
              showHeading={(enableCourier || enableMailOrder) ?? false}
              enableOpenNow={enableOpenNow}
              enable24Hr={enable24Hr}
              setEnableOpenNow={setEnableOpenNow}
              setEnable24Hr={setEnable24Hr}
            />
          </VStack>
        ) : null}
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
