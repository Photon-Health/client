import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';

import { PrescriptionsList } from '../components';
import { useText } from '../hooks/useText';
import { useOrderContext } from './Main';
import { usePageAnalytics } from '../hooks/usePageAnalytics';

export const Canceled = () => {
  const t = useText();
  const {
    order: { patient }
  } = useOrderContext();

  usePageAnalytics({ pageName: 'Order Canceled' });

  return (
    <Box>
      <Helmet>
        <title>{t.orderCanceled}</title>
      </Helmet>

      <Box bgColor="white" shadow="sm">
        <Container>
          <VStack spacing={2} align="start" py={4}>
            <Heading as="h3" size="lg">
              {t.orderCanceled}
            </Heading>
            <Box>
              <Text display="inline">{t.reachOut}</Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      <Container>
        <Text align="left" mt={4} fontSize="md" color="gray.500">
          {t.patient}{' '}
          <Text as="span" color="gray.700">
            {patient.name.full}
          </Text>
        </Text>
      </Container>

      <PrescriptionsList />
    </Box>
  );
};
