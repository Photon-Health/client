import { useState, useContext, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { types } from '@photonhealth/sdk';

import { formatAddress, getFulfillmentType } from '../utils/general';
import { Order, Pharmacy as EnrichedPharmacy } from '../utils/models';
import { MARK_ORDER_AS_PICKED_UP } from '../utils/graphql';
import { Nav } from '../components/Nav';
import { StatusStepper } from '../components/StatusStepper';
import { FixedFooter } from '../components/FixedFooter';
import { PoweredBy } from '../components/PoweredBy';
import { OrderContext } from './Main';
import { graphQLClient } from '../configs/graphqlClient';
import * as TOAST_CONFIG from '../configs/toast';
import { text as t } from '../utils/text';
import { PharmacyCard } from '../components/PharmacyCard';
import { addRatingsAndHours } from '../utils/general';
import { AUTH_HEADER_ERRORS } from '../api/internal';

const PHOTON_PHONE_NUMBER: string = process.env.REACT_APP_TWILIO_SMS_NUMBER;

export const Status = () => {
  const navigate = useNavigate();
  const order = useContext<Order>(OrderContext);

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  const [showFooter, setShowFooter] = useState<boolean>(
    order?.state === types.OrderState.Placed &&
      order?.fulfillment?.type !== types.FulfillmentType.MailOrder
  );

  const [error, setError] = useState(undefined);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);
  const [enrichedPharmacy, setEnrichedPharmacy] = useState<EnrichedPharmacy | undefined>(undefined);

  const { fulfillment, pharmacy, organization, address } = order;

  const fulfillmentType = getFulfillmentType(pharmacy?.id, fulfillment, type);

  const toast = useToast();

  const handleMarkOrderAsPickedUp = async () => {
    try {
      setSubmitting(true);

      graphQLClient.setHeader('x-photon-auth', token);
      const results: any = await graphQLClient.request(MARK_ORDER_AS_PICKED_UP, {
        markOrderAsPickedUpId: orderId
      });

      setTimeout(() => {
        if (results?.markOrderAsPickedUp) {
          setSuccessfullySubmitted(true);
          setTimeout(() => setShowFooter(false), 1000);
        } else {
          toast({
            title: t.status[fulfillmentType].errorToast.title,
            description: t.status[fulfillmentType].errorToast.description,
            ...TOAST_CONFIG.ERROR
          });
        }
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error(JSON.stringify(error, undefined, 2));

      if (error?.response?.errors) {
        if (AUTH_HEADER_ERRORS.includes(error.response.errors[0].extensions.code)) {
          navigate('/no-match');
        } else {
          setError(error.response.errors[0].message);
        }
      }
    }
  };

  const handleGetDirections = () => {
    const url = `http://maps.google.com/?q=${pharmacy.name}, ${formatAddress(pharmacy.address)}`;
    window.open(url, '_blank').focus();
  };

  useEffect(() => {
    if (!order?.fulfillment) {
      setTimeout(() => {
        window.location.reload();
      }, 60000);
    }
  }, [order?.fulfillment]);

  const initializePharmacy = async (p: EnrichedPharmacy) => {
    await addRatingsAndHours(p);
    setEnrichedPharmacy(p);
  };

  useEffect(() => {
    // Show the pharmacy with ratings + hours if not mail order or courier
    const showEnrichedPharmacy =
      fulfillmentType !== (types.FulfillmentType.MailOrder || 'COURIER') &&
      pharmacy?.name &&
      pharmacy?.address;
    if (showEnrichedPharmacy) {
      initializePharmacy(pharmacy);
    }
  }, [pharmacy]);

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // Only show "Text us now" prompt if pickup and RECEIVED or READY
  const showChatAlert = fulfillment?.state === 'RECEIVED' || fulfillment?.state === 'READY';

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
                  {t.status.PICK_UP.chat.prompt}{' '}
                  <Link href={`sms:${PHOTON_PHONE_NUMBER}`} textDecoration="underline">
                    {t.status.PICK_UP.chat.cta}
                  </Link>
                </Text>
              </Alert>
            ) : null}
          </VStack>
          {enrichedPharmacy ? (
            <Box width="full">
              <PharmacyCard
                pharmacy={enrichedPharmacy}
                onChangePharmacy={() =>
                  navigate(`/pharmacy?orderId=${order.id}&token=${token}&reroute=true`)
                }
                onGetDirections={handleGetDirections}
              />
            </Box>
          ) : null}
          {fulfillmentType === types.FulfillmentType.MailOrder && fulfillment?.trackingNumber ? (
            <Box alignSelf="start">
              <Text display="inline" color="gray.600">
                {t.status.MAIL_ORDER.trackingNumber}
              </Text>
              <Link
                href={`https://google.com/search?q=${fulfillment.trackingNumber}`}
                display="inline"
                ms={2}
                color="brandLink"
                fontWeight="medium"
                target="_blank"
              >
                {fulfillment.trackingNumber}
              </Link>
            </Box>
          ) : null}
          <StatusStepper
            fulfillmentType={fulfillmentType}
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
            variant={successfullySubmitted ? undefined : 'brand'}
            colorScheme={successfullySubmitted ? 'green' : undefined}
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleMarkOrderAsPickedUp : undefined}
            isLoading={submitting}
          >
            {successfullySubmitted ? t.status.thankYou : t.status[fulfillmentType].cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
