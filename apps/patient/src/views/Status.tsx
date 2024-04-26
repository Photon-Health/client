import { Box, Button, Container, Heading, Link, Text, VStack, useToast } from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import { types } from '@photonhealth/sdk';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCheck, FiNavigation, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import {
  BrandedPharmacyCard,
  DemoCtaModal,
  PharmacyInfo,
  PoweredBy,
  StatusStepper
} from '../components';
import { PrescriptionsList } from '../components/PrescriptionsList';
import * as TOAST_CONFIG from '../configs/toast';
import { formatAddress, getFulfillmentType, preparePharmacy } from '../utils/general';
import { orderStateMapping as m, text as t } from '../utils/text';
import { useOrderContext } from './Main';

export const Status = () => {
  const navigate = useNavigate();
  const { order, flattenedFills, setOrder, isDemo } = useOrderContext();

  const orgSettings = getSettings(order?.organization.id);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const phone = searchParams.get('phone');

  const showReceivedButtonStates = ['RECEIVED', 'READY'];
  const [showReceivedButton, setShowReceivedButton] = useState<boolean>(
    showReceivedButtonStates.includes(order?.fulfillment?.state ?? '') &&
      order?.fulfillment?.type !== types.FulfillmentType.MailOrder
  );
  const [showDemoCtaModal, setShowDemoCtaModal] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  const { fulfillment, pharmacy, address } = order;

  const fulfillmentType = getFulfillmentType(
    pharmacy?.id,
    fulfillment ?? undefined,
    type ?? undefined
  );

  const toast = useToast();

  const handleMarkOrderAsPickedUp = async () => {
    if (!order) {
      return;
    }
    setSubmitting(true);

    // Show cta modal for demo
    if (isDemo) {
      setTimeout(() => {
        setSuccessfullySubmitted(true);
        setTimeout(() => {
          setShowReceivedButton(false);
          setShowDemoCtaModal(true);
        }, 1000);
        setSubmitting(false);
      }, 1000);

      return;
    }

    try {
      const result: boolean = await markOrderAsPickedUp(order.id);

      setTimeout(() => {
        if (result) {
          setSuccessfullySubmitted(true);
          setTimeout(() => setShowReceivedButton(false), 1000);

          setOrder({
            ...order,
            fulfillment: { ...order.fulfillment, state: 'PICKED_UP', type: fulfillment!.type }
          });
        } else {
          toast({
            title: m[fulfillmentType].error.title,
            description: m[fulfillmentType].error.description,
            ...TOAST_CONFIG.ERROR
          });
        }
        setSubmitting(false);
      }, 1000);
    } catch (error: any) {
      toast({
        title: m[fulfillmentType].error.title,
        description: m[fulfillmentType].error.description,
        ...TOAST_CONFIG.ERROR
      });

      setSubmitting(false);

      console.error(JSON.stringify(error, undefined, 2));
    }
  };

  const pharmacyFormattedAddress = pharmacy?.address ? formatAddress(pharmacy.address) : '';

  const handleGetDirections = () => {
    if (!pharmacy?.name) return;
    const url = `http://maps.google.com/?q=${pharmacy?.name}, ${pharmacyFormattedAddress}`;
    window.open(url);
  };

  useEffect(() => {
    if (!phone || !pharmacy || !order) {
      return;
    }
    if (isDemo && !order.fulfillment) {
      setTimeout(async () => {
        // Send order received sms to demo participant
        await triggerDemoNotification(
          phone!,
          'photon:order_fulfillment:received',
          pharmacy.name,
          pharmacyFormattedAddress
        );

        setOrder({
          ...order,
          fulfillment: {
            ...order.fulfillment,
            state: 'RECEIVED',
            type: 'PICK_UP' as types.FulfillmentType
          }
        });

        setShowReceivedButton(true);

        setTimeout(async () => {
          // Send ready sms
          await triggerDemoNotification(
            phone,
            'photon:order_fulfillment:ready',
            pharmacy.name,
            pharmacyFormattedAddress
          );

          setOrder({
            ...order,
            fulfillment: {
              ...order.fulfillment,
              state: 'READY',
              type: 'PICK_UP' as types.FulfillmentType
            }
          });

          setTimeout(() => setShowDemoCtaModal(true), 1500);
        }, 1000);
      }, 1000);
    }
  }, [
    isDemo,
    order,
    pharmacy,
    pharmacy?.address,
    pharmacy?.name,
    pharmacyFormattedAddress,
    phone,
    setOrder
  ]);

  const isMultiRx = flattenedFills.length > 1;

  // There's still a slight delay (1-3s) before fulfillment is created,
  // so default to SENT on first navigation
  const fulfillmentState = fulfillment?.state ?? 'SENT';

  const showTextUsPrompt =
    fulfillmentState === 'DELIVERED' ||
    fulfillmentState === 'PICKED_UP' ||
    fulfillmentState === 'RECEIVED';

  // Demo pharmacies are already prepared
  const pharmacyWithHours = pharmacy ? (isDemo ? pharmacy : preparePharmacy(pharmacy)) : undefined;

  const isDeliveryPharmacy = fulfillmentType === 'MAIL_ORDER' || fulfillmentType === 'COURIER';

  // TODO(mrochlin) Theres so typing issue here because MAIL_ORDER doesnt have RECEIVED as a valid state.
  const copy = (m[fulfillmentType] as any)[fulfillmentState];

  if (!order) {
    console.error('No order found');
    return null;
  }

  const canReroute = !isDemo && orgSettings.enablePatientRerouting && order.isReroutable;

  const handleRerouteLink = () => {
    const query = queryString.stringify({
      orderId: order.id,
      token,
      reroute: true,
      ...(!pharmacyWithHours?.isOpen ? { openNow: true } : {})
    });
    navigate(`/pharmacy?${query}`);
  };

  return (
    <Box>
      <DemoCtaModal isOpen={showDemoCtaModal} />
      <Helmet>
        <title>{t.track}</title>
      </Helmet>

      <Box bgColor="white">
        <Container>
          <VStack spacing={2} align="start" py={4}>
            <Heading as="h3" size="lg">
              {copy.heading}
            </Heading>
            <Box>
              <Text display="inline">
                {typeof copy.subheading === 'function'
                  ? copy.subheading(isMultiRx)
                  : copy.subheading}
              </Text>
              {showTextUsPrompt ? (
                <Text ms={1} display="inline">
                  Please
                  <Link
                    mx={1}
                    color="link"
                    textDecoration="underline"
                    href={`sms:${process.env.REACT_APP_TWILIO_SMS_NUMBER}`}
                  >
                    text us
                  </Link>
                  if you have any issues.
                </Text>
              ) : null}
            </Box>
            {fulfillmentType === types.FulfillmentType.MailOrder && fulfillment?.trackingNumber ? (
              <Box alignSelf="start">
                <Text display="inline" color="gray.600">
                  {t.tracking}
                </Text>
                <Link
                  href={`https://google.com/search?q=${fulfillment.trackingNumber}`}
                  display="inline"
                  ms={2}
                  color="link"
                  fontWeight="medium"
                  target="_blank"
                  data-dd-privacy="mask"
                >
                  {fulfillment.trackingNumber}
                </Link>
              </Box>
            ) : null}
          </VStack>
        </Container>

        {order?.pharmacy?.id && isDeliveryPharmacy ? (
          <BrandedPharmacyCard pharmacyId={order.pharmacy.id} />
        ) : pharmacyWithHours ? (
          <Container pb={4}>
            <VStack>
              <PharmacyInfo
                pharmacy={pharmacyWithHours}
                showDetails={fulfillmentType === 'PICK_UP'}
                isStatus
                price={0}
              />
              <Button
                mt={4}
                mx="auto"
                size="md"
                py={6}
                variant="solid"
                onClick={handleGetDirections}
                leftIcon={<FiNavigation />}
                w="full"
                bg="gray.900"
                color="white"
              >
                {t.directions}
              </Button>
              {canReroute ? (
                <Button
                  mx="auto"
                  size="md"
                  py={6}
                  variant="outline"
                  onClick={handleRerouteLink}
                  leftIcon={<FiRefreshCcw />}
                  bg="gray.50"
                  color="blue.500"
                  w="full"
                >
                  {t.changePharmacy}
                </Button>
              ) : null}

              {showReceivedButton ? (
                <Button
                  size="md"
                  py={6}
                  w="full"
                  borderRadius="lg"
                  variant="outline"
                  bg="gray.50"
                  color="blue.500"
                  colorScheme={successfullySubmitted ? 'green' : undefined}
                  leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
                  onClick={!successfullySubmitted ? handleMarkOrderAsPickedUp : undefined}
                  isLoading={submitting}
                >
                  {successfullySubmitted ? t.thankYou : copy.cta(isMultiRx)}
                </Button>
              ) : null}
            </VStack>
          </Container>
        ) : null}
      </Box>

      <Box bgColor="white" mt={2}>
        <Container>
          <VStack spacing={6} align="start" py={5}>
            <StatusStepper
              fulfillmentType={fulfillmentType}
              status={successfullySubmitted ? 'PICKED_UP' : fulfillmentState || 'SENT'}
              patientAddress={address ? formatAddress(address) : undefined}
            />
          </VStack>
        </Container>
      </Box>

      <Box bgColor="white" mt={2}>
        <PrescriptionsList />
      </Box>

      <Container as={VStack} w="full" py={4}>
        <PoweredBy />
      </Container>
    </Box>
  );
};
