import { useRef, useState } from 'react';
import { Box, Button, Container, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import queryString from 'query-string';

import { FixedFooter, PoweredBy, PrescriptionsList } from '../components';
import { AddressForm, AddressFormHandle } from '../components/AddressForm';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to trigger form submission from CTA button
  const addressFormRef = useRef<AddressFormHandle>(null);

  // Show address form if patient has no address and hasn't just submitted one
  const needsAddress = !patient.address && !isDemo && !addressSubmitted;

  const handleCtaClick = async () => {
    // If patient needs address, validate and submit the form first
    if (needsAddress && addressFormRef.current) {
      setIsSubmitting(true);
      const success = await addressFormRef.current.submit();
      setIsSubmitting(false);

      if (!success) {
        // Form validation failed or API error - don't proceed
        return;
      }

      // Address saved successfully
      setAddressSubmitted(true);
      await fetchOrder();
    }

    // Proceed to pharmacy page
    const query = isDemo
      ? queryString.stringify({ demo: true, phone })
      : queryString.stringify({ orderId: order.id, token });
    navigate(`/pharmacy?${query}`);
  };

  const isMultiRx = flattenedFills.length > 1;

  usePageAnalytics({ pageName: 'Review Prescriptions' });

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

      <Box bgColor="white" mt={2} mb={needsAddress ? 2 : 32}>
        <PrescriptionsList />
      </Box>

      {needsAddress && (
        <Container mb={32} mt={2}>
          <AddressForm ref={addressFormRef} patientId={patient.id} order={order} />
        </Container>
      )}

      <FixedFooter show={true}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            borderRadius="lg"
            w="full"
            variant="brand"
            onClick={handleCtaClick}
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            {t.searchPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
