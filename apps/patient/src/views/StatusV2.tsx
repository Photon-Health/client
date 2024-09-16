import { Box, Button, Container, Heading, Link, Text, VStack, useToast } from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import { types } from '@photonhealth/sdk';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCheck, FiNavigation, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import { DemoCtaModal, PHARMACY_BRANDING, PharmacyInfo, PoweredBy } from '../components';
import { Card } from '../components/Card';
import { FAQModal } from '../components/FAQModal';
import { OrderDetailsModal } from '../components/order-details/OrderDetailsModal';
import { OrderSummary } from '../components/order-summary/OrderSummary';
import { OrderStatusHeader } from '../components/statusV2/Header';
import * as TOAST_CONFIG from '../configs/toast';
import { formatAddress, getFulfillmentType, preparePharmacy } from '../utils/general';
import { orderStateMapping as m, text as t } from '../utils/text';
import { useOrderContext } from './Main';

export const StatusV2 = () => {
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

  const { fulfillment, pharmacy, readyBy, readyByTime } = order;

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

  // Demo pharmacies are already prepared
  const pharmacyWithHours = pharmacy ? (isDemo ? pharmacy : preparePharmacy(pharmacy)) : undefined;

  const isDeliveryPharmacy =
    fulfillmentType === 'MAIL_ORDER' ||
    fulfillmentType === 'COURIER' ||
    pharmacy?.name === 'Amazon Pharmacy';

  // TODO(mrochlin) Theres so typing issue here because MAIL_ORDER doesnt have RECEIVED as a valid state.
  const copy = m[fulfillmentType][fulfillmentState]!;

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

  const fulfillments = order.fulfillments.map((f) => ({
    ...f,
    rxName: f.prescription.treatment.name
  }));

  const prescriptions = fulfillments.map((f) => ({
    rxName: f.prescription.treatment.name,
    quantity: `${f.prescription?.dispenseQuantity} ${f.prescription?.dispenseUnit}`,
    daysSupply: f.prescription?.daysSupply ?? 0,
    numRefills: f.prescription?.fillsAllowed ?? 0,
    expiresAt: f.prescription?.expirationDate ?? new Date()
  }));

  const [faqModalIsOpen, setFaqModalIsOpen] = useState(false);
  const [orderDetailsIsOpen, setOrderDetailsIsOpen] = useState(false);

  const pharmacyInfo =
    order?.pharmacy?.id && isDeliveryPharmacy ? (
      <PharmacyInfo
        pharmacy={{
          id: order.pharmacy.id,
          ...PHARMACY_BRANDING[order.pharmacy.id]
        }}
        showDetails={false}
        isStatus
      />
    ) : pharmacyWithHours ? (
      <PharmacyInfo
        pharmacy={pharmacyWithHours}
        showDetails={fulfillmentType === 'PICK_UP'}
        isStatus
        showHours
      />
    ) : null;

  const navigateButton = (
    <Button
      mt={2}
      mx="auto"
      size="md"
      py={6}
      variant="solid"
      onClick={handleGetDirections}
      leftIcon={<FiNavigation />}
      w="full"
      bg="blue.600"
      _hover={{ bg: 'blue.700' }}
      color="white"
    >
      {t.directions}
    </Button>
  );

  const rerouteButton = (
    <Button
      mx="auto"
      size="md"
      py={6}
      variant="outline"
      onClick={handleRerouteLink}
      leftIcon={<FiRefreshCcw />}
      color="blue.500"
      w="full"
    >
      {t.changePharmacy}
    </Button>
  );

  const markReceivedButton = (
    <Button
      size="md"
      py={6}
      w="full"
      borderRadius="lg"
      variant="outline"
      color="blue.500"
      colorScheme={successfullySubmitted ? 'green' : undefined}
      leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
      onClick={!successfullySubmitted ? handleMarkOrderAsPickedUp : undefined}
      isLoading={submitting}
    >
      {successfullySubmitted ? t.thankYou : copy.cta(isMultiRx)}
    </Button>
  );

  return (
    <Box>
      <FAQModal isOpen={faqModalIsOpen} onClose={() => setFaqModalIsOpen(false)} />
      <DemoCtaModal isOpen={showDemoCtaModal} onClose={() => setShowDemoCtaModal(false)} />
      <OrderDetailsModal
        isOpen={orderDetailsIsOpen}
        onClose={() => setOrderDetailsIsOpen(false)}
        pharmacyName={order.pharmacy?.name ?? 'My Pharmacy'}
        prescriptions={prescriptions}
      />
      <Helmet>
        <title>{t.track}</title>
      </Helmet>

      <VStack spacing={4} width="full" alignItems={'stretch'}>
        <VStack p={4} bg="white" justifyContent={'center'}>
          <OrderStatusHeader
            status={'PROCESSING'}
            pharmacyEstimatedReadyAt={order.pharmacyEstimatedReadyAt}
            patientDesiredReadyAt={readyBy === 'Urgent' ? 'URGENT' : readyByTime}
            exception={order.pharmacy?.isOpen === false ? 'PHARMACY_CLOSED' : undefined}
          />
        </VStack>

        <VStack maxW={'xl'} mx="auto" w="full" spacing={6}>
          <OrderSummary
            fulfillments={fulfillments}
            onViewDetails={() => setOrderDetailsIsOpen(true)}
          />

          <VStack w="full" alignItems={'stretch'} px={4} spacing={4}>
            <Heading as="h4" size="md">
              Pharmacy
            </Heading>
            <Card>
              {pharmacyInfo}
              <VStack spacing={2} w="full">
                {pharmacyWithHours && !isDeliveryPharmacy && navigateButton}
                {!isDeliveryPharmacy && pharmacyWithHours && canReroute && rerouteButton}
                {pharmacyWithHours && showReceivedButton && markReceivedButton}
              </VStack>
            </Card>
          </VStack>
          <VStack w="full" alignItems={'stretch'} px={4} spacing={4}>
            <Heading as="h4" size="md">
              Need help?
            </Heading>
            <Card>
              <Button
                w="full"
                variant="outline"
                color="blue.500"
                onClick={() => setFaqModalIsOpen(true)}
              >
                I have a pharmacy issue
              </Button>
            </Card>
          </VStack>
        </VStack>
      </VStack>
      {fulfillmentType === types.FulfillmentType.MailOrder && fulfillment?.trackingNumber ? (
        <Box>
          <Container>
            <VStack spacing={4} align="start" py={5}>
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
            </VStack>
          </Container>
        </Box>
      ) : null}

      <Container as={VStack} w="full" my={4}>
        <PoweredBy />
      </Container>
    </Box>
  );
};
