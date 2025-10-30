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
  Switch,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import queryString from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactGA from 'react-ga4';
import { Helmet } from 'react-helmet';
import { FiCheck, FiMapPin } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FixedFooter, LocationModal, PoweredBy } from '../components';
import { CouponModal } from '../components/coupons';
import * as TOAST_CONFIG from '../configs/toast';
import { preparePharmacy } from '../utils/general';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

import {
  geocode,
  getPharmaciesByLocation,
  rerouteOrder,
  setOrderPharmacy,
  setPreferredPharmacy,
  triggerDemoNotification
} from '../api';

import capsuleZipcodeLookup from '../data/capsuleZipcodes.json';
import { demoPharmacies } from '../data/demoPharmacies';
import { isGLP } from '../utils/isGLP';
import { datadogRum } from '@datadog/browser-rum';
import {
  FulfillmentType,
  GetPharmaciesByLocationQuery,
  Pharmacy as PharmacyType
} from '../__generated__/graphql';
import { getOrgMailOrderPharms } from '@client/settings';
import { fetchOffers, getPharmacy } from './pharmacy.utils';
import _ from 'lodash';
import {
  Offer,
  BrandedOptionOverrides,
  BrandedOptions,
  BrandedOptionsHeader,
  PickupPharmacyCardList
} from '../components/pharmacy-card-list';
import { formatAddress } from '../utils/formatters';
import { usePageAnalytics } from '../hooks/usePageAnalytics';
import { patientAnalytics } from '../configs/analytics';
import { OffersList } from '../components/offers/OffersList';
import { MailOrderSelectModal } from '../components/mail-order-select/MailOrderSelectModal';

const GET_PHARMACIES_COUNT = 5; // Number of pharmacies to fetch at a time
const COSTCO_PHARMACY_RADIUS = 30; // miles
const WALGREENS_PHARMACY_RADIUS = 15; // miles

function isMailOrderPharmacy(pharmacy: EnrichedPharmacy): boolean {
  const pharmacyId = pharmacy.id;
  const hasMailOrderFulfillment = pharmacy.fulfillmentTypes?.includes('MAIL_ORDER');

  return (
    hasMailOrderFulfillment ||
    pharmacyId === process.env.REACT_APP_AMAZON_PHARMACY_ID ||
    pharmacyId === process.env.REACT_APP_NOVOCARE_PHARMACY_ID ||
    pharmacyId === 'SUPER_TEST_MAIL_ORDER_PHARMACY'
  );
}

export const Pharmacy = () => {
  const {
    order,
    flattenedFills,
    setOrder,
    isDemo,
    fetchOrder,
    showPriceToggle,
    enablePrice,
    setEnablePrice
  } = useOrderContext();
  const mailOrderPharmacies = getOrgMailOrderPharms(order?.organization.id).patient;
  const { enablePatientDeliveryPharmacies, patientFeaturedPharmacyName } =
    order?.organization?.settings?.patientUx ?? {};

  const topRankedCostco = patientFeaturedPharmacyName?.toLowerCase() === 'costco';
  const topRankedWalgreens = patientFeaturedPharmacyName?.toLowerCase() === 'walgreens';

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

  // top ranked pharmacies
  const containsGLP = flattenedFills.some((fill) => isGLP(fill.treatment.name));
  const enableTopRankedCostco = !isDemo && topRankedCostco;
  const enableTopRankedWalgreens = !isDemo && topRankedWalgreens && containsGLP;

  // View state
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);
  const [mailOrderModalOpen, setMailOrderModalOpen] = useState<boolean>(false);

  // selection state
  const [selectedId, setSelectedId] = useState<string>('');

  // Submitting state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  // Address state
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [patientLocation, setPatientLocation] = useState(
    order?.address ? formatAddress(order.address) : undefined
  );
  const [cleanAddress, setCleanAddress] = useState<string>();
  const [loadingLocation, setLoadingLocation] = useState(false);

  // loading state
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(true);
  const [showingAllPharmacies, setShowingAllPharmacies] = useState<boolean>(false);
  const isLoading = loadingLocation || loadingPharmacies;

  // pricing
  const shouldTrackOfferImpressionsAndSelections = showPriceToggle && !isDemo;

  // filters
  const [enableOpenNow, setEnableOpenNow] = useState(
    openNow !== null ? !!openNow : order?.readyBy === 'Urgent'
  );
  const [enable24Hr, setEnable24Hr] = useState(order?.readyBy === 'After hours');

  const [brandedOptionsOverride, setBrandedOptionsOverride] = useState<
    BrandedOptionOverrides | undefined
  >(undefined);

  const [offers, setOffers] = useState<Offer[] | undefined>(undefined);
  const [filteredOffers, setFilteredOffers] = useState<Offer[] | undefined>(undefined);

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

    // because offers aren't actually pharmacies
    // we'll transform them into things that resemble pharamcy objects
    const offerPharmacies = (offers || []).map((o) => ({
      id: o.pharmacyId ?? 'unknown',
      name: o.pharmacyName ?? 'unknown'
    }));

    if (isDemo) {
      // demo pharmacies already are prepared
      return combined;
    }
    return [...combined, ...offerPharmacies].map((combinedItem) => preparePharmacy(combinedItem));
  }, [isDemo, pharmacyResults, topRankedPharmacies, offers]);

  // capsule
  const isCapsuleTerritory =
    order?.address?.postalCode != null && order.address.postalCode in capsuleZipcodeLookup;
  const enableCourier =
    !isDemo &&
    !enablePrice && // Hide for price filter
    isCapsuleTerritory &&
    enablePatientDeliveryPharmacies;
  const capsulePharmacyId = order?.address?.postalCode
    ? capsuleZipcodeLookup[order.address.postalCode as keyof typeof capsuleZipcodeLookup]
        ?.pharmacyId
    : null;

  // mail order
  const hasTopRankedCostco = topRankedPharmacies.some((p) => p.name === 'Costco Pharmacy');
  const enableMailOrder =
    !isDemo &&
    !enablePrice && // Hide for price filter
    // If we're showing costco, we don't want to show mail order
    !topRankedCostco &&
    !hasTopRankedCostco && // this means org is Sesame, we don't want to show Amazon and top ranked Costco at the same time
    enablePatientDeliveryPharmacies;

  // headings
  const heading = isReroute ? t.changePharmacy : t.selectAPharmacy;

  usePageAnalytics({ pageName: 'Pharmacy Select' });

  useEffect(() => {
    const getOffers = async () => {
      let fetchedOffers: Offer[] | undefined;

      // only fetch offers if we don't have any
      if (!offers) {
        fetchedOffers = await fetchOffers(order);

        if (JSON.stringify(fetchedOffers) !== JSON.stringify(offers)) {
          setOffers(fetchedOffers);
        }
      }
    };

    getOffers();
  }, [order, offers]);

  useEffect(() => {
    const insuranceOffer = offers?.find((offer) => offer.costType == 'INSURANCE_ESTIMATE');
    const primeRxOffer = offers?.find((offer) => offer.costType == 'PRIME_RX');

    const novocareOffer = offers?.find((offer) => offer.costType == 'NOVOCARE_OFFER');

    // we're not ready to share price yet
    // so we're forcibly nulling out the costas
    // so the price won't be shown
    let amazonPharmacyOverride;

    const filteringOffers = [];

    // we'll only want to set the override
    // if we have at least one offer
    if (insuranceOffer || primeRxOffer) {
      if (enablePrice && primeRxOffer) {
        amazonPharmacyOverride = primeRxOffer;
        filteringOffers.push(primeRxOffer);
      } else if (!enablePrice && insuranceOffer) {
        amazonPharmacyOverride = insuranceOffer;
        filteringOffers.push(insuranceOffer);
      }
    }

    const newBrandedOptionsOverride = {
      amazonPharmacyOverride,
      novocareExperimentOverride: novocareOffer?.deliveryEstimate
    };

    if (novocareOffer) {
      filteringOffers.push(novocareOffer);
    }

    if (JSON.stringify(newBrandedOptionsOverride) !== JSON.stringify(brandedOptionsOverride)) {
      setBrandedOptionsOverride(newBrandedOptionsOverride);
      setFilteredOffers(filteringOffers);
    }
  }, [enablePrice, offers, order, brandedOptionsOverride]);

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
      setPatientLocation(loc);
    }
    setLocationModalOpen(false);

    if (loc) {
      patientAnalytics.track('Update Location', order, {
        newLocation: loc,
        previousLocation: cleanAddress
      });
    }
  };

  // Reset when we toggle 24hr, open now, price
  useEffect(() => {
    reset();
  }, [enable24Hr, enableOpenNow, enablePrice]);

  // Initialize demo data
  useEffect(() => {
    if (isDemo) {
      // Mock geocode data
      setPatientLocation('201 N 8th St, Brooklyn, NY 11211');
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
  }, [enable24Hr, enableOpenNow, enablePrice, isDemo]);

  // Update and geocode patient's location
  useEffect(() => {
    const onUpdateLocation = async () => {
      if (patientLocation == null) {
        return;
      }
      setLoadingLocation(true);
      try {
        const locationData = await geocode(patientLocation);
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
  }, [patientLocation, toast]);

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
        const res: GetPharmaciesByLocationQuery = await getPharmaciesByLocation({
          searchParams: { latitude, longitude, radius: COSTCO_PHARMACY_RADIUS },
          limit: 1,
          offset: 0,
          isOpenNow: enableOpenNow,
          is24hr: enable24Hr,
          name: 'costco',
          includePrice: enablePrice
        });
        const topRankedCostco = res?.pharmaciesByLocation ?? [];
        if (topRankedCostco.length > 0) {
          return [topRankedCostco[0]];
        }
      } catch {
        // no costcos found :(
      }
      return [];
    },
    [enable24Hr, enableOpenNow, enablePrice]
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
        const res: GetPharmaciesByLocationQuery = await getPharmaciesByLocation({
          searchParams: { latitude, longitude, radius: WALGREENS_PHARMACY_RADIUS },
          limit: 1,
          offset: 0,
          isOpenNow: enableOpenNow,
          is24hr: enable24Hr,
          name: 'walgreens',
          includePrice: enablePrice
        });
        const topRankedWags = res?.pharmaciesByLocation ?? [];
        if (topRankedWags.length > 0) {
          return [topRankedWags[0]];
        }
      } catch {
        // no walgreens found :(
      }
      return [];
    },
    [enable24Hr, enableOpenNow, enablePrice]
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

      const res = await getPharmaciesByLocation({
        searchParams: { latitude, longitude },
        limit: GET_PHARMACIES_COUNT,
        offset: pageOffset,
        isOpenNow: enableOpenNow,
        is24hr: enable24Hr,
        includePrice: enablePrice
      });

      const pharmacies = res?.pharmaciesByLocation ?? [];
      setPageOffset(pageOffset + pharmacies.length);
      return pharmacies;
    },
    [enable24Hr, enableOpenNow, enablePrice]
  );

  useEffect(() => {
    const fetchPharmaciesOnLocationOrSortChange = async () => {
      if (isDemo) {
        // if we're in demo mode, pharmacies are already loaded from a hardcoded list
        setLoadingPharmacies(false);
        return;
      }
      if (latitude == null || longitude == null) {
        // Need to wait till we have lat/lng
        return;
      }

      setLoadingPharmacies(true);
      try {
        // Get pharmacies from photon db
        let topRankedPharmacies: EnrichedPharmacy[] = [];

        // check if top ranked costco is enabled and there are GLP treatments
        if (enableTopRankedCostco) {
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
          if (enablePrice) {
            if (initialLoad) {
              // If we're on initial load and no pharmacies are found, we should try again with distance
              setEnablePrice(false);
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
    enablePrice,
    setEnablePrice,
    getCostco,
    getWalgreens,
    isDemo,
    latitude,
    longitude,
    loadPharmacies,
    order?.readyBy,
    toast,
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

    const selectedPharmacy = allPharmacies.find((p) => p.id === pharmacyId);
    patientAnalytics.track('Pharmacy Selected', order, {
      pharmacyId: pharmacyId,
      pharmacyName: selectedPharmacy?.name,
      pharmacyRank: allPharmacies.findIndex((p) => p.id === pharmacyId) + 1,
      isReroute: !!isReroute,
      enablePrice: enablePrice,
      hasPrice: selectedPharmacy?.price !== undefined
    });
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

      // Only track price selection if price is enabled and the pharmacy has a price
      const selectedPrice = pharmacies[index].price;
      if (enablePrice && selectedPrice) {
        datadogRum.addAction('price_selection', {
          orderId: order.id,
          organization: order.organization.name,
          pharmacyId: selectedPharmacyId,
          timestamp: new Date().toISOString(),
          price: selectedPrice
        });
      }

      if (shouldTrackOfferImpressionsAndSelections) {
        patientAnalytics.track('Offer Clicked', order, {
          clickedPharmacy: pharmacies[index],
          orderId: order.id,
          organizationName: order.organization.name,
          pharmacyId: selectedPharmacyId
        });
      }
    }
  };

  const handleSubmit = async (selectedPharmacy: EnrichedPharmacy) => {
    if (!order) {
      console.error('No order present');
      return;
    }
    setSubmitting(true);

    const selectedOffer = filteredOffers?.find((o) => o.pharmacyId === selectedPharmacy.id);
    const isMailOrder = isMailOrderPharmacy(selectedPharmacy);

    patientAnalytics.track('Pharmacy Selection Submitted', order, {
      pharmacyId: selectedPharmacy.id,
      pharmacyName: selectedPharmacy?.name,
      isReroute: !!isReroute,
      isMailOrder,
      enablePrice,
      hasPrice: selectedPharmacy?.price !== undefined,
      price: selectedPharmacy?.price || selectedOffer?.costAmount,
      retailPrice: selectedPharmacy?.retailPrice || selectedOffer?.retailAmount
    });

    if (isDemo) {
      handleDemoSubmit();
      return;
    }

    // If it's a mail order pharmacy, submit the pharmacy to the order
    // Otherwise, just navigate to ready by selection
    if (isMailOrder || isReroute) {
      trackSelectedPharmacyRank(selectedPharmacy.id, allPharmacies);

      try {
        const patientSelectedPrice = enablePrice;
        const result = isReroute
          ? await rerouteOrder(order.id, selectedPharmacy.id, patientSelectedPrice)
          : await setOrderPharmacy(
              order.id,
              selectedPharmacy.id,
              order.readyBy ?? undefined,
              order.readyByDay ?? undefined,
              order.readyByTime,
              patientSelectedPrice
            );

        // TODO: Remove this once we've got all pharmacies marked correctly in the db
        // this historically was overriding pharmaicy type and presentation due to an inept datamodel
        const override = getPharmacy(allPharmacies, selectedPharmacy.id);
        const overridePharmacy = override.selectedPharmacy ?? selectedPharmacy;
        const overrideType = override.selectedPharmacy
          ? override.type
          : selectedPharmacy.fulfillmentTypes?.[0];

        await new Promise<void>((resolve) =>
          setTimeout(() => {
            if (result) {
              setSuccessfullySubmitted(true);
              setTimeout(async () => {
                setShowFooter(false);

                handleSubmitSuccessAnalytics(overridePharmacy);

                // necessary to ensure the order is updated with the new coupon before navigating
                const updatedOrder = await fetchOrder(overridePharmacy);

                if (updatedOrder) {
                  updatedOrder.fulfillment = {
                    ...updatedOrder.fulfillment,
                    type: overrideType as FulfillmentType,
                    state: updatedOrder.fulfillment?.state ?? 'CREATED'
                  };
                  setOrder({
                    ...updatedOrder,
                    isReroutable: !isReroute,
                    exceptions: updatedOrder.exceptions.map((exception) => ({
                      ...exception,
                      resolvedAt: new Date().toISOString()
                    })),
                    pharmacy: overridePharmacy
                  });
                }

                const query = queryString.stringify({
                  orderId: order.id,
                  token,
                  type: overrideType
                });
                resolve();
                return navigate(`/status?${query}`);
              }, 1000);
            } else {
              showToastWarning();
              resolve();
            }
          }, 1000)
        );
        setSubmitting(false);
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
    } else {
      // for non mail order pharmacies, just navigate to ready by selection
      // Store the selected pharmacy in the order context temporarily
      const { selectedPharmacy } = getPharmacy(allPharmacies, selectedId);
      setOrder({
        ...order,
        pharmacy: selectedPharmacy
      });

      setSubmitting(false);
      const query = queryString.stringify({ orderId: order.id, token });
      return navigate(`/readyBy?${query}`);
    }
  };

  const handleSetPreferredPharmacy = async (pharmacyId: string) => {
    if (!pharmacyId) return;

    setSavingPreferred(true);

    const selectedPharmacy = allPharmacies.find((p) => p.id === pharmacyId);

    patientAnalytics.track('Set Preferred Pharmacy', order, {
      pharmacyId: pharmacyId,
      pharmacyName: selectedPharmacy?.name
    });

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

  const handleDemoSubmit = () => {
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

        // For demo, follow the same logic as non-demo
        if (isMailOrderPharmacy(selectedPharmacy)) {
          const query = queryString.stringify({ demo: true, phone });
          navigate(`/status?${query}`);
        } else {
          const query = queryString.stringify({ demo: true, phone });
          navigate(`/readyBy?${query}`);
        }
      }, 1000);
      setSubmitting(false);
    }, 1000);
  };

  const handleSubmitSuccessAnalytics = (
    selectedPharmacy: { id: string; name: string } | PharmacyType | undefined
  ) => {
    const extraOfferMetadata: Record<string, any> = {};

    if (brandedOptionsOverride?.amazonPharmacyOverride) {
      const sawPrice = brandedOptionsOverride?.amazonPharmacyOverride?.costAmount !== undefined;
      const priceType = brandedOptionsOverride?.amazonPharmacyOverride?.costType;

      extraOfferMetadata.sawPrice = sawPrice;
      extraOfferMetadata.price = brandedOptionsOverride?.amazonPharmacyOverride?.costAmount;
      extraOfferMetadata.retailPrice = brandedOptionsOverride?.amazonPharmacyOverride?.retailAmount;
      extraOfferMetadata.priceType = priceType;

      const slugifiedOverride = brandedOptionsOverride?.amazonPharmacyOverride.deliveryEstimate
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
      if (selectedId === process.env.REACT_APP_AMAZON_PHARMACY_ID) {
        datadogRum.addAction('amazon_pharmacy_offer_active_and_selected', {
          orderId: order.id,
          organizationId: order.organization.id,
          description: slugifiedOverride,
          treatmentId: flattenedFills[0]?.treatment?.id,
          timestamp: new Date().toISOString(),
          sawPrice,
          costAmount: brandedOptionsOverride?.amazonPharmacyOverride?.costAmount,
          retailAmount: brandedOptionsOverride?.amazonPharmacyOverride?.retailAmount,
          priceType,
          offers
        });
      } else {
        datadogRum.addAction('amazon_pharmacy_offer_active_and_not_selected', {
          orderId: order.id,
          organizationId: order.organization.id,
          description: slugifiedOverride,
          treatmentId: flattenedFills[0]?.treatment?.id,
          timestamp: new Date().toISOString(),
          sawPrice,
          costAmount: brandedOptionsOverride?.amazonPharmacyOverride?.costAmount,
          retailAmount: brandedOptionsOverride?.amazonPharmacyOverride?.retailAmount,
          priceType,
          offers
        });
      }
    }

    if (brandedOptionsOverride?.novocareExperimentOverride) {
      if (selectedId === process.env.REACT_APP_NOVOCARE_PHARMACY_ID) {
        datadogRum.addAction('novocare_experiment_offer_active_and_selected', {
          orderId: order.id,
          organizationId: order.organization.id,
          timestamp: new Date().toISOString()
        });
      } else {
        datadogRum.addAction('novocare_experiment_offer_active_and_not_selected', {
          orderId: order.id,
          organizationId: order.organization.id,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (shouldTrackOfferImpressionsAndSelections) {
      const brandedOptionObjects = brandedOptions.map((id) => ({
        id
      }));

      const offersArray =
        filteredOffers?.map((o) => ({
          id: o.pharmacyId
        })) || [];

      patientAnalytics.track('Offer Selected', order, {
        ...selectedPharmacy,
        ...extraOfferMetadata,
        pharmacyId: selectedId,
        // allPharmacies does not included branded options so we must combine them
        ordinalPosition:
          [...offersArray, ...brandedOptionObjects, ...allPharmacies].findIndex(
            (p) => p.id === selectedId
          ) + 1
      });
    }
  };

  if (!order) {
    console.error('No error');
    return null;
  }

  if (initialLoad && isLoading) {
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

  const locationPreview = (
    <VStack w="full" align="start" spacing={1}>
      <Text size="sm">{t.showingLabel}</Text>
      <Link
        onClick={() => setLocationModalOpen(true)}
        display="inline"
        size="sm"
        data-dd-privacy="mask"
      >
        <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
        {cleanAddress}
      </Link>
    </VStack>
  );

  const setLocationButton = (
    <Button variant="brand" onClick={() => setLocationModalOpen(true)}>
      {t.setLoc}
    </Button>
  );
  const capsuleEnabled = enableCourier && order?.address?.postalCode && capsulePharmacyId;

  const brandedOptions = _.uniq([
    ...(capsuleEnabled ? [capsulePharmacyId] : []),
    // the destructuring for novo and amazon can be removed once we remove brandedOptionsOverrides
    // and switch fully over the offers-based approach
    ...(brandedOptionsOverride?.novocareExperimentOverride
      ? [process.env.REACT_APP_NOVOCARE_PHARMACY_ID as string]
      : []),
    ...(brandedOptionsOverride?.amazonPharmacyOverride
      ? [process.env.REACT_APP_AMAZON_PHARMACY_ID as string]
      : []),
    ...(enableMailOrder ? mailOrderPharmacies : [])
  ]).filter((id) => !filteredOffers?.map((offer) => offer.pharmacyId).includes(id));
  // filter out any branded options that are in the offers list

  const showBrandedOptionsHeader =
    (brandedOptions.length > 0 || (filteredOffers || []).length > 0) && !!patientLocation;

  const showOffers =
    enableCourier ||
    enableMailOrder ||
    showBrandedOptionsHeader ||
    (filteredOffers || []).length > 0;

  const showBrandedOptions =
    enableCourier ||
    enableMailOrder ||
    brandedOptionsOverride !== undefined ||
    showBrandedOptionsHeader;

  const showPickupHeading =
    (enableCourier || enableMailOrder || brandedOptionsOverride !== undefined) ?? false;

  const pickupPharmacyOptions = (patientLocation: string) => (
    <PickupPharmacyCardList
      location={patientLocation}
      pharmacies={allPharmacies}
      preferredPharmacy={preferredPharmacyId}
      savingPreferred={savingPreferred}
      selectedId={selectedId}
      handleSelect={handleSelect}
      handleShowMore={handleShowMore}
      handleSetPreferred={handleSetPreferredPharmacy}
      loadingMore={isLoading}
      showingAllPharmacies={showingAllPharmacies}
      showHeading={showPickupHeading}
      enableOpenNow={enableOpenNow}
      enable24Hr={enable24Hr}
      enablePrice={enablePrice}
      setEnableOpenNow={setEnableOpenNow}
      setEnable24Hr={setEnable24Hr}
      currentPharmacyId={order.pharmacy?.id}
      setCouponModalOpen={setCouponModalOpen}
      numberOfBrandedOptions={brandedOptions.length}
      shouldTrackOfferImpressionsAndSelections={shouldTrackOfferImpressionsAndSelections}
    />
  );

  return (
    <Box>
      {!isDemo && <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />}

      <Helmet>
        <title>{t.selectAPharmacy}</title>
      </Helmet>

      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />

      <MailOrderSelectModal
        isOpen={mailOrderModalOpen}
        onClose={() => setMailOrderModalOpen(false)}
        onConfirm={handleSubmit}
      />

      <Box bgColor="white">
        <VStack
          spacing={4}
          align="span"
          pt={4}
          pb={!showPriceToggle ? 4 : 0} // don't remove, this padding is needed when price toggle section is not shown
        >
          <Container px={-3}>
            <VStack spacing={2} align="start" px={4}>
              <Heading as="h3" size="lg">
                {heading}
              </Heading>
              <HStack justify="space-between" w="full">
                {patientLocation ? locationPreview : setLocationButton}
              </HStack>
            </VStack>
          </Container>

          {showPriceToggle ? (
            <Container px={-3}>
              <VStack
                spacing={2}
                align="start"
                borderY="2px solid"
                borderColor="gray.300"
                py={4}
                px={4}
              >
                <HStack justify="space-between" w="full">
                  {t.showDiscountCardPrices(() => setCouponModalOpen(true))}
                  <Switch
                    size="lg"
                    aria-label="Show coupon card prices"
                    isChecked={enablePrice}
                    onChange={(e) => setEnablePrice(e.target.checked)}
                  />
                </HStack>
                {enablePrice ? (
                  <Box p={3} bgColor="blue.100" borderRadius="lg">
                    <Text fontSize="sm">
                      The displayed price is a coupon price for the pharmacy. Coupon details
                      available after you select a pharmacy. <b>This is NOT insurance.</b>
                    </Text>
                  </Box>
                ) : null}
              </VStack>
            </Container>
          ) : null}
        </VStack>
      </Box>

      <Container pb={showFooter ? 32 : 8}>
        {patientLocation && (
          <VStack spacing={6} align="stretch" pt={4}>
            <VStack spacing={2} align="span" w="full" rowGap="6">
              {showBrandedOptionsHeader && (
                <BrandedOptionsHeader title={t.delivery} description={t.getDelivered} />
              )}
              {showOffers && (
                <OffersList
                  offers={filteredOffers || []}
                  shouldTrackOfferImpressionsAndSelections={
                    shouldTrackOfferImpressionsAndSelections
                  }
                  selectedPharmacyId={selectedId}
                  preferredPharmacyId={preferredPharmacyId}
                  handleSelect={handleSelect}
                />
              )}
              {showBrandedOptions && (
                <BrandedOptions
                  options={brandedOptions}
                  location={patientLocation}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  fulfillingPharmacyId={order.pharmacy?.id}
                  brandedOptionOverrides={brandedOptionsOverride ?? {}}
                  shouldTrackOfferImpressionsAndSelections={
                    shouldTrackOfferImpressionsAndSelections
                  }
                />
              )}
              <HStack
                w="full"
                justifyContent="space-between"
                background="Background"
                padding="2"
                borderRadius="md"
              >
                <Text fontSize="sm">Don't see your pharmacy?</Text>
                <Link as="button" onClick={() => setMailOrderModalOpen(true)} fontSize="sm">
                  See all mail orders
                </Link>
              </HStack>
              {pickupPharmacyOptions(patientLocation)}
            </VStack>
          </VStack>
        )}
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
            disabled={selectedId == null}
            isDisabled={selectedId == null}
            isLoading={submitting}
            onClick={async () => {
              if (successfullySubmitted) return;

              const selectedPharmacy = allPharmacies.find((p) => p.id === selectedId);
              if (!selectedId || !selectedPharmacy) {
                console.error('No selectedId. Cannot set pharmacy on order.');
                return;
              }

              await handleSubmit(selectedPharmacy);
            }}
          >
            {successfullySubmitted ? t.thankYou : t.selectPharmacy}
          </Button>

          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
