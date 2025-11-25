import {
  Box,
  Button,
  ChakraProvider,
  CircularProgress,
  Container,
  Heading,
  Image as DisplayImage,
  Text,
  VStack,
  HStack
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { ScrollRestoration, useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthHeader } from '../configs/graphqlClient';
import { TokenPayload } from './Main';
import { Organization, Patient, Pharmacy } from '../__generated__/graphql';
import { PharmacyInfo } from '../components';
import { Card } from '../components/Card';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { text } from '../utils/text';
import { formatAddress } from '../utils/formatters';
import theme from '../configs/theme';
import { OrderStatusHeader } from '../components/status/Header';
import { getInfoPageData } from '../api';
import { OrderDetailsModal, PrescriptionData } from '../components/order-details/OrderDetailsModal';

export function InfoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tokenPayload, setTokenPayload] = useState<TokenPayload>();
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  const [me, setMe] = useState<Patient>();
  const [pharmacy, setPharmacy] = useState<Pharmacy>();
  const [organization, setOrganization] = useState<Organization>();
  const [logoLoading, setLogoLoading] = useState<boolean>(true);

  const logo = organization?.settings?.brandLogo;
  const pharmacyFormattedAddress = pharmacy?.address ? formatAddress(pharmacy.address) : '';
  const loading = !me || !pharmacy || !organization || logoLoading;

  const prescriptionData = useMemo<PrescriptionData[]>(
    () =>
      tokenPayload?.prescriptions?.map((rx) => ({
        rxName: rx.treatment.name,
        quantity: `${rx.dispenseQuantity} ${rx.dispenseUnit}`,
        daysSupply: rx.daysSupply,
        expiresAt: rx.expiresAt ? new Date(rx.expiresAt) : undefined,
        numRefills: rx.refillsAllowed
      })) ?? [],
    [tokenPayload?.prescriptions]
  );

  // effect hook to parse the token from the query params, then wipe it from query params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setAuthHeader(tokenParam);
      try {
        const base64TokenData = tokenParam?.split('.')?.[1];
        const tokenData = base64TokenData ? JSON.parse(atob(base64TokenData)) : undefined;
        setTokenPayload(tokenData);
        navigate('/info', { replace: true });
      } catch (err) {
        console.error('failed to parse token data', { err });
        navigate('/no-match', { replace: true });
      }
    }
  }, [navigate, searchParams]);

  // once we have the token payload:
  // effect hook to fetch all the data we need to display, using identifiers from the token payload
  useEffect(() => {
    async function fetchInfoData() {
      if (!tokenPayload) return;
      try {
        const pageData = await getInfoPageData({
          pharmacyId: tokenPayload.pharmacyId,
          organizationId: tokenPayload.organizationId
        });
        setMe(pageData.me as Patient);
        setPharmacy(pageData.pharmacy);
        setOrganization(pageData.organization);
      } catch (err) {
        console.error('Failed to fetch data', { err });
        navigate('/no-match', { replace: true });
      }
    }

    fetchInfoData();
  }, [navigate, tokenPayload]);

  useEffect(() => {
    async function preloadLogo() {
      if (organization && !logo) {
        // if the organization doesn't have a logo, set loading false
        setLogoLoading(false);
      } else if (logo) {
        // otherwise prefetch the logo to avoid clunky ux
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = logo;
          });
        } finally {
          // set loading false even if the preload fails, don't want to block on this optimization
          setLogoLoading(false);
        }
      }
    }

    preloadLogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo]);

  if (loading || logoLoading) {
    return (
      <ChakraProvider>
        <Box mx="auto" my="24">
          <CircularProgress isIndeterminate color="gray.800" />
        </Box>
      </ChakraProvider>
    );
  }

  console.log({ tokenPayload });

  return (
    <ChakraProvider theme={theme({ accentColor: organization?.settings?.brandColor })}>
      <ScrollRestoration />
      {logo && (
        <Box
          as="nav"
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.100"
          borderWidth="2px"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          <Container py={2.5}>
            <DisplayImage src={logo} width="auto" height="auto" maxW="60%" maxH="35px" />
          </Container>
        </Box>
      )}
      <Box bgColor="white">
        <Container py={6}>
          <OrderStatusHeader
            status="SENT"
            fulfillmentType={pharmacy.fulfillmentTypes?.[0]}
            integrated={false}
            subHeaderOverride="Your order was sent to the pharmacy"
          />
        </Container>
      </Box>
      <Container my={4}>
        <VStack w="full" spacing={8}>
          {pharmacy && (
            <VStack w="full" alignItems="stretch" spacing={3}>
              <Heading as="h4" size="md">
                Pharmacy
              </Heading>
              <Card>
                <VStack w="full" spacing={4}>
                  <PharmacyInfo pharmacy={pharmacy} showHours isStatus />
                  <VStack spacing={2} w="full">
                    <Button
                      as="a"
                      target="_blank"
                      py={6}
                      href={`tel:${pharmacy.phone}`}
                      leftIcon={<FiPhone />}
                      w="full"
                      variant="solid"
                      bg="blue.600"
                      _hover={{ bg: 'blue.700' }}
                      color="white"
                    >
                      {text.callPharmacy}
                    </Button>
                    <Button
                      as="a"
                      target="_blank"
                      py={6}
                      href={`http://maps.google.com/?q=${pharmacy?.name}, ${pharmacyFormattedAddress}`}
                      leftIcon={<FiMapPin />}
                      w="full"
                      variant="outline"
                      borderColor="blue.500"
                      borderWidth="2px"
                      color="blue.500"
                    >
                      {text.directions}
                    </Button>
                  </VStack>
                </VStack>
              </Card>
            </VStack>
          )}
          <VStack w="full" spacing={3} alignItems="start">
            <HStack w="full" justifyContent="space-between">
              <Heading as="h4" size="md">
                Order Summary
              </Heading>
              <Button
                onClick={() => setDetailsModalOpen(true)}
                variant="solid"
                bg="gray.300"
                size="sm"
              >
                View Details
              </Button>
            </HStack>
            <Card>
              {tokenPayload?.prescriptions?.map((prescription) => (
                <Text key={prescription.treatment.id}>{prescription.treatment.name}</Text>
              ))}
            </Card>
          </VStack>
        </VStack>
      </Container>
      <OrderDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        pharmacyName={pharmacy.name}
        pharmacyLogo={pharmacy.logo}
        prescriptions={prescriptionData}
      />
    </ChakraProvider>
  );
}
