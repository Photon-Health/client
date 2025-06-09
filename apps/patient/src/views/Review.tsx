import {
  Box,
  Button,
  Container,
  Divider,
  HStack,
  Heading,
  Icon,
  Text,
  VStack
} from '@chakra-ui/react';
import { TbPrescription } from 'react-icons/tb';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FixedFooter, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { formatDate } from '../utils/general';

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
          <VStack spacing={2} align="span" py={4}>
            <Heading as="h3" size="lg">
              {t.reviewYourRx(isMultiRx)}
            </Heading>
            <Text>{t.pleaseReview(isMultiRx)}</Text>
            <HStack
              spacing={2}
              border="1px solid"
              borderColor="gray.200"
              p={3}
              borderRadius="lg"
              justify="space-between"
            >
              <Text display="inline" color="gray.700">
                {t.patient}
              </Text>
              <Text display="inline" data-dd-privacy="mask" fontWeight="semibold">
                {patient.name.full}
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Box mt={3} mb={32}>
        {flattenedFills.map(({ id, treatment, prescription: rx, count }) => {
          const prescription = rx!;
          return (
            <Container key={id}>
              <Box border="1px solid" borderColor="gray.200" borderRadius="lg" bgColor="white">
                <HStack p={3}>
                  <Icon as={TbPrescription} mr={1} fontSize="1.2rem" />
                  <Text align="start" data-dd-privacy="mask" fontWeight="semibold">
                    {treatment.name}
                  </Text>
                </HStack>
                <Divider my={0} />
                <VStack align="span" p={3} fontSize="sm">
                  <HStack>
                    <HStack w="50%">
                      <Text color="gray.700">{t.quantity}</Text>
                      <Text data-dd-privacy="mask">{prescription.dispenseQuantity}</Text>
                    </HStack>
                    <HStack w="50%">
                      <Text color="gray.700">{t.daysSupply}</Text>
                      <Text data-dd-privacy="mask">{prescription.daysSupply}</Text>
                    </HStack>
                  </HStack>
                  <HStack>
                    <HStack w="50%">
                      <Text color="gray.700">{t.refills}</Text>
                      <Text data-dd-privacy="mask">{count - 1}</Text>
                    </HStack>
                    <HStack w="50%">
                      <Text color="gray.700">{t.expires}</Text>
                      <Text data-dd-privacy="mask">{formatDate(prescription.expirationDate)}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            </Container>
          );
        })}
      </Box>

      <FixedFooter show={true}>
        <Container as={VStack} w="full">
          <Button size="lg" borderRadius="lg" w="full" variant="brand" onClick={handleCtaClick}>
            {t.next}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
