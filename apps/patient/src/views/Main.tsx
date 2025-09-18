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
  fetchOrder: (currentPharmacy?: Pharmacy) => Promise<Order | undefined>;
  setFaqModalIsOpen: (isOpen: boolean) => void;
}
export const OrderContext = createContext<OrderContextType | null>(null);
export const useOrderContext = () =>
  useContext<OrderContextType>(OrderContext as Context<OrderContextType>);

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
  const [enablePrice, setEnablePrice] = useState<boolean>(false);

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
    if (location.pathname !== '/canceled') {
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

  const handleOrderResponse = useCallback(
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
    [navigate, orderId, token, order]
  );

  const fetchOrder = useCallback(
    async (currentPharmacy?: Pharmacy) => {
      if (isDemo) return demoOrder;
      try {
        const result = await getOrder(orderId!);
        if (result) {
          handleOrderResponse(result, currentPharmacy);
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
        handleOrderResponse(error.response.data.order);
      }
    },
    [handleOrderResponse, isDemo, navigate, orderId]
  );

  useEffect(() => {
    if (isDemo && (orderId || order?.id !== demoOrder.id || location.pathname === '/')) {
      const query = queryString.stringify({ demo: true, phone });
      navigate(`/review?${query}`, { replace: true });
    }
  }, [isDemo, location.pathname, navigate, order, orderId, phone]);

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
  }, [order, orderId, fetchOrder, isDemo]);

  const preloadImage = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  };

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
      if (isDemo) {
        fetchLogo('newco_logo.svg');
      } else if (settings?.brandLogo) {
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
