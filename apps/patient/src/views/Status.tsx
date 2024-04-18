import { Box, Button, Container, Heading, Link, Text, VStack, useToast } from '@chakra-ui/react';
import { getSettings } from '@client/settings';
import { types } from '@photonhealth/sdk';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCheck } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import {
  BrandedPharmacyCard,
  DemoCtaModal,
  FixedFooter,
  PharmacyCard,
  PoweredBy,
  StatusStepper
} from '../components';
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

  const showFooterStates = ['RECEIVED', 'READY'];
  const [showFooter, setShowFooter] = useState<boolean>(
    showFooterStates.includes(order?.fulfillment?.state ?? '') &&
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
          setShowFooter(false);
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
          setTimeout(() => setShowFooter(false), 1000);

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

        setShowFooter(true);

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
  return (
    <Box>
      <DemoCtaModal isOpen={showDemoCtaModal} />
      <Helmet>
        <title>{t.track}</title>
      </Helmet>

      <Box bgColor="white" shadow="sm">
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
      </Box>

      {/* Bottom padding is added so stepper can be seen when footer is showing on smaller screens */}
      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={6} align="start" pt={5}>
          <Box width="full">
            {order?.pharmacy?.id && isDeliveryPharmacy ? (
              <BrandedPharmacyCard pharmacyId={order.pharmacy.id} />
            ) : pharmacyWithHours ? (
              <PharmacyCard
                pharmacy={pharmacyWithHours}
                selected={true}
                showDetails={fulfillmentType === 'PICK_UP'}
                canReroute={!isDemo && orgSettings.enablePatientRerouting && order.isReroutable}
                onChangePharmacy={() => {
                  const query = queryString.stringify({
                    orderId: order.id,
                    token,
                    reroute: true,
                    ...(!pharmacyWithHours.isOpen ? { openNow: true } : {})
                  });
                  navigate(`/pharmacy?${query}`);
                }}
                onGetDirections={handleGetDirections}
              />
            ) : null}
          </Box>
          <StatusStepper
            fulfillmentType={fulfillmentType}
            status={successfullySubmitted ? 'PICKED_UP' : fulfillmentState || 'SENT'}
            patientAddress={address ? formatAddress(address) : undefined}
          />
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            w="full"
            borderRadius="lg"
            variant={successfullySubmitted ? undefined : 'brand'}
            colorScheme={successfullySubmitted ? 'green' : undefined}
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleMarkOrderAsPickedUp : undefined}
            isLoading={submitting}
          >
            {successfullySubmitted ? t.thankYou : copy.cta(isMultiRx)}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
