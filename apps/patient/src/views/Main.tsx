import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Center, CircularProgress } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import { datadogRum } from '@datadog/browser-rum';

import { countFillsAndRemoveDuplicates } from '../utils/general';
import { Order } from '../utils/models';
import { getOrder } from '../api/internal';
import { demoOrder } from '../data/demoOrder';

import { getSettings } from '@client/settings';
import { types } from '@photonhealth/sdk';
import theme from '../configs/theme';
import { setAuthHeader } from '../configs/graphqlClient';
import { AUTH_HEADER_ERRORS } from '../api/internal';

const OrderContext = createContext(null);
export const useOrderContext = () => useContext(OrderContext);

export const Main = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const [order, setOrder] = useState<Order | undefined>(isDemo ? demoOrder : undefined);

  const [logo, setLogo] = useState(undefined);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const [flattenedFills, setFlattenedFills] = useState(
    isDemo ? countFillsAndRemoveDuplicates(demoOrder.fills) : []
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/canceled') {
      if (!isDemo && (!orderId || !token)) {
        console.error('Missing orderId or token in search params');
        navigate('/no-match', { replace: true });
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
    }
  }, [token]);

  const handleOrderResponse = (order: Order) => {
    setOrder(order);

    if (order.state === types.OrderState.Canceled) {
      navigate('/canceled', { replace: true });
      return;
    }

    setFlattenedFills(countFillsAndRemoveDuplicates(order.fills));

    datadogRum.setGlobalContextProperty('organizationId', order.organization.id);
    datadogRum.setUser({ patientId: order.patient.id });

    const hasPharmacy = order.pharmacy?.id;
    const redirect = hasPharmacy ? '/status' : '/review';

    navigate(`${redirect}?orderId=${order.id}&token=${token}`, { replace: true });
  };

  const fetchOrder = useCallback(async () => {
    try {
      const result: Order = await getOrder(orderId);
      if (result) {
        handleOrderResponse(result);
      }
    } catch (error) {
      console.log(error.response);

      const isAuthError = AUTH_HEADER_ERRORS.includes(error?.response?.errors?.[0].extensions.code);
      const hasOrder = !!error?.response?.data?.order;
      if (isAuthError || !hasOrder) {
        navigate('/no-match', { replace: true });
        return;
      }

      // If an order was returned, use it for routing
      handleOrderResponse(error.response.data.order);
    }
  }, [navigate, orderId, token]);

  useEffect(() => {
    if (isDemo && order) {
      navigate(`/review?demo=true&phone=${phone}`, { replace: true });
    }
  }, [isDemo]);

  useEffect(() => {
    if (!isDemo && !order) {
      fetchOrder();
    }
  }, [order, orderId, fetchOrder]);

  const preloadImage = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  };

  const fetchLogo = async (fileName: string) => {
    if (fileName === 'photon') {
      setLogo('photon');
      setLoadingLogo(false);
    } else {
      try {
        const response = await import(`../assets/${fileName}`);
        await preloadImage(response.default);
        setLogo(response.default);
        setLoadingLogo(false);
      } catch (e) {
        console.error(e);
        setLoadingLogo(false);
      }
    }
  };

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
  }, [order?.organization?.id]);

  if (!order || loadingLogo) {
    return (
      <ChakraProvider theme={theme()}>
        <Center h="100vh">
          <CircularProgress isIndeterminate color="gray.800" />
        </Center>
      </ChakraProvider>
    );
  }

  const orderContextValue = { order, flattenedFills, setOrder, logo };

  return (
    <ChakraProvider theme={theme(order.organization.id)}>
      <OrderContext.Provider value={orderContextValue}>
        <Outlet />
      </OrderContext.Provider>
    </ChakraProvider>
  );
};
