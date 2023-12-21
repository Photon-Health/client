import { useState, useEffect } from 'react';
import { Box, Button, Container, Heading, Link, Text, VStack, useToast } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { types } from '@photonhealth/sdk';
import {
  DemoCtaModal,
  FixedFooter,
  Nav,
  PharmacyCard,
  PoweredBy,
  StatusStepper
} from '../components';
import {
  formatAddress,
  getFulfillmentType,
  preparePharmacy,
  countFillsAndRemoveDuplicates
} from '../utils/general';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t, orderStateMapping as m } from '../utils/text';
import { useOrderContext } from './Main';
import * as TOAST_CONFIG from '../configs/toast';
import { markOrderAsPickedUp, triggerDemoNotification } from '../api';
import { getSettings } from '@client/settings';

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

const PHOTON_PHONE_NUMBER: string = process.env.REACT_APP_TWILIO_SMS_NUMBER;

export const Status = () => {
  const navigate = useNavigate();
  const { order, setOrder } = useOrderContext();

  const orgSettings =
    order?.organization?.id in settings ? settings[order.organization.id] : settings.default;

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
  const [enrichedPharmacy, setEnrichedPharmacy] = useState<EnrichedPharmacy | undefined>(undefined);

  const { fulfillment, pharmacy, address, fills } = order;

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

  const initializePharmacy = async (p: types.Pharmacy) => {
    const enrichedPharmacy = await preparePharmacy(p, false);
    setEnrichedPharmacy(enrichedPharmacy);
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

  // People that select a pharmacy low in the list might start at bottom of status page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

          setTimeout(() => setShowDemoCtaModal(true), 2000);
        }, 2000);
      }, 2000);
    }
  }, []);

  const flattenedFills = countFillsAndRemoveDuplicates(fills);
  const isMultiRx = flattenedFills.length > 1;

  return (
    <Box>
      <DemoCtaModal isOpen={showDemoCtaModal} />

      <Helmet>
        <title>{t.track}</title>
      </Helmet>

      <Nav showRefresh />

      {/* Bottom padding is added so stepper can be seen when footer is showing on smaller screens */}
      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={6} align="start" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {m[fulfillmentType][fulfillment?.state].heading}
            </Heading>
            <Text>
              {m[fulfillmentType][fulfillment?.state].subheading(isMultiRx, PHOTON_PHONE_NUMBER)}
            </Text>
          </VStack>
          {enrichedPharmacy ? (
            <Box width="full">
              <PharmacyCard
                pharmacy={enrichedPharmacy}
                selected={true}
                showDetails={fulfillmentType === 'PICK_UP'}
                canReroute={!isDemo && orgSettings.enablePatientRerouting}
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
            {successfullySubmitted
              ? t.thankYou
              : m[fulfillmentType][fulfillment?.state].cta(isMultiRx)}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
