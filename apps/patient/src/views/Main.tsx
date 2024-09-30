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

import { getSettings } from '@client/settings';

import { AUTH_HEADER_ERRORS, getOrder } from '../api/internal';
import { Nav } from '../components';
import { setAuthHeader } from '../configs/graphqlClient';
import theme from '../configs/theme';
import { demoOrder } from '../data/demoOrder';
import { FillWithCount, countFillsAndRemoveDuplicates } from '../utils/general';
import { Order } from '../utils/models';
import { Pharmacy } from '../__generated__/graphql';

interface OrderContextType {
  order: Order;
  flattenedFills: FillWithCount[];
  setOrder: (order: Order) => void;
  logo: any;
  isDemo: boolean;
  fetchOrder: (currentPharmacy?: Pharmacy) => void;
}
const OrderContext = createContext<OrderContextType | null>(null);
export const useOrderContext = () =>
  useContext<OrderContextType>(OrderContext as Context<OrderContextType>);

export const Main = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const orderId = searchParams.get('orderId');
  const phone = searchParams.get('phone');
  const useV2 = searchParams.get('v2');

  const [order, setOrder] = useState<Order | undefined>(isDemo ? demoOrder : undefined);

  const [logo, setLogo] = useState<any>(undefined);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const [flattenedFills, setFlattenedFills] = useState(
    isDemo ? countFillsAndRemoveDuplicates(demoOrder.fills) : []
  );

  const navigate = useNavigate();
  const location = useLocation();

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
      console.log('handleOrderResponse', newOrder);

      // This is weird, but it's necessary to show the selected pharmacy
      // when the user goes from selection to the status page
      setOrder({
        ...newOrder,
        pharmacy: currentPharmacy || newOrder?.pharmacy || order?.pharmacy
      });

      setFlattenedFills(countFillsAndRemoveDuplicates(newOrder.fills));

      datadogRum.setGlobalContextProperty('organizationId', newOrder.organization.id);
      datadogRum.setGlobalContextProperty('orderId', orderId);
      datadogRum.setUser({ patientId: newOrder.patient.id });

      if (newOrder.state === 'CANCELED') {
        navigate('/canceled', { replace: true });
        return;
      }

      const hasPharmacy = newOrder.pharmacy?.id;
      const redirect = hasPharmacy ? (useV2 ? '/status' : '/status') : '/review';

      navigate(`${redirect}?orderId=${newOrder.id}&token=${token}${useV2 ? '&v2=true' : ''}`, {
        replace: true
      });
    },
    [navigate, orderId, token, order, useV2]
  );

  const fetchOrder = useCallback(
    async (currentPharmacy?: Pharmacy) => {
      if (isDemo) return demoOrder;
      try {
        const result = await getOrder(orderId!);
        if (result) {
          handleOrderResponse(result, currentPharmacy);
        }
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
      navigate(`/review?demo=true&phone=${phone}`, { replace: true });
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
        const response = await import(`../assets/${fileName}`);
        await preloadImage(response.default);
        setLogo(response.default);
        setLoadingLogo(false);
      } catch (e: any) {
        console.error(e);
        setLoadingLogo(false);
      }
    }
  }, []);

  // Set logo
  useEffect(() => {
    if (order?.organization?.id) {
      const theme = getSettings(order.organization.id);

      if (isDemo) {
        fetchLogo('newco_logo.svg');
      } else {
        if (theme.logo) {
          fetchLogo(theme.logo);
        } else {
          setLoadingLogo(false);
        }
      }
    }
  }, [fetchLogo, isDemo, order?.organization.id]);

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
    isDemo: isDemo != null ?? false,
    order,
    flattenedFills,
    setOrder,
    logo,
    fetchOrder
  };

  return (
    <ChakraProvider theme={theme(order?.organization.id)}>
      <OrderContext.Provider value={orderContextValue}>
        <ScrollRestoration />
        <Nav />
        <Outlet />
      </OrderContext.Provider>
    </ChakraProvider>
  );
};
