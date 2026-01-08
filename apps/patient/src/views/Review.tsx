import { useState } from 'react';
import { Box, Button, Container, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import queryString from 'query-string';

import { FixedFooter, PoweredBy, PrescriptionsList } from '../components';
import { AddressForm } from '../components/AddressForm';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { usePageAnalytics } from '../hooks/usePageAnalytics';

export const Review = () => {
  const { order, flattenedFills, fetchOrder } = useOrderContext();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const { patient } = order;

  // Track if user has just submitted their address
  const [addressSubmitted, setAddressSubmitted] = useState(false);

  // Show address form if patient has no address and hasn't just submitted one
  const needsAddress = !patient.address && !isDemo && !addressSubmitted;

  const handleCtaClick = () => {
    const query = isDemo
      ? queryString.stringify({ demo: true, phone })
      : queryString.stringify({ orderId: order.id, token });
    navigate(`/pharmacy?${query}`);
  };

  const handleAddressSuccess = async () => {
    setAddressSubmitted(true);
    // Refetch order to get updated patient address
    await fetchOrder();
  };

  const isMultiRx = flattenedFills.length > 1;

  usePageAnalytics({ pageName: needsAddress ? 'Add Address' : 'Review Prescriptions' });

  // Show address form if patient doesn't have an address
  if (needsAddress) {
    return (
      <>
        <Helmet>
          <title>Add your address</title>
        </Helmet>
        <AddressForm patientId={patient.id} order={order} onSuccess={handleAddressSuccess} />
      </>
    );
  }

  return (
    <Box>
      <Helmet>
        <title>{t.reviewRx(isMultiRx)}</title>
      </Helmet>

      <Box bgColor="white">
        <Container>
          <VStack spacing={4} align="span" py={4}>
            <VStack spacing={2} align="start">
              <Heading as="h3" size="lg">
                {t.reviewYourRx(isMultiRx)}
              </Heading>
              <Text>{t.pleaseReview(isMultiRx)}</Text>
            </VStack>
            <HStack spacing={2}>
              <Text display="inline" color="gray.500">
                {t.patient}
              </Text>
              <Text display="inline" data-dd-privacy="mask">
                {patient.name.full}
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Box bgColor="white" mt={2} mb={32}>
        <PrescriptionsList />
      </Box>

      <FixedFooter show={true}>
        <Container as={VStack} w="full">
          <Button size="lg" borderRadius="lg" w="full" variant="brand" onClick={handleCtaClick}>
            {t.searchPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
