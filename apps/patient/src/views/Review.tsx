import { Box, Button, Container, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FixedFooter, PoweredBy, PrescriptionsList } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

export const Review = () => {
  const { order, flattenedFills } = useOrderContext();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const { patient } = order;

  const handleCtaClick = () => {
    const toUrl = isDemo
      ? `/readyBy?demo=true&phone=${phone}`
      : `/readyBy?orderId=${order.id}&token=${token}`;
    navigate(toUrl);
  };

  const isMultiRx = flattenedFills.length > 1;

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
