import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Center, CircularProgress } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

import { Order } from '../utils/models';
import { getOrder } from '../api/internal';
import { demoOrder } from '../data/demoOrder';

import theme from '../configs/theme';
import { setAuthHeader } from '../configs/graphqlClient';
import { types } from '@photonhealth/sdk';
import { AUTH_HEADER_ERRORS } from '../api/internal';

const OrderContext = createContext(null);
export const useOrderContext = () => useContext(OrderContext);

export const Main = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');
  const isTrial = searchParams.get('trial');

  const [order, setOrder] = useState<Order | undefined>(isTrial ? demoOrder : undefined);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/canceled') {
      if (!isTrial && (!orderId || !token)) {
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
    }

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
      }

      // If an order was returned, use it for routing
      handleOrderResponse(error.response.data.order);
    }
  }, [navigate, orderId, token]);

  useEffect(() => {
    if (isTrial && order) {
      navigate(`/review?trial=true`, { replace: true });
    }
  }, [isTrial]);

  useEffect(() => {
    if (!isTrial && !order) {
      fetchOrder();
    }
  }, [order, orderId, fetchOrder]);

  if (!order) {
    return (
      <ChakraProvider theme={theme()}>
        <Center h="100vh">
          <CircularProgress isIndeterminate color="gray.800" />
        </Center>
      </ChakraProvider>
    );
  }

  const orderContextValue = { order, setOrder };

  return (
    <ChakraProvider theme={theme(order.organization.id)}>
      <OrderContext.Provider value={orderContextValue}>
        <Outlet />
      </OrderContext.Provider>
    </ChakraProvider>
  );
};
