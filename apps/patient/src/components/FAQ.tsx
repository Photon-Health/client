import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  HStack,
  Text
} from '@chakra-ui/react';
import { renderWithLinks } from '../utils/text';

export type FAQEntry = {
  question: string;
  answer: string;
};

export const FAQContents = ({ faqs }: { faqs: FAQEntry[] }) => {
  return (
    <Accordion allowToggle w="full">
      {faqs.map(({ question, answer }, idx) => (
        <AccordionItem
          key={question}
          borderTopWidth={idx === 0 || idx === question.length - 1 ? 0 : 1}
          borderBottomColor="white"
        >
          <AccordionButton px={0} py={3}>
            <HStack justifyContent="space-between" w="full">
              <Text align="start" color="gray.900">
                {question}
              </Text>
              <AccordionIcon />
            </HStack>
          </AccordionButton>
          <AccordionPanel px={0} pb={4}>
            <Text align="start" color="gray.900">
              {renderWithLinks(answer)}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export const FAQ = ({ faqs }: { faqs: FAQEntry[] }) => {
  return (
    <Container pt={4} pb={1}>
      <Text align="start" fontWeight="semibold">
        Frequently Asked Questions
      </Text>
      <FAQContents faqs={faqs} />
    </Container>
  );
};
