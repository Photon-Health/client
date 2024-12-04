import { Box, Button, Container, Heading, Link, Text, VStack } from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import queryString from 'query-string';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiNavigation, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { triggerDemoNotification } from '../api';
import { Coupons, DemoCtaModal, PHARMACY_BRANDING, PharmacyInfo, PoweredBy } from '../components';
import { Card } from '../components/Card';
import { HolidayAlert } from '../components/HolidayAlert';
import { OrderDetailsModal } from '../components/order-details/OrderDetailsModal';
import { OrderSummary } from '../components/order-summary/OrderSummary';
import { OrderStatusHeader } from '../components/statusV2/Header';
import {
  deriveOrderStatus,
  getFulfillmentTrackingLink,
  getLatestReadyTime
} from '../utils/fulfillmentsHelpers';
import { formatAddress, getFulfillmentType, preparePharmacy } from '../utils/general';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

export const StatusV2 = () => {
  const navigate = useNavigate();
  const { order, setOrder, isDemo, setFaqModalIsOpen } = useOrderContext();

  const orgSettings = getSettings(order?.organization.id);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const phone = searchParams.get('phone');

  const [showDemoCtaModal, setShowDemoCtaModal] = useState<boolean>(false);

  const { fulfillment, pharmacy, readyBy, readyByTime } = order;

  const fulfillmentType = getFulfillmentType(
    pharmacy?.id,
    fulfillment ?? undefined,
    type ?? undefined
  );

  const fulfillmentTrackingLink = fulfillment && getFulfillmentTrackingLink(fulfillment);

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
          phone,
          'photon:order_fulfillment:received',
          pharmacy.name,
          pharmacyFormattedAddress
        );

        setOrder({
          ...order,
          fulfillment: {
            ...order.fulfillment,
            state: 'RECEIVED',
            type: 'PICK_UP'
          }
        });

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
              type: 'PICK_UP'
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

  const [orderDetailsIsOpen, setOrderDetailsIsOpen] = useState(false);

  // Demo pharmacies are already prepared
  const pharmacyWithHours = pharmacy ? (isDemo ? pharmacy : preparePharmacy(pharmacy)) : undefined;

  const isDeliveryPharmacy =
    fulfillmentType === 'MAIL_ORDER' ||
    fulfillmentType === 'COURIER' ||
    [
      'phr_01GA9HPV5XYTC1NNX213VRRBZ3', // Amazon Pharmacy
      'phr_01HH0B05XNYH876AY8JZ7BD256', // Cost Plus Pharmacy
      'phr_01GA9HPXGSDTSB0Z70BRK5XEP0' // Walmart Mail Order Pharmacy
    ].includes(pharmacy?.id as string);

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
    rxName: f.prescription.treatment.name,
    exceptions: f.exceptions.filter((e) => e.resolvedAt == null)
  }));

  const prescriptions = fulfillments.map((f) => ({
    rxName: f.prescription.treatment.name,
    quantity: `${f.prescription?.dispenseQuantity} ${f.prescription?.dispenseUnit}`,
    daysSupply: f.prescription?.daysSupply ?? 0,
    numRefills: f.prescription?.fillsAllowed ? f.prescription.fillsAllowed - 1 : 0,
    expiresAt: f.prescription?.expirationDate ?? new Date()
  }));

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

  const pharmacyEstimatedReadyAt = useMemo(() => getLatestReadyTime(fulfillments), [fulfillments]);
  const orderState = useMemo(
    () =>
      order.fulfillment?.type === 'MAIL_ORDER'
        ? (order.fulfillment.state as 'FILLING' | 'SHIPPED' | 'DELIVERED')
        : deriveOrderStatus(fulfillments),
    [fulfillments, order.fulfillment]
  );

  return (
    <VStack flex={1}>
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
      <VStack spacing={4} width="full" alignItems={'stretch'} flex={1}>
        <Box bgColor="white" shadow="sm">
          <Container py={4}>
            <VStack spacing={4} width="full" alignItems="stretch">
              <HolidayAlert>Holiday may affect pharmacy hours.</HolidayAlert>
              <OrderStatusHeader
                status={orderState}
                pharmacyEstimatedReadyAt={pharmacyEstimatedReadyAt}
                patientDesiredReadyAt={readyBy === 'Urgent' ? 'URGENT' : readyByTime}
                exception={
                  order.pharmacy?.isOpen === false
                    ? 'PHARMACY_CLOSED'
                    : fulfillments
                        .map((f) => f.exceptions[0]?.exceptionType)
                        .find((e) => e != null) ?? undefined
                }
              />
            </VStack>
          </Container>
        </Box>

        <Container>
          <VStack spacing={6}>
            <VStack w="full" alignItems="stretch" spacing={4}>
              <Heading as="h4" size="md">
                Pharmacy
              </Heading>
              <Card>
                <VStack w="full" spacing={0}>
                  {pharmacyInfo}
                  <VStack spacing={2} w="full">
                    {pharmacyWithHours && !isDeliveryPharmacy && navigateButton}
                    {!isDeliveryPharmacy && pharmacyWithHours && canReroute && rerouteButton}
                  </VStack>
                </VStack>
              </Card>
            </VStack>

            <OrderSummary
              fulfillments={fulfillments}
              onViewDetails={() => setOrderDetailsIsOpen(true)}
            />

            <Coupons />

            <VStack w="full" alignItems="stretch" spacing={4}>
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
        </Container>
      </VStack>
      {fulfillmentType === 'MAIL_ORDER' && fulfillmentTrackingLink ? (
        <Box>
          <Container>
            <VStack spacing={4} align="start" py={5}>
              <Box alignSelf="start">
                <Text display="inline" color="gray.600">
                  {t.tracking}
                </Text>
                <Link
                  href={fulfillmentTrackingLink}
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
      <VStack w="full" pb={6}>
        <PoweredBy />
      </VStack>
    </VStack>
  );
};
