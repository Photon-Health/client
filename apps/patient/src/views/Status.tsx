import { Box, Button, Container, Heading, Link, Text, VStack, useToast } from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCheck, FiNavigation, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FulfillmentType } from '../__generated__/graphql';
import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import { DemoCtaModal, PHARMACY_BRANDING, PharmacyInfo, PoweredBy } from '../components';
import { Card } from '../components/Card';
import { FAQModal } from '../components/FAQModal';
import { FulfillmentData, OrderSummary } from '../components/order-summary/OrderSummary';
import { OrderStatusHeader } from '../components/statusV2/Header';
import * as TOAST_CONFIG from '../configs/toast';
import { formatAddress, getFulfillmentType, preparePharmacy } from '../utils/general';
import { orderStateMapping as m, text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { OrderDetailsModal, PrescriptionData } from '../components/order-details/OrderDetailsModal';

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
      order?.fulfillment?.type !== FulfillmentType.MailOrder
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
            type: FulfillmentType.PickUp
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
              type: FulfillmentType.PickUp
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

  const fulfillments: FulfillmentData[] = flattenedFills.flatMap((f) => [
    {
      rxName: f.treatment.name,
      exceptions: [],
      pharmacyEstimatedReadyTime: new Date('2024-09-13T20:00:00.000Z'),
      state: 'PROCESSING'
    },
    {
      rxName: f.treatment.name,
      exceptions: [
        { type: 'OOS', message: 'Zepbound is out of stock but will be in soon' },
        { type: 'PA_REQUIRED', message: 'Zepbound is out of stock but will be in soon' }
      ],
      pharmacyEstimatedReadyTime: new Date('2024-09-13T21:00:00.000Z'),
      state: 'PROCESSING'
    }
  ]);

  const prescriptions: PrescriptionData[] = flattenedFills.flatMap((f) => [
    {
      rxName: f.treatment.name,
      quantity: `${f.prescription?.dispenseQuantity} ${f.prescription?.dispenseUnit}`,
      daysSupply: f.prescription?.daysSupply ?? 0,
      numRefills: f.prescription?.fillsAllowed ?? 0,
      expiresAt: f.prescription?.expirationDate ?? new Date()
    },
    {
      rxName: f.treatment.name,
      quantity: `${f.prescription?.dispenseQuantity} ${f.prescription?.dispenseUnit}`,
      daysSupply: f.prescription?.daysSupply ?? 0,
      numRefills: f.prescription?.fillsAllowed ?? 0,
      expiresAt: f.prescription?.expirationDate ?? new Date()
    }
  ]);

  const [faqModalIsOpen, setFaqModalIsOpen] = useState(false);
  const [orderDetailsIsOpen, setOrderDetailsIsOpen] = useState(false);

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
            pharmacyEstimatedReadyAt={new Date() ?? order.pharmacyEstimatedReadyAt}
            patientDesiredReadyAt={readyBy === 'Urgent' ? 'URGENT' : readyByTime}
            exception={order.pharmacy?.isOpen === false ? 'PHARMACY_CLOSED' : undefined}
          />
        </VStack>

        <OrderSummary
          fulfillments={fulfillments}
          onViewDetails={() => setOrderDetailsIsOpen(true)}
        />

        <VStack w="full" alignItems={'stretch'} px={4} spacing={4}>
          <Heading as="h4" size="md">
            Pharmacy
          </Heading>
          <Card>
            {order?.pharmacy?.id && isDeliveryPharmacy ? (
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
              />
            ) : null}
            <VStack spacing={2} w="full">
              {pharmacyWithHours && !isDeliveryPharmacy ? (
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
              ) : null}
              {!isDeliveryPharmacy && pharmacyWithHours && canReroute ? (
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
              {pharmacyWithHours && showReceivedButton ? (
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
      <Box>
        <Container className="CONT">
          <VStack spacing={4} align="start" py={5} className="VSTACK">
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
      </Box>

      <Container as={VStack} w="full" py={4}>
        <PoweredBy />
      </Container>
    </Box>
  );
};
