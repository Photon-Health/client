import { Box, Button, Container, Heading, useDisclosure, VStack } from '@chakra-ui/react';
import queryString from 'query-string';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiNavigation, FiPhoneCall, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { triggerDemoNotification } from '../api';
import { PharmacyInfo, PoweredBy } from '../components';
import { Card } from '../components/Card';
import { HolidayAlert } from '../components/HolidayAlert';
import { OrderDetailsModal } from '../components/order-details/OrderDetailsModal';
import { OrderSummary } from '../components/order-summary/OrderSummary';
import { OrderStatusHeader } from '../components/status/Header';
import { deriveOrderStatus, getLatestReadyTime } from '../utils/fulfillmentsHelpers';
import { getFulfillmentType, isDelivery, preparePharmacy, wait } from '../utils/general';
import { InsuranceAlert } from '../components/InsuranceAlert';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { formatAddress } from '../utils/formatters';
import { usePageAnalytics } from '../hooks/usePageAnalytics';
import { ChangePharmacyReasons } from '../components/ChangePharmacyReasons';
import { computeNumRefillsForPrescription } from '../utils/presenters';
import { CouponCardList } from '../components/coupons';
import { Pharmacy } from '../utils/models';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

export const Status = () => {
  const navigate = useNavigate();
  const { order, setOrder, isDemo, setFaqModalIsOpen, setReason } = useOrderContext();
  const patientAnalytics = usePatientAnalytics();
  usePageAnalytics({ pageName: 'Order Status' });
  const { enablePatientRerouting } = order?.organization?.settings?.patientUx ?? {};
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const phone = searchParams.get('phone') ?? undefined;

  const { fulfillment, pharmacy, readyBy, readyByTime } = order;

  const fulfillmentType = getFulfillmentType(pharmacy?.id, fulfillment, type);

  const pharmacyFormattedAddress = pharmacy?.address ? formatAddress(pharmacy.address) : '';

  const canOrderReroute = !isDemo && enablePatientRerouting && order.isReroutable;

  const handleGetDirections = () => {
    if (!pharmacy?.name) return;
    const url = `http://maps.google.com/?q=${pharmacy?.name}, ${pharmacyFormattedAddress}`;
    window.open(url);

    patientAnalytics.track('Get Directions', order, {
      orderId: order?.id,
      pharmacyId: pharmacy?.id,
      pharmacyName: pharmacy?.name,
      pharmacyAddress: pharmacyFormattedAddress,
      fulfillmentType: fulfillmentType
    });
  };

  const handleCallPharmacy = () => {
    if (!pharmacy?.phone) return;
    window.location.href = `tel:${pharmacy.phone}`;

    patientAnalytics.track('Call Pharmacy', order, {
      orderId: order?.id,
      pharmacyId: pharmacy?.id,
      pharmacyName: pharmacy?.name,
      pharmacyPhone: pharmacy?.phone,
      fulfillmentType: fulfillmentType
    });
  };

  const handleDemoStatusPage = async (demoUserPhone: string, selectedDemoPharmacy: Pharmacy) => {
    const isMailOrder = !!order.pharmacy?.fulfillmentTypes?.includes('MAIL_ORDER');

    setOrder({
      ...order,
      fulfillment: {
        state: isMailOrder ? 'SENT' : 'READY',
        type: isMailOrder ? 'MAIL_ORDER' : 'PICK_UP'
      }
    });

    if (!isMailOrder) {
      await wait(1000);
      await triggerDemoNotification(
        demoUserPhone,
        'photon:order_fulfillment:received',
        selectedDemoPharmacy.name,
        pharmacyFormattedAddress
      );
      await wait(1000);

      await triggerDemoNotification(
        demoUserPhone,
        'photon:order_fulfillment:ready',
        selectedDemoPharmacy.name,
        pharmacyFormattedAddress
      );
    }
  };

  useEffect(() => {
    if (!phone || !pharmacy || !order) {
      return;
    }
    const hasNotSetDemoFulfillment = isDemo && !order.fulfillment;
    if (hasNotSetDemoFulfillment) {
      handleDemoStatusPage(phone, pharmacy);
    }
  }, [
    handleDemoStatusPage,
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
  const displayPharmacy = pharmacy
    ? isDemo
      ? pharmacy
      : preparePharmacy(pharmacy, fulfillmentType)
    : undefined;

  const isDeliveryPharmacy = isDelivery({ pharmacy, fulfillmentType });

  if (!order) {
    console.error('No order found');
    return null;
  }

  const navigateToReroute = (reason?: string) => {
    const query = queryString.stringify({
      orderId: order.id,
      token,
      reroute: true,
      ...(!displayPharmacy?.isOpen ? { openNow: true } : {})
    });
    navigate(`/pharmacy?${query}`);

    patientAnalytics.track('Reroute Order', order, {
      pharmacyId: pharmacy?.id,
      pharmacyName: pharmacy?.name,
      isPharmacyOpen: displayPharmacy?.isOpen,
      fulfillmentType: fulfillmentType,
      rerouteReason: reason
    });
  };

  const handleReroute = () => {
    const isEnabled = patientAnalytics.getFlagValueSync('change_pharmacy_reasons');
    const hasUnresolvedOrderError = order.exceptions.some(
      (e) => e.exceptionType === 'ORDER_ERROR' && !e.resolvedAt
    );

    if (hasUnresolvedOrderError) {
      const reason = 'Order Error';
      setReason(reason); // set reason for reroute on order context
      navigateToReroute(reason);
      return;
    }

    if (isEnabled) {
      onOpen();
      return;
    }

    navigateToReroute();
  };

  const handleSelectReason = (reason: string, otherReason?: string) => {
    patientAnalytics.track(
      'Pharmacy Change Reason Selected',
      order,
      { reason, otherReason: otherReason || undefined },
      { toRudderStack: false, toMixpanel: true }
    );
    setReason(otherReason ? `${reason}: ${otherReason}` : reason);
    navigateToReroute();
  };

  const fulfillments = order.fulfillments.map((f) => ({
    ...f,
    rxName: f.prescription.treatment.name,
    exceptions: f.exceptions.filter((e) => e.resolvedAt == null)
  }));

  const prescriptions = fulfillments.map((fulfillment) => ({
    rxName: fulfillment.prescription.treatment.name,
    quantity: `${fulfillment.prescription?.dispenseQuantity} ${fulfillment.prescription?.dispenseUnit}`,
    daysSupply: fulfillment.prescription?.daysSupply ?? 0,
    numRefills: computeNumRefillsForPrescription(order.fills, fulfillment.prescription?.id),
    expiresAt: fulfillment.prescription?.expirationDate ?? new Date()
  }));

  const primaryButtonStyle = {
    variant: 'solid',
    colorScheme: 'blue',
    color: 'white'
  };

  const navigateButton = (
    <Button
      mt={2}
      mx="auto"
      size="md"
      py={6}
      onClick={handleGetDirections}
      leftIcon={<FiNavigation />}
      w="full"
      {...primaryButtonStyle}
    >
      {t.directions}
    </Button>
  );

  const callPharmacyButton = (isPrimary: boolean) => (
    <Button
      mx="auto"
      py={6}
      onClick={handleCallPharmacy}
      leftIcon={<FiPhoneCall />}
      w="full"
      {...(isPrimary ? primaryButtonStyle : { variant: 'outline', color: 'blue.500' })}
    >
      {t.callPharmacy}
    </Button>
  );

  const rerouteButton = (
    <Button
      mx="auto"
      size="md"
      py={6}
      variant="outline"
      onClick={handleReroute}
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

  const unresolvedExceptions = order.exceptions.filter((e) => e.resolvedAt == null);

  const exception = unresolvedExceptions[0]
    ? unresolvedExceptions[0].exceptionType
    : order.pharmacy?.isOpen === false
    ? 'PHARMACY_CLOSED'
    : fulfillments.map((f) => f.exceptions[0]?.exceptionType).find((e) => e != null) ?? undefined;

  return (
    <VStack flex={1}>
      <OrderDetailsModal
        isOpen={orderDetailsIsOpen}
        onClose={() => setOrderDetailsIsOpen(false)}
        pharmacyName={order.pharmacy?.name ?? 'My Pharmacy'}
        prescriptions={prescriptions}
      />
      <Helmet>
        <title>{t.track}</title>
      </Helmet>
      <VStack spacing={5} width="full" alignItems={'stretch'} flex={1}>
        <Box bgColor="white">
          <Container py={6}>
            <VStack spacing={4} width="full" alignItems="stretch">
              <HolidayAlert>Holiday may affect pharmacy hours.</HolidayAlert>
              <InsuranceAlert exception={unresolvedExceptions[0]?.exceptionType} />
              <OrderStatusHeader
                status={orderState}
                fulfillmentType={order.fulfillment?.type}
                integrated={order.pharmacy?.integrated}
                pharmacyEstimatedReadyAt={pharmacyEstimatedReadyAt}
                patientDesiredReadyAt={readyBy === 'Urgent' ? 'URGENT' : readyByTime}
                exception={exception}
              />
            </VStack>
          </Container>
        </Box>

        <Container>
          <VStack spacing={7}>
            <OrderSummary
              fulfillments={fulfillments}
              onViewDetails={() => {
                setOrderDetailsIsOpen(true);
                patientAnalytics.track('Status, View Order Details', order, {
                  orderId: order?.id,
                  pharmacyId: pharmacy?.id,
                  pharmacyName: pharmacy?.name,
                  fulfillmentType: fulfillmentType,
                  prescriptionCount: fulfillments.length
                });
              }}
            />

            <CouponCardList />

            {displayPharmacy && (
              <VStack w="full" alignItems="stretch" spacing={4}>
                <Heading as="h4" size="md">
                  Pharmacy
                </Heading>
                <Card>
                  <VStack w="full" spacing={2}>
                    <PharmacyInfo
                      pharmacy={displayPharmacy}
                      showDetails={!isDeliveryPharmacy}
                      showHours={!isDeliveryPharmacy}
                      orderFulfillment={fulfillment}
                      isStatus
                    />
                    <VStack spacing={2} w="full">
                      {displayPharmacy && !isDeliveryPharmacy && !exception && navigateButton}
                      {displayPharmacy &&
                        !isDeliveryPharmacy &&
                        canOrderReroute &&
                        !exception &&
                        callPharmacyButton(false)}
                      {displayPharmacy &&
                        !isDeliveryPharmacy &&
                        exception &&
                        callPharmacyButton(true)}
                      {displayPharmacy && canOrderReroute && rerouteButton}
                    </VStack>
                  </VStack>
                </Card>
              </VStack>
            )}

            <VStack w="full" alignItems="stretch" spacing={4}>
              <Heading as="h4" size="md">
                Need help?
              </Heading>
              <Card>
                <Button
                  w="full"
                  variant="outline"
                  color="blue.500"
                  onClick={() => {
                    setFaqModalIsOpen(true);
                    patientAnalytics.track('Clicked Pharmacy Issue Button', order);
                  }}
                >
                  I have a pharmacy issue
                </Button>
              </Card>
            </VStack>
          </VStack>
        </Container>
      </VStack>
      <VStack w="full" pb={6}>
        <PoweredBy />
      </VStack>
      <ChangePharmacyReasons isOpen={isOpen} onClose={onClose} onSelect={handleSelectReason} />
    </VStack>
  );
};
