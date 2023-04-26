import { useState, useContext, useEffect } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Heading,
  Link,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiCheck, FiMapPin } from 'react-icons/fi'
import { types } from '@photonhealth/react'

import { formatAddress } from '../utils/general'
import { Order } from '../utils/models'
import { MARK_ORDER_AS_PICKED_UP } from '../utils/mutations'
import { Nav } from '../components/Nav'
import { StatusStepper } from '../components/StatusStepper'
import { FixedFooter } from '../components/FixedFooter'
import { PoweredBy } from '../components/PoweredBy'
import { OrderContext } from './Main'
import { graphQLClient } from '../configs/graphqlClient'
import t from '../utils/text.json'

const AUTH_HEADER_ERRORS = ['EMPTY_AUTHORIZATION_HEADER', 'INVALID_AUTHORIZATION_HEADER']

export const Status = () => {
  const navigate = useNavigate()
  const order = useContext<Order>(OrderContext)

  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const token = searchParams.get('token')
  const courier = searchParams.get('courier')

  const [showFooter, setShowFooter] = useState<boolean>(order?.state === types.OrderState.Placed)

  const [error, setError] = useState(undefined)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false)

  const isCourier: boolean =
    courier === 'true' ||
    [process.env.REACT_APP_CAPSULE_PHARMACY_ID, process.env.REACT_APP_ALTO_PHARMACY_ID].includes(
      order?.pharmacy?.id
    )
  const fulfillmentType = isCourier ? 'courier' : 'pickup'

  const toast = useToast()

  const markOrderAsPickedUp = async () => {
    try {
      setSubmitting(true)

      graphQLClient.setHeader('x-photon-auth', token)
      const results: any = await graphQLClient.request(MARK_ORDER_AS_PICKED_UP, {
        markOrderAsPickedUpId: orderId
      })

      setTimeout(() => {
        if (results?.markOrderAsPickedUp) {
          setSuccessfullySubmitted(true)
          setTimeout(() => setShowFooter(false), 1000)
        } else {
          toast({
            title: t.status[fulfillmentType].errorToast.title,
            description: t.status[fulfillmentType].errorToast.description,
            position: 'top',
            status: 'error',
            duration: 5000,
            isClosable: true
          })
        }
        setSubmitting(false)
      }, 1000)
    } catch (error) {
      console.error(JSON.stringify(error, undefined, 2))

      if (error?.response?.errors) {
        if (AUTH_HEADER_ERRORS.includes(error.response.errors[0].extensions.code)) {
          navigate('/no-match')
        } else {
          setError(error.response.errors[0].message)
        }
      }
    }
  }

  useEffect(() => {
    if (!order?.fulfillment) {
      setTimeout(() => {
        window.location.reload()
      }, 60000)
    }
  }, [order?.fulfillment])

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  const { fulfillment, pharmacy, organization, address } = order

  const photonPhone: string = process.env.REACT_APP_TWILIO_SMS_NUMBER

  const showChatAlert =
    !isCourier && (fulfillment?.state === 'RECEIVED' || fulfillment?.state === 'READY')

  return (
    <Box>
      <Helmet>
        <title>{t.status.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} showRefresh />

      {/* Bottom padding is added so stepper can be seen when footer is showing on smaller screens */}
      <Container pb={showFooter ? 32 : undefined}>
        <VStack spacing={6} align="start" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.status.heading}
            </Heading>
            <Text>{t.status.subheading}</Text>
            {showChatAlert ? (
              <Alert status="warning">
                <AlertIcon />
                <Text>
                  {t.status.pickup.chat.prompt}{' '}
                  <Link href={`sms:${photonPhone}`} textDecoration="underline">
                    {t.status.pickup.chat.cta}
                  </Link>
                </Text>
              </Alert>
            ) : null}
          </VStack>
          {!isCourier && pharmacy?.name && pharmacy?.address ? (
            <Box alignSelf="start">
              <Text display="inline" color="gray.500">
                {t.status.pickup.pickup}
              </Text>
              <Link
                href={`http://maps.google.com/?q=${pharmacy.name}, ${formatAddress(
                  pharmacy.address
                )}`}
                display="inline"
                ms={2}
                color="brandLink"
                fontWeight="medium"
              >
                <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
                {pharmacy.name}, {pharmacy.address ? formatAddress(pharmacy.address) : ''}
              </Link>
            </Box>
          ) : null}
          <StatusStepper
            isCourier={isCourier}
            status={successfullySubmitted ? 'PICKED_UP' : fulfillment?.state || 'SENT'}
            patientAddress={formatAddress(address)}
          />
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            w="full"
            variant="brand"
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? markOrderAsPickedUp : undefined}
            isLoading={submitting}
          >
            {successfullySubmitted ? t.status.thankYou : t.status[fulfillmentType].cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  )
}
