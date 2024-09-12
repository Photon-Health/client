import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Icon,
  Link,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCheck, FiInfo, FiNavigation, FiRefreshCcw } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import {
  CouponModal,
  DemoCtaModal,
  PHARMACY_BRANDING,
  PharmacyInfo,
  PoweredBy
} from '../components';
import { FAQ } from '../components/FAQ';
import { HorizontalStatusStepper } from '../components/HorizontalStatusStepper';
import { PrescriptionsList } from '../components/PrescriptionsList';
import { ReadyText } from '../components/ReadyText';
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
      order?.fulfillment?.type !== 'MAIL_ORDER'
  );
  const [showDemoCtaModal, setShowDemoCtaModal] = useState<boolean>(false);
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);

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
            type: 'PICK_UP'
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
      <DemoCtaModal isOpen={showDemoCtaModal} onClose={() => setShowDemoCtaModal(false)} />
      <Helmet>
        <title>{t.track}</title>
      </Helmet>

      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />

      <Box bgColor="white">
        <Container>
          <VStack spacing={4} align="start" py={5}>
            <Heading as="h3" size="lg">
              {copy.heading}
            </Heading>
            <Box bg="orange.100" p={4} borderRadius="lg" w="full">
              <Text display="inline">
                {typeof copy.subheading === 'function'
                  ? copy.subheading(isMultiRx)
                  : copy.subheading}
              </Text>
            </Box>
            {fulfillmentType === 'MAIL_ORDER' && fulfillment?.trackingNumber ? (
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

            <ReadyText
              readyBy={readyBy}
              readyByTime={readyByTime}
              isDeliveryPharmacy={isDeliveryPharmacy}
              fulfillment={fulfillment}
            />

            <HorizontalStatusStepper
              fulfillmentType={fulfillmentType}
              status={successfullySubmitted ? 'PICKED_UP' : fulfillmentState || 'SENT'}
            />

            <VStack spacing={2} w="full" pt={2}>
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
                    bg="gray.900"
                    _hover={{ bg: 'gray.600' }}
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
            </VStack>
          </VStack>
        </Container>
      </Box>

      <Box bgColor="white" mt={2} py={4}>
        <Container>
          <VStack w="full" spacing={4}>
            <Text fontSize="4xl" fontWeight="700" py={0} lineHeight="1">
              $8.71
            </Text>
            <Box bgColor="blue.50" w="full" textAlign="center" p={2} borderRadius="xl">
              <Text fontWeight="semibold" fontSize="md">
                Show this coupon at the pharmacy
              </Text>
            </Box>
            <HStack w="full" align="start">
              <VStack w="30%" align="start">
                <Text>BIN</Text>
                <Text>PCN</Text>
                <Text>Group</Text>
                <Text>Member ID</Text>
              </VStack>
              <VStack w="70%" align="start">
                <Text as="b">015995</Text>
                <Text as="b">GDC</Text>
                <Text as="b">DR33</Text>
                <Text as="b">HFFF867485</Text>
              </VStack>
            </HStack>
            <HStack color="blue.500">
              <Icon as={FiInfo} />
              <Text
                as="u"
                textUnderlineOffset="2px"
                fontSize="sm"
                fontWeight="semibold"
                cursor="pointer"
                onClick={() => setCouponModalOpen(true)}
              >
                How to use this coupon
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Box bgColor="white" mt={2}>
        <PrescriptionsList />
      </Box>

      <Box bgColor="white" mt={2}>
        <FAQ />
      </Box>

      <Container as={VStack} w="full" py={4}>
        <PoweredBy />
      </Container>
    </Box>
  );
};
