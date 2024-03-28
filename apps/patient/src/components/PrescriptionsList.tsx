import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Card,
  CardBody,
  Container,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react';
import { FaPrescription } from 'react-icons/fa';
import { text as t } from '../utils/text';
import { formatDate } from '../utils/general';
import { useOrderContext } from '../views/Main';

export const PrescriptionsList = () => {
  const { flattenedFills } = useOrderContext();

  return (
    <Container pb={32}>
      <VStack spacing={4} align="span" pt={5}>
        <Accordion allowToggle defaultIndex={[0]}>
          {flattenedFills.map(({ id, treatment, prescription, count }) => (
            <AccordionItem border="none" mb={3} key={id}>
              <Card w="full" backgroundColor="white" borderRadius="lg">
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
                        <AccordionItem />
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
  );
};
