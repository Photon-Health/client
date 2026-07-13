import {
  Box,
  Button,
  Center,
  CircularProgress,
  Container,
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
import { Pharmacy as EnrichedPharmacy, OfferBundleDetails, Order } from '../utils/models';
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
  PickupPharmacyCardList,
  SentPharmacyBanner
} from '../components/pharmacy-card-list';
import { formatAddress } from '../utils/formatters';
import { usePageAnalytics } from '../hooks/usePageAnalytics';
import { OffersList } from '../components/offers/OffersList';
import { MailOrderSelectList } from '../components/mail-order-select';
import { MailOrderPharmacyOption } from '../components/mail-order-select/MailOrderSelectCard';
import { PharmacyTabKey, PharmacyTypeTabBar, TabPanel } from '../components/pharmacy-tabs';
import { getOfferType } from '../utils/offers';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';
import { MarketplaceSummary } from '../components/marketplace/summary/MarketplaceSummary';
import { LocationSelection } from '../components/marketplace/summary/LocationSelection';
import {
  clearAutoroutedPharmacyConfirmation,
  markAutoroutedPharmacyConfirmed
} from '../utils/autoroutedPharmacyConfirmationStorage';
import {
  hasSingleAutoRouteWithNoReroutes,
  hasSingleProviderRouteWithNoReroutes
} from '../utils/getOrderFetchRedirectPath';

const GET_PHARMACIES_COUNT = 5; // Number of pharmacies to fetch at a time
const COSTCO_PHARMACY_RADIUS = 30; // miles
const WALGREENS_PHARMACY_RADIUS = 15; // miles

/** Which action is the patient taking when they submit their pharmacy selection? */
enum RoutingAction {
  /** Patient selects a new pharmacy for an order that already has one */
  Reroute = 'reroute',
  /** Patient selects a new pharmacy for an order that doesn't have one */
  Route = 'route',
  /** Patient selects existing pharmacy on order, "confirming" it */
  Confirmation = 'confirmation'
}

function getRoutingAction({
  order,
  selectedId,
  searchParams
}: {
  order: Order;
  selectedId: string;
  searchParams: URLSearchParams;
}): RoutingAction {
  if (selectedId === order.pharmacy?.id) {
    return RoutingAction.Confirmation;
  }

  if (!!order.pharmacy?.id || !!searchParams.get('reroute')) {
    return RoutingAction.Reroute;
  }

  return RoutingAction.Route;
}

/** How was the order initially routed? */
enum InitialRouteType {
  /** Sent to patient and patient selected a pharmacy */
  Patient = 'patient',
  /** Provider routed to local pickup pharmacy */
  Pickup = 'pickup',
  /** Provider routed to mail order pharmacy */
  MailOrder = 'mail-order',
  /** System routed to preferred pharmacy */
  PreferredPharmacy = 'preferred-pharmacy',
  /** System routed to open order pharmacy */
  OpenOrderPharmacy = 'open-order-pharmacy'
}

/**
 * @returns If null, we should look into why we were not able to determine the initial route.
 */
function getInitialRouteType(order: Order): InitialRouteType | null {
  const routingHistory = order.metadata?.routingHistory || [];
  if (!routingHistory.length) {
    // Empty routing history > order created without pharmacy > order was sent to patient
    return InitialRouteType.Patient;
  }
  const initialRoute = _.sortBy(routingHistory, 'createdAt')[0];
  if (!initialRoute?.selector) {
    // Selector should always be defined but need this check for type narrowing
    return null;
  }
  switch (initialRoute.selector) {
    case 'AUTO':
      return initialRoute.reason === 'SYSTEM_ORDER_ROUTED'
        ? InitialRouteType.PreferredPharmacy
        : initialRoute.reason === 'SYSTEM_ROUTED_TO_OPEN_ORDER_PHARMACY'
        ? InitialRouteType.OpenOrderPharmacy
        : null;
    case 'PATIENT':
      return InitialRouteType.Patient;
    case 'PROVIDER':
      return initialRoute.pharmacy?.fulfillmentTypes?.[0] === 'MAIL_ORDER'
        ? InitialRouteType.MailOrder
        : initialRoute.pharmacy?.fulfillmentTypes?.[0] === 'PICK_UP'
        ? InitialRouteType.Pickup
        : null;
    default:
      return null;
  }
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

  // selected pharmacy
  const [selectedId, setSelectedId] = useState<string>('');
  const routingAction = getRoutingAction({ order, selectedId, searchParams });
  // pharmacy is considered autorouted if the patient did not actively choose it
  // - show "sent here" card styling
  // - selecting it persists confirmation in local storage
  const autoroutedPharmacyId =
    order &&
    (hasSingleAutoRouteWithNoReroutes(order) || hasSingleProviderRouteWithNoReroutes(order))
      ? order.pharmacy?.id
      : undefined;
  // order.pharmacy when not autorouted, unrelated to selectedPharmacy
  // - show grey card styling + "current pharmacy" tag
  const currentPharmacyId =
    order?.pharmacy?.id && order.pharmacy.id !== autoroutedPharmacyId
      ? order.pharmacy.id
      : undefined;

  // default tab is based on order's pharmacy fulfillment type
  const orderPharmacyIsMailOrder = !!order?.pharmacy?.fulfillmentTypes?.includes('MAIL_ORDER');
  const [activeTab, setActiveTab] = useState<PharmacyTabKey>(
    orderPharmacyIsMailOrder ? 'delivery' : 'pickup'
  );

  const sentPharmacyName = autoroutedPharmacyId ? order?.pharmacy?.name : undefined;

  // Captures the tab shown on first load (Page Opened fires once when the order resolves).
  usePageAnalytics({ pageName: 'Pharmacy Select', properties: { activeTab } });

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
  const pickupPharmacies = useMemo(() => {
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

    // Clearing this on select as well to capture that
    // patient is no longer 100% sure about the existing pharmacy
    if (order && pharmacyId !== autoroutedPharmacyId) {
      clearAutoroutedPharmacyConfirmation(order.id);
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

    const selectedPharmacy: EnrichedPharmacy | undefined = [
      ...pickupPharmacies,
      ...pharmaciesFromOffers,
      ...(patientMailOrderOptions ?? [])
    ].find((p) => p.id === pharmacyId);

    const pickupRankIndex = pickupPharmacies.findIndex((p) => p.id === pharmacyId);
    const mailOrderRankIndex = inlineMailOrderOptions.findIndex((p) => p.id === pharmacyId);
    const rankIndex = pickupRankIndex >= 0 ? pickupRankIndex : mailOrderRankIndex;
    // Calculate routingAction locally since
    // setSelectedId state update will not have registered yet
    const routingAction = getRoutingAction({
      order: order,
      selectedId: pharmacyId,
      searchParams
    });
    patientAnalytics.track('Pharmacy Selected', order, {
      pharmacyId: pharmacyId,
      pharmacyName: selectedPharmacy?.name,
      pharmacyRank: rankIndex >= 0 ? rankIndex + 1 : undefined,
      isPreferred: pharmacyId === effectivePreferredPharmacyId,
      routingAction,
      initialRouteType: getInitialRouteType(order),
      enablePrice: enablePrice,
      hasPrice: selectedPharmacy?.price !== undefined
    });
  };

  const handleTabChange = (tab: PharmacyTabKey) => {
    if (tab !== activeTab) {
      patientAnalytics.track('Pharmacy Type Tab Clicked', order, {
        tabName: tab
      });
    }
    setActiveTab(tab);
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

  const persistAutoroutedPharmacyConfirmation = (pharmacyId: string) => {
    if (!order) {
      return;
    }

    if (pharmacyId === autoroutedPharmacyId) {
      markAutoroutedPharmacyConfirmed(order.id);
    } else {
      clearAutoroutedPharmacyConfirmation(order.id);
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

    persistAutoroutedPharmacyConfirmation(selectedPharmacy.id);

    const selectedOffer = filteredOffers?.find((o) => o.pharmacy.id === selectedPharmacy.id);

    patientAnalytics.track('Pharmacy Selection Submitted', order, {
      pharmacyId: selectedPharmacy.id,
      pharmacyName: selectedPharmacy.name,
      isPreferred: selectedPharmacy.id === effectivePreferredPharmacyId,
      routingAction,
      initialRouteType: getInitialRouteType(order),
      enablePrice,
      hasPrice: selectedPharmacy.price !== undefined,
      price: selectedPharmacy.price || selectedOffer?.costAmount,
      retailPrice: selectedPharmacy.retailPrice || selectedOffer?.retailAmount
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

    const allPharmaciesIncludingOffers = [...pharmaciesFromOffers, ...pickupPharmacies];

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

    // If the patient is simply confirming, navigate back to the status page
    if (routingAction === RoutingAction.Confirmation) {
      setSubmitting(false);
      setSuccessfullySubmitted(true);
      const query = queryString.stringify({
        orderId: order.id,
        token,
        type: overrideType
      });
      return navigate(`/status?${query}`);
    }

    trackSelectedPharmacyRank(selectedPharmacy.id, allPharmaciesIncludingOffers);

    const showSubmitWarning = () =>
      toast({
        title:
          routingAction === RoutingAction.Reroute
            ? 'Unable to change pharmacies'
            : 'Unable to submit pharmacy selection',
        description:
          routingAction === RoutingAction.Reroute
            ? 'Your order is already being processed. Text us if you need it sent to a different pharmacy.'
            : 'Please refresh and try again',
        ...TOAST_CONFIG.WARNING
      });

    try {
      const result =
        routingAction === RoutingAction.Reroute
          ? await rerouteOrder(order.id, selectedPharmacy.id, enablePrice, reason)
          : await setOrderPharmacy(
              order.id,
              selectedPharmacy.id,
              order.readyBy ?? undefined,
              order.readyByDay ?? undefined,
              order.readyByTime,
              enablePrice
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
                  isReroutable: routingAction === RoutingAction.Route,
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
            showSubmitWarning();
            resolve();
          }
        }, 1000)
      );
      setSubmitting(false);
    } catch (_error: any) {
      showSubmitWarning();
      setSubmitting(false);
      if (routingAction === RoutingAction.Reroute) {
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

    const selectedPharmacy = pickupPharmacies.find((p) => p.id === pharmacyId);

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
    persistAutoroutedPharmacyConfirmation(selectedPharmacy.id);

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

    const query = queryString.stringify({ demo: true, phone });
    navigate(`/status?${query}`);

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

      const visiblePharmacyList =
        activeTab === 'delivery'
          ? [...offersArray, ...brandedOptionObjects, ...inlineMailOrderOptions]
          : [...offersArray, ...pickupPharmacies];

      patientAnalytics.track('Offer Selected', order, {
        ...selectedPharmacy,
        ...extraOfferMetadata,
        pharmacyId: selectedId,
        pharmacyType: selectedOfferPharmacy?.fulfillmentTypes?.[0],
        activeTab,
        ordinalPosition: visiblePharmacyList.findIndex((p) => p.id === selectedId) + 1
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

  const brandedAndOfferIds = new Set<string>([
    ...brandedOptions,
    ...(filteredOffers ?? []).map((offer) => offer.pharmacy.id)
  ]);
  // The full mail-order list excluding pharmacies already shown as branded options or offers
  const inlineMailOrderOptions = (patientMailOrderOptions ?? []).filter(
    (option) => !brandedAndOfferIds.has(option.id)
  );

  const showOffers = enableCourier || enableMailOrder || (filteredOffers || []).length > 0;

  const showBrandedOptions =
    !isDemo && (enableCourier || enableMailOrder || brandedOptionsOverride !== undefined);

  return (
    <Box>
      {!isDemo && <LocationModal isOpen={locationModalOpen} onClose={handleModalClose} />}

      <Helmet>
        <title>{t.selectAPharmacy}</title>
      </Helmet>

      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />

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
              <PharmacyTypeTabBar activeTab={activeTab} onTabChange={handleTabChange} />
            </Container>
          </Box>

          {activeTab === 'delivery' ? (
            <TabPanel ariaLabel="Select a delivery pharmacy" pb={showFooter ? 32 : 8}>
              <SentPharmacyBanner
                sentPharmacyName={sentPharmacyName}
                sentToMailOrder={orderPharmacyIsMailOrder}
                activeTab={activeTab}
              />
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
              {inlineMailOrderOptions.length > 0 ? (
                <MailOrderSelectList
                  options={inlineMailOrderOptions}
                  selectedId={selectedId}
                  autoroutedPharmacyId={autoroutedPharmacyId}
                  onSelect={(option) => handleSelect(option.id)}
                  shouldTrackOfferImpressionsAndSelections={
                    shouldTrackOfferImpressionsAndSelections
                  }
                  numberOfPrecedingOptions={brandedOptions.length}
                />
              ) : brandedOptions.length === 0 ? (
                <Text fontSize="sm" color="gray.600" py={4}>
                  No delivery pharmacies available.
                </Text>
              ) : null}
            </TabPanel>
          ) : (
            <TabPanel ariaLabel="Select a pickup pharmacy" pb={showFooter ? 32 : 8}>
              <SentPharmacyBanner
                sentPharmacyName={sentPharmacyName}
                sentToMailOrder={orderPharmacyIsMailOrder}
                activeTab={activeTab}
              />
              <PickupPharmacyCardList
                location={patientLocation}
                pharmacies={pickupPharmacies}
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
                shouldTrackOfferImpressionsAndSelections={shouldTrackOfferImpressionsAndSelections}
              >
                <BenefitsBanner
                  onTooltipClick={() =>
                    patientAnalytics.track('Benefits Banner Tooltip Clicked', order)
                  }
                />
              </PickupPharmacyCardList>
            </TabPanel>
          )}
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

              const allPharmaciesIncludingOffers = [
                ...pharmaciesFromOffers,
                ...pickupPharmacies,
                ...(patientMailOrderOptions ?? [])
              ];

              const selectedPharmacy = allPharmaciesIncludingOffers.find(
                (p) => p.id === selectedId
              );
              if (!selectedId || !selectedPharmacy) {
                console.error('No selectedId. Cannot set pharmacy on order.');
                return;
              }

              await handleSubmit(selectedPharmacy, {
                selectedFrom: inlineMailOrderOptions.some((o) => o.id === selectedId)
                  ? 'Mail Order List'
                  : 'Main List',
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
