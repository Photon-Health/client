import { useState, useEffect, useCallback, createContext } from 'react';
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertIcon, Center, CircularProgress } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

import { Order } from '../utils/models';
import { GET_ORDER } from '../graphql';
import { graphQLClient } from '../configs/graphqlClient';

import theme from '../configs/theme';
import { setAuthHeader } from '../configs/graphqlClient';
import { types } from '@photonhealth/sdk';
import { AUTH_HEADER_ERRORS } from '../api/internal';

export const OrderContext = createContext(null);

export const Main = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  if (token) {
    setAuthHeader(token);
  }

  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname !== '/canceled') {
    if (!orderId || !token) {
      console.error('Missing orderId or token in search params');
      navigate('/no-match');
    }
  }

  const fetchOrder = useCallback(async () => {
    try {
      const results: any = await graphQLClient.request(GET_ORDER, { id: orderId });
      if (results) {
        setOrder(results.order);

        if (results?.order.state === types.OrderState.Canceled) {
          navigate('/canceled', { replace: true });
        }

        const isMissingPharmacy = !results.order?.pharmacy?.id;
        if (isMissingPharmacy) {
          navigate(`/review?orderId=${results.order.id}&token=${token}`, {
            replace: true
          });
        } else {
          navigate(`/status?orderId=${results.order.id}&token=${token}`, {
            replace: true
          });
        }
      }
    } catch (error) {
      console.log(error);

      if (error?.response?.data?.order.state === types.OrderState.Canceled) {
        navigate('/canceled', { replace: true });
      }

      if (error?.response?.errors) {
        const isMissingPharmacyError = error.response.errors.some(
          (err: any) =>
            err.message.includes('No order fulfillment') ||
            err.message.includes('No pharmacy found')
        );
        if (isMissingPharmacyError) {
          setOrder(error.response.data.order);
          navigate(`/review?orderId=${error.response.data.order.id}&token=${token}`, {
            replace: true
          });
        } else {
          if (AUTH_HEADER_ERRORS.includes(error.response.errors[0].extensions.code)) {
            navigate('/no-match');
          } else {
            setError(error.response.errors[0].message);
          }
        }
      }
    }
  }, [navigate, orderId, token]);

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
  }, [order, orderId, fetchOrder]);

  if (error) {
    return (
      <ChakraProvider theme={theme()}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </ChakraProvider>
    );
  }

  if (!order) {
    return (
      <ChakraProvider theme={theme()}>
        <Center h="100vh">
          <CircularProgress isIndeterminate color="gray.800" />
        </Center>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme(order.organization.id)}>
      <OrderContext.Provider value={order}>
        <Outlet />
      </OrderContext.Provider>
    </ChakraProvider>
  );
};
