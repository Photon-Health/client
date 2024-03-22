import { useState, useEffect } from 'react';
import { Box, Button, Container, Heading, Link, Text, VStack, useToast } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { types } from '@photonhealth/sdk';
import queryString from 'query-string';
import { DemoCtaModal, FixedFooter, PharmacyCard, PoweredBy, StatusStepper } from '../components';
import { Pharmacy as PharmacyWithHours } from '../utils/models';
import { formatAddress, getFulfillmentType, preparePharmacyHours } from '../utils/general';
import { text as t, orderStateMapping as m } from '../utils/text';
import { useOrderContext } from './Main';
import * as TOAST_CONFIG from '../configs/toast';
import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import { getSettings } from '@client/settings';

export const Status = () => {
  const navigate = useNavigate();
  const { order, flattenedFills, setOrder } = useOrderContext();

  const orgSettings = getSettings(order.organization.id);

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const showFooterStates: types.FulfillmentState[] = ['RECEIVED', 'READY'];
  const [showFooter, setShowFooter] = useState<boolean>(
    showFooterStates.includes(order?.fulfillment?.state) &&
      order?.fulfillment?.type !== types.FulfillmentType.MailOrder
  );
  const [showDemoCtaModal, setShowDemoCtaModal] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  const { fulfillment, pharmacy, address } = order;

  const fulfillmentType = getFulfillmentType(pharmacy?.id, fulfillment, type);

  const toast = useToast();

  const handleMarkOrderAsPickedUp = async () => {
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
      const result: boolean = await markOrderAsPickedUp(orderId);

      setTimeout(() => {
        if (result) {
          setSuccessfullySubmitted(true);
          setTimeout(() => setShowFooter(false), 1000);

          setOrder({
            ...order,
            fulfillment: {
              state: 'PICKED_UP'
            }
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
    } catch (error) {
      toast({
        title: m[fulfillmentType].error.title,
        description: m[fulfillmentType].error.description,
        ...TOAST_CONFIG.ERROR
      });

      setSubmitting(false);

      console.error(JSON.stringify(error, undefined, 2));
    }
  };

  const handleGetDirections = () => {
    const url = `http://maps.google.com/?q=${pharmacy.name}, ${formatAddress(pharmacy.address)}`;
    window.open(url);
  };

  useEffect(() => {
    if (isDemo) {
      setTimeout(async () => {
        // Send order received sms to demo participant
        await triggerDemoNotification(
          phone,
          'photon:order_fulfillment:received',
          pharmacy.name,
          formatAddress(pharmacy.address)
        );

        setOrder({
          ...order,
          fulfillment: {
            state: 'RECEIVED'
          }
        });

        setShowFooter(true);

        setTimeout(async () => {
          // Send ready sms
          await triggerDemoNotification(
            phone,
            'photon:order_fulfillment:ready',
            pharmacy.name,
            formatAddress(pharmacy.address)
          );

          setOrder({
            ...order,
            fulfillment: {
              state: 'READY'
            }
          });

          setTimeout(() => setShowDemoCtaModal(true), 1500);
        }, 1500);
      }, 1500);
    }
  }, []);

  const isMultiRx = flattenedFills.length > 1;

  // There's still a slight delay (1-3s) before fulfillment is created,
  // so default to SENT on first navigation
  const fulfillmentState = fulfillment?.state ?? 'SENT';

  const showTextUsPrompt =
    fulfillmentState === 'DELIVERED' ||
    fulfillmentState === 'PICKED_UP' ||
    fulfillmentState === 'RECEIVED';

  const pharmacyWithHours: PharmacyWithHours = preparePharmacyHours(pharmacy);

  const copy = m[fulfillmentType][fulfillmentState];

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
          {pharmacy ? (
            <Box width="full">
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
            </Box>
          ) : null}
          <StatusStepper
            fulfillmentType={fulfillmentType}
            status={successfullySubmitted ? 'PICKED_UP' : fulfillmentState || 'SENT'}
            patientAddress={formatAddress(address)}
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
            {successfullySubmitted
              ? t.thankYou
              : m[fulfillmentType][fulfillmentState].cta(isMultiRx)}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
