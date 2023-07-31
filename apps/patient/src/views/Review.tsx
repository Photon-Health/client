import { useContext } from 'react';
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

import { Order } from '../utils/models';
import { formatDate, countFillsAndRemoveDuplicates } from '../utils/general';
import { FixedFooter } from '../components/FixedFooter';
import { Nav } from '../components/Nav';
import { PoweredBy } from '../components/PoweredBy';
import { text as t } from '../utils/text';
import { OrderContext } from './Main';

export const Review = () => {
  const order = useContext<Order>(OrderContext);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { organization, patient, fills } = order;

  const handleCtaClick = () => {
    navigate(`/pharmacy?orderId=${order.id}&token=${token}`);
  };

  const flattenedFills = countFillsAndRemoveDuplicates(fills);

  return (
    <Box>
      <Helmet>
        <title>{t.review.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} />

      <Container pb={32}>
        <VStack spacing={6} align="span" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.review.heading}
            </Heading>
            <Text>{t.review.subheading}</Text>
          </VStack>
          <VStack spacing={1} align="start">
            <HStack>
              <Text display="inline" color="gray.500">
                {t.review.patient}
              </Text>
              <Text display="inline" ms={3}>
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
                          <Text align="start">{treatment.name}</Text>
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
                            <Text color="gray.500">{t.review.quantity}</Text>
                            <Text>{prescription.dispenseQuantity}</Text>
                          </HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.review.daysSupply}</Text>
                            <Text>{prescription.daysSupply}</Text>
                          </HStack>
                        </HStack>
                        <HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.review.refills}</Text>
                            <Text>{count - 1}</Text>
                          </HStack>
                          <HStack w="50%">
                            <Text color="gray.500">{t.review.expires}</Text>
                            <Text>{formatDate(prescription.expirationDate)}</Text>
                          </HStack>
                        </HStack>
                        <HStack w="full" align="start">
                          <Text color="gray.500">{t.review.instructions}</Text>
                          <Text>{prescription.instructions}</Text>
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
            {t.review.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
