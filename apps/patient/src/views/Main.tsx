import { useState, useEffect, useCallback, createContext } from 'react'
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Alert, AlertIcon, Center, CircularProgress } from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'

import { Order } from '../utils/models'
import { GET_ORDER } from '../utils/queries'
import { graphQLClient } from '../configs/graphqlClient'

import theme from '../configs/theme'

const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER']

export const OrderContext = createContext(null)

export const Main = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const token = searchParams.get('token')

  const [order, setOrder] = useState<Order | undefined>(undefined)

  const [error, setError] = useState<string | undefined>(undefined)

  const navigate = useNavigate()
  const location = useLocation()

  if (!orderId || !token) {
    console.error('Missing orderId or token in search params')
    navigate('/no-match')
  }

  const fetchOrder = useCallback(async () => {
    try {
      graphQLClient.setHeader('x-photon-auth', token)
      const results: any = await graphQLClient.request(GET_ORDER, { id: orderId })
      if (results) {
        setOrder(results.order)
      }
    } catch (error) {
      console.error(JSON.stringify(error, undefined, 2))
      console.log(error)

      if (error?.response?.errors) {
        const isMissingPharmacyError = error.response.errors.some(
          (err: any) =>
            err.message.includes('No order fulfillment') ||
            err.message.includes('No pharmacy found')
        )
        if (isMissingPharmacyError) {
          setOrder(error.response.data.order)
          navigate(`/pharmacy?orderId=${orderId}&token=${token}`)
        } else {
          if (AUTH_HEADER_ERRORS.includes(error.response.errors[0].extensions.code)) {
            navigate('/no-match')
          } else {
            setError(error.response.errors[0].message)
          }
        }
      }
    }
  }, [navigate, orderId, token])

  useEffect(() => {
    if (!order) {
      fetchOrder()
    }
  }, [order, orderId, fetchOrder])

  if (error) {
    return (
      <ChakraProvider theme={theme()}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </ChakraProvider>
    )
  }

  if (!order) {
    return (
      <ChakraProvider theme={theme()}>
        <Center h="100vh">
          <CircularProgress isIndeterminate color="gray.800" />
        </Center>
      </ChakraProvider>
    )
  }

  if (location.pathname !== '/status' && order?.pharmacy?.id) {
    navigate(`/status?orderId=${orderId}&token=${token}`, { replace: true })
  }

  return (
    <ChakraProvider theme={theme(order.organization.id)}>
      <OrderContext.Provider value={order}>
        <Outlet />
      </OrderContext.Provider>
    </ChakraProvider>
  )
}
