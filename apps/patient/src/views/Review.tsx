import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react';
import { FaPrescription } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

import { useOrderContext } from './Main';
import { formatDate, countFillsAndRemoveDuplicates } from '../utils/general';
import { FixedFooter, Nav, PoweredBy } from '../components';
import { text as t } from '../utils/text';

export const Review = () => {
  const { order } = useOrderContext();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const { patient, fills } = order;

  const handleCtaClick = () => {
    const toUrl = isDemo
      ? `/pharmacy?demo=true&phone=${phone}`
      : `/pharmacy?orderId=${order.id}&token=${token}`;
    navigate(toUrl);
  };

  const flattenedFills = countFillsAndRemoveDuplicates(fills);
  const isMultiRx = flattenedFills.length > 1;

  return (
    <Box>
      <Helmet>
        <title>{t.reviewRx(isMultiRx)}</title>
      </Helmet>

      <Nav />

      <Container pb={32}>
        <VStack spacing={6} align="span" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.reviewYourRx(isMultiRx)}
            </Heading>
            <Text>{t.pleaseReview(isMultiRx)}</Text>
          </VStack>
          <VStack spacing={1} align="start">
            <HStack spacing={2}>
              <Text display="inline" color="gray.500">
                {t.patient}
              </Text>
              <Text display="inline" data-dd-privacy="mask">
                {patient.name.full}
              </Text>
            </HStack>
          </VStack>

          <Accordion allowToggle defaultIndex={[0]}>
            {flattenedFills.map(({ id, treatment, prescription, count }) => (
              <AccordionItem border="none" mb={3} key={id}>
                <Card w="full" backgroundColor="white">
                  <CardBody p={0}>
                    <HStack>
                      <AccordionButton
                        p={5}
                        _expanded={{ bg: 'transparent' }}
                        _focus={{ bg: 'transparent' }}
                      >
                        <HStack me="auto">
                          <Box me={2}>
                            <FaPrescription size="1.3em" />
                          </Box>
                          <Text align="start" data-dd-privacy="mask">
                            {treatment.name}
                          </Text>
                        </HStack>
                        <Box>
                          <AccordionIcon />
                        </Box>
                      </AccordionButton>
                    </HStack>
                    <AccordionPanel mt={0} p={5} borderTop="1px" borderColor="gray.100">
                      <VStack align="span">
                        <HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.quantity}</Text>
                            <Text data-dd-privacy="mask">{prescription.dispenseQuantity}</Text>
                          </HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.daysSupply}</Text>
                            <Text data-dd-privacy="mask">{prescription.daysSupply}</Text>
                          </HStack>
                        </HStack>
                        <HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.refills}</Text>
                            <Text data-dd-privacy="mask">{count - 1}</Text>
                          </HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.expires}</Text>
                            <Text data-dd-privacy="mask">
                              {formatDate(prescription.expirationDate)}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </AccordionPanel>
                  </CardBody>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>

      <FixedFooter show={true}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" onClick={handleCtaClick}>
            {t.searchPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
