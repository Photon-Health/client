import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { Prescriptions } from '../components/Prescriptions';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

export const Canceled = () => {
  const {
    order: { patient }
  } = useOrderContext();

  return (
    <Box>
      <Helmet>
        <title>{t.orderCanceled}</title>
      </Helmet>

      <Box bgColor="white" shadow="sm">
        <Container>
          <VStack spacing={2} align="start" py={4}>
            <Heading as="h3" size="lg">
              {t.orderCanceledHeader}
            </Heading>
            <Box>
              <Text display="inline">{t.orderCanceledSubheader}</Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      <Container>
        <Text align="left" mt={4} fontSize="md" color="gray.400">
          Patient{' '}
          <Text as="span" color="gray.700">
            {patient.name.full}
          </Text>
        </Text>
      </Container>

      <Prescriptions />
    </Box>
  );
};
