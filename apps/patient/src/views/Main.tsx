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
import { demoPharmacies } from '../data/demoPharmacies';
import { countFillsAndRemoveDuplicates, FillWithCount } from '../utils/general';
import { Order } from '../utils/models';
import { Pharmacy } from '../__generated__/graphql';
import { FAQModal } from '../components/FAQModal';
import { patientAnalytics } from '../configs/analytics';
import { shouldShowPriceToggle } from '../utils/shouldShowPriceToggle';
import { preloadImage } from '../utils/preloadImage';

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
  phone: string | null;
  demoToken: DemoTokenPayload | undefined;
  fetchOrder: (
    currentPharmacy?: Pharmacy,
    options?: FetchOrderOptions
  ) => Promise<Order | undefined>;
  setFaqModalIsOpen: (isOpen: boolean) => void;
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

export type DemoTokenPayload = {
  demo: true;
  phoneNumber: string;
  context: 'demo-select-pharmacy' | 'demo-order-status';
  iat: number;
  exp: number;
};

function isDemoToken(payload: any): payload is DemoTokenPayload {
  return payload?.demo === true;
}

export const Main = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const legacyIsDemo = searchParams.get('demo');
  const orderId = searchParams.get('orderId');
  const legacyPhone = searchParams.get('phone');
  const location = useLocation();

  // Parse JWT if present — detect demo tokens
  let demoToken: DemoTokenPayload | undefined;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (isDemoToken(payload)) {
        demoToken = payload;
      }
    } catch (e) {
      console.error('Failed to parse demo JWT token', e);
    }
  }

  // Unified demo state — JWT takes priority, legacy params as fallback
  const isDemo = !!demoToken || legacyIsDemo != null;
  const phone = demoToken?.phoneNumber ?? legacyPhone;
  const demoContext = demoToken?.context;

  const [order, setOrder] = useState<Order | undefined>(isDemo ? demoOrder : undefined);
  // This is used to track whether the patient has enabled price on the pharmacy page
  const [showPriceToggle, setShowPriceToggle] = useState<boolean>(false);
  const [enablePrice, setEnablePrice] = useState<boolean>(isDemo);

  const [logo, setLogo] = useState<any>(undefined);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const [flattenedFills, setFlattenedFills] = useState(
    isDemo ? countFillsAndRemoveDuplicates(demoOrder.fills) : []
  );

  const navigate = useNavigate();
  const [faqModalIsOpen, setFaqModalIsOpen] = useState(false);

  const orgId = order?.organization.id;
  const settings = order?.organization.settings;

  useEffect(() => {
    if (order?.patient.id && order?.organization.id && order?.organization.name && order?.address) {
      patientAnalytics.identify({
        userId: order.patient.id,
        address: {
          city: order.address.city,
          country: order.address.country,
          postalCode: order.address.postalCode,
          state: order.address.state,
          street: order.address.street2
            ? `${order.address.street1}, ${order.address.street2}`
            : order.address.street1
        },
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
          if (payload.demo) {
            datadogRum.addAction('shortlink-opened', {
              demo: true,
              context: payload.context
            });
          } else {
            datadogRum.addAction('shortlink-opened', {
              orderId: payload.orderId,
              patientId: payload.sub,
              organizationId: payload.organizationId,
              context: payload.context,
              metadata: payload.metadata
            });
          }
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
      const parsed = base64TokenData ? JSON.parse(atob(base64TokenData)) : undefined;
      // Only treat as TokenPayload if it's not a demo token
      if (parsed && !parsed.demo) {
        tokenData = parsed;
      }
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
      setEnablePrice(showPriceToggle);

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
    if (!isDemo) return;
    if (orderId || order?.id !== demoOrder.id || location.pathname === '/') {
      const query = demoToken
        ? queryString.stringify({ token })
        : queryString.stringify({ demo: true, phone });

      if (demoContext === 'demo-order-status') {
        // Pre-select a demo pharmacy and go straight to status
        if (!order?.pharmacy) {
          setOrder({ ...demoOrder, pharmacy: demoPharmacies[0] });
        }
        navigate(`/status?${query}`, { replace: true });
      } else {
        // demo-select-pharmacy or legacy — start at review
        navigate(`/review?${query}`, { replace: true });
      }
    }
  }, [isDemo, demoContext, location.pathname, navigate, order, orderId, phone, token, demoToken]);

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
    isDemo,
    phone,
    demoToken,
    order,
    flattenedFills,
    setOrder,
    showPriceToggle,
    enablePrice,
    setEnablePrice,
    logo,
    fetchOrder,
    setFaqModalIsOpen
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
