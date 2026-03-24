import { Center, ChakraProvider, CircularProgress } from '@chakra-ui/react';
import { datadogRum } from '@datadog/browser-rum';
import { Context, createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom';
import queryString from 'query-string';

import { AUTH_HEADER_ERRORS, getOrder } from '../api';
import { Nav } from '../components';
import { setAuthHeader } from '../configs/graphqlClient';
import theme from '../configs/theme';
import { demoOrder } from '../data/demoOrder';
import { countFillsAndRemoveDuplicates, FillWithCount } from '../utils/general';
import { Order } from '../utils/models';
import { Pharmacy } from '../__generated__/graphql';
import { FAQModal } from '../components/FAQModal';
import { patientAnalytics } from '../configs/analytics';
import { shouldShowPriceToggle } from '../utils/shouldShowPriceToggle';
import { preloadImage } from '../utils/preloadImage';
import { usePageAnalytics } from '../hooks/usePageAnalytics';

type FetchOrderOptions = {
  triggerNavigationAfterFetch: boolean;
};

export interface OrderContextType {
  order: Order;
  flattenedFills: FillWithCount[];
  setOrder: (order: Order) => void;
  // enablePrice is used to track whether the patient has enabled price on the pharmacy page
  // but we need it set the pharmacy after the ready by page
  enablePrice: boolean;
  showPriceToggle: boolean;
  setEnablePrice: (enablePrice: boolean) => void;
  logo: any;
  isDemo: boolean;
  fetchOrder: (
    currentPharmacy?: Pharmacy,
    options?: FetchOrderOptions
  ) => Promise<Order | undefined>;
  setFaqModalIsOpen: (isOpen: boolean) => void;
  reason: string;
  setReason: (reason: string) => void;
}
export const OrderContext = createContext<OrderContextType | null>(null);
export const useOrderContext = () =>
  useContext<OrderContextType>(OrderContext as Context<OrderContextType>);

export enum PatientExperienceType {
  CONTROLLED = 'CONTROLLED_SUBSTANCE',
  UNCONTROLLED = 'UNCONTROLLED'
}

type TokenPrescriptionData = {
  dispenseQuantity: number;
  dispenseUnit: string;
  externalId: string;
  instructions: string;
  notes: string;
  refillsAllowed: number;
  daysSupply?: number;
  expiresAt?: string;
  treatment: { id: string; name: string; schedule: string };
};

export type TokenPayload = {
  organizationId: string;
  context: PatientExperienceType;
  metadata?: {
    reason: PatientExperienceType;
  };
  prescriptions?: TokenPrescriptionData[];
  pharmacyId: string;
  iat: number;
  exp: number;
  sub: string; // the subject is the patient id
};

export const Main = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const orderId = searchParams.get('orderId');
  const phone = searchParams.get('phone');
  const location = useLocation();

  const [order, setOrder] = useState<Order | undefined>(isDemo ? demoOrder : undefined);
  // This is used to track whether the patient has enabled price on the pharmacy page
  const [showPriceToggle, setShowPriceToggle] = useState<boolean>(false);
  const [enablePrice, setEnablePrice] = useState<boolean>(true); // default is to show cash price

  const [logo, setLogo] = useState<any>(undefined);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const [flattenedFills, setFlattenedFills] = useState(
    isDemo ? countFillsAndRemoveDuplicates(demoOrder.fills) : []
  );

  const navigate = useNavigate();
  usePageAnalytics({ pageName: 'Main' });
  const [faqModalIsOpen, setFaqModalIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('');

  const orgId = order?.organization.id;
  const settings = order?.organization.settings;

  useEffect(() => {
    if (order) {
      patientAnalytics.identify({
        userId: order.patient.id,
        address: order.address
          ? {
              city: order.address.city,
              country: order.address.country,
              postalCode: order.address.postalCode,
              state: order.address.state,
              street: order.address.street2
                ? `${order.address.street1}, ${order.address.street2}`
                : order.address.street1
            }
          : undefined,
        orgId: order.organization.id,
        orgName: order.organization.name
      });
    }
  }, [order?.patient.id, order?.organization.id, order?.organization.name, order?.address]);

  useEffect(
    function triggerDatadogShortlinkOpenEvent() {
      // If the user opens a shortlink, send an event to Datadog
      // Only trigger on / because thats the first page they see when clicking a shortlink
      if (location.pathname === '/' && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          datadogRum.addAction('shortlink-opened', {
            orderId: payload.orderId,
            patientId: payload.sub,
            organizationId: payload.organizationId,
            context: payload.context,
            metadata: payload.metadata
          });
        } catch (e) {
          console.error('Failed to parse JWT token', e);
        }
      }
    },
    [location.pathname, token]
  );

  useEffect(() => {
    // need to parse the token and see if this is a controlled substance link
    let tokenData: TokenPayload | undefined;
    try {
      const base64TokenData = token?.split('.')?.[1];
      tokenData = base64TokenData ? JSON.parse(atob(base64TokenData)) : undefined;
    } catch (err) {
      console.error('failed to parse token data', { err });
    }

    const isControlled =
      tokenData?.context === PatientExperienceType.CONTROLLED ||
      tokenData?.metadata?.reason === PatientExperienceType.CONTROLLED;

    if (location.pathname === '/' && isControlled) {
      // info lives outside of the main path, so none of these effect hooks will affect the ux
      navigate(`/info?token=${token}`, { replace: true });
    } else if (!['/canceled', '/info'].includes(location.pathname)) {
      if (!isDemo && (!orderId || !token)) {
        navigate('/no-match', { replace: true });
      }
    }
  }, [isDemo, location.pathname, navigate, orderId, token]);

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
    }
  }, [token]);

  const setOrderDataLocally = useCallback(
    (newOrder: Order, currentPharmacy?: Pharmacy) => {
      // This is weird, but it's necessary to show the selected pharmacy
      // when the user goes from selection to the status page
      setOrder({
        ...newOrder,
        pharmacy: currentPharmacy || newOrder?.pharmacy || order?.pharmacy
      });

      const newFlattenedFills = countFillsAndRemoveDuplicates(newOrder.fills);
      setFlattenedFills(newFlattenedFills);

      const showPriceToggle = shouldShowPriceToggle(newFlattenedFills, newOrder);
      setShowPriceToggle(showPriceToggle);

      datadogRum.setGlobalContextProperty('organizationId', newOrder.organization.id);
      datadogRum.setGlobalContextProperty('orderId', orderId);
      datadogRum.setUser({ patientId: newOrder.patient.id });

      patientAnalytics.track('Patient App Opened', newOrder, {});
    },
    [orderId, order]
  );
  const navigateForOrder = useCallback(
    (newOrder: Order) => {
      if (newOrder.state === 'CANCELED') {
        navigate('/canceled', { replace: true });
        return;
      }

      const hasPharmacy = newOrder.pharmacy?.id;
      const redirect = hasPharmacy ? '/status' : '/review';

      const query = queryString.stringify({ orderId: newOrder.id, token });
      navigate(`${redirect}?${query}`, {
        replace: true
      });
    },
    [navigate, token]
  );

  const fetchOrder = useCallback(
    async (
      currentPharmacy?: Pharmacy,
      options: FetchOrderOptions = { triggerNavigationAfterFetch: true }
    ) => {
      if (isDemo) return demoOrder;
      try {
        const result = await getOrder(orderId!);
        if (result) {
          setOrderDataLocally(result, currentPharmacy);

          if (options.triggerNavigationAfterFetch) {
            navigateForOrder(result);
          }
        }
        return result;
      } catch (e: any) {
        const error = e as any;
        console.log(error.response);

        const isAuthError = AUTH_HEADER_ERRORS.includes(
          error?.response?.errors?.[0].extensions.code
        );
        const hasOrder = !!error?.response?.data?.order;
        if (isAuthError || !hasOrder) {
          navigate('/no-match', { replace: true });
          return;
        }

        // If an order was returned, use it for routing
        setOrderDataLocally(error.response.data.order);
        navigateForOrder(error.response.data.order);
      }
    },
    [isDemo, orderId, setOrderDataLocally, navigateForOrder, navigate]
  );

  useEffect(() => {
    if (isDemo && (orderId || order?.id !== demoOrder.id || location.pathname === '/')) {
      const query = queryString.stringify({ demo: true, phone });
      navigate(`/review?${query}`, { replace: true });
    }
  }, [isDemo, location.pathname, navigate, order, orderId, phone]);

  useEffect(() => {
    // it's valid to not have an orderId since we're notifying patients of controlled substances in athena
    if (!order && orderId) {
      fetchOrder();
    }
  }, [order, orderId, fetchOrder, isDemo]);

  const fetchLogo = useCallback(async (fileName: string) => {
    if (fileName === 'photon') {
      setLogo('photon');
      setLoadingLogo(false);
    } else {
      try {
        let imgHref = fileName;
        // if the logo is not a url, it's a file in the assets folder
        if (!imgHref.startsWith('http')) {
          const response = await import(`../assets/${fileName}`);
          imgHref = response.default as string;
        }
        await preloadImage(imgHref);
        setLogo(imgHref);
        setLoadingLogo(false);
      } catch (e: any) {
        console.error(e);
        setLoadingLogo(false);
      }
    }
  }, []);

  // Set logo
  useEffect(() => {
    if (orgId) {
      if (settings?.brandLogo) {
        fetchLogo(settings.brandLogo);
      } else {
        setLoadingLogo(false);
      }
    }
  }, [fetchLogo, isDemo, settings, orgId]);

  if (!order || loadingLogo) {
    return (
      <ChakraProvider theme={theme()}>
        <Center h="100vh">
          <CircularProgress isIndeterminate color="gray.800" />
        </Center>
      </ChakraProvider>
    );
  }

  const orderContextValue = {
    isDemo: isDemo != null,
    order,
    flattenedFills,
    setOrder,
    showPriceToggle,
    enablePrice,
    setEnablePrice,
    logo,
    fetchOrder,
    setFaqModalIsOpen,
    reason,
    setReason
  };

  const isAutomatedOrder = order.organization.settings?.patientUx.enableAutomatedOps;

  return (
    <ChakraProvider theme={theme({ accentColor: settings?.brandColor })}>
      <OrderContext.Provider value={orderContextValue}>
        <ScrollRestoration />
        <Nav />
        <Outlet />
        <FAQModal
          isOpen={faqModalIsOpen}
          onClose={() => setFaqModalIsOpen(false)}
          allowMessageSupport={!isAutomatedOrder}
        />
      </OrderContext.Provider>
    </ChakraProvider>
  );
};
