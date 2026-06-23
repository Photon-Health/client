import {
  Box,
  Button,
  Center,
  CircularProgress,
  Container,
  Link,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import queryString from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactGA from 'react-ga4';
import { Helmet } from 'react-helmet';
import { FiCheck } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FixedFooter, LocationModal, PoweredBy } from '../components';
import { CouponModal } from '../components/coupons';
import * as TOAST_CONFIG from '../configs/toast';
import { preparePharmacy, wait } from '../utils/general';
import { Pharmacy as EnrichedPharmacy, OfferBundleDetails } from '../utils/models';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

import {
  geocode,
  getPharmacies,
  getPharmaciesByLocation,
  rerouteOrder,
  setOrderPharmacy,
  setPreferredPharmacy,
  triggerDemoNotification
} from '../api';

import capsuleZipcodeLookup from '../data/capsuleZipcodes.json';
import { demoMailOrderPharmacies, demoPharmacies } from '../data/demoPharmacies';
import { demoOffers } from '../data/demoOffers';
import { isGLP } from '../utils/isGLP';
import {
  FulfillmentType,
  GetPharmaciesByLocationQuery,
  Pharmacy as PharmacyType,
  Prescription
} from '../__generated__/graphql';
import { getOrgMailOrderPharms } from '@client/settings';
import { fetchOfferBundles, getPharmacy } from './pharmacy.utils';
import _ from 'lodash';
import {
  BenefitsBanner,
  BrandedOptionOverrides,
  BrandedOptions,
  BrandedOptionsHeader,
  PickupPharmacyCardList
} from '../components/pharmacy-card-list';
import { formatAddress } from '../utils/formatters';
import { usePageAnalytics } from '../hooks/usePageAnalytics';
import { OffersList } from '../components/offers/OffersList';
import { MailOrderSelectModal } from '../components/mail-order-select';
import { MailOrderPharmacyOption } from '../components/mail-order-select/MailOrderSelectCard';
import { getOfferType } from '../utils/offers';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';
import { MarketplaceSummary } from '../components/marketplace/summary/MarketplaceSummary';
import { LocationSelection } from '../components/marketplace/summary/LocationSelection';
import {
  clearAutoroutedPharmacyConfirmation,
  markAutoroutedPharmacyConfirmed
} from '../utils/autoroutedPharmacyConfirmationStorage';
import { hasSingleAutoRouteWithNoReroutes } from '../utils/getOrderFetchRedirectPath';

const GET_PHARMACIES_COUNT = 5; // Number of pharmacies to fetch at a time
const COSTCO_PHARMACY_RADIUS = 30; // miles
const WALGREENS_PHARMACY_RADIUS = 15; // miles

function isMailOrderPharmacy(pharmacy: EnrichedPharmacy): boolean {
  return !!pharmacy.fulfillmentTypes?.includes('MAIL_ORDER');
}

function FulfillmentTypeTabBar() {
  // TODO: eventually we'll have more than one selectable fulfillment type in this bar (mail order)
  // for now, we'll just show the pickup tab bar
  return (
    <Text
      as="span"
      display="inline-block"
      fontWeight="semibold"
      fontSize="md"
      color="gray.900"
      pb={3}
      borderBottom="2px solid"
      borderColor="blue.500"
      aria-selected="true"
      role="tab"
    >
      {t.pickUp}
    </Text>
  );
}

export const Pharmacy = () => {
  const {
    order,
    flattenedFills,
    setOrder,
    isDemo,
    fetchOrder,
    enablePrice,
    setEnablePrice,
    reason
  } = useOrderContext();
  // We don't want to collect data on demo activity
  const patientAnalytics = usePatientAnalytics();
  usePageAnalytics({ pageName: 'Pharmacy Select' });

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
  const [newPreferredPharmacyId, setNewPreferredPharmacyId] = useState<string>('');
  const [savingPreferred, setSavingPreferred] = useState<boolean>(false);
  const existingPreferredPharmacy = order?.patient?.preferredPharmacies?.[0];
  const existingPreferredPharmacyForList = existingPreferredPharmacy
    ? ({ ...existingPreferredPharmacy } as EnrichedPharmacy)
    : undefined;
  const existingPreferredPharmacyId = existingPreferredPharmacy?.id || '';
  const effectivePreferredPharmacyId = newPreferredPharmacyId || existingPreferredPharmacyId;

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
  const orderIsMultiRx = flattenedFills.length > 1;
  const autoroutedPharmacyId =
    order && hasSingleAutoRouteWithNoReroutes(order) ? order.pharmacy?.id : undefined;
  const currentPharmacyId =
    order?.pharmacy?.id && order.pharmacy.id !== autoroutedPharmacyId
      ? order.pharmacy.id
      : undefined;

  // pricing
  const shouldTrackOfferImpressionsAndSelections = enablePrice && !isDemo;

  // filters
  const [enableOpenNow, setEnableOpenNow] = useState(
    openNow !== null ? !!openNow : order?.readyBy === 'Urgent'
  );
  const [enable24Hr, setEnable24Hr] = useState(order?.readyBy === 'After hours');

  const [brandedOptionsOverride, setBrandedOptionsOverride] = useState<
    BrandedOptionOverrides | undefined
  >(undefined);

  const [offers, setOffers] = useState<OfferBundleDetails[] | undefined>(undefined);
  const [filteredOffers, setFilteredOffers] = useState<OfferBundleDetails[] | undefined>(undefined);

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

    const combinedWithPreferred =
      existingPreferredPharmacyForList &&
      !combined.some((pharmacy) => pharmacy.id === existingPreferredPharmacyForList.id)
        ? [existingPreferredPharmacyForList, ...combined]
        : combined;

    // drop pharmacies already present in topRankedPharmacies to avoid duplicates
    const prepared = isDemo
      ? combinedWithPreferred
      : combinedWithPreferred.map((combinedItem) => preparePharmacy(combinedItem));
    if (!effectivePreferredPharmacyId) {
      // no preferred pharmacies: preserve existing ordering
      return prepared;
    }

    // preferred pharmacy should appear first
    const preferred = prepared.find((pharmacy) => pharmacy.id === effectivePreferredPharmacyId);
    if (!preferred) {
      return prepared;
    }
    const remaining = prepared.filter((pharmacy) => pharmacy.id !== effectivePreferredPharmacyId);
    return [preferred, ...remaining];
  }, [
    isDemo,
    pharmacyResults,
    effectivePreferredPharmacyId,
    existingPreferredPharmacy,
    existingPreferredPharmacyForList,
    topRankedPharmacies
  ]);

  // Non-integrated patient mail order pharmacies
  const [patientMailOrderOptions, setPatientMailOrderOptions] = useState<
    MailOrderPharmacyOption[] | undefined
  >();

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
    !enablePrice && // Hide for price filter
    // If we're showing costco, we don't want to show mail order
    !topRankedCostco &&
    !hasTopRankedCostco && // this means org is Sesame, we don't want to show Amazon and top ranked Costco at the same time
    enablePatientDeliveryPharmacies;

  useEffect(() => {
    const getOffers = async () => {
      // only fetch offers if we don't have any
      if (!offers) {
        const fetchedOffers = await fetchOfferBundles(order);

        if (JSON.stringify(fetchedOffers) !== JSON.stringify(offers)) {
          setOffers(fetchedOffers);
        }
      }
    };

    if (isDemo) {
      setOffers(demoOffers);
    } else {
      getOffers();
    }
  }, [order, offers, isDemo]);

  useEffect(() => {
    const insuranceOffer = offers?.find((offer) => offer.costType == 'INSURANCE_ESTIMATE');
    const bestPriceOffer = offers?.find(
      (o) => o.costType === 'MIXED' || o.costType === 'PRIME_RX' || o.costType === 'CASH'
    );

    const novocareOffer = offers?.find((offer) => offer.costType == 'NOVOCARE_OFFER');

    let amazonPharmacyOverride;

    const filteringOffers = [];

    // we'll only want to set the override if we have at least one offer to show
    if (bestPriceOffer || insuranceOffer) {
      if (enablePrice && bestPriceOffer) {
        amazonPharmacyOverride = bestPriceOffer;
        filteringOffers.push(bestPriceOffer);
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

  useEffect(() => {
    // load all the pharmacy options on mount
    async function loadMailOrderPharmacies() {
      const { pharmacies } = await getPharmacies({
        limit: 50,
        offset: 0,
        fulfillmentType: 'MAIL_ORDER',
        integrated: false
      });
      setPatientMailOrderOptions(pharmacies);
    }

    if (isDemo) {
      setPatientMailOrderOptions(demoMailOrderPharmacies);
    } else {
      loadMailOrderPharmacies();
    }
  }, [isDemo]);

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

    patientAnalytics.track('Patient Clicked Show More Pharmacies', order, {
      latitude,
      longitude,
      pageOffset
    });
  };

  const handleSelect = (pharmacyId: string) => {
    setSelectedId(pharmacyId);
    setShowFooter(true);

    if (order) {
      if (pharmacyId === autoroutedPharmacyId) {
        markAutoroutedPharmacyConfirmed(order.id);
      } else {
        clearAutoroutedPharmacyConfirmation(order.id);
      }
    }

    // because offers aren't actually pharmacies
    // we'll transform them into things that resemble pharamcy objects
    const pharmaciesFromOffers = (filteredOffers || []).map((o) => ({
      id: o.pharmacy.id,
      name: o.pharmacy.name,
      fulfillmentTypes: o.pharmacy.fulfillmentTypes,
      logo: o.pharmacy.logo,
      price: o.costAmount ?? 0,
      retailPrice: o.retailAmount ?? 0
    }));

    const selectedPharmacy = [...allPharmacies, ...pharmaciesFromOffers].find(
      (p) => p.id === pharmacyId
    );
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

  const handleSubmit = async (
    selectedPharmacy: EnrichedPharmacy,
    analyticsDetails: {
      selectedFrom: 'Main List' | 'Mail Order List';
      buttonText: string;
    }
  ) => {
    if (!order) {
      console.error('No order present');
      return;
    }
    setSubmitting(true);
    const { selectedFrom = 'Main List', buttonText } = analyticsDetails;

    const selectedOffer = filteredOffers?.find((o) => o.pharmacy.id === selectedPharmacy.id);
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
      await handleDemoSubmit(selectedPharmacy);
      return;
    }

    // because offers aren't actually pharmacies
    // we'll transform them into things that resemble pharamcy objects
    const pharmaciesFromOffers = (filteredOffers || []).map((o) => ({
      id: o.pharmacy.id,
      name: o.pharmacy.name,
      fulfillmentTypes: o.pharmacy.fulfillmentTypes,
      logo: o.pharmacy.logo,
      price: o.costAmount ?? 0,
      retailPrice: o.retailAmount ?? 0
    }));

    const allPharmaciesIncludingOffers = [...pharmaciesFromOffers, ...allPharmacies];

    // TODO: Remove this once we've got all pharmacies marked correctly in the db
    // this historically was overriding pharmaicy type and presentation due to an inept datamodel
    const override = getPharmacy(allPharmaciesIncludingOffers, selectedPharmacy.id);
    const overridePharmacy = override.selectedPharmacy ?? selectedPharmacy;
    const overrideType = override.selectedPharmacy
      ? override.type
      : selectedPharmacy.fulfillmentTypes?.[0];

    handleSubmitSuccessAnalytics({
      selectedPharmacy: overridePharmacy,
      allPharmaciesIncludingOffers,
      selectedFrom,
      buttonText
    });

    const isSkipReadyBySelectionPageEnabled = patientAnalytics.getFlagValueSync(
      'remove_ready_by_selection_page'
    ).skipReadyBySelectionPage;

    // If it's a mail order pharmacy, submit the pharmacy to the order
    // Otherwise, just navigate to ready by selection
    if (isMailOrder || isReroute || isSkipReadyBySelectionPageEnabled) {
      trackSelectedPharmacyRank(selectedPharmacy.id, allPharmaciesIncludingOffers);

      try {
        const patientSelectedPrice = enablePrice;
        const result = isReroute
          ? await rerouteOrder(order.id, selectedPharmacy.id, patientSelectedPrice, reason)
          : await setOrderPharmacy(
              order.id,
              selectedPharmacy.id,
              order.readyBy ?? undefined,
              order.readyByDay ?? undefined,
              order.readyByTime,
              patientSelectedPrice
            );

        await new Promise<void>((resolve) =>
          setTimeout(() => {
            if (result) {
              setSuccessfullySubmitted(true);
              setTimeout(async () => {
                setShowFooter(false);

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
      } catch (_error: any) {
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
      const { selectedPharmacy } = getPharmacy(allPharmaciesIncludingOffers, selectedId);
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
        setNewPreferredPharmacyId(pharmacyId);
        toast({ ...TOAST_CONFIG.SUCCESS, title: 'Set preferred pharmacy' });
        setSavingPreferred(false);
      }, 750);
      return;
    }

    try {
      const result: boolean = await setPreferredPharmacy(order.patient.id, pharmacyId);
      setTimeout(() => {
        if (result) {
          setNewPreferredPharmacyId(pharmacyId);
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

  const handleDemoSubmit = async (selectedPharmacy: EnrichedPharmacy) => {
    await wait(1000);
    setSuccessfullySubmitted(true);
    await wait(1000);

    setShowFooter(false);

    setOrder({ ...order, pharmacy: selectedPharmacy });

    triggerDemoNotification(
      phone!,
      'photon:order:placed',
      selectedPharmacy.name,
      selectedPharmacy.address ? formatAddress(selectedPharmacy.address) : undefined
    );

    if (isMailOrderPharmacy(selectedPharmacy)) {
      const query = queryString.stringify({ demo: true, phone });
      navigate(`/status?${query}`);
    } else {
      const query = queryString.stringify({ demo: true, phone });
      navigate(`/readyBy?${query}`);
    }

    setSubmitting(false);
  };

  const handleSubmitSuccessAnalytics = ({
    selectedPharmacy,
    allPharmaciesIncludingOffers,
    selectedFrom = 'Main List',
    buttonText
  }: {
    selectedPharmacy: { id: string; name: string } | PharmacyType | undefined;
    allPharmaciesIncludingOffers: EnrichedPharmacy[];
    selectedFrom: 'Main List' | 'Mail Order List';
    buttonText: string;
  }) => {
    const extraOfferMetadata: Record<string, any> = {};

    const selectedOffer = offers?.find((o) => o.pharmacy.id == selectedPharmacy?.id);
    const selectedOfferPharmacy =
      selectedPharmacy && allPharmaciesIncludingOffers.find((p) => p.id === selectedPharmacy.id);

    const offerType =
      getOfferType({ offer: selectedOffer, pharmacy: selectedOfferPharmacy }) ?? 'None';

    const medCount = new Set(
      order.fills
        .map((f) => f.prescription)
        .filter((p): p is Prescription => !!p)
        .map(({ id }) => id)
    ).size;

    if (brandedOptionsOverride?.amazonPharmacyOverride) {
      const sawPrice = brandedOptionsOverride?.amazonPharmacyOverride?.costAmount !== undefined;
      const priceType = brandedOptionsOverride?.amazonPharmacyOverride?.costType;

      extraOfferMetadata.sawPrice = sawPrice;
      extraOfferMetadata.price = brandedOptionsOverride?.amazonPharmacyOverride?.costAmount;
      extraOfferMetadata.retailPrice = brandedOptionsOverride?.amazonPharmacyOverride?.retailAmount;
      extraOfferMetadata.priceType = priceType;
    }

    if (shouldTrackOfferImpressionsAndSelections) {
      const brandedOptionObjects = brandedOptions.map((id) => ({
        id
      }));

      const offersArray =
        filteredOffers?.map((o) => ({
          id: o.pharmacy.id
        })) || [];

      extraOfferMetadata.offerType = offerType;
      extraOfferMetadata.buttonText = t.selectPharmacy;
      extraOfferMetadata.numPrescriptions = medCount;
      extraOfferMetadata.multiMedOffer = medCount > 1;
      extraOfferMetadata.hasRefills = medCount < order.fills.length;
      extraOfferMetadata.selectedFrom = selectedFrom;
      extraOfferMetadata.buttonText = buttonText;

      patientAnalytics.track('Offer Selected', order, {
        ...selectedPharmacy,
        ...extraOfferMetadata,
        pharmacyId: selectedId,
        pharmacyType: selectedOfferPharmacy?.fulfillmentTypes?.[0],
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

  const patientClicksAddress = () => {
    patientAnalytics.track('Patient Clicks Address', order, {});
  };

  const capsuleEnabled = enableCourier && order?.address?.postalCode && capsulePharmacyId;
  const brandedOptions = _.uniq([
    ...(capsuleEnabled ? [capsulePharmacyId] : []),
    // the destructuring for novo and amazon can be removed once we remove brandedOptionsOverrides
    // and switch fully over the offers-based approach
    ...(brandedOptionsOverride?.novocareExperimentOverride
      ? [import.meta.env.VITE_NOVOCARE_PHARMACY_ID as string]
      : []),
    ...(brandedOptionsOverride?.amazonPharmacyOverride
      ? [import.meta.env.VITE_AMAZON_PHARMACY_ID as string]
      : []),
    ...(enableMailOrder ? mailOrderPharmacies : [])
  ]).filter((id) => !filteredOffers?.map((offer) => offer.pharmacy.id).includes(id));
  // filter out any branded options that are in the offers list

  const showBrandedOptionsHeader =
    (brandedOptions.length > 0 || (filteredOffers || []).length > 0) && !!patientLocation;

  const showOffers =
    enableCourier ||
    enableMailOrder ||
    showBrandedOptionsHeader ||
    (filteredOffers || []).length > 0;

  const showBrandedOptions =
    !isDemo &&
    (enableCourier ||
      enableMailOrder ||
      brandedOptionsOverride !== undefined ||
      showBrandedOptionsHeader);

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
        options={patientMailOrderOptions}
      />

      <Box bgColor="white" p={4} borderBottom="1px" borderColor="gray.200">
        <Container px={-3}>
          <VStack spacing={4} align="stretch">
            <MarketplaceSummary />
            {patientLocation ? (
              <LocationSelection
                address={cleanAddress ?? patientLocation}
                onClick={() => {
                  patientClicksAddress();
                  setLocationModalOpen(true);
                }}
              />
            ) : (
              <Button variant="brand" onClick={() => setLocationModalOpen(true)}>
                {t.setLoc}
              </Button>
            )}
          </VStack>
        </Container>
      </Box>

      <Box px={4}>
        <Container
          px={-3}
          pb={patientLocation ? 0 : showFooter ? 32 : 8}
          mb={
            patientLocation && ((filteredOffers || []).length > 0 || brandedOptions.length > 0)
              ? 6
              : 0
          }
        >
          {patientLocation && (
            <VStack spacing={6} align="stretch" pt={4}>
              {((filteredOffers || []).length > 0 || brandedOptions.length > 0) && (
                <VStack
                  align="span"
                  w="full"
                  rowGap="2"
                  role="radiogroup"
                  aria-label="Select a pharmacy"
                >
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
                      preferredPharmacyId={effectivePreferredPharmacyId}
                      autoroutedPharmacyId={autoroutedPharmacyId}
                      currentPharmacyId={currentPharmacyId}
                      handleSelect={handleSelect}
                    />
                  )}
                  {showBrandedOptions && (
                    <BrandedOptions
                      options={brandedOptions}
                      location={patientLocation}
                      selectedId={selectedId}
                      handleSelect={handleSelect}
                      autoroutedPharmacyId={autoroutedPharmacyId}
                      currentPharmacyId={currentPharmacyId}
                      brandedOptionOverrides={brandedOptionsOverride ?? {}}
                      shouldTrackOfferImpressionsAndSelections={
                        shouldTrackOfferImpressionsAndSelections
                      }
                    />
                  )}
                </VStack>
              )}
            </VStack>
          )}
        </Container>
      </Box>

      {patientLocation && (
        <>
          <Box bg="white" w="full" borderBottom="1px" borderColor="gray.200" px={4} pt={4} pb={0}>
            <Container px={-3}>
              <FulfillmentTypeTabBar />
            </Container>
          </Box>
          <Box bg="gray.50" w="full" px={4}>
            <Container px={-3} pb={showFooter ? 32 : 8} pt={4}>
              <VStack
                spacing={2}
                align="stretch"
                w="full"
                rowGap="6"
                role="radiogroup"
                aria-label="Select a pharmacy"
              >
                <PickupPharmacyCardList
                  location={patientLocation}
                  pharmacies={allPharmacies}
                  preferredPharmacy={effectivePreferredPharmacyId}
                  savingPreferred={savingPreferred}
                  selectedId={selectedId}
                  handleSelect={handleSelect}
                  handleShowMore={handleShowMore}
                  handleSetPreferred={handleSetPreferredPharmacy}
                  loadingMore={isLoading}
                  showingAllPharmacies={showingAllPharmacies}
                  showPrice={isDemo || !orderIsMultiRx}
                  enableOpenNow={enableOpenNow}
                  enable24Hr={enable24Hr}
                  enablePrice={enablePrice}
                  setEnableOpenNow={setEnableOpenNow}
                  setEnable24Hr={setEnable24Hr}
                  showFilters={false}
                  autoroutedPharmacyId={autoroutedPharmacyId}
                  currentPharmacyId={currentPharmacyId}
                  setCouponModalOpen={setCouponModalOpen}
                  numberOfBrandedOptions={brandedOptions.length}
                  shouldTrackOfferImpressionsAndSelections={
                    shouldTrackOfferImpressionsAndSelections
                  }
                >
                  <BenefitsBanner
                    onTooltipClick={() =>
                      patientAnalytics.track('Benefits Banner Tooltip Clicked', order)
                    }
                  />
                  {patientMailOrderOptions?.length ? (
                    <Box
                      w="full"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      px={4}
                      py={3}
                    >
                      <Text fontSize="sm" color="gray.600">
                        Don&apos;t see your pharmacy?{' '}
                        <Link
                          as="button"
                          color="blue.500"
                          fontWeight="semibold"
                          onClick={() => setMailOrderModalOpen(true)}
                        >
                          See all mail orders
                        </Link>
                      </Text>
                    </Box>
                  ) : null}
                </PickupPharmacyCardList>
              </VStack>
            </Container>
          </Box>
        </>
      )}

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

              // because offers aren't actually pharmacies
              // we'll transform them into things that resemble pharamcy objects
              const pharmaciesFromOffers = (filteredOffers || []).map((o) => ({
                id: o.pharmacy.id,
                name: o.pharmacy.name,
                fulfillmentTypes: o.pharmacy.fulfillmentTypes,
                logo: o.pharmacy.logo,
                price: o.costAmount ?? 0,
                retailPrice: o.retailAmount ?? 0
              }));

              const allPharmaciesIncludingOffers = [...pharmaciesFromOffers, ...allPharmacies];

              const selectedPharmacy = allPharmaciesIncludingOffers.find(
                (p) => p.id === selectedId
              );
              if (!selectedId || !selectedPharmacy) {
                console.error('No selectedId. Cannot set pharmacy on order.');
                return;
              }

              await handleSubmit(selectedPharmacy, {
                selectedFrom: 'Main List',
                buttonText: t.selectPharmacy
              });
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
