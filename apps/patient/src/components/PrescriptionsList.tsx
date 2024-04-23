import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  Heading,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react';
import { text as t } from '../utils/text';
import { formatDate } from '../utils/general';
import { useOrderContext } from '../views/Main';

export const PrescriptionsList = () => {
  const { flattenedFills } = useOrderContext();

  return (
    <Container>
      <VStack spacing={4} align="span" pt={5}>
        <Heading as="h4" size="md">
          Order Details
        </Heading>
        <Accordion allowToggle>
          {flattenedFills.map(({ id, treatment, prescription: rx, count }) => {
            const prescription = rx!;
            return (
              <AccordionItem border="none" mb={5} key={id}>
                {({ isExpanded }) => (
                  <>
                    <HStack>
                      <AccordionButton
                        p={0}
                        _expanded={{ bg: 'transparent' }}
                        _focus={{ bg: 'transparent' }}
                      >
                        <VStack me="auto" w="full" align="start">
                          <Text align="start" data-dd-privacy="mask" as="b">
                            {treatment.name}
                          </Text>
                          <HStack>
                            <Text fontSize="sm" color="gray.500">
                              {isExpanded ? 'Show less ' : 'Show more '}
                            </Text>
                            <AccordionIcon />
                          </HStack>
                        </VStack>
                      </AccordionButton>
                    </HStack>
                    <AccordionPanel mt={0} px={0} pt={2} pb={4}>
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
                  </>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </VStack>
    </Container>
  );
};
